import {PromptProvider as UIPromptProvider} from "@bilibay/ui";
import {usePromptStore} from "~/stores/common/promptStore";

export const PromptProvider = () => {
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
    closePrompt,
  } = usePromptStore();

  return (
    <UIPromptProvider
      isOpen={isOpen}
      onClose={closePrompt}
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
    </UIPromptProvider>
  );
};

