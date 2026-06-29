import { useRef } from "react";

export default function Overlay({ children, onClose }) {
    const ref = useRef();
    return (
        <div
            ref={ref}
            onClick={e => { if (e.target === ref.current) onClose(); }}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div style={{
                background: "#fff", borderRadius: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                overflow: "hidden", width: "fit-content", maxWidth: "95vw",
            }}>
                {children}
            </div>
        </div>
    );
}