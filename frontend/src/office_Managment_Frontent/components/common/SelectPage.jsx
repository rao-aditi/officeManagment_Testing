import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const SelectPage = ({
  label,
  value,
  onChange,
  options,
  className,
  style,
  placeholder,
  labelPosition = "top",
  isSearchable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : "";

  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase()?.includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 200;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldOpenUp = spaceBelow < dropdownHeight;
      setOpenUp(shouldOpenUp);
    }
    setOpen(true);
  };

  const handleOptionClick = (val) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div
      className={`relative z-[10] flex ${labelPosition === "side" ? "items-center gap-2" : "flex-col"
        } ${className || ""}`}
      ref={containerRef}
      style={style}
    >
      {label && (
        <label className="text-sm font-medium text-foreground m-0">
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center justify-between border rounded-md min-h-[24px] px-2 py-1 cursor-text transition-all duration-200
          border-gray-300 bg-input hover:border-primary
          ${open ? "border-primary ring-1 ring-primary/30" : ""}
        `}
        onClick={handleOpen}
      >
        {isSearchable ? (
          <input
            value={open ? search : selectedLabel}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="outline-none border-none text-sm w-full pr-6 bg-transparent text-foreground placeholder:text-muted-foreground"
          />
        ) : (
          <span className="text-sm text-foreground">
            {selectedLabel || placeholder}
          </span>
        )}

        <span className={`absolute right-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <MdKeyboardArrowDown size={18} className="text-primary" />
        </span>
      </div>

      {open && (
        <ul
          className={`absolute bg-card border border-gray-300 rounded-md shadow-lg max-h-52 overflow-y-auto w-full text-sm z-[9999]
            ${openUp ? "bottom-full mb-1" : "top-full mt-1"}
          `}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleOptionClick(opt.value)}
                className={`px-3 py-2 cursor-pointer transition-colors duration-150 text-foreground
                  hover:bg-muted hover:text-primary
                  ${opt.value === value ? "bg-muted text-primary font-medium" : ""}
                `}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 italic text-muted-foreground">
              No options found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectPage;
