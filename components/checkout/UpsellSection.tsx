"use client";

import Image from "next/image";
import type { UpsellProduct } from "@/types/tenant";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

interface Props {
  products: UpsellProduct[];
  qty: Record<string, number>;
  onToggle: (id: string) => void;
  brandColor: string;
  stepNumber?: number;
}

export default function UpsellSection({
  products,
  qty,
  onToggle,
  brandColor,
  stepNumber = 3,
}: Props) {
  if (!products.length) return null;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
          style={{ backgroundColor: brandColor }}
        >
          {stepNumber}
        </span>
        Completa tu pedido
        <span className="ml-auto text-xs font-normal text-gray-400">Agrega más productos</span>
      </h3>

      <div className="space-y-3">
        {products.map((product) => {
          const isSelected = (qty[product.id] ?? 0) > 0;
          return (
            <div
              key={product.id}
              onClick={() => onToggle(product.id)}
              className={`
                relative rounded-lg border cursor-pointer transition-all
                ${isSelected
                  ? "border-2 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
              style={isSelected ? { borderColor: brandColor } : {}}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Imagen */}
                <div className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">
                    {product.name}
                  </p>
                  {product.variant && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.variant}</p>
                  )}
                  {product.benefit && (
                    <p className="text-xs text-green-600 mt-0.5 font-medium">
                      ✓ {product.benefit}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCOP(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatCOP(product.compare_price)}
                      </span>
                    )}
                    {product.stock < 10 && (
                      <span className="text-xs text-orange-600 font-medium">
                        ¡Solo {product.stock} disponibles!
                      </span>
                    )}
                  </div>
                </div>

                {/* Checkbox */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: brandColor, borderColor: brandColor }
                      : { borderColor: "#d1d5db" }
                  }
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Social proof */}
              {product.sold_today > 0 && (
                <div className="px-3 pb-2">
                  <p className="text-xs text-gray-400">
                    🔥 {product.sold_today} personas lo agregaron hoy
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
