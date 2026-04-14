import { createServerClient } from "@/lib/supabase";
import { RevenueChart, OrdersChart } from "@/components/dashboard/DashboardCharts";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("brand_members")
    .select("brand_id, brands(primary_color, name)")
    .eq("user_id", user!.id)
    .single();

  const brandId = membership?.brand_id;
  const brandRaw = membership?.brands;
  const brand = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw) as { primary_color: string; name: string } | null;
  const color = brand?.primary_color ?? "#6366f1";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - 13 + i); return d;
  });

  const [ordersResult, revenueResult, abandonedResult, allOrdersResult, recentOrdersResult] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("brand_id", brandId).eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("orders").select("total")
      .eq("brand_id", brandId).eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("abandoned_carts").select("*", { count: "exact", head: true })
      .eq("brand_id", brandId).is("converted_at", null).gte("created_at", monthStart),
    supabase.from("orders").select("total, created_at, payment_status")
      .eq("brand_id", brandId).gte("created_at", last14[0].toISOString()),
    supabase.from("orders")
      .select("id, first_name, last_name, total, payment_method, payment_status, created_at")
      .eq("brand_id", brandId).order("created_at", { ascending: false }).limit(6),
  ]);

  const totalOrders = ordersResult.count ?? 0;
  const totalRevenue = (revenueResult.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const abandoned = abandonedResult.count ?? 0;

  const labels = last14.map((d) => d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" }));
  const revenueData = last14.map((d, i) => {
    const day = d.toISOString().split("T")[0];
    const rev = (allOrdersResult.data ?? [])
      .filter((o) => o.created_at.startsWith(day) && o.payment_status === "approved")
      .reduce((s, o) => s + Number(o.total), 0);
    return { day: labels[i], revenue: Math.round(rev) };
  });
  const ordersData = last14.map((d, i) => {
    const day = d.toISOString().split("T")[0];
    const count = (allOrdersResult.data ?? [])
      .filter((o) => o.created_at.startsWith(day) && o.payment_status === "approved").length;
    return { day: labels[i], orders: count };
  });

  const stats = [
    { label: "Pedidos este mes", value: totalOrders.toString(), sub: "aprobados" },
    { label: "Revenue total",    value: formatCOP(totalRevenue), sub: "mes actual" },
    { label: "Ticket promedio",  value: formatCOP(aov), sub: "AOV" },
    { label: "Carritos perdidos",value: abandoned.toString(), sub: "sin convertir" },
  ];

  const statusMap: Record<string, { label: string; style: React.CSSProperties }> = {
    approved:   { label: "Aprobado",   style: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" } },
    pending:    { label: "Pendiente",  style: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" } },
    failure:    { label: "Fallido",    style: { background: "rgba(239,68,68,0.12)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.2)"  } },
    in_process: { label: "En proceso", style: { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" } },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Resumen</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {now.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
            <p className="text-xl font-bold text-white leading-none">{s.value}</p>
            <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm font-semibold text-white mb-1">Revenue — 14 días</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>{formatCOP(totalRevenue)} este mes</p>
          <RevenueChart data={revenueData} color={color} />
        </div>
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-sm font-semibold text-white mb-1">Pedidos — 14 días</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>{totalOrders} aprobados este mes</p>
          <OrdersChart data={ordersData} color={color} />
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-sm font-semibold text-white">Pedidos recientes</p>
          <a href="/dashboard/orders" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color }}>Ver todos →</a>
        </div>
        <div>
          {(recentOrdersResult.data ?? []).length === 0 && (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>Sin pedidos este mes.</p>
          )}
          {(recentOrdersResult.data ?? []).map((order) => (
            <div key={order.id} className="px-5 py-3 flex items-center gap-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{order.first_name} {order.last_name}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {new Date(order.created_at).toLocaleDateString("es-CO")} · {order.payment_method === "contraentrega" ? "COD" : "MercadoPago"}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={statusMap[order.payment_status]?.style ?? { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                {statusMap[order.payment_status]?.label ?? order.payment_status}
              </span>
              <p className="text-sm font-bold text-white flex-shrink-0">{formatCOP(Number(order.total))}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
