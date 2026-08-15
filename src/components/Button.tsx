import type { ReactNode } from "react";

interface ButtonPropsInterface {
  handleClick: () => void;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export default function Button({
  handleClick,
  variant = "primary",
  children,
}: ButtonPropsInterface) {
  console.log(variant);

  const getVariantStyles = () => {
    return variant === "primary" ? 'bg-orange-47 text-gray-99 font-semibold text-sm' : 'font-semibold text-sm'
  }
  return <button className={`pointer py-3 px-6 rounded-full ${getVariantStyles()}`} onClick={handleClick}>{children}</button>;
}
