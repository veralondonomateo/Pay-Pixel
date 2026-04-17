"use client";

import type { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import type { CheckoutFormData } from "@/types/checkout";

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  brandColor: string;
  stepNumber?: number;
}

const MP_METHODS = [
  { label: "Tarjeta", icon: "💳" },
  { label: "Nequi", icon: "📲" },
  { label: "Daviplata", icon: "🔴" },
  { label: "PSE", icon: "🏦" },
  { label: "Cuotas", icon: "📅" },
];

export default function PaymentSection({
  register,
  errors,
  watch,
  brandColor,
  stepNumber = 4,
}: Props) {
  const selected = watch("paymentMethod");

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
          style={{ backgroundColor: brandColor }}
        >
          {stepNumber}
        </span>
        Método de pago
      </h3>

      {errors.paymentMethod && (
        <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>
      )}

      <div className="space-y-2.5">
        {/* ── MercadoPago ── */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            value="mercadopago"
            className="sr-only"
            {...register("paymentMethod")}
          />
          <div
            className={`relative rounded-xl border-2 overflow-hidden transition-all ${
              selected === "mercadopago"
                ? "shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            style={
              selected === "mercadopago"
                ? { borderColor: brandColor, backgroundColor: `${brandColor}09` }
                : {}
            }
          >
            {/* Popular badge */}
            <div
              className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-xl uppercase tracking-wider"
              style={{ backgroundColor: brandColor }}
            >
              ⭐ Más popular
            </div>

            <div className="p-4 pr-28">
              <div className="flex items-center gap-3">
                {/* Radio dot */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={
                    selected === "mercadopago"
                      ? { borderColor: brandColor }
                      : { borderColor: "#d1d5db" }
                  }
                >
                  {selected === "mercadopago" && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: brandColor }}
                    />
                  )}
                </div>

                {/* MP icon */}
                <svg
                  className="w-6 h-6 text-[#009ee3] flex-shrink-0"
                  viewBox="0 0 40 40"
                  fill="currentColor"
                >
                  <path d="M20 0C9 0 0 9 0 20s9 20 20 20 20-9 20-20S31 0 20 0zm7.6 23.4c-.4.5-1 .8-1.7.8H14.1l-.9-3.6h9.6c1 0 1.8-.4 2.2-1.2.4-.8.3-1.7-.3-2.5l-3-3.9h4.7l3 3.9c1.1 1.5 1.2 3.8.2 5.5z" />
                </svg>

                <div>
                  <p className="text-sm font-bold text-gray-900">Pagar ahora con MercadoPago</p>
                  <p className="text-xs text-gray-500 mt-0.5">Seguro e instantáneo</p>
                </div>
              </div>

              {/* Sub-methods */}
              <div className="mt-3 ml-8 flex flex-wrap gap-1.5">
                {MP_METHODS.map((m) => (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border border-gray-200 text-gray-600 shadow-sm"
                  >
                    {m.icon} {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </label>

        {/* ── Contra entrega ── */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            value="contraentrega"
            className="sr-only"
            {...register("paymentMethod")}
          />
          <div
            className={`rounded-xl border-2 transition-all ${
              selected === "contraentrega"
                ? "shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            style={
              selected === "contraentrega"
                ? { borderColor: brandColor, backgroundColor: `${brandColor}09` }
                : {}
            }
          >
            <div className="p-4 flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={
                  selected === "contraentrega"
                    ? { borderColor: brandColor }
                    : { borderColor: "#d1d5db" }
                }
              >
                {selected === "contraentrega" && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
              </div>

              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              <div>
                <p className="text-sm font-semibold text-gray-900">Pago contra entrega</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paga en efectivo cuando recibas tu pedido
                </p>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-1.5 pt-1">
        <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[10px] text-gray-400">
          Tus datos de pago están protegidos con encriptación SSL de 256 bits
        </p>
      </div>
    </section>
  );
}
