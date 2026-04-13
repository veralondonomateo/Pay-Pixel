import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Obtener marca del usuario
  const { data: membership } = await supabase
    .from("brand_members")
    .select("brand_id, role, brands(id, name, slug, logo_url, primary_color, plan)")
    .eq("user_id", user.id)
    .single();

  const brandsRaw = membership?.brands;
  const brand = (Array.isArray(brandsRaw) ? brandsRaw[0] : brandsRaw) as {
    id: string; name: string; slug: string;
    logo_url: string | null; primary_color: string; plan: string;
  } | null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardNav brand={brand} user={user} />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
