import { useEffect, useRef, useState } from "react";

interface DropdownOptionInterface {
  label: string;
  value: string;
}

interface DropdownPropsInterface {
  options: DropdownOptionInterface[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export default function Dropdown({
  options,
  placeholder = "Seleccionar",
  value,
  defaultValue,
  onChange,
}: DropdownPropsInterface) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleSelect(option: DropdownOptionInterface) {
    if (!isControlled) setInternalValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="cursor-pointer inline-flex items-center gap-2 py-2.5 px-5 rounded-full border border-gray-91 bg-gray-98 text-orange-18 text-sm font-medium"
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

      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 top-full mt-2 min-w-full w-max py-2 rounded-2xl border border-gray-91 bg-gray-99 shadow-lg z-10"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-93 ${
                  option.value === selectedValue ? "text-orange-47 font-semibold" : "text-orange-18"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
