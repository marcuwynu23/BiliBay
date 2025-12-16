import {useEffect, ReactNode} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  formId?: string;
  onSubmit?: () => void;
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-2xl",
  formId,
  onSubmit,
}: DialogProps) => {
  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-t-3xl sm:rounded-2xl sm:rounded-b-2xl ${maxWidth} w-full max-h-[70vh] sm:h-auto sm:max-h-[calc(100vh-2rem)] shadow-2xl relative animate-slide-up sm:animate-none flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-2 flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Fixed Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition flex-shrink-0 touch-manipulation"
            aria-label="Close dialog"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 md:px-8 py-4 sm:py-5 scrollbar-hide">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="border-t sm:border-t-0 rounded-b-2xl sm:rounded-2xl border-gray-100 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

