import React from "react";

const ToggleButton = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  color = "#04506B",
}) => {
  const sizeClasses = {
    sm: {
      container: "w-8 h-5",
      circle: "after:h-4 after:w-4 after:top-[2px] after:left-[2px]",
    },
    md: {
      container: "w-11 h-6",
      circle: "after:h-5 after:w-5 after:top-[2px] after:left-[2px]",
    },
    lg: {
      container: "w-14 h-7",
      circle: "after:h-6 after:w-6 after:top-[2px] after:left-[2px]",
    },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
          ${sizeClass.container} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          bg-gray-200 
          peer-focus:outline-none 
          rounded-full 
          peer 
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white 
          after:content-[''] 
          after:absolute 
          ${sizeClass.circle}
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:transition-all 
          peer-checked:bg-[${color}]
        `}
        style={{ backgroundColor: checked ? color : undefined }}
      />
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900">
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleButton;