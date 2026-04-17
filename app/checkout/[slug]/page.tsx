import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { safeDecrypt } from "@/lib/encryption";
import { getProductByHandle, getProducts } from "@/lib/shopify";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import ProductCatalog from "@/components/checkout/ProductCatalog";
import type { BrandPublic, UpsellProduct } from "@/types/tenant";
import type { ShopifyProduct } from "@/lib/shopify";

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

  const shopifyDomain = brand.shopify_domain;
  const shopifyToken = safeDecrypt(brand.shopify_access_token);
  const isShopifyConnected = !!(shopifyDomain && shopifyToken);

  // ── Sin producto seleccionado → mostrar catálogo ──────────────────────────
  if (!sp.product) {
    let allProducts: ShopifyProduct[] = [];

    if (isShopifyConnected) {
      try {
        const shopifyOpts = { domain: shopifyDomain!, accessToken: shopifyToken! };
        allProducts = await getProducts(shopifyOpts);
      } catch (err) {
        console.error("[Checkout] Error cargando productos de Shopify:", err);
      }
    }

    return (
      <ProductCatalog
        brand={brandPublic}
        slug={slug}
        products={allProducts}
        isDemo={!isShopifyConnected}
      />
    );
  }

  // ── Producto seleccionado → checkout completo ─────────────────────────────
  let shopifyProduct = null;
  let upsellProducts: UpsellProduct[] = [];

  if (isShopifyConnected) {
    const shopifyOpts = { domain: shopifyDomain!, accessToken: shopifyToken! };

    try {
      shopifyProduct = await getProductByHandle(shopifyOpts, sp.product);
    } catch (err) {
      console.error("[Checkout Page] Shopify product error:", err);
    }

    // Cargar upsells configurados manualmente por la marca
    const { data: dbUpsells } = await supabase
      .from("upsell_products")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .eq("show_in_checkout", true)
      .order("position");

    if (dbUpsells?.length) {
      // Enriquecer con datos reales de Shopify
      try {
        const allProducts = await getProducts(shopifyOpts);
        upsellProducts = dbUpsells.map((u) => {
          const match = allProducts.find((p) => p.handle === u.shopify_handle);
          return {
            ...u,
            price: match
              ? Math.round(parseFloat(match.variants[0]?.price ?? u.price))
              : u.price,
            image: match?.images[0]?.src ?? u.image,
          } as UpsellProduct;
        });
      } catch {
        upsellProducts = dbUpsells as UpsellProduct[];
      }
    } else {
      // Sin upsells configurados: sugerir otros productos de Shopify automáticamente
      try {
        const allProducts = await getProducts(shopifyOpts);
        const suggestions = allProducts
          .filter((p) => p.handle !== sp.product && p.status === "active")
          .slice(0, 3);

        upsellProducts = suggestions.map((p, i) => ({
          id: `auto-${p.id}`,
          brand_id: brand.id,
          shopify_handle: p.handle,
          name: p.title,
          variant:
            p.variants[0]?.title !== "Default Title" ? p.variants[0]?.title : null,
          price: Math.round(parseFloat(p.variants[0]?.price ?? "0")),
          compare_price: null,
          image: p.images[0]?.src ?? null,
          benefit: null,
          stock: p.variants[0]?.inventory_quantity ?? 99,
          sold_today: 0,
          position: i,
          show_in_checkout: true,
          show_post_purchase: false,
        }));
      } catch {
        // No hay upsells auto-generados
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
      isShopifyConnected={isShopifyConnected}
      initialVariantId={sp.variant ? parseInt(sp.variant) : undefined}
      initialQty={sp.qty ? parseInt(sp.qty) : 1}
      recoveryData={recoveryData}
    />
  );
}
