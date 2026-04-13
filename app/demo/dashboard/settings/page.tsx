"use client";

export default function DemoSettingsPage() {
  const fields = {
    name: "FEM Suplementos",
    primary_color: "#6366f1",
    shopify_domain: "femsuplementos.myshopify.com",
    meta_pixel_id: "1234567890123456",
    tiktok_pixel_id: "C4BXXXXXXXX",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">
          URL de tu checkout:{" "}
          <span className="text-indigo-600 font-medium">paypixel.com/checkout/fem-suplementos</span>
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        Estás en modo demo — los cambios no se guardan. <a href="/register" className="font-semibold underline">Crea tu cuenta real →</a>
      </div>

      {/* Marca */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">Identidad de la marca</h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Nombre de la marca</label>
          <input type="text" defaultValue={fields.name} disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Color primario</label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-gray-300" style={{ backgroundColor: fields.primary_color }} />
            <span className="text-sm text-gray-600 font-mono">{fields.primary_color}</span>
          </div>
        </div>
      </div>

      {/* Shopify */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">S</span>
          Shopify
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Dominio de Shopify</label>
          <input type="text" defaultValue={fields.shopify_domain} disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Access Token</label>
          <input type="password" defaultValue="shpat_demo_token_hidden" disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
      </div>

      {/* MercadoPago */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 bg-[#009ee3] rounded text-white text-xs flex items-center justify-center font-bold">M</span>
          MercadoPago
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Access Token</label>
          <input type="password" defaultValue="APP_USR_demo_token" disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">M</span>
          Meta (Facebook/Instagram)
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Meta Pixel ID</label>
          <input type="text" defaultValue={fields.meta_pixel_id} disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Conversions API Token</label>
          <input type="password" defaultValue="EAAdemo" disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
      </div>

      {/* TikTok */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</span>
          TikTok
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">TikTok Pixel ID</label>
          <input type="text" defaultValue={fields.tiktok_pixel_id} disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Events API Token</label>
          <input type="password" defaultValue="ttdemo" disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" />
        </div>
      </div>

      <button disabled
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold opacity-40 cursor-not-allowed">
        Guardar cambios (demo)
      </button>
    </div>
  );
}
