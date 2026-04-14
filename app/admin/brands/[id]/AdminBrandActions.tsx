"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  brandId: string;
  isActive: boolean;
  launchPromo: boolean;
}

export default function AdminBrandActions({ brandId, isActive, launchPromo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async (action: "toggle_active" | "toggle_promo" | "mark_paid") => {
    setLoading(true);
    try {
      await fetch("/api/admin/brands/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, action }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="font-semibold text-white text-sm mb-4">Acciones</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => toggle("toggle_active")}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            isActive
              ? "bg-red-900/40 text-red-400 hover:bg-red-900/60"
              : "bg-green-900/40 text-green-400 hover:bg-green-900/60"
          }`}
        >
          {isActive ? "Desactivar marca" : "Activar marca"}
        </button>
        <button
          onClick={() => toggle("toggle_promo")}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/60 transition-colors disabled:opacity-50"
        >
          {launchPromo ? "Quitar promo" : "Activar promo"}
        </button>
        <button
          onClick={() => toggle("mark_paid")}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
        >
          Marcar como pagado
        </button>
      </div>
    </div>
  );
}
