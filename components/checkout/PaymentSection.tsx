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

export default function PaymentSection({
  register,
  errors,
  watch,
  brandColor,
  stepNumber = 4,
}: Props) {
  const selected = watch("paymentMethod");

  const methods = [
    {
      value: "mercadopago",
      label: "Pagar ahora con MercadoPago",
      description: "Tarjeta, PSE, Nequi, Daviplata y más",
      icon: (
        <svg className="w-5 h-5 text-[#009ee3]" viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 0C9 0 0 9 0 20s9 20 20 20 20-9 20-20S31 0 20 0zm7.6 23.4c-.4.5-1 .8-1.7.8H14.1l-.9-3.6h9.6c1 0 1.8-.4 2.2-1.2.4-.8.3-1.7-.3-2.5l-3-3.9h4.7l3 3.9c1.1 1.5 1.2 3.8.2 5.5z"/>
        </svg>
      ),
    },
    {
      value: "contraentrega",
      label: "Pago contra entrega",
      description: "Paga en efectivo cuando recibas tu pedido",
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
          style={{ backgroundColor: brandColor }}
        >
          {stepNumber}
        </span>
        Método de pago
      </h3>

      {errors.paymentMethod && (
        <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>
      )}

      <div className="space-y-2">
        {methods.map((method) => {
          const isSelected = selected === method.value;
          return (
            <label
              key={method.value}
              className={`
                flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all
                ${isSelected ? "border-2 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}
              `}
              style={isSelected ? { borderColor: brandColor, backgroundColor: `${brandColor}10` } : {}}
            >
              <input
                type="radio"
                value={method.value}
                className="sr-only"
                {...register("paymentMethod")}
              />
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={isSelected
                  ? { borderColor: brandColor }
                  : { borderColor: "#d1d5db" }
                }
              >
                {isSelected && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                )}
              </div>
              <span className="flex-shrink-0">{method.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
