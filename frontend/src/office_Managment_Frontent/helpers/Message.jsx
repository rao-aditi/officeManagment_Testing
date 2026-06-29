import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoClose, IoWarning } from "react-icons/io5";
import { TiInfo } from "react-icons/ti";
import { MdError } from "react-icons/md";

const Message = ({ type, title, message, onClose }) => {
  const bg = {
    success: "var(--color-success)",
    error: "var(--color-destructive)",
    warning: "var(--color-warning)",
    info: "var(--color-brand)",
  };

  const textColor = {
    success: "var(--color-success-foreground)",
    error: "var(--color-destructive-foreground)",
    warning: "var(--color-warning-foreground)",
    info: "var(--color-primary-foreground)",
  };

  const icon = {
    success: <FaCircleCheck size={20} />,
    error: <MdError size={20} />,
    warning: <IoWarning size={20} />,
    info: <TiInfo size={20} />,
  };

  return (
    <div
      className="flex items-center justify-between w-full px-3 py-3 mb-1 shadow-sm"
      style={{
        backgroundColor: bg[type],
        color: textColor[type],
      }}
      role="alert"
    >
      <div className="flex items-center">
        <div className="mr-2 flex items-center">{icon[type]}</div>
        <div>
          {title && <span className="font-semibold mr-1">{title}:</span>}
          {message && <span>{message}</span>}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ color: textColor[type] }}
        >
          <IoClose size={20} />
        </button>
      )}
    </div>
  );
};

export const SuccessAlert = (props) => <Message type="success" {...props} />;
export const ErrorAlert = (props) => <Message type="error" {...props} />;
export const WarningAlert = (props) => <Message type="warning" {...props} />;
export const InfoAlert = (props) => <Message type="info" {...props} />;

export default Message;
