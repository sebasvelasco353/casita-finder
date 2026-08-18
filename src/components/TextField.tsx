interface TextFieldPropsInterface {
  label: string;
  as?: "input" | "textarea";
  type?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
}

export default function TextField({
  label,
  as = "input",
  type = "text",
  required = false,
  placeholder,
  helperText,
  value,
  onChange,
  className = "",
  autoComplete,
}: TextFieldPropsInterface) {
  const fieldClassName =
    "w-full rounded-lg border border-gray-91 bg-gray-98 px-4 py-2.5 text-sm text-orange-18 placeholder:text-orange-42/60 focus:outline-none focus:ring-2 focus:ring-orange-47";

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
      ) : (
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={fieldClassName}
        />
      )}
      {helperText && <span className="text-xs text-orange-42">{helperText}</span>}
    </label>
  );
}
