import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
  closeOnBackdropClick = true,
}: ModalPropsInterface) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-18/40 motion-safe:animate-[fade-in_0.15s_ease-out]"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-99 p-6 shadow-lg motion-safe:animate-[fade-in-up_0.2s_ease-out] ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          {title && (
            <h2 id={titleId} className="text-xl font-bold text-orange-18">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer text-orange-42 hover:text-orange-18 ml-auto shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
