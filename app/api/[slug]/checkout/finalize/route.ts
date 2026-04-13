import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getTenantBySlug } from "@/lib/tenant";
import { createShopifyOrder } from "@/lib/shopify";

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

  let body: { order_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { order_id } = body;
  if (!order_id) {
    return NextResponse.json({ error: "Falta order_id" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("brand_id", tenant.brand.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Idempotencia: ya tiene orden Shopify
  if (order.shopify_order_id) {
    return NextResponse.json({ ok: true, shopify_order_id: order.shopify_order_id });
  }

  // Solo para órdenes aprobadas contraentrega
  if (
    order.payment_status !== "approved" ||
    order.payment_method !== "contraentrega"
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!tenant.shopifyDomain || !tenant.shopifyToken) {
    return NextResponse.json({ ok: true, skipped: true, reason: "shopify_not_configured" });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order_id);

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
        paymentMethod: "contraentrega",
        paypixelOrderId: order_id,
        brandSlug: slug,
      }
    );

    await supabase
      .from("orders")
      .update({ shopify_order_id: shopifyId, shopify_error: null })
      .eq("id", order_id);

    // Marcar carrito abandonado como convertido
    await supabase
      .from("abandoned_carts")
      .update({ converted_at: new Date().toISOString() })
      .eq("brand_id", tenant.brand.id)
      .eq("email", order.email)
      .is("converted_at", null);

    return NextResponse.json({ ok: true, shopify_order_id: shopifyId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Finalize] Shopify error:", msg);
    await supabase
      .from("orders")
      .update({ shopify_error: msg })
      .eq("id", order_id);
    return NextResponse.json({ error: "Error Shopify", detail: msg }, { status: 500 });
  }
}
