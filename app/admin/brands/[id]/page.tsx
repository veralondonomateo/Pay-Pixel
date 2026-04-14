import { createServiceClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AdminBrandActions from "./AdminBrandActions";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

export default async function AdminBrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .single();

  if (!brand) notFound();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [ordersThisMonthResult, totalOrdersResult, billingResult, cartsResult] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("brand_id", id).eq("payment_status", "approved").gte("created_at", monthStart),
    supabase.from("orders").select("total")
      .eq("brand_id", id).eq("payment_status", "approved"),
    supabase.from("billing_records").select("*").eq("brand_id", id).order("month", { ascending: false }).limit(6),
    supabase.from("abandoned_carts").select("*", { count: "exact", head: true }).eq("brand_id", id),
  ]);

  const ordersThisMonth = ordersThisMonthResult.count ?? 0;
  const totalRevenue = (totalOrdersResult.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const totalCarts = cartsResult.count ?? 0;

  const fields = [
    { label: "Shopify", value: brand.shopify_domain ?? "No configurado" },
    { label: "MercadoPago", value: brand.mp_access_token ? "Configurado ✓" : "No configurado" },
    { label: "Meta Pixel", value: brand.meta_pixel_id ?? "No configurado" },
    { label: "TikTok Pixel", value: brand.tiktok_pixel_id ?? "No configurado" },
    { label: "WhatsApp", value: brand.whatsapp_enabled ? `Habilitado (${brand.whatsapp_phone_id ?? "sin phone_id"})` : "Deshabilitado" },
    { label: "Email recovery", value: brand.email_recovery_enabled ? "Habilitado" : "Deshabilitado" },
    { label: "Promo lanzamiento", value: brand.launch_promo ? "Activa (3 meses gratis)" : "Terminada" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <a href="/admin/brands" className="text-gray-500 hover:text-gray-300 text-sm">← Marcas</a>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">{brand.name}</h1>
          <p className="text-gray-500 text-sm font-mono">/checkout/{brand.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            brand.is_active ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
          }`}>
            {brand.is_active ? "Activa" : "Inactiva"}
          </span>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            brand.plan === "paid" ? "bg-indigo-900/50 text-indigo-400" : "bg-gray-800 text-gray-400"
          }`}>
            {brand.plan === "paid" ? "Plan Pagado" : "Plan Free"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pedidos este mes", value: ordersThisMonth.toString() },
          { label: "Revenue total", value: formatCOP(totalRevenue) },
          { label: "Carritos totales", value: totalCarts.toString() },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Configuración */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white text-sm mb-4">Configuración de integraciones</h2>
        <dl className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between">
              <dt className="text-xs text-gray-500">{f.label}</dt>
              <dd className="text-xs text-gray-300 font-mono">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Acciones */}
      <AdminBrandActions brandId={brand.id} isActive={brand.is_active} launchPromo={brand.launch_promo} />

      {/* Historial de facturación */}
      {(billingResult.data ?? []).length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white text-sm">Historial de facturación</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                {["Mes", "Pedidos", "Facturables", "Monto", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(billingResult.data ?? []).map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4 py-3 font-medium text-white">{rec.month}</td>
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
      )}
    </div>
  );
}
