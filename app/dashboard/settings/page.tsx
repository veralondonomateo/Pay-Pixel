"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SettingsPage() {
  const [brand, setBrand] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    primary_color: "#6366f1",
    shopify_domain: "",
    shopify_access_token: "",
    mp_access_token: "",
    meta_pixel_id: "",
    meta_conversions_token: "",
    tiktok_pixel_id: "",
    tiktok_events_token: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: membership } = await supabase
        .from("brand_members").select("brand_id").eq("user_id", user.id).single();
      if (!membership) return;
      const { data: b } = await supabase.from("brands").select("*").eq("id", membership.brand_id).single();
      if (b) {
        setBrand(b);
        setForm({
          name: b.name ?? "",
          primary_color: b.primary_color ?? "#6366f1",
          shopify_domain: b.shopify_domain ?? "",
          shopify_access_token: "",
          mp_access_token: "",
          meta_pixel_id: b.meta_pixel_id ?? "",
          meta_conversions_token: "",
          tiktok_pixel_id: b.tiktok_pixel_id ?? "",
          tiktok_events_token: "",
        });
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        {brand && (
          <p className="text-sm text-gray-500 mt-1">
            URL de tu checkout:{" "}
            <a href={`/checkout/${brand.slug}`} target="_blank" className="text-indigo-600 font-medium hover:underline">
              paypixel.com/checkout/{brand.slug}
            </a>
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Marca */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">Identidad de la marca</h2>
          <Input label="Nombre de la marca" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Color primario</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color}
                onChange={(e) => setForm(f => ({ ...f, primary_color: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
              <span className="text-sm text-gray-600 font-mono">{form.primary_color}</span>
            </div>
          </div>
        </div>

        {/* Shopify */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">S</span>
            Shopify
          </h2>
          <Input label="Dominio de Shopify" placeholder="mitienda.myshopify.com"
            value={form.shopify_domain} onChange={(e) => setForm(f => ({ ...f, shopify_domain: e.target.value }))} />
          <Input label="Access Token (Custom App)" type="password" placeholder="shpat_••••••••"
            value={form.shopify_access_token} onChange={(e) => setForm(f => ({ ...f, shopify_access_token: e.target.value }))} />
          <p className="text-xs text-gray-400">Deja vacío el token para no cambiarlo.</p>
        </div>

        {/* MercadoPago */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-[#009ee3] rounded text-white text-xs flex items-center justify-center font-bold">M</span>
            MercadoPago
          </h2>
          <Input label="Access Token de MercadoPago" type="password" placeholder="APP_USR-••••••••"
            value={form.mp_access_token} onChange={(e) => setForm(f => ({ ...f, mp_access_token: e.target.value }))} />
        </div>

        {/* Meta */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">M</span>
            Meta (Facebook/Instagram)
          </h2>
          <Input label="Meta Pixel ID" placeholder="1234567890123456"
            value={form.meta_pixel_id} onChange={(e) => setForm(f => ({ ...f, meta_pixel_id: e.target.value }))} />
          <Input label="Conversions API Token" type="password" placeholder="EAAxxxxxxxx"
            value={form.meta_conversions_token} onChange={(e) => setForm(f => ({ ...f, meta_conversions_token: e.target.value }))} />
        </div>

        {/* TikTok */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-5 h-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</span>
            TikTok
          </h2>
          <Input label="TikTok Pixel ID" placeholder="XXXXXXXXXX"
            value={form.tiktok_pixel_id} onChange={(e) => setForm(f => ({ ...f, tiktok_pixel_id: e.target.value }))} />
          <Input label="Events API Token" type="password"
            value={form.tiktok_events_token} onChange={(e) => setForm(f => ({ ...f, tiktok_events_token: e.target.value }))} />
        </div>

        <Button type="submit" loading={saving} brandColor={brand?.primary_color}>
          {saved ? "✓ Guardado" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
