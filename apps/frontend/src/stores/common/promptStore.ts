import {create} from "zustand";

export type PromptType = "info" | "warning" | "error" | "success" | "confirm";

interface PromptState {
  isOpen: boolean;
  title: string;
  message?: string;
  type: PromptType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  children?: React.ReactNode;
}

interface PromptStore extends PromptState {
  openPrompt: (config: Omit<PromptState, "isOpen">) => void;
  closePrompt: () => void;
  confirm: (config: {
    title: string;
    message?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  alert: (config: {
    title: string;
    message?: string;
    type?: PromptType;
  }) => Promise<void>;
}

const initialState: PromptState = {
  isOpen: false,
  title: "",
  message: undefined,
  type: "info",
  confirmText: "OK",
  cancelText: "Cancel",
  onConfirm: undefined,
  onCancel: undefined,
  showCancel: false,
  children: undefined,
};

export const usePromptStore = create<PromptStore>((set) => ({
  ...initialState,
  openPrompt: (config) => {
    set({
      isOpen: true,
      ...config,
    });
  },
  closePrompt: () => {
    set(initialState);
  },
  confirm: (config) => {
    set({
      isOpen: true,
      title: config.title,
      message: config.message,
      type: "confirm",
      confirmText: config.confirmText || "Confirm",
      cancelText: config.cancelText || "Cancel",
      showCancel: true,
      onConfirm: () => {
        config.onConfirm();
        set(initialState);
      },
      onCancel: () => {
        if (config.onCancel) {
          config.onCancel();
        }
        set(initialState);
      },
    });
  },
  alert: (config) => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        title: config.title,
        message: config.message,
        type: config.type || "info",
        confirmText: "OK",
        showCancel: false,
        onConfirm: () => {
          resolve();
          set(initialState);
        },
      });
    });
  },
}));

