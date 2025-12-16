import {Dialog} from "./Dialog";
import {useDialogStore} from "~/stores/common/dialogStore";

export const DialogProvider = () => {
  const {
    isOpen,
    title,
    message,
    type,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    showCancel,
    children,
    closeDialog,
  } = useDialogStore();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={closeDialog}
      title={title}
      message={message}
      type={type}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      showCancel={showCancel}
    >
      {children}
    </Dialog>
  );
};

