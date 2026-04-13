import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getTenantBySlug } from "@/lib/tenant";
import { addLineItemToShopifyOrder } from "@/lib/shopify";

interface UpsellBody {
  order_id: string;
  upsell_product_id: string; // ID de upsell_products en Supabase
  quantity?: number;
}

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

  let body: UpsellBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { order_id, upsell_product_id, quantity = 1 } = body;
  if (!order_id || !upsell_product_id) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verificar orden y tenant
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", order_id)
    .eq("brand_id", tenant.brand.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Obtener producto upsell del tenant
  const { data: upsellProduct } = await supabase
    .from("upsell_products")
    .select("*")
    .eq("id", upsell_product_id)
    .eq("brand_id", tenant.brand.id)
    .eq("is_active", true)
    .single();

  if (!upsellProduct) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  // Obtener shopifyVariantId desde Shopify si no está cacheado
  let shopifyVariantId: number | null = null;
  let shopifyVariantPrice: number | null = null;
  if (tenant.shopifyDomain && tenant.shopifyToken) {
    try {
      const { getProductByHandle } = await import("@/lib/shopify");
      const product = await getProductByHandle(
        { domain: tenant.shopifyDomain, accessToken: tenant.shopifyToken },
        upsellProduct.shopify_handle
      );
      if (product?.variants[0]) {
        shopifyVariantId = product.variants[0].id;
        shopifyVariantPrice = parseFloat(product.variants[0].price);
      }
    } catch (err) {
      console.warn("[Upsell] Could not fetch Shopify product:", err);
    }
  }

  // Agregar item a Supabase
  await supabase.from("order_items").insert({
    order_id,
    brand_id: tenant.brand.id,
    product_id: upsellProduct.id,
    name: upsellProduct.name,
    variant: upsellProduct.variant,
    price: upsellProduct.price,
    quantity,
    image: upsellProduct.image,
    shopify_variant_id: shopifyVariantId,
  });

  // Actualizar total de la orden
  await supabase
    .from("orders")
    .update({ total: order.total + upsellProduct.price * quantity })
    .eq("id", order_id);

  // Si la orden ya tiene shopify_order_id, agregar via Order Editing API
  if (
    order.shopify_order_id &&
    tenant.shopifyDomain &&
    tenant.shopifyToken
  ) {
    try {
      await addLineItemToShopifyOrder(
        { domain: tenant.shopifyDomain, accessToken: tenant.shopifyToken },
        order.shopify_order_id,
        {
          name: upsellProduct.name,
          variant: upsellProduct.variant,
          price: upsellProduct.price,
          quantity,
          shopifyVariantId,
          shopifyVariantPrice,
        }
      );
    } catch (err) {
      console.error("[Upsell] Shopify edit error:", err);
      // No fatal — el item ya está en Supabase, se puede agregar manualmente
    }
  }

  return NextResponse.json({ ok: true });
}
