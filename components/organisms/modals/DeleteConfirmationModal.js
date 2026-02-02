import Modal from "../../molecules/Modal";
import Button from "../../atoms/Button";

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.",
  loading = false,
}) {
  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-amber-600 bg-amber-50 p-4 rounded-lg">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-medium">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Hapus Data
          </Button>
        </div>
      </div>
    </Modal>
  );
}
