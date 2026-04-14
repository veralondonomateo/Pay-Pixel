"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", ...(props.style ?? {}) }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [brand, setBrand] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", primary_color: "#6366f1",
    shopify_domain: "", shopify_access_token: "",
    mp_access_token: "",
    meta_pixel_id: "", meta_conversions_token: "",
    tiktok_pixel_id: "", tiktok_events_token: "",
  });

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: m } = await supabase.from("brand_members").select("brand_id").eq("user_id", user.id).single();
      if (!m) return;
      const { data: b } = await supabase.from("brands").select("*").eq("id", m.brand_id).single();
      if (b) {
        setBrand(b);
        setLogoPreview(b.logo_url ?? null);
        setForm({
          name: b.name ?? "", primary_color: b.primary_color ?? "#6366f1",
          shopify_domain: b.shopify_domain ?? "", shopify_access_token: "",
          mp_access_token: "",
          meta_pixel_id: b.meta_pixel_id ?? "", meta_conversions_token: "",
          tiktok_pixel_id: b.tiktok_pixel_id ?? "", tiktok_events_token: "",
        });
      }
    })();
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/dashboard/upload-logo", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setLogoPreview(json.url);
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  const color = form.primary_color;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        {brand && (
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Checkout:{" "}
            <a href={`/checkout/${brand.slug}`} target="_blank"
              className="font-mono hover:opacity-80 transition-opacity" style={{ color }}>
              /checkout/{brand.slug}
            </a>
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Marca */}
        <Section title="Identidad de la marca">
          {/* Logo */}
          <Field label="Logo" hint="PNG, JPG o SVG — máx 2MB">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                  : <span className="text-xl font-bold text-white/20">{form.name?.[0]?.toUpperCase() ?? "?"}</span>
                }
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                  {uploading ? "Subiendo..." : "Cambiar logo"}
                </button>
                {logoPreview && (
                  <button type="button"
                    onClick={async () => {
                      setLogoPreview(null);
                      await fetch("/api/dashboard/settings", {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...form, logo_url: null }),
                      });
                    }}
                    className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Quitar logo
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
          </Field>
          <Field label="Nombre de la marca">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Mi Tienda" />
          </Field>
          <Field label="Color principal">
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
                style={{ background: "rgba(255,255,255,0.05)" }} />
              <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)}
                placeholder="#6366f1" className="font-mono w-32" />
              <div className="flex-1 h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)`, boxShadow: `0 0 20px ${color}40` }} />
            </div>
          </Field>
        </Section>

        {/* Shopify */}
        <Section title="Shopify">
          <Field label="Dominio" hint="ej: mitienda.myshopify.com">
            <Input value={form.shopify_domain} onChange={(e) => set("shopify_domain", e.target.value)} placeholder="tienda.myshopify.com" />
          </Field>
          <Field label="Access Token" hint="Deja vacío para no cambiar el token actual">
            <Input type="password" value={form.shopify_access_token} onChange={(e) => set("shopify_access_token", e.target.value)} placeholder="shpat_••••••••" />
          </Field>
        </Section>

        {/* MercadoPago */}
        <Section title="MercadoPago">
          <Field label="Access Token" hint="Deja vacío para no cambiar el token actual">
            <Input type="password" value={form.mp_access_token} onChange={(e) => set("mp_access_token", e.target.value)} placeholder="APP_USR-••••••••" />
          </Field>
        </Section>

        {/* Meta */}
        <Section title="Meta (Facebook / Instagram)">
          <Field label="Pixel ID">
            <Input value={form.meta_pixel_id} onChange={(e) => set("meta_pixel_id", e.target.value)} placeholder="1234567890123456" />
          </Field>
          <Field label="Conversions API Token" hint="Deja vacío para no cambiar el token actual">
            <Input type="password" value={form.meta_conversions_token} onChange={(e) => set("meta_conversions_token", e.target.value)} placeholder="EAAxxxxxxxx" />
          </Field>
        </Section>

        {/* TikTok */}
        <Section title="TikTok">
          <Field label="Pixel ID">
            <Input value={form.tiktok_pixel_id} onChange={(e) => set("tiktok_pixel_id", e.target.value)} placeholder="XXXXXXXXXX" />
          </Field>
          <Field label="Events API Token" hint="Deja vacío para no cambiar el token actual">
            <Input type="password" value={form.tiktok_events_token} onChange={(e) => set("tiktok_events_token", e.target.value)} placeholder="••••••••" />
          </Field>
        </Section>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 24px ${color}40` }}>
          {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
