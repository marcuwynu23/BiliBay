import {create} from "zustand";

export type DialogType = "info" | "warning" | "error" | "success" | "confirm";

interface DialogState {
  isOpen: boolean;
  title: string;
  message?: string;
  type: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  children?: React.ReactNode;
}

interface DialogStore extends DialogState {
  openDialog: (config: Omit<DialogState, "isOpen">) => void;
  closeDialog: () => void;
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
    type?: DialogType;
  }) => Promise<void>;
}

const initialState: DialogState = {
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

export const useDialogStore = create<DialogStore>((set) => ({
  ...initialState,
  openDialog: (config) => {
    set({
      isOpen: true,
      ...config,
    });
  },
  closeDialog: () => {
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

