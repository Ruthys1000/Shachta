import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function DeleteConfirmModal({
  itemLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  itemLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      title="מחיקת פריט"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            מחיקה
          </Button>
        </>
      }
    >
      <p className="text-sm text-foreground">
        למחוק את <span className="font-semibold">{itemLabel}</span>? פעולה זו לא ניתנת לביטול.
      </p>
    </Modal>
  );
}
