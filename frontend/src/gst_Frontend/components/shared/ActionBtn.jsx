export default function ActionBtn({ children, onClick, variant = "primary", disabled = false }) {
  const base = {
    padding: "7px 18px", fontSize: 13, borderRadius: 5,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, border: "1px solid transparent",
    opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s",
  };
  const styles = {
    primary: { background: "#1e3a5f", color: "#fff", borderColor: "#1e3a5f" },
    ghost: { background: "#fff", color: "#374151", borderColor: "#d1d5db" },
  };
  return (
    <button
      type="button"
      style={{ ...base, ...styles[variant] }}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}