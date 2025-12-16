import {useEffect, ReactNode} from "react";
// @ts-ignore - react-dom types may not be available in all environments
import {createPortal} from "react-dom";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export interface PromptProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  children?: ReactNode;
  type?: "info" | "warning" | "error" | "success" | "confirm";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const Prompt = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
}: PromptProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Close any open Select dropdowns by dispatching a custom event
      const closeSelectEvent = new CustomEvent("close-all-selects");
      document.dispatchEvent(closeSelectEvent);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "text-[#98b964]";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "confirm":
        return "text-[#98b964]";
      default:
        return "text-[#98b964]";
    }
  };


  const getConfirmButtonStyles = () => {
    // All buttons use brand color
    return "bg-[#98b964] hover:bg-[#5e7142] text-white";
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  if (!isOpen) return null;

  const promptContent = (
    <div
      className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
      onClick={(e) => {
        // Close any open Select dropdowns
        const closeSelectEvent = new CustomEvent("close-all-selects");
        document.dispatchEvent(closeSelectEvent);
        
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative overflow-hidden mx-4 z-[999999]"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-start mb-4 sm:mb-4 pt-2">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            <div className="flex-1">
              <h2 className={`text-center text-xl sm:text-2xl font-bold ${getTypeStyles()}`}>{title}</h2>
            </div>
          </div>
         
        </div>

        {message && (
          <p className="text-center text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 whitespace-pre-line leading-relaxed">{message}</p>
        )}

        {children && <div className="mb-6">{children}</div>}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 border-t border-gray-100">
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3.5 sm:py-2.5 border-2 border-[#98b964] text-[#98b964] rounded-lg font-medium hover:bg-[#98b964] hover:text-white active:bg-[#5e7142] transition-all duration-200 touch-manipulation min-h-[48px] text-base sm:text-sm"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-3.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow active:bg-[#4a5a35] touch-manipulation min-h-[48px] text-base sm:text-sm ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // Render via portal to document.body to ensure it's always on top
  if (typeof document !== "undefined") {
    return createPortal(promptContent, document.body);
  }

  return promptContent;
};

