export default function ActionBar({ onAdd, onModify, onFilling, onGroup, selectedRecord }) {
    const buttons = [
        { label: "ADD", action: onAdd },
        { label: "Modify", action: onModify },
        { label: "Filling", action: onFilling },
        { label: "Group", action: onGroup },
    ];

    return (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {buttons.map(btn => (
                <button
                    key={btn.label}
                    type="button"
                    onClick={btn.action}
                    style={{
                        padding: "5px 16px", fontSize: 12, fontWeight: 600,
                        background: "#e8edf2", border: "1px solid #9aafc4",
                        borderRadius: 3, cursor: "pointer", color: "#1e3a5f",
                    }}
                >
                    {btn.label}
                </button>
            ))}

            {selectedRecord && (
                <span style={{
                    marginLeft: "auto", alignSelf: "center",
                    fontSize: 12, color: "#374151",
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    borderRadius: 4, padding: "3px 10px",
                }}>
                    Selected: <strong>{selectedRecord.name}</strong>
                </span>
            )}
        </div>
    );
}