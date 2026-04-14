import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    <div className="min-h-screen flex" style={{ background: "#050508" }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
      <DashboardNav brand={brand} user={user} />
      <main className="flex-1 ml-60 min-h-screen relative">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
