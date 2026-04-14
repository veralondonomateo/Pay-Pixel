import { createServiceClient } from "@/lib/supabase";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function AdminBillingPage() {
  const supabase = createServiceClient();

  const { data: records } = await supabase
    .from("billing_records")
    .select("*, brands(name, slug, billing_email)")
    .order("month", { ascending: false })
    .order("amount_cop", { ascending: false });

  const pending = (records ?? []).filter((r) => r.status === "pending");
  const paid = (records ?? []).filter((r) => r.status === "paid");
  const totalPending = pending.reduce((s, r) => s + Number(r.amount_cop), 0);
  const totalPaid = paid.reduce((s, r) => s + Number(r.amount_cop), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Facturación</h1>
        <p className="text-gray-500 text-sm mt-1">{records?.length ?? 0} registros históricos</p>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendiente de cobro", value: formatCOP(totalPending), color: "amber" },
          { label: "Cobrado total", value: formatCOP(totalPaid), color: "emerald" },
          { label: "Registros pendientes", value: pending.length.toString(), color: "indigo" },
        ].map((s) => {
          const c: Record<string, string> = {
            amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
            emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
            indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
          };
          return (
            <div key={s.label} className={`rounded-2xl border p-5 ${c[s.color]}`}
              style={{ backdropFilter: "blur(10px)" }}>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/5 overflow-hidden"
        style={{ background: "rgba(10,10,20,0.7)", backdropFilter: "blur(10px)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Marca", "Email", "Mes", "Pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {(records ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-600">Sin registros de facturación.</td></tr>
            )}
            {(records ?? []).map((rec) => (
              <tr key={rec.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3.5">
                  <a href={`/admin/brands/${rec.brand_id}`}
                    className="font-medium text-white hover:text-indigo-400 transition-colors">
                    {(rec.brands as any)?.name ?? "—"}
                  </a>
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs">{(rec.brands as any)?.billing_email ?? "—"}</td>
                <td className="px-4 py-3.5 font-mono text-gray-400 text-xs">{rec.month}</td>
                <td className="px-4 py-3.5 text-gray-300">{rec.total_orders}</td>
                <td className="px-4 py-3.5 text-gray-300">{rec.billable_orders}</td>
                <td className="px-4 py-3.5 font-semibold text-white">{formatCOP(rec.amount_cop)}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    rec.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    rec.status === "waived" ? "bg-gray-800 text-gray-500 border-gray-700" :
                    rec.status === "failed" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {rec.status === "paid" ? "Pagado" : rec.status === "waived" ? "Gratis" : rec.status === "failed" ? "Fallido" : "Pendiente"}
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
