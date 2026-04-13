import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { getProducts } from "@/lib/shopify";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let tenant;
  try {
    tenant = await getTenantBySlug(slug);
  } catch {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }

  if (!tenant.shopifyDomain || !tenant.shopifyToken) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getProducts({
      domain: tenant.shopifyDomain,
      accessToken: tenant.shopifyToken,
    });

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[Products] Shopify error:", err);
    return NextResponse.json({ error: "Error obteniendo productos" }, { status: 500 });
  }
}
