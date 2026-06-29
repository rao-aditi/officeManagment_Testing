import { memo, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

const SelectInput = ({
  label,
  name,
  id,
  options = [],
  placeholder = "Select",
  required = false,
  wrapperClass = "",
  selectClass = "",
  onChange,
  value,
  isMulti = false,
  disabled = false,
  size = "md",
  error = null,
  searchable = true,
}) => {
  const selectedValues = isMulti
    ? Array.isArray(value)
      ? value
      : []
    : value;

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOptions = isMulti
    ? options.filter((o) => selectedValues.includes(o.value))
    : options.filter((o) => String(o.value) === String(value));

  const selectedLabel = isMulti
    ? selectedOptions.map((o) => o.label).join(", ")
    : selectedOptions[0]?.label || "";

  const displayValue = isOpen && searchable
    ? searchText
    : selectedLabel;

  const filteredOptions = options.filter((option) =>
    String(option.label || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [isOpen]);

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    if (searchable) {
      setSearchText("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchText("");
  };

  const sizeClasses = {
    sm: "px-2 py-[7px] text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  const inputClasses = `
    mt-1 w-full border rounded-md pr-9
    border-gray-300 text-gray-900
    focus:outline-none focus:ring-1 bg-gray-50
    focus:border-primary focus:ring-primary/30
    ${sizeClasses[size]}
    ${disabled
      ? "opacity-70 cursor-not-allowed bg-gray-50"
      : isOpen && searchable
        ? "cursor-text caret-gray-900"
        : "cursor-pointer"
    }
    ${selectClass}
  `;

  const handleSelect = (optionValue) => {
    if (isMulti) {

      if (optionValue === "ALL") {
        const allClientIds = options
          .filter((o) => o.value !== "ALL")
          .map((o) => o.value);

        const isAllSelected =
          selectedValues.length === allClientIds.length;

        onChange?.(isAllSelected ? [] : allClientIds);
        return;
      }

      const exists = selectedValues.includes(optionValue);

      const updated = exists
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];

      onChange?.(updated);
    } else {
      onChange?.(optionValue);
      closeDropdown();
    }
  };

  return (
    <div className={`relative ${wrapperClass}`}>
      {/* {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )} */}

      {label && (
        <label htmlFor={id || name} className="text-[14px] text-foreground font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={id || name}
          type="text"
          disabled={disabled}
          readOnly={!isMulti && (!searchable || !isOpen)}
          value={displayValue}
          placeholder={placeholder}
          onFocus={openDropdown}
          onClick={openDropdown}
          onChange={(e) => {
            if (!searchable || !isOpen) return;
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          className={inputClasses}
          autoComplete="off"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={openDropdown}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded ${disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          aria-label="Open options"
        >
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}

      {isOpen &&
        !disabled &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="absolute z-[99999] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No results found
              </li>
            )}

            {filteredOptions.map((option) => {
              const isSelected = isMulti
                ? selectedValues.includes(option.value)
                : String(option.value) === String(value);

              return (
                <li
                  key={option.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-2  text-sm flex items-center justify-between cursor-pointer hover:bg-gray-100 ${isSelected
                    ? "bg-blue-50/60 font-medium text-[#04506B]"
                    : "text-gray-900"
                    }`}
                >
                  <span>{option.label}</span>
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4 w-4 text-[#022938] rounded border-gray-300 focus:ring-[#022938]/30 cursor-pointer"
                    />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
};

export default memo(SelectInput);
