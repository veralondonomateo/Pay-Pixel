import { createServiceClient } from "@/lib/supabase";
import ThankYouClient from "@/components/checkout/ThankYouClient";
import type { BrandPublic, UpsellProduct } from "@/types/tenant";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ThankYouPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("id, slug, name, logo_url, primary_color, meta_pixel_id, tiktok_pixel_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const brandPublic: BrandPublic | null = brand
    ? {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        logo_url: brand.logo_url,
        primary_color: brand.primary_color ?? "#6366f1",
        meta_pixel_id: brand.meta_pixel_id,
        tiktok_pixel_id: brand.tiktok_pixel_id,
      }
    : null;

  // Cargar upsells post-compra del tenant
  let postPurchaseUpsells: UpsellProduct[] = [];
  if (brand) {
    const { data } = await supabase
      .from("upsell_products")
      .select("*")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .eq("show_post_purchase", true)
      .order("position")
      .limit(3);
    postPurchaseUpsells = (data ?? []) as UpsellProduct[];
  }

  return (
    <ThankYouClient
      brand={brandPublic}
      slug={slug}
      postPurchaseUpsells={postPurchaseUpsells}
    />
  );
}
