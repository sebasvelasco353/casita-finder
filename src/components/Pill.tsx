import type { ReactNode } from "react";

interface PillPropsInterface {
  variant?: "primary" | "secondary" | "tertiary";
  children: ReactNode;
}

export default function Pill({
  variant = "primary",
  children,
}: PillPropsInterface) {
  const getVariantStyles = () => {
    if (variant === "primary") return "bg-orange-47 text-gray-99 font-semibold";
    if (variant === "secondary")
      return "bg-gray-98 border border-gray-91 text-orange-18";
    return "bg-gray-93 text-orange-18";
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs ${getVariantStyles()}`}
    >
      {children}
    </span>
  );
}
