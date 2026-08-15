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
    return variant === "primary" ? 'bg-orange-47 text-gray-99' : 'border-orange-47 border bg-transparent text-orange-47'
  }
  return <button className={`cursor-pointer py-3 px-6 rounded-full font-semibold text-sm ${getVariantStyles()}`} onClick={handleClick}>{children}</button>;
}
