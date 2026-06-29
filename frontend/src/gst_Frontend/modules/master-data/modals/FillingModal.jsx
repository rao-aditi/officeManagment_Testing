import Overlay from "@/gst_Frontend/components/shared/Overlay";
import ModalHeader from "@/gst_Frontend/components/shared/ModalHeader";
import ActionBtn from "@/gst_Frontend/components/shared/ActionBtn";

export default function FillingModal({ onClose }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ width: 420 }}>
        <ModalHeader title="Filling Settings" onClose={onClose} />
        <div style={{ padding: "20px", color: "#6b7280", fontSize: 13, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          Filling options UI goes here.
        </div>
        <div style={{ borderTop: "1px solid #e5e7eb", padding: "12px 20px",
          display: "flex", justifyContent: "flex-end", background: "#f9fafb" }}>
          <ActionBtn variant="ghost" onClick={onClose}>Close</ActionBtn>
        </div>
      </div>
    </Overlay>
  );
}