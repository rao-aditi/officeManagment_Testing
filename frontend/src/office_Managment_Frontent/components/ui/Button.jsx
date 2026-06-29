import { memo } from "react";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconSize,
  disabled = false,
  styleClass = "",
}) => {
  const base = `
    inline-flex items-center justify-center gap-1
    rounded-md
    font-medium
    transition-all duration-200
    ${styleClass}
  `;

  const sizes = {
    sm: "text-sm px-3 py-1",
    md: "text-sm px-4 py-1.5",
    lg: "text-base px-6 py-3",
    xl: "text-lg px-8 py-4",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 20,
    xl: 22,
  };

  const variants = {
    primary:
      "bg-cyanDark text-button-foreground hover:bg-button-hover",

    outline:
      "text-cyanDark border border-cyanDark bg-transparent hover:bg-[#065273] hover:text-white",

    success:
      "bg-green-600 text-white hover:bg-green-700",


    "success-outline":
      "text-green-700 border border-green-700 bg-transparent hover:bg-green-700 hover:text-white",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    "danger-outline":
      "text-red-600 border border-red-600 bg-transparent hover:bg-red-600 hover:text-white",

  };

  const disabledStyles = disabled
    ? "opacity-60 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabledStyles}`}
    >
      {LeftIcon && <LeftIcon size={iconSize || iconSizes[size]} />}
      {children}
      {RightIcon && <RightIcon size={iconSize || iconSizes[size]} />}
    </button>
  );
};

export default memo(CustomButton);
