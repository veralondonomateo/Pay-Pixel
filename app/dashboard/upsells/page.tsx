"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface UpsellProduct {
  id: string;
  shopify_handle: string;
  name: string;
  variant: string | null;
  price: number;
  compare_price: number | null;
  image: string | null;
  benefit: string | null;
  stock: number;
  sold_today: number;
  position: number;
  is_active: boolean;
  show_in_checkout: boolean;
  show_post_purchase: boolean;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  variants: { id: number; title: string; price: string }[];
  images: { src: string }[];
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

const EMPTY_FORM = {
  shopify_handle: "", name: "", variant: "", price: "", compare_price: "",
  image: "", benefit: "", stock: "99", show_in_checkout: true, show_post_purchase: false,
};

export default function UpsellsPage() {
  const [upsells, setUpsells] = useState<UpsellProduct[]>([]);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [brandSlug, setBrandSlug] = useState("");
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleting, setDeleting] = useState<string | null>(null);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Cargar datos al montar
  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: m } = await supabase.from("brand_members").select("brand_id").eq("user_id", user.id).single();
      if (!m) return;
      const { data: b } = await supabase.from("brands").select("slug, primary_color, shopify_domain").eq("id", m.brand_id).single();
      if (b) {
        setBrandSlug(b.slug);
        setBrandColor(b.primary_color ?? "#6366f1");

        // Cargar productos de Shopify si está conectado
        if (b.shopify_domain && b.slug) {
          try {
            const res = await fetch(`/api/${b.slug}/products`);
            if (res.ok) {
              const json = await res.json();
              setShopifyProducts(json.products ?? []);
            }
          } catch { /* No hay Shopify */ }
        }
      }

      // Cargar upsells
      await loadUpsells();
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUpsells = async () => {
    const res = await fetch("/api/dashboard/upsells");
    if (res.ok) {
      const json = await res.json();
      setUpsells(json.upsells ?? []);
    }
  };

  // Autocompletar desde Shopify
  const handleShopifyPickChange = (handle: string) => {
    const product = shopifyProducts.find((p) => p.handle === handle);
    if (!product) { set("shopify_handle", handle); return; }
    const variant = product.variants[0];
    set("shopify_handle", handle);
    set("name", product.title);
    set("price", Math.round(parseFloat(variant?.price ?? "0")).toString());
    set("image", product.images[0]?.src ?? "");
    if (variant?.title && variant.title !== "Default Title") set("variant", variant.title);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (u: UpsellProduct) => {
    setEditId(u.id);
    setForm({
      shopify_handle: u.shopify_handle ?? "",
      name: u.name,
      variant: u.variant ?? "",
      price: u.price.toString(),
      compare_price: u.compare_price?.toString() ?? "",
      image: u.image ?? "",
      benefit: u.benefit ?? "",
      stock: u.stock.toString(),
      show_in_checkout: u.show_in_checkout,
      show_post_purchase: u.show_post_purchase,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...(editId ? { id: editId } : {}),
      shopify_handle: form.shopify_handle,
      name: form.name,
      variant: form.variant || null,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      image: form.image || null,
      benefit: form.benefit || null,
      stock: Number(form.stock),
      show_in_checkout: form.show_in_checkout,
      show_post_purchase: form.show_post_purchase,
    };

    const method = editId ? "PATCH" : "POST";
    const res = await fetch("/api/dashboard/upsells", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await loadUpsells();
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    }
    setSaving(false);
  };

  const toggleActive = async (u: UpsellProduct) => {
    await fetch("/api/dashboard/upsells", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, is_active: !u.is_active }),
    });
    await loadUpsells();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/dashboard/upsells?id=${id}`, { method: "DELETE" });
    await loadUpsells();
    setDeleting(null);
  };

  const color = brandColor;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: color, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Upsells</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Productos adicionales que se ofrecen en el checkout y en la página de gracias.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 16px ${color}40` }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar upsell
          </button>
        )}
      </div>

      {/* Explicación */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: `${color}0d`, border: `1px solid ${color}20` }}>
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          <strong className="text-white">¿Cómo funciona?</strong> Los upsells con <em>"En checkout"</em> aparecen en el formulario de compra como productos adicionales. Los de <em>"Post-compra"</em> aparecen en la página de gracias para agregar a la orden. Si no configuras ninguno, PayPixel sugiere automáticamente otros productos de tu tienda.
        </div>
      </div>

      {/* ── Formulario add/edit ── */}
      {showForm && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}40` }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{editId ? "Editar upsell" : "Nuevo upsell"}</p>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Picker de Shopify */}
            {shopifyProducts.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Seleccionar de Shopify
                </label>
                <select
                  value={form.shopify_handle}
                  onChange={(e) => handleShopifyPickChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <option value="">— Elige un producto de tu tienda —</option>
                  {shopifyProducts.map((p) => (
                    <option key={p.id} value={p.handle}>{p.title}</option>
                  ))}
                </select>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                  Al elegir un producto, se autocompletan los campos de abajo (puedes editarlos)
                </p>
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Nombre del producto *
                </label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="Proteína Premium 1kg"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Variante (opcional)
                </label>
                <input value={form.variant} onChange={(e) => set("variant", e.target.value)}
                  placeholder="Sabor Chocolate"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Precio (COP) *
                </label>
                <input required type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                  placeholder="89900"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Precio tachado (opcional)
                </label>
                <input type="number" value={form.compare_price} onChange={(e) => set("compare_price", e.target.value)}
                  placeholder="129900"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Stock disponible
                </label>
                <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)}
                  placeholder="99"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  URL imagen (opcional)
                </label>
                <input value={form.image} onChange={(e) => set("image", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                Beneficio / gancho (opcional)
              </label>
              <input value={form.benefit} onChange={(e) => set("benefit", e.target.value)}
                placeholder="Perfecto para complementar tu pedido — ahorra 30%"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                Mensaje corto que convence al cliente de añadirlo
              </p>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "show_in_checkout", label: "Mostrar en el checkout", desc: "Aparece antes de pagar" },
                { key: "show_post_purchase", label: "Mostrar post-compra", desc: "Aparece en la página de gracias" },
              ].map(({ key, label, desc }) => {
                const val = form[key as keyof typeof form] as boolean;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set(key, !val)}
                    className="flex items-center justify-between p-3 rounded-xl transition-all text-left"
                    style={{
                      background: val ? `${color}15` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${val ? color + "40" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div>
                      <p className="text-xs font-semibold" style={{ color: val ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>{label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{desc}</p>
                    </div>
                    <div
                      className="w-8 h-4.5 rounded-full flex items-center transition-all flex-shrink-0 ml-3"
                      style={{ background: val ? color : "rgba(255,255,255,0.1)", padding: 2 }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white transition-all"
                        style={{ transform: val ? "translateX(13px)" : "translateX(0)" }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 24px ${color}40` }}>
              {saving ? "Guardando..." : editId ? "Guardar cambios" : "Agregar upsell"}
            </button>
          </form>
        </div>
      )}

      {/* ── Lista de upsells ── */}
      {upsells.length === 0 && !showForm ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <svg className="w-6 h-6" style={{ color: "rgba(255,255,255,0.2)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-white/60 mb-1">Sin upsells configurados</p>
          <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.25)" }}>
            PayPixel mostrará automáticamente otros productos de tu tienda como sugerencias.
          </p>
          <button onClick={openNew}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            Agregar primer upsell
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {upsells.map((u) => {
            const discount = u.compare_price && u.compare_price > u.price
              ? Math.round(((u.compare_price - u.price) / u.compare_price) * 100)
              : null;
            return (
              <div
                key={u.id}
                className="rounded-2xl p-4 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${u.is_active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                  opacity: u.is_active ? 1 : 0.6,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Imagen */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {u.image
                      ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6" style={{ color: "rgba(255,255,255,0.15)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{u.name}</p>
                      {u.variant && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>{u.variant}</span>}
                    </div>
                    {u.benefit && <p className="text-xs mt-0.5" style={{ color }}>{u.benefit}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-bold text-white">{formatCOP(u.price)}</span>
                      {u.compare_price && <span className="text-xs line-through" style={{ color: "rgba(255,255,255,0.25)" }}>{formatCOP(u.compare_price)}</span>}
                      {discount && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>-{discount}%</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {u.show_in_checkout && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>En checkout</span>}
                      {u.show_post_purchase && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>Post-compra</span>}
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Stock: {u.stock}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle activo */}
                    <button
                      onClick={() => toggleActive(u)}
                      className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                      style={{ background: u.is_active ? color : "rgba(255,255,255,0.1)" }}
                      title={u.is_active ? "Desactivar" : "Activar"}
                    >
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: u.is_active ? "calc(100% - 18px)" : "2px" }} />
                    </button>

                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)" }}
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deleting === u.id}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.05)" }}
                      title="Eliminar"
                    >
                      {deleting === u.id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(239,68,68,0.5)", borderTopColor: "transparent" }} />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ir al checkout para previsualizar */}
      {brandSlug && (
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            ¿Quieres ver cómo se ven en tu checkout?
          </p>
          <a
            href={`/checkout/${brandSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}
          >
            Ver checkout →
          </a>
        </div>
      )}
    </div>
  );
}
