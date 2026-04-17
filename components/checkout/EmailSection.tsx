"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CheckoutFormData } from "@/types/checkout";
import Input from "@/components/ui/Input";

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  brandColor: string;
}

export default function EmailSection({ register, errors, brandColor }: Props) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
          style={{ backgroundColor: brandColor }}
        >
          1
        </span>
        Contacto
      </h3>

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <p className="text-xs text-gray-400">
        Recibirás la confirmación y actualizaciones de tu pedido aquí
      </p>
    </section>
  );
}
