import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface DropdownOptionInterface {
  label: string;
  value: string;
}

interface DropdownPropsInterface {
  options: DropdownOptionInterface[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  variant?: "pill" | "field";
  error?: boolean;
  errorMessage?: string;
}

export default function Dropdown({
  options,
  placeholder = "Seleccionar",
  value,
  onChange,
  variant = "pill",
  error = false,
  errorMessage,
}: DropdownPropsInterface) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  // "pill" (filtros) mantiene el label fijo -- la selección ya se ve en la
  // barra de pills; "field" (forms) sí muestra el valor elegido.
  const displayLabel =
    variant === "pill" ? placeholder : (selectedOption?.label ?? placeholder);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const trigger = containerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const margin = 8;
      const menuWidth = menuRef.current?.offsetWidth ?? rect.width;
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - menuWidth - margin);
      }
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + margin,
        left,
        minWidth: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  function handleSelect(option: DropdownOptionInterface) {
    onChange(option.value);
    setIsOpen(false);
  }

  const borderClassName = error
    ? "border-red-500 ring-1 ring-red-500"
    : "border-gray-91";

  const triggerClassName =
    variant === "field"
      ? `cursor-pointer w-full inline-flex items-center justify-between gap-2 py-2.5 px-4 rounded-lg border ${borderClassName} bg-gray-98 text-sm font-medium ${
          selectedOption ? "text-orange-18" : "text-orange-42/60"
        }`
      : `cursor-pointer inline-flex items-center gap-2 py-2.5 px-5 rounded-full border ${borderClassName} bg-gray-98 text-orange-18 text-sm font-medium`;

  return (
    <div className={variant === "field" ? "relative w-full" : "relative inline-block"} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={triggerClassName}
      >
        <span>{displayLabel}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M5 7.5l5 5 5-5" />
        </svg>
      </button>

      {errorMessage && (
        <span className="text-xs text-red-600 mt-1 block">{errorMessage}</span>
      )}

      {isOpen &&
        createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className="w-max py-2 rounded-2xl border border-gray-91 bg-gray-99 shadow-lg z-50"
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-93 ${
                    option.value === value ? "text-orange-47 font-semibold" : "text-orange-18"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
