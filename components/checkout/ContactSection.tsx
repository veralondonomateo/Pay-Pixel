"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CheckoutFormData } from "@/types/checkout";
import Input from "@/components/ui/Input";

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export default function ContactSection({ register, errors }: Props) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
        Información de contacto
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre"
          placeholder="Juan"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          label="Apellido"
          placeholder="Pérez"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="juan@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Teléfono (celular)"
        type="tel"
        placeholder="3001234567"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Input
        label="Cédula (opcional)"
        placeholder="1234567890"
        {...register("cedula")}
      />
    </section>
  );
}
