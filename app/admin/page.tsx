import { createServiceClient } from "@/lib/supabase";
import { RevenueChart, OrdersChart } from "@/components/admin/AdminCharts";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

function StatCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string; sub?: string; accent: string; icon: React.ReactNode;
}) {
  const accents: Record<string, { glow: string; border: string; text: string; bg: string }> = {
    indigo: { glow: "shadow-indigo-500/20", border: "border-indigo-500/20", text: "text-indigo-400", bg: "bg-indigo-500/10" },
    violet: { glow: "shadow-violet-500/20", border: "border-violet-500/20", text: "text-violet-400", bg: "bg-violet-500/10" },
    emerald: { glow: "shadow-emerald-500/20", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    amber: { glow: "shadow-amber-500/20", border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/10" },
  };
  const a = accents[accent];

  return (
    <div className={`relative rounded-2xl border ${a.border} p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
      style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${a.bg}`} />
      <div className="flex items-start justify-between mb-4">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center`}>
          <span className={a.text}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const supabase = createServiceClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Datos de los últimos 14 días para gráficas
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 13 + i);
    return d;
  });

  const [brandsResult, ordersMonthResult, revenueResult, pendingBillingResult,
    allOrdersResult, recentBrandsResult] = await Promise.all([
    supabase.from("brands").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("orders").select("total, created_at")
      .eq("payment_status", "approved")
      .gte("created_at", last14[0].toISOString()),
    supabase.from("billing_records").select("amount_cop").eq("status", "pending"),
    supabase.from("orders").select("total, created_at, payment_status")
      .gte("created_at", last14[0].toISOString()),
    supabase.from("brands").select("id, name, slug, plan, launch_promo, is_active, created_at")
      .order("created_at", { ascending: false }).limit(6),
  ]);

  const totalBrands = brandsResult.count ?? 0;
  const ordersThisMonth = ordersMonthResult.count ?? 0;
  const revenueThisMonth = (revenueResult.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const pendingBilling = (pendingBillingResult.data ?? []).reduce((s, r) => s + Number(r.amount_cop), 0);

  // Construir datos de gráficas por día
  const dayLabels = last14.map((d) => d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" }));
  const revenueByDay = last14.map((d, i) => {
    const dayStr = d.toISOString().split("T")[0];
    const rev = (revenueResult.data ?? [])
      .filter((o) => o.created_at.startsWith(dayStr))
      .reduce((s, o) => s + Number(o.total), 0);
    return { day: dayLabels[i], revenue: Math.round(rev) };
  });
  const ordersByDay = last14.map((d, i) => {
    const dayStr = d.toISOString().split("T")[0];
    const count = (allOrdersResult.data ?? [])
      .filter((o) => o.created_at.startsWith(dayStr) && o.payment_status === "approved").length;
    return { day: dayLabels[i], orders: count };
  });

  const recentBrands = recentBrandsResult.data ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Resumen global
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Sistema operativo</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Marcas activas" value={totalBrands.toString()}
          sub="En plataforma" accent="indigo"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard label="Pedidos este mes" value={ordersThisMonth.toString()}
          sub="Aprobados" accent="violet"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard label="Revenue procesado" value={formatCOP(revenueThisMonth)}
          sub="Mes actual" accent="emerald"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Por cobrar" value={formatCOP(pendingBilling)}
          sub="Facturación pendiente" accent="amber"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-white/5 p-5"
          style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Revenue (14 días)</p>
              <p className="text-gray-500 text-xs mt-0.5">{formatCOP(revenueThisMonth)} este mes</p>
            </div>
            <span className="text-xs text-indigo-400 font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              COP
            </span>
          </div>
          <RevenueChart data={revenueByDay} />
        </div>

        {/* Pedidos */}
        <div className="rounded-2xl border border-white/5 p-5"
          style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold text-sm">Pedidos (14 días)</p>
              <p className="text-gray-500 text-xs mt-0.5">{ordersThisMonth} aprobados este mes</p>
            </div>
            <span className="text-xs text-violet-400 font-medium px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              Órdenes
            </span>
          </div>
          <OrdersChart data={ordersByDay} />
        </div>
      </div>

      {/* Marcas recientes */}
      <div className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Últimas marcas</p>
          <a href="/admin/brands" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Ver todas →
          </a>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentBrands.length === 0 && (
            <p className="px-5 py-10 text-center text-gray-600 text-sm">Sin marcas registradas.</p>
          )}
          {recentBrands.map((brand) => (
            <a key={brand.id} href={`/admin/brands/${brand.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-300 text-sm font-bold">{brand.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{brand.name}</p>
                <p className="text-xs text-gray-600 font-mono">{brand.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  brand.plan === "paid"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-gray-800 text-gray-500 border border-gray-700"
                }`}>
                  {brand.plan === "paid" ? "Pagado" : "Free"}
                  {brand.launch_promo ? " 🎁" : ""}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  brand.is_active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {brand.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
              <p className="text-xs text-gray-600 flex-shrink-0">
                {new Date(brand.created_at).toLocaleDateString("es-CO")}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
