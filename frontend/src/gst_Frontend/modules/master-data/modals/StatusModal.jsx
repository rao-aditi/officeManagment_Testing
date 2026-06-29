import { useState } from "react";
import { STATUS_OPTIONS } from "@/gst_Frontend/modules/master-data/constants";
import Overlay from "@/gst_Frontend/components/shared/Overlay";
import ModalHeader from "@/gst_Frontend/components/shared/ModalHeader";
import ActionBtn from "@/gst_Frontend/components/shared/ActionBtn";

function StatusPicker({ value, onChange, onImport }) {
  return (
    <div style={{ border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        background: "#1e3a5f", color: "#fff", padding: "8px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 13, fontWeight: 600,
      }}>
        <span>Select Status</span>
        <button
          type="button" onClick={onImport}
          style={{
            background: "#2563eb", color: "#fff", border: "none",
            borderRadius: 4, padding: "3px 10px", fontSize: 11, cursor: "pointer",
          }}
        >
          ⬇ Import From ITD Portal
        </button>
      </div>
      <div style={{ background: "#fffdf0", maxHeight: 260, overflowY: "auto" }}>
        {STATUS_OPTIONS.map(opt => (
          <div
            key={opt.code}
            onClick={() => onChange(opt.code)}
            style={{
              padding: "6px 14px", fontSize: 13, cursor: "pointer",
              borderBottom: "1px dashed #e5e7eb",
              background: value === opt.code ? "#dbeafe" : "transparent",
              color: "#111", display: "flex", gap: 6, alignItems: "baseline",
            }}
          >
            <span style={{ color: "#374151" }}>[{opt.code}]</span>
            <span>{opt.label}</span>
            {opt.note && <span style={{ color: "#b45309", fontSize: 11 }}>{opt.note}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatusModal({ onSelect, onClose }) {
  const [selected, setSelected] = useState("");

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 440 }}>
        <ModalHeader title="Add New Record — Select Status" onClose={onClose} />
        <div style={{ padding: "16px 20px 20px" }}>
          <StatusPicker
            value={selected}
            onChange={setSelected}
            onImport={() => alert("Import From ITD Portal — connect your API here.")}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <ActionBtn variant="ghost" onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn disabled={!selected} onClick={() => selected && onSelect(selected)}>
              Proceed →
            </ActionBtn>
          </div>
        </div>
      </div>
    </Overlay>
  );
}