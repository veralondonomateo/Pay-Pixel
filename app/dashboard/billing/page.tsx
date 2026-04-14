import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function BillingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("brand_members").select("brand_id, brands(primary_color, launch_promo)").eq("user_id", user!.id).single();

  const brandId = membership?.brand_id;
  const brandRaw = (membership as any)?.brands;
  const b = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw) as { primary_color: string; launch_promo: boolean } | null;
  const color = b?.primary_color ?? "#6366f1";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [currentOrders, history] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("brand_id", brandId).eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("billing_records").select("*").eq("brand_id", brandId)
      .order("month", { ascending: false }).limit(12),
  ]);

  const ordersThisMonth = currentOrders.count ?? 0;
  const billable = Math.max(0, ordersThisMonth - 100);
  const estimated = billable * 1500;
  const pct = Math.min(100, (ordersThisMonth / 100) * 100);

  const statusStyle: Record<string, React.CSSProperties> = {
    paid:    { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" },
    waived:  { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" },
    failed:  { background: "rgba(239,68,68,0.12)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" },
    pending: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" },
  };
  const statusLabel: Record<string, string> = { paid: "Pagado", waived: "Gratis", failed: "Fallido", pending: "Pendiente" };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Facturación</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          {b?.launch_promo ? "🎁 Promo de lanzamiento activa — 3 meses gratis" : "Plan por uso — primeros 100 pedidos gratis/mes"}
        </p>
      </div>

      {/* Mes actual */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-sm font-semibold text-white">Mes actual</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pedidos aprobados", value: ordersThisMonth.toString() },
            { label: "Facturables (> 100)", value: billable.toString() },
            { label: "Estimado a pagar", value: formatCOP(estimated) },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>{ordersThisMonth} pedidos</span>
            <span>100 gratis</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct >= 100 ? "#f87171" : `linear-gradient(90deg, ${color}, ${color}99)` }} />
          </div>
          <p className="text-xs mt-2 rounded-xl px-3 py-2"
            style={{ background: `${color}0d`, color: "rgba(255,255,255,0.5)", border: `1px solid ${color}15` }}>
            {ordersThisMonth <= 100
              ? `${ordersThisMonth}/100 pedidos gratuitos usados. ¡Sin costo hasta el pedido #101!`
              : `Superaste los 100 pedidos. Los ${billable} adicionales se facturan a $1.500 COP c/u.`}
          </p>
        </div>
      </div>

      {/* Historial */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-sm font-semibold text-white">Historial</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Mes", "Pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(history.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>Sin historial aún.</td></tr>
            )}
            {(history.data ?? []).map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td className="px-4 py-3 font-mono text-sm text-white">{r.month}</td>
                <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{r.total_orders}</td>
                <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.5)" }}>{r.billable_orders}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatCOP(r.amount_cop)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={statusStyle[r.status] ?? statusStyle.pending}>
                    {statusLabel[r.status] ?? "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
