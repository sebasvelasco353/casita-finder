import Button from "../Button";
import Modal from "./Modal";

interface ConfirmModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirming?: boolean;
  error?: string | null;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Eliminar",
  confirming = false,
  error,
}: ConfirmModalPropsInterface) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-sm"
      footer={
        <>
          <Button variant="secondary" disabled={confirming} handleClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={confirming} handleClick={onConfirm}>
            {confirming ? "Eliminando..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-orange-42">{message}</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Modal>
  );
}
