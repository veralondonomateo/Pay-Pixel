"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { useMemo } from "react";
import type { CheckoutFormData } from "@/types/checkout";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import statesData from "@/data/states.json";

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  stepNumber?: number;
  brandColor?: string;
}

export default function DeliverySection({
  register,
  errors,
  watch,
  setValue,
  stepNumber = 2,
  brandColor = "#6366f1",
}: Props) {
  const selectedState = watch("state");

  const stateOptions = useMemo(
    () =>
      statesData.states
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((s) => ({ value: s.name, label: s.name })),
    []
  );

  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    const found = statesData.states.find((s) => s.name === selectedState);
    return (found?.cities ?? [])
      .slice()
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((c) => ({ value: c, label: c }));
  }, [selectedState]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("state", e.target.value, { shouldValidate: true });
    setValue("city", "", { shouldValidate: false });
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
          style={{ backgroundColor: brandColor }}
        >
          {stepNumber}
        </span>
        Dirección de entrega
      </h3>

      <Input
        label="Dirección"
        placeholder="Calle 123 # 45-67"
        autoComplete="street-address"
        error={errors.address?.message}
        {...register("address")}
      />

      <Input
        label="Complemento (opcional)"
        placeholder="Apto 301, Casa, Torre..."
        error={errors.complement?.message}
        {...register("complement")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Departamento"
          placeholder="Selecciona"
          options={stateOptions}
          error={errors.state?.message}
          {...register("state", { onChange: handleStateChange })}
        />
        <Select
          label="Ciudad"
          placeholder={selectedState ? "Selecciona" : "Elige departamento"}
          options={cityOptions}
          disabled={!selectedState}
          error={errors.city?.message}
          {...register("city")}
        />
      </div>
    </section>
  );
}
