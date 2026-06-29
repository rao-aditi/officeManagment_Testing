import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef(null);
  const animationRef = useRef(null);

  const showAlert = ({ type = "info", message, title }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) clearInterval(animationRef.current);

    setProgress(100);
    setAlert({
      type,
      message: message || title,
    });

    const startTime = Date.now();
    const duration = 6000;

    animationRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(animationRef.current);
      }
    }, 16);

    timeoutRef.current = setTimeout(() => {
      setAlert(null);
      clearInterval(animationRef.current);
    }, duration);
  };

  const closeAlert = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationRef.current) clearInterval(animationRef.current);
    setAlert(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const alertConfig = {
    success: { icon: <CheckCircle size={18} /> },
    error: { icon: <AlertCircle size={18} /> },
    warning: { icon: <AlertTriangle size={18} /> },
    info: { icon: <Info size={18} /> },
  };

  const alertStyles = {
    success: { background: "#fff", borderLeft: "6px solid #22C55E", color: "#189445ff" },
    error: { background: "#fff", borderLeft: "6px solid #EF4444", color: "#f12626ff" },
    warning: { background: "#fff", borderLeft: "6px solid #F59E0B", color: "#d88d0cff" },
    info: { background: "#fff", borderLeft: "6px solid #3B82F6", color: "#1964ddff" },
  };

  const getProgressColor = () => {
    switch (alert?.type) {
      case "success": return "#22C55E";
      case "error": return "#EF4444";
      case "warning": return "#F59E0B";
      default: return "#3B82F6";
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div
          className="fixed top-5 right-5 z-[99999] bg-white"
          style={{
            minWidth: "320px",
            maxWidth: "450px",
            borderRadius: "10px",
            backgroundColor: "white",
            overflow: "hidden",
            ...alertStyles[alert.type],
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div className="flex items-start gap-2 px-4 py-3">
            <div className="mt-0.5">{alertConfig[alert.type]?.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold capitalize">{alert.type}</h4>
              <p className="text-base text-gray-900 font-medium mt-1">{alert.message}</p>
            </div>
            <button onClick={closeAlert} className="hover:bg-black/5 rounded p-1 transition">
              <X size={16} />
            </button>
          </div>
          <div className="h-1 bg-black/5 overflow-hidden">
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: getProgressColor(),
                transition: "width 0.016s linear",
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};