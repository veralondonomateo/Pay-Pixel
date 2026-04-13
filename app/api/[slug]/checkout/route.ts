import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getTenantBySlug } from "@/lib/tenant";
import { createMPPreference } from "@/lib/mercadopago";
import { sendPurchaseEvent } from "@/lib/meta";
import { sendTikTokPurchase } from "@/lib/tiktok";
import type { CheckoutItem } from "@/types/checkout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://paypixel.com";

interface CheckoutBody {
  email: string;
  firstName: string;
  lastName: string;
  cedula?: string;
  phone: string;
  address: string;
  complement?: string;
  state: string;
  city: string;
  paymentMethod: "mercadopago" | "contraentrega";
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  couponCode?: string;
  discount?: number;
  // Attribution cookies (sent from browser)
  fbp?: string;
  fbc?: string;
  ttp?: string;
  ttclid?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // ── Resolver tenant ───────────────────────────────────────────────────────
  let tenant;
  try {
    tenant = await getTenantBySlug(slug);
  } catch {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── 1. Validar cupón si viene ─────────────────────────────────────────────
  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("brand_id", tenant.brand.id)
      .eq("code", body.couponCode.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!coupon) {
      return NextResponse.json({ error: "Cupón no válido" }, { status: 400 });
    }
    if (coupon.max_uses && coupon.uses >= coupon.max_uses) {
      return NextResponse.json({ error: "Cupón agotado" }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "Cupón expirado" }, { status: 400 });
    }
  }

  // ── 2. Insertar la orden ──────────────────────────────────────────────────
  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({
      brand_id: tenant.brand.id,
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName,
      cedula: body.cedula ?? null,
      phone: body.phone,
      address: body.address,
      complement: body.complement ?? null,
      state: body.state,
      city: body.city,
      payment_method: body.paymentMethod,
      payment_status:
        body.paymentMethod === "contraentrega" ? "approved" : "pending",
      subtotal: body.subtotal,
      shipping: body.shipping,
      discount: body.discount ?? 0,
      coupon_code: body.couponCode ?? null,
      total: body.total,
    })
    .select("id")
    .single();

  if (insertError || !order) {
    console.error("[Checkout] Supabase insert error:", insertError);
    return NextResponse.json(
      { error: "No se pudo registrar la orden" },
      { status: 500 }
    );
  }

  const orderId: string = order.id;

  // ── 3. Guardar items ──────────────────────────────────────────────────────
  const { error: itemsError } = await supabase.from("order_items").insert(
    body.items.map((item) => ({
      order_id: orderId,
      brand_id: tenant.brand.id,
      product_id: item.id,
      name: item.name,
      variant: item.variant ?? null,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      shopify_variant_id: item.shopifyVariantId ?? null,
    }))
  );
  if (itemsError) {
    console.error("[Checkout] Items insert error:", itemsError);
  }

  // ── 4. Usar cupón (incrementar uses) ─────────────────────────────────────
  if (body.couponCode) {
    await supabase.rpc("increment_coupon_uses", {
      p_brand_id: tenant.brand.id,
      p_code: body.couponCode.toUpperCase(),
    });
  }

  // ── 5. Registrar como potencial carrito abandonado ────────────────────────
  // Se marca como abandonado si no convierte en 45 min (lo lee el cron)
  await supabase.from("abandoned_carts").insert({
    brand_id: tenant.brand.id,
    email: body.email,
    phone: body.phone,
    first_name: body.firstName,
    items: body.items,
    total: body.total,
  });

  // ── 6. Contraentrega: CAPI inmediato ─────────────────────────────────────
  if (body.paymentMethod === "contraentrega") {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined;
    const clientUserAgent = req.headers.get("user-agent") ?? undefined;

    if (tenant.metaPixelId && tenant.metaToken) {
      sendPurchaseEvent({
        pixelId: tenant.metaPixelId,
        accessToken: tenant.metaToken,
        orderId,
        email: body.email,
        phone: body.phone,
        value: body.total,
        clientIp,
        clientUserAgent,
        fbp: body.fbp ?? req.cookies.get("_fbp")?.value,
        fbc: body.fbc ?? req.cookies.get("_fbc")?.value,
      }).catch(() => {});
    }

    if (tenant.tiktokPixelId && tenant.tiktokToken) {
      sendTikTokPurchase({
        pixelId: tenant.tiktokPixelId,
        accessToken: tenant.tiktokToken,
        orderId,
        email: body.email,
        phone: body.phone,
        value: body.total,
        clientIp,
        clientUserAgent,
        ttp: body.ttp,
        ttclid: body.ttclid,
      }).catch(() => {});
    }

    return NextResponse.json({
      type: "contraentrega",
      status: "approved",
      order_id: orderId,
    });
  }

  // ── 7. MercadoPago: crear preferencia ─────────────────────────────────────
  if (!tenant.mpToken) {
    return NextResponse.json(
      { error: "MercadoPago no configurado para esta marca" },
      { status: 400 }
    );
  }

  try {
    const { preferenceId, initPoint } = await createMPPreference({
      accessToken: tenant.mpToken,
      orderId,
      brandSlug: slug,
      appUrl: APP_URL,
      items: body.items,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
      cedula: body.cedula,
      couponCode: body.couponCode,
      discount: body.discount,
      statementDescriptor: tenant.brand.name.slice(0, 22),
    });

    await supabase
      .from("orders")
      .update({ mp_preference_id: preferenceId })
      .eq("id", orderId);

    return NextResponse.json({
      type: "mercadopago",
      init_point: initPoint,
      preference_id: preferenceId,
      order_id: orderId,
    });
  } catch (err) {
    console.error("[Checkout] MP error:", err);
    await supabase
      .from("orders")
      .update({ payment_status: "failure" })
      .eq("id", orderId);
    return NextResponse.json(
      { error: "Error creando la orden de pago" },
      { status: 500 }
    );
  }
}
