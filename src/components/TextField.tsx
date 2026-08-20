import type { ReactNode } from "react";

interface TextFieldPropsInterface {
  label: string;
  as?: "input" | "textarea";
  type?: string;
  inputMode?: "text" | "numeric";
  prefix?: ReactNode;
  suffix?: ReactNode;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
}

export default function TextField({
  label,
  as = "input",
  type = "text",
  inputMode = "text",
  prefix,
  suffix,
  required = false,
  placeholder,
  helperText,
  error = false,
  errorMessage,
  value,
  onChange,
  className = "",
  autoComplete,
}: TextFieldPropsInterface) {
  const borderClassName = error
    ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500"
    : "border-gray-91 focus:ring-orange-47";

  const fieldClassName = `w-full rounded-lg border ${borderClassName} bg-gray-98 px-4 py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2`;

  const hasAdornments = Boolean(prefix || suffix);
  const paddingClassName = `${prefix ? "pl-8" : "pl-4"} ${suffix ? "pr-14" : "pr-4"}`;
  const inputClassName = `w-full rounded-lg border ${borderClassName} bg-gray-98 ${paddingClassName} py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2`;

  return (
    <label className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <span className="text-sm font-medium text-orange-18">
        {label} {required && <span className="text-orange-47">*</span>}
      </span>
      {as === "textarea" ? (
        <textarea
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          autoComplete={autoComplete}
          className={fieldClassName}
        />
      ) : hasAdornments ? (
        <div className="relative flex items-center w-full">
          {prefix && (
            <span className="pointer-events-none absolute left-3 text-sm font-medium text-orange-42 select-none">
              {prefix}
            </span>
          )}
          <input
            type={type}
            inputMode={inputMode}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete={autoComplete}
            className={inputClassName}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3 text-xs font-semibold text-orange-42 select-none">
              {suffix}
            </span>
          )}
        </div>
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={fieldClassName}
        />
      )}
      {errorMessage ? (
        <span className="text-xs text-red-600">{errorMessage}</span>
      ) : helperText ? (
        <span className="text-xs text-orange-42">{helperText}</span>
      ) : null}
    </label>
  );
}
