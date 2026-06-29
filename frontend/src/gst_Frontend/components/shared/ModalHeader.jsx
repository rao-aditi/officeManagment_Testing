export default function ModalHeader({ title, subtitle, onClose }) {
    return (
        <div style={{
            background: "#1e3a5f", color: "#fff",
            padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
            <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                {subtitle && (
                    <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 2 }}>{subtitle}</div>
                )}
            </div>
            <button
                onClick={onClose}
                style={{
                    background: "none", border: "none", color: "#fff",
                    fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 2px",
                }}
            >×</button>
        </div>
    );
}

