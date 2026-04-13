"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  brandColor?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, brandColor, className = "", id, ...props }, ref) => {
    const focusColor = brandColor
      ? `focus:border-[${brandColor}] focus:ring-[${brandColor}]/20`
      : "focus:border-indigo-500 focus:ring-indigo-500/20";

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white
            placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 transition-colors
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : `border-gray-300 ${focusColor}`}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
