// components/common/CustomTooltip.jsx
import React, { useState, useRef, useEffect } from "react";

const CustomTooltip = ({
    children,
    content,
    position = "top",
    delay = 300,
    maxWidth = "250px",
    className = "",
    disabled = false
}) => {
    const [show, setShow] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    const handleMouseEnter = () => {
        if (disabled) return;

        const id = setTimeout(() => {
            setShow(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setShow(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    // Get position styles
    const getPositionStyles = () => {
        const baseStyles = {
            position: "absolute",
            zIndex: 9999,
        };

        switch (position) {
            case "top":
                return {
                    ...baseStyles,
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: "8px",
                };
            case "bottom":
                return {
                    ...baseStyles,
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginTop: "8px",
                };
            case "left":
                return {
                    ...baseStyles,
                    right: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginRight: "8px",
                };
            case "right":
                return {
                    ...baseStyles,
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginLeft: "8px",
                };
            default:
                return baseStyles;
        }
    };

    const getArrowStyles = () => {
        const baseArrowStyles = {
            position: "absolute",
            width: "8px",
            height: "8px",
            backgroundColor: "inherit",
            transform: "rotate(45deg)",
        };

        switch (position) {
            case "top":
                return {
                    ...baseArrowStyles,
                    bottom: "-4px",
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                };
            case "bottom":
                return {
                    ...baseArrowStyles,
                    top: "-4px",
                    left: "50%",
                    transform: "translateX(-50%) rotate(45deg)",
                };
            case "left":
                return {
                    ...baseArrowStyles,
                    right: "-4px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(45deg)",
                };
            case "right":
                return {
                    ...baseArrowStyles,
                    left: "-4px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(45deg)",
                };
            default:
                return baseArrowStyles;
        }
    };

    if (!content || (Array.isArray(content) && content.length === 0) || disabled) {
        return <>{children}</>;
    }

    return (
        <div
            className={`relative inline-block ${className}`}
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {show && (
                <div
                    ref={tooltipRef}
                    className="tooltip-content"
                    style={{
                        ...getPositionStyles(),
                        maxWidth,
                    }}
                >
                    <div className="relative bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3">
                        {/* Arrow */}
                        <div style={getArrowStyles()} />

                        {/* Content */}
                        <div className="tooltip-inner">
                            {Array.isArray(content) ? (
                                <div className="space-y-1.5">
                                    {content.map((item, index) => (
                                        <div
                                            key={index}
                                            className="whitespace-nowrap hover:bg-gray-800 px-1 rounded transition-colors"
                                        >
                                            {typeof item === 'string' ? item : item.name || item.label || item}
                                        </div>
                                    ))}
                                </div>
                            ) : typeof content === 'string' ? (
                                <div className="whitespace-normal break-words">
                                    {content}
                                </div>
                            ) : (
                                content
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const AdvancedTooltip = ({
    children,
    content,
    position = "top",
    variant = "dark", 
    size = "md", 
    showArrow = true,
    interactive = false,
    trigger = "hover", 
    disabled = false
}) => {
    const [show, setShow] = useState(false);
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);

    // Variant styles
    const variantStyles = {
        dark: {
            background: "bg-gray-900",
            text: "text-white",
            border: "",
            arrow: "bg-gray-900",
        },
        light: {
            background: "bg-white",
            text: "text-gray-900",
            border: "border border-gray-200",
            arrow: "bg-white",
        },
        primary: {
            background: "bg-primary-600",
            text: "text-white",
            border: "",
            arrow: "bg-primary-600",
        },
    };

    // Size styles
    const sizeStyles = {
        sm: {
            padding: "p-2",
            fontSize: "text-xs",
            maxWidth: "200px",
        },
        md: {
            padding: "p-3",
            fontSize: "text-sm",
            maxWidth: "250px",
        },
        lg: {
            padding: "p-4",
            fontSize: "text-base",
            maxWidth: "300px",
        },
    };

    const handleShow = () => {
        if (disabled) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShow(true);
    };

    const handleHide = () => {
        if (!interactive) {
            timeoutRef.current = setTimeout(() => {
                setShow(false);
            }, 100);
        } else {
            setShow(false);
        }
    };

    const toggleShow = () => {
        setShow(!show);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)) {
                setShow(false);
            }
        };

        if (trigger === "click") {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [trigger]);

    // Get position styles
    const getPositionStyles = () => {
        const positions = {
            top: { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "8px" },
            bottom: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" },
            left: { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: "8px" },
            right: { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: "8px" },
        };
        return positions[position] || positions.top;
    };

    // Get arrow position styles
    const getArrowStyles = () => {
        const arrows = {
            top: { bottom: "-4px", left: "50%", transform: "translateX(-50%) rotate(45deg)" },
            bottom: { top: "-4px", left: "50%", transform: "translateX(-50%) rotate(45deg)" },
            left: { right: "-4px", top: "50%", transform: "translateY(-50%) rotate(45deg)" },
            right: { left: "-4px", top: "50%", transform: "translateY(-50%) rotate(45deg)" },
        };
        return arrows[position] || arrows.top;
    };

    const triggerProps = {
        onMouseEnter: trigger === "hover" ? handleShow : undefined,
        onMouseLeave: trigger === "hover" ? handleHide : undefined,
        onClick: trigger === "click" ? toggleShow : undefined,
        onFocus: trigger === "focus" ? handleShow : undefined,
        onBlur: trigger === "focus" ? handleHide : undefined,
    };

    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    return (
        <div className="relative inline-block" ref={triggerRef}>
            <div {...triggerProps}>
                {children}
            </div>

            {show && (
                <div
                    ref={tooltipRef}
                    className="fixed z-[9999]"
                    style={{
                        ...getPositionStyles(),
                        maxWidth: currentSize.maxWidth,
                    }}
                >
                    <div
                        className={`${currentVariant.background} ${currentVariant.border} ${currentSize.padding} rounded-lg shadow-xl ${currentSize.fontSize} ${currentVariant.text}`}
                    >
                        {showArrow && (
                            <div
                                className={`absolute w-2 h-2 ${currentVariant.arrow}`}
                                style={getArrowStyles()}
                            />
                        )}

                        <div className="relative z-10">
                            {Array.isArray(content) ? (
                                <div className="space-y-1">
                                    {content.map((item, index) => (
                                        <div key={index} className="whitespace-nowrap">
                                            {typeof item === 'string' ? item : item.name || item.label || item}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                content
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CustomTooltip;