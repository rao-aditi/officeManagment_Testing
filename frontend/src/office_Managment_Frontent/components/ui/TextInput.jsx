import { memo } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  showToggle = false,
  onToggle,
  touched,
  size = "md",
}) => {
  const sizes = {
    sm: "text-sm px-3 py-[8px]",
    md: "text-sm px-4 py-2",
    lg: "text-base px-4 py-2.5",
    xl: "text-lg px-5 py-3",
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-[14px] text-foreground font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`
      w-full rounded-md border bg-input text-foreground
      border-gray-300 transition-colors mt-1
      focus:outline-none focus:ring-1
      ${showToggle ? "pr-10" : ""}
      ${error && touched ? "border-destructive" : ""}
      ${sizes[size]}
    `}
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {type === "password" ? (
              <Eye size={20} />
            ) : (
              <EyeOff size={20} />
            )}
          </button>
        )}
      </div>

      {error && touched && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default memo(TextInput);
