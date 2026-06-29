import { memo } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const MobileInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  size = "md",
  defaultCountry = "IN",
}) => {
  const sizes = {
    sm: "text-sm py-1.5",
    md: "text-sm py-2",
    lg: "text-base py-2.5",
    xl: "text-lg py-3",
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          border rounded-md px-3 bg-input transition-colors
          ${error && touched ? "border-destructive" : "border-gray-300"}
        `}
      >
        <PhoneInput
          international
          defaultCountry={defaultCountry}
          countryCallingCodeEditable={false}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`PhoneInputInput bg-transparent outline-none w-full text-foreground ${sizes[size]}`}
        />
      </div>

      {touched && error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default memo(MobileInput);
