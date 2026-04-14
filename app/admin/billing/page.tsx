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
  const totalPending = pending.reduce((s, r) => s + Number(r.amount_cop), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturación global</h1>
          <p className="text-gray-500 text-sm mt-1">{records?.length ?? 0} registros</p>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-800/50 rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-yellow-500">Pendiente de cobro</p>
          <p className="text-xl font-bold text-yellow-400 mt-0.5">{formatCOP(totalPending)}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {["Marca", "Email", "Mes", "Pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(records ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-600">Sin registros.</td></tr>
            )}
            {(records ?? []).map((rec) => (
              <tr key={rec.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <a href={`/admin/brands/${rec.brand_id}`} className="font-medium text-white hover:text-indigo-400 transition-colors">
                    {(rec.brands as any)?.name ?? "—"}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{(rec.brands as any)?.billing_email ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-gray-400 text-xs">{rec.month}</td>
                <td className="px-4 py-3 text-gray-400">{rec.total_orders}</td>
                <td className="px-4 py-3 text-gray-400">{rec.billable_orders}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatCOP(rec.amount_cop)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    rec.status === "paid" ? "bg-green-900/50 text-green-400" :
                    rec.status === "waived" ? "bg-gray-800 text-gray-500" :
                    rec.status === "failed" ? "bg-red-900/50 text-red-400" :
                    "bg-yellow-900/50 text-yellow-400"
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
