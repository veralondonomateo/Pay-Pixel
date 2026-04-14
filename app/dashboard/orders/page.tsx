import { createServerClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function OrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase
    .from("brand_members").select("brand_id, brands(primary_color)").eq("user_id", user!.id).single();

  const brandId = membership?.brand_id;
  const brandRaw = (membership as any)?.brands;
  const color = (Array.isArray(brandRaw) ? brandRaw[0] : brandRaw)?.primary_color ?? "#6366f1";

  const { data: orders } = await supabase
    .from("orders").select("*").eq("brand_id", brandId)
    .order("created_at", { ascending: false }).limit(100);

  const statusMap: Record<string, { label: string; style: React.CSSProperties }> = {
    approved:   { label: "Aprobado",   style: { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" } },
    pending:    { label: "Pendiente",  style: { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" } },
    failure:    { label: "Fallido",    style: { background: "rgba(239,68,68,0.12)",  color: "#f87171", border: "1px solid rgba(239,68,68,0.2)"  } },
    in_process: { label: "En proceso", style: { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" } },
  };

  const approved = orders?.filter((o) => o.payment_status === "approved").length ?? 0;
  const revenue = orders?.filter((o) => o.payment_status === "approved").reduce((s, o) => s + Number(o.total), 0) ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{orders?.length ?? 0} registrados</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-lg font-bold text-white">{approved}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Aprobados</p>
          </div>
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: `${color}0f`, border: `1px solid ${color}20` }}>
            <p className="text-lg font-bold" style={{ color }}>{formatCOP(revenue)}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Revenue</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Cliente", "Fecha", "Método", "Estado", "Total", "Shopify"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.25)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>Sin pedidos aún.</td></tr>
            )}
            {(orders ?? []).map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td className="px-4 py-3.5">
                  <p className="font-medium text-white">{order.first_name} {order.last_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{order.email}</p>
                </td>
                <td className="px-4 py-3.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {new Date(order.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium px-2 py-1 rounded-full"
                    style={ order.payment_method === "contraentrega"
                      ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }
                      : { background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                    {order.payment_method === "contraentrega" ? "COD" : "MP"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={statusMap[order.payment_status]?.style ?? { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                    {statusMap[order.payment_status]?.label ?? order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-semibold text-white">{formatCOP(Number(order.total))}</td>
                <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {order.shopify_order_id ? `#${order.shopify_order_id}` : order.shopify_error ? "⚠ Error" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
