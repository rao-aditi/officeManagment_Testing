import { searchInputStyle } from "@/gst_Frontend/modules/master-data/utils";

export default function MasterTable({
    filtered, selected, onSelectRow, maskPAN,
    searchCode, searchName, searchFather,
    onSearchCode, onSearchName, onSearchFather,
}) {
    return (
        <div style={{ border: "1px solid #b0b8c4", borderRadius: 4, overflow: "hidden" }}>

            {/* Column headers */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 1fr 160px 70px",
                background: "#d6e4f7", borderBottom: "1px solid #b0b8c4",
            }}>
                {["CodeNo", "Name", "FATHER", "PAN", "Status"].map((h, i) => (
                    <div key={i} style={{
                        padding: "7px 10px", fontWeight: 700, fontSize: 12,
                        borderRight: i < 4 ? "1px solid #b0b8c4" : "none",
                        color: "#1e3a5f",
                    }}>
                        {h === "FATHER" ? (
                            <>
                                Father Name / Signing Person{" "}
                                <span style={{ color: "#c0392b", fontWeight: 700 }}>
                                    {filtered.length} Record(s)
                                </span>
                            </>
                        ) : h}
                    </div>
                ))}
            </div>

            {/* Search row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 1fr 160px 70px",
                background: "#f0f4f8", borderBottom: "1px solid #b0b8c4",
            }}>
                <div style={{ padding: "4px 6px", borderRight: "1px solid #b0b8c4" }}>
                    <input value={searchCode} onChange={e => onSearchCode(e.target.value)}
                        style={searchInputStyle} placeholder="Search…" />
                </div>
                <div style={{ padding: "4px 6px", borderRight: "1px solid #b0b8c4" }}>
                    <input value={searchName} onChange={e => onSearchName(e.target.value)}
                        style={searchInputStyle} placeholder="Search…" />
                </div>
                <div style={{ padding: "4px 6px", borderRight: "1px solid #b0b8c4" }}>
                    <input value={searchFather} onChange={e => onSearchFather(e.target.value)}
                        style={searchInputStyle} placeholder="Search…" />
                </div>
                <div style={{ borderRight: "1px solid #b0b8c4" }} />
                <div />
            </div>

            {/* Data rows */}
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
                {filtered.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                        No records found.
                    </div>
                )}
                {filtered.map((r, i) => {
                    const isSelected = r.id === selected;
                    return (
                        <div
                            key={r.id}
                            onClick={() => onSelectRow(isSelected ? null : r.id)}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "90px 1fr 1fr 160px 70px",
                                background: isSelected ? "#1e3a5f" : i % 2 === 0 ? "#fff" : "#f7f9fc",
                                color: isSelected ? "#fff" : "#111",
                                borderBottom: "1px solid #e5e7eb",
                                cursor: "pointer",
                                transition: "background 0.1s",
                            }}
                        >
                            {[r.codeNo, r.name, r.fatherName || "",
                            maskPAN ? String(r.pan || "").replace(/.(?=.{4})/g, "X") : r.pan,
                            r.status,
                            ].map((val, j) => (
                                <div key={j} style={{
                                    padding: "5px 10px",
                                    borderRight: j < 4 ? `1px solid ${isSelected ? "#3b5f8a" : "#e5e7eb"}` : "none",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {val}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
