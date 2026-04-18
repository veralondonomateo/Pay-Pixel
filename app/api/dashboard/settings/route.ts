import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";
import { encrypt } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  // Verificar identidad con el cliente de usuario (cookies / anon key)
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  // Usar service client (bypasa RLS) para las operaciones de DB
  const supabase = createServiceClient();

  const { data: membership } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
    .single();
  if (!membership) return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });

  const updates: Record<string, unknown> = {
    name: body.name,
    primary_color: body.primary_color,
    shopify_domain: body.shopify_domain || null,
    meta_pixel_id: body.meta_pixel_id || null,
    tiktok_pixel_id: body.tiktok_pixel_id || null,
    // default_product_handle se habilita después de correr la migración SQL
  };

  // Solo encriptar y actualizar tokens si se enviaron (no vacíos)
  if (body.shopify_access_token) updates.shopify_access_token = encrypt(body.shopify_access_token);
  if (body.mp_access_token) updates.mp_access_token = encrypt(body.mp_access_token);
  if (body.meta_conversions_token) updates.meta_conversions_token = encrypt(body.meta_conversions_token);
  if (body.tiktok_events_token) updates.tiktok_events_token = encrypt(body.tiktok_events_token);

  // Manejar logo_url si se envió explícitamente (para quitar logo)
  if ("logo_url" in body) updates.logo_url = body.logo_url;

  const { error } = await supabase
    .from("brands")
    .update(updates)
    .eq("id", membership.brand_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
