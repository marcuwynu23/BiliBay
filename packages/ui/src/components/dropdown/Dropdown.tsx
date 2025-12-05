import {useState, useRef, useEffect} from "react";

interface DropdownProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  label?: string;
  width?: string; // Tailwind width classes, default w-48
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selected,
  onSelect,
  label,
  width = "w-48",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${width} ml-auto`} ref={dropdownRef}>
      {label && (
        <label className="block text-[#98b964] font-semibold mb-1">
          {label}
        </label>
      )}
      <div
        className="bg-white border border-[#98b964] rounded-lg px-4 py-2 cursor-pointer  flex justify-between items-center hover:shadow-lg transition"
        onClick={() => setOpen(!open)}
      >
        <span>{selected.charAt(0).toUpperCase() + selected.slice(1)}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </div>

      {open && (
        <div className="absolute right-0 mt-1 w-full bg-white border border-[#98b964] rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              className={`px-4 py-2 cursor-pointer transition hover:bg-[#98b964] hover:text-white ${
                selected === option
                  ? "bg-[#98b964] text-white"
                  : "text-gray-700"
              }`}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
