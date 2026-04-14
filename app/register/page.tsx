"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", brandName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al registrar"); return; }
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      router.push("/dashboard/settings");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center px-4">
      {/* Subtle top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[480px] h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/Pay Pixel-1.png" alt="PayPixel" width={100} height={22} className="object-contain mx-auto" />
          </Link>
          <p className="text-sm text-white/30 mt-3">Gratis hasta 100 pedidos · Sin tarjeta</p>
        </div>

        {/* Form */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-1.5">Nombre de tu marca</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm(f => ({ ...f, brandName: e.target.value }))}
                required
                placeholder="FEM Suplementos"
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
                placeholder="tu@email.com"
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="input-dark"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors mt-1"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>

            <p className="text-center text-xs text-white/20">
              Al registrarte aceptas los términos de servicio.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Inicia sesión
          </Link>
        </p>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
