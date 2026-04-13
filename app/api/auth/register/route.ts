import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateUniqueSlug } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  let body: { email: string; password: string; brandName: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { email, password, brandName } = body;
  if (!email || !password || !brandName) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    const msg = authError?.message ?? "Error creando usuario";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 2. Generar slug único
  const slug = await generateUniqueSlug(brandName);

  // 3. Crear marca y relación owner en una transacción
  const { data: brandId, error: brandError } = await supabase.rpc(
    "create_brand_for_user",
    {
      p_user_id: authData.user.id,
      p_name: brandName,
      p_slug: slug,
      p_email: email,
    }
  );

  if (brandError) {
    // Rollback: borrar usuario creado
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.error("[Register] Brand creation error:", brandError);
    return NextResponse.json(
      { error: "Error creando la marca" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    userId: authData.user.id,
    brandId,
    slug,
  });
}
