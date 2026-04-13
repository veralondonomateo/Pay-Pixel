export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  shopify_domain: string | null;
  shopify_access_token: string | null;
  mp_access_token: string | null;
  meta_pixel_id: string | null;
  meta_conversions_token: string | null;
  tiktok_pixel_id: string | null;
  tiktok_events_token: string | null;
  whatsapp_enabled: boolean;
  whatsapp_phone_id: string | null;
  whatsapp_token: string | null;
  email_recovery_enabled: boolean;
  plan: "free" | "paid";
  billing_email: string | null;
  is_active: boolean;
  launch_promo: boolean;
  created_at: string;
}

// Brand config exposed to client (no tokens)
export interface BrandPublic {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  meta_pixel_id: string | null;
  tiktok_pixel_id: string | null;
}

export interface UpsellProduct {
  id: string;
  brand_id: string;
  shopify_handle: string;
  name: string;
  variant: string | null;
  price: number;
  compare_price: number | null;
  image: string | null;
  benefit: string | null;
  stock: number;
  sold_today: number;
  position: number;
  show_in_checkout: boolean;
  show_post_purchase: boolean;
}

export interface Coupon {
  id: string;
  brand_id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
}
