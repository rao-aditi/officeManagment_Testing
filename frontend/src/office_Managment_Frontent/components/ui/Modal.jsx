import React, { useEffect } from "react";
import { X } from "lucide-react";
import { ModalPortal } from "../Model/ModalPortal";

const Modal = ({ isOpen, onClose, title, children, size = "md", showCloseButton = true }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[90%]",
    };

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-40 overflow-y-auto">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all`}
                    >
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3.5">
                                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default Modal;