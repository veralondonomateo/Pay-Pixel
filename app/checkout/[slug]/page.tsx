import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { safeDecrypt } from "@/lib/encryption";
import { getProductByHandle, getProducts } from "@/lib/shopify";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import type { BrandPublic, UpsellProduct } from "@/types/tenant";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    product?: string;
    variant?: string;
    qty?: string;
    recover?: string;
  }>;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const supabase = createServiceClient();

  // ── Resolver tenant ───────────────────────────────────────────────────────
  const { data: brand } = await supabase
    .from("brands")
    .select(
      "id, slug, name, logo_url, primary_color, meta_pixel_id, tiktok_pixel_id, shopify_domain, shopify_access_token"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!brand) notFound();

  const brandPublic: BrandPublic = {
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    logo_url: brand.logo_url,
    primary_color: brand.primary_color ?? "#6366f1",
    meta_pixel_id: brand.meta_pixel_id,
    tiktok_pixel_id: brand.tiktok_pixel_id,
  };

  // ── Cargar producto inicial y upsells desde Shopify ───────────────────────
  let shopifyProduct = null;
  let upsellProducts: UpsellProduct[] = [];

  const shopifyDomain = brand.shopify_domain;
  const shopifyToken = safeDecrypt(brand.shopify_access_token);

  if (shopifyDomain && shopifyToken) {
    const shopifyOpts = { domain: shopifyDomain, accessToken: shopifyToken };

    if (sp.product) {
      try {
        shopifyProduct = await getProductByHandle(shopifyOpts, sp.product);
      } catch (err) {
        console.error("[Checkout Page] Shopify product error:", err);
      }
    }

    // Cargar productos upsell configurados por la marca
    const { data: dbUpsells } = await supabase
      .from("upsell_products")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .eq("show_in_checkout", true)
      .order("position");

    if (dbUpsells?.length) {
      // Enriquecer con datos de Shopify (precio real, imagen)
      try {
        const allProducts = await getProducts(shopifyOpts);
        upsellProducts = dbUpsells.map((u) => {
          const sp = allProducts.find((p) => p.handle === u.shopify_handle);
          return {
            ...u,
            price: sp
              ? Math.round(parseFloat(sp.variants[0]?.price ?? u.price))
              : u.price,
            image: sp?.images[0]?.src ?? u.image,
          } as UpsellProduct;
        });
      } catch {
        upsellProducts = dbUpsells as UpsellProduct[];
      }
    }
  }

  // ── Carrito abandonado a recuperar ────────────────────────────────────────
  let recoveryData = null;
  if (sp.recover) {
    const { data: cart } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("id", sp.recover)
      .eq("brand_id", brand.id)
      .is("converted_at", null)
      .single();
    if (cart) recoveryData = cart;
  }

  return (
    <CheckoutPageClient
      brand={brandPublic}
      slug={slug}
      shopifyProduct={shopifyProduct}
      upsellProducts={upsellProducts}
      initialVariantId={sp.variant ? parseInt(sp.variant) : undefined}
      initialQty={sp.qty ? parseInt(sp.qty) : 1}
      recoveryData={recoveryData}
    />
  );
}
