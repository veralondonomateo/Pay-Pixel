import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase";

async function getAuthenticatedBrandId(): Promise<string | null> {
  // Verificar identidad con cliente de usuario (cookies)
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  // Obtener brand_id con service client (bypasa RLS)
  const db = createServiceClient();
  const { data: m } = await db
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
    .single();
  return m?.brand_id ?? null;
}

// GET — list upsells for brand
export async function GET() {
  const brandId = await getAuthenticatedBrandId();
  if (!brandId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("upsell_products")
    .select("*")
    .eq("brand_id", brandId)
    .order("position");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ upsells: data });
}

// POST — create upsell
export async function POST(req: NextRequest) {
  const brandId = await getAuthenticatedBrandId();
  if (!brandId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const db = createServiceClient();

  // Get next position
  const { data: existing } = await db
    .from("upsell_products")
    .select("position")
    .eq("brand_id", brandId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = (existing?.[0]?.position ?? 0) + 1;

  const { data, error } = await db
    .from("upsell_products")
    .insert({
      brand_id: brandId,
      shopify_handle: body.shopify_handle ?? "",
      name: body.name,
      variant: body.variant || null,
      price: Number(body.price),
      compare_price: body.compare_price ? Number(body.compare_price) : null,
      image: body.image || null,
      benefit: body.benefit || null,
      stock: Number(body.stock ?? 99),
      sold_today: 0,
      position: nextPos,
      is_active: true,
      show_in_checkout: body.show_in_checkout ?? true,
      show_post_purchase: body.show_post_purchase ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ upsell: data });
}

// PATCH — update upsell
export async function PATCH(req: NextRequest) {
  const brandId = await getAuthenticatedBrandId();
  if (!brandId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const sanitized: Record<string, unknown> = {};
  if (updates.name !== undefined) sanitized.name = updates.name;
  if (updates.variant !== undefined) sanitized.variant = updates.variant || null;
  if (updates.price !== undefined) sanitized.price = Number(updates.price);
  if (updates.compare_price !== undefined) sanitized.compare_price = updates.compare_price ? Number(updates.compare_price) : null;
  if (updates.image !== undefined) sanitized.image = updates.image || null;
  if (updates.benefit !== undefined) sanitized.benefit = updates.benefit || null;
  if (updates.stock !== undefined) sanitized.stock = Number(updates.stock);
  if (updates.shopify_handle !== undefined) sanitized.shopify_handle = updates.shopify_handle;
  if (updates.is_active !== undefined) sanitized.is_active = updates.is_active;
  if (updates.show_in_checkout !== undefined) sanitized.show_in_checkout = updates.show_in_checkout;
  if (updates.show_post_purchase !== undefined) sanitized.show_post_purchase = updates.show_post_purchase;
  if (updates.position !== undefined) sanitized.position = Number(updates.position);

  const db = createServiceClient();
  const { data, error } = await db
    .from("upsell_products")
    .update(sanitized)
    .eq("id", id)
    .eq("brand_id", brandId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ upsell: data });
}

// DELETE — remove upsell
export async function DELETE(req: NextRequest) {
  const brandId = await getAuthenticatedBrandId();
  if (!brandId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db
    .from("upsell_products")
    .delete()
    .eq("id", id)
    .eq("brand_id", brandId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
