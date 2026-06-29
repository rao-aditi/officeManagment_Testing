import React from "react";
import { IoSearch } from "react-icons/io5";

const SearchInput = ({
  placeholder = "Search...",
  width = "",
  onChange,
  onSearchClick,
  value,
  autoFocusInput = false,
  className = "",
  size = "md",
}) => {

  const sizeClasses = {
    sm: "px-2 py-[7px] text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative" style={{ width }}>

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            onSearchClick &&
            onSearchClick()
          }
          autoFocus={autoFocusInput}
          className={`
            w-full
            mt-1
            pl-4
            pr-11
            rounded-lg
            border
            bg-input
            border-gray-300
            text-foreground
            placeholder:text-muted-foreground
            placeholder:text-sm
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-primary/20
            focus:border-primary
            ${sizeClasses[size]}
          `}
        />

        {/* Search Icon */}
        <button
          type="button"
          onClick={onSearchClick}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-muted-foreground
            hover:text-primary
            transition-colors
            duration-200
          "
        >
          <IoSearch size={18} />
        </button>
      </div>
    </div>
  );
};

export default SearchInput;