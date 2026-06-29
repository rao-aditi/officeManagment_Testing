export default function Input({ id, value, onChange, placeholder, style = {} }) {
  return (
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "6px 10px", fontSize: 13,
        border: "1px solid #d1d5db", borderRadius: 5,
        outline: "none", background: "#fff",
        ...style,
      }}
    />
  );
}