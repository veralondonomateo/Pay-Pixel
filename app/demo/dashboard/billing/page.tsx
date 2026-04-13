function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

const BILLING_HISTORY = [
  { month: "Marzo 2024", orders: 312, billable: 212, amount: 318000, status: "Pagado" },
  { month: "Febrero 2024", orders: 287, billable: 187, amount: 280500, status: "Pagado" },
  { month: "Enero 2024", orders: 241, billable: 141, amount: 211500, status: "Pagado" },
  { month: "Diciembre 2023", orders: 198, billable: 98, amount: 147000, status: "Pagado" },
  { month: "Noviembre 2023", orders: 156, billable: 56, amount: 84000, status: "Pagado" },
  { month: "Octubre 2023", orders: 87, billable: 0, amount: 0, status: "Gratis" },
];

export default function DemoBillingPage() {
  const currentOrders = 247;
  const billableThisMonth = Math.max(0, currentOrders - 100);
  const amountThisMonth = billableThisMonth * 1500;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>

      {/* Current month */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Mes actual — Abril 2024</h2>
            <p className="text-xs text-gray-500 mt-0.5">Factura generada el 1 de mayo</p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">En curso</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500">Pedidos totales</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{currentOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pedidos facturables</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{billableThisMonth}</p>
            <p className="text-xs text-gray-400">(sobre 100 gratis)</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Monto estimado</p>
            <p className="text-2xl font-bold text-indigo-600 mt-0.5">{formatCOP(amountThisMonth)}</p>
            <p className="text-xs text-gray-400">$1.500 COP/pedido</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>0 pedidos</span>
            <span>100 gratis</span>
            <span>{currentOrders} actual</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentOrders / 300) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{billableThisMonth} pedidos por encima del límite gratuito</p>
        </div>
      </div>

      {/* Price structure */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-900 text-sm mb-3">Estructura de precios</h3>
        <div className="space-y-2 text-xs text-indigo-700">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Primeros 100 pedidos/mes: <strong>$0 COP (gratis)</strong>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Pedido 101 en adelante: <strong>$1.500 COP por pedido</strong>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Solo se cuentan pedidos con estado <strong>aprobado</strong>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Sin cargos fijos ni costos de setup
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Historial de facturación</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Mes", "Pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {BILLING_HISTORY.map((row) => (
              <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                <td className="px-4 py-3 text-gray-600">{row.orders}</td>
                <td className="px-4 py-3 text-gray-600">{row.billable}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {row.amount === 0 ? "—" : formatCOP(row.amount)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    row.status === "Pagado" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {row.status}
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
