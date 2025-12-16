import React, {useState, useRef, useEffect} from "react";
// @ts-ignore - react-dom types may not be available in all environments
import {createPortal} from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  selectClassName?: string;
  optionClassName?: string;
  placeholder?: string;
  // Color customization
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  iconColor?: string;
  focusRingColor?: string;
  optionHoverColor?: string;
  optionSelectedColor?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  leftIcon,
  className = "",
  containerClassName = "",
  selectClassName = "",
  optionClassName = "",
  placeholder = "Select an option",
  backgroundColor = "bg-white/10 backdrop-blur-sm",
  borderColor = "border-white/30",
  textColor = "text-white",
  iconColor = "text-white/70",
  focusRingColor = "focus:ring-white/50",
  optionHoverColor = "hover:bg-white/20",
  optionSelectedColor = "bg-white/30",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Update position when opening or window resizes
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        !target.closest('[data-select-dropdown="true"]')
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      updateDropdownPosition();
      // Use a slight delay to avoid immediate closure
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    // Create a synthetic event for onChange
    const syntheticEvent = {
      target: {
        name: name || "",
        value: optionValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${containerClassName}`} ref={selectRef}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={value}
        required={required}
        disabled={disabled}
      />

      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(updateDropdownPosition, 0);
            }
          }
        }}
        disabled={disabled}
        className={`block w-full ${leftIcon ? "pl-10" : "pl-4"} pr-10 py-3 sm:py-2.5 text-base sm:text-sm ${backgroundColor} ${borderColor} border rounded-lg ${textColor} focus:outline-none focus:ring-2 ${focusRingColor} focus:border-white/50 transition-all touch-manipulation text-left ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${selectClassName} ${className}`}
      >
        <div className="flex items-center">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <span className={selectedOption ? "" : "opacity-60"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
      </button>

      {/* Dropdown Arrow */}
      <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${iconColor}`}>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Options - Rendered via Portal */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-select-dropdown="true"
            className={`fixed z-[99999] ${backgroundColor} ${borderColor} border rounded-lg shadow-2xl max-h-60 overflow-auto ${optionClassName}`}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 sm:py-2.5 text-left text-base sm:text-sm ${textColor} transition-colors ${option.value === value ? optionSelectedColor : ""} ${optionHoverColor} ${option.value === value ? "font-semibold" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

