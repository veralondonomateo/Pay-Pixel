import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getTenantBySlug } from "@/lib/tenant";
import { getMPPayment, mapMPStatus } from "@/lib/mercadopago";
import { createShopifyOrder } from "@/lib/shopify";
import { sendPurchaseEvent } from "@/lib/meta";
import { sendTikTokPurchase } from "@/lib/tiktok";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let tenant;
  try {
    tenant = await getTenantBySlug(slug);
  } catch {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }

  let body: { order_id: string; payment_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { order_id, payment_id } = body;
  if (!order_id || !payment_id) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  if (!tenant.mpToken) {
    return NextResponse.json({ error: "MP no configurado" }, { status: 400 });
  }

  // ── Verificar estado real en MP (no confiar en el query param) ────────────
  let status: ReturnType<typeof mapMPStatus> = "pending";
  try {
    const payment = await getMPPayment(tenant.mpToken, payment_id);
    status = mapMPStatus(payment.status);
  } catch (err) {
    console.error("[Confirm] Error consultando MP:", err);
    return NextResponse.json({ ok: true, verified: false });
  }

  const supabase = createServiceClient();

  // Verificar que la orden pertenece a este tenant
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("brand_id", tenant.brand.id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Actualizar estado del pago
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status, mp_payment_id: payment_id })
    .eq("id", order_id)
    .eq("brand_id", tenant.brand.id);

  if (error) {
    console.error("[Confirm] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // ── Si aprobado: CAPI + crear orden Shopify ───────────────────────────────
  if (status === "approved") {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined;
    const clientUserAgent = req.headers.get("user-agent") ?? undefined;

    // Disparar CAPI (no bloquear)
    if (tenant.metaPixelId && tenant.metaToken) {
      sendPurchaseEvent({
        pixelId: tenant.metaPixelId,
        accessToken: tenant.metaToken,
        orderId: order_id,
        email: order.email,
        phone: order.phone,
        value: order.total,
        clientIp,
        clientUserAgent,
        fbp: req.cookies.get("_fbp")?.value,
        fbc: req.cookies.get("_fbc")?.value,
      }).catch(() => {});
    }

    if (tenant.tiktokPixelId && tenant.tiktokToken) {
      sendTikTokPurchase({
        pixelId: tenant.tiktokPixelId,
        accessToken: tenant.tiktokToken,
        orderId: order_id,
        email: order.email,
        phone: order.phone,
        value: order.total,
        clientIp,
        clientUserAgent,
      }).catch(() => {});
    }

    // Crear orden en Shopify
    if (!order.shopify_order_id && tenant.shopifyDomain && tenant.shopifyToken) {
      try {
        const shopifyId = await createShopifyOrder(
          { domain: tenant.shopifyDomain, accessToken: tenant.shopifyToken },
          {
            email: order.email,
            firstName: order.first_name,
            lastName: order.last_name,
            phone: order.phone,
            address: order.address,
            complement: order.complement,
            city: order.city,
            state: order.state,
            items: (items ?? []).map((i) => ({
              name: i.name,
              variant: i.variant,
              price: i.price,
              quantity: i.quantity,
              shopifyVariantId: i.shopify_variant_id,
            })),
            shipping: order.shipping ?? 0,
            total: order.total,
            paymentMethod: "mercadopago",
            mpPaymentId: payment_id,
            paypixelOrderId: order_id,
            brandSlug: slug,
          }
        );
        await supabase
          .from("orders")
          .update({ shopify_order_id: shopifyId })
          .eq("id", order_id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Confirm] Shopify error:", msg);
        await supabase
          .from("orders")
          .update({ shopify_error: msg })
          .eq("id", order_id);
      }
    }

    // Marcar carrito abandonado como convertido
    await supabase
      .from("abandoned_carts")
      .update({ converted_at: new Date().toISOString() })
      .eq("brand_id", tenant.brand.id)
      .eq("email", order.email)
      .is("converted_at", null);
  }

  return NextResponse.json({ ok: true, verified: true, status });
}
