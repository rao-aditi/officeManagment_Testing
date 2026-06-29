export default function FormField({ label, id, error, required, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label
                htmlFor={id}
                style={{
                    display: "block", fontSize: 12, fontWeight: 600,
                    color: "#374151", marginBottom: 4
                }}
            >
                {label}
                {required && <span style={{ color: "#ef4444" }}> *</span>}
            </label>
            {children}
            {error && (
                <p style={{ fontSize: 11, color: "#ef4444", margin: "3px 0 0" }}>{error}</p>
            )}
        </div>
    );
}