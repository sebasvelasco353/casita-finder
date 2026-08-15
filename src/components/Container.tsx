import type { ReactNode } from "react";

interface ContainerPropsType {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerPropsType) {
  return (
    <div className={`mx-auto max-w-(--max-width) px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
