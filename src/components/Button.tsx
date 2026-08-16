import type { ReactNode } from "react";

interface ButtonPropsInterface {
  handleClick: () => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  handleClick,
  variant = "primary",
  type = "button",
  children,
  className,
  disabled
}: ButtonPropsInterface) {
  const getVariantStyles = () => {
    return variant === "primary" ? 'bg-orange-47 text-gray-99' : 'border-orange-47 border bg-transparent text-orange-47'
  }
  return <button type={type} disabled={disabled} className={`cursor-pointer py-3 px-6 rounded-full font-semibold text-sm flex flex-row gap-2.5 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${className}`.trim()} onClick={handleClick}>{children}</button>;
}
