import { createServiceClient } from "@/lib/supabase";

export default async function AdminBrandsPage() {
  const supabase = createServiceClient();

  const { data: brands } = await supabase
    .from("brands")
    .select(`
      id, name, slug, billing_email, plan, launch_promo, is_active, created_at,
      brand_members(count),
      orders(count)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marcas</h1>
          <p className="text-gray-500 text-sm mt-1">{brands?.length ?? 0} registradas</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-800">
            <tr>
              {["Marca", "Email", "Plan", "Estado", "Registro", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(brands ?? []).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-600">Sin marcas.</td></tr>
            )}
            {(brands ?? []).map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{brand.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{brand.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{brand.billing_email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    brand.plan === "paid" ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-400"
                  }`}>
                    {brand.plan === "paid" ? "Pagado" : "Free"}
                    {brand.launch_promo ? " 🎁" : ""}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    brand.is_active ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
                  }`}>
                    {brand.is_active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(brand.created_at).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <a href={`/admin/brands/${brand.id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    Ver →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
