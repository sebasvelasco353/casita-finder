import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxPropsInterface {
  photos: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ photos, index, onClose, onNavigate }: LightboxPropsInterface) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") onNavigate((index + 1) % photos.length);
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, photos.length, onClose, onNavigate]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="cursor-pointer absolute top-4 right-4 text-gray-99 hover:text-gray-93"
      >
        <X className="w-8 h-8" />
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index - 1 + photos.length) % photos.length);
          }}
          aria-label="Anterior"
          className="cursor-pointer absolute left-4 text-gray-99 hover:text-gray-93"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      <img
        src={photos[index]}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(event) => event.stopPropagation()}
      />

      {photos.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index + 1) % photos.length);
          }}
          aria-label="Siguiente"
          className="cursor-pointer absolute right-4 text-gray-99 hover:text-gray-93"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}
    </div>,
    document.body,
  );
}
