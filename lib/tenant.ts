// ── Helpers para resolver el tenant (brand) desde el slug ────────────────────
import { createServiceClient } from "./supabase";
import { safeDecrypt } from "./encryption";
import type { Brand } from "@/types/tenant";

export interface TenantCredentials {
  brand: Brand;
  shopifyDomain: string;
  shopifyToken: string;
  mpToken: string;
  metaPixelId: string | null;
  metaToken: string | null;
  tiktokPixelId: string | null;
  tiktokToken: string | null;
  whatsappPhoneId: string | null;
  whatsappToken: string | null;
}

/**
 * Resuelve el tenant por slug y desencripta sus credenciales.
 * Lanza un error si el slug no existe o la marca está inactiva.
 */
export async function getTenantBySlug(slug: string): Promise<TenantCredentials> {
  const supabase = createServiceClient();

  const { data: brand, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !brand) {
    throw new Error(`Tenant not found: ${slug}`);
  }

  return {
    brand: brand as Brand,
    shopifyDomain: brand.shopify_domain ?? "",
    shopifyToken: safeDecrypt(brand.shopify_access_token) ?? "",
    mpToken: safeDecrypt(brand.mp_access_token) ?? "",
    metaPixelId: brand.meta_pixel_id ?? null,
    metaToken: safeDecrypt(brand.meta_conversions_token),
    tiktokPixelId: brand.tiktok_pixel_id ?? null,
    tiktokToken: safeDecrypt(brand.tiktok_events_token),
    whatsappPhoneId: brand.whatsapp_phone_id ?? null,
    whatsappToken: safeDecrypt(brand.whatsapp_token),
  };
}

/**
 * Genera un slug único a partir del nombre de la marca.
 * Verifica que no exista en la base de datos.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const supabase = createServiceClient();

  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  let slug = base;
  let attempt = 0;

  while (true) {
    const { data } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    attempt++;
    slug = `${base}-${attempt}`;
  }
}
