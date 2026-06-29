import { useMemo, useState } from "react";
import MasterTable from "@/gst_Frontend/components/MasterTable";
import ActionBar from "@/gst_Frontend/components/ActionBar";
import StatusModal from "@/gst_Frontend/modules/master-data/modals/StatusModal";
import AddFormModal from "@/gst_Frontend/modules/master-data/modals/AddFormModal";
import ModifyModal from "@/gst_Frontend/modules/master-data/modals/ModifyModal";
import GroupModal from "@/gst_Frontend/modules/master-data/modals/GroupModal";
import FillingModal from "@/gst_Frontend/modules/master-data/modals/FillingModal";
import { STATUS_OPTIONS } from "@/gst_Frontend/modules/master-data/constants";
import { ENTITY_ENDPOINTS } from "@/gst_Frontend/config/entityEndpoints";
import { useClients } from "@/gst_Frontend/hooks/useClients";
import { toTableRecord } from "@/gst_Frontend/modules/master-data/utils";
import { clientsApi } from "@/gst_Frontend/api/clientsApi";

export default function MasterDataModule() {
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [maskPAN, setMaskPAN] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchFather, setSearchFather] = useState("");
  const [modal, setModal] = useState(null);
  const [addStatus, setAddStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const endpoint = ENTITY_ENDPOINTS[activeStatus];
  const { data, loading, error, refetch, createClient, updateClient } = useClients(endpoint);
  const records = useMemo(() => data.map(toTableRecord), [data]);

  console.log("ACTIVE STATUS:", activeStatus);
  console.log("DATA:", data);
  console.log("RECORDS:", records);

  const filtered = records.filter(record =>
    String(record.codeNo).toLowerCase().includes(searchCode.toLowerCase()) &&
    String(record.name || "").toLowerCase().includes(searchName.toLowerCase()) &&
    String(record.fatherName || "").toLowerCase().includes(searchFather.toLowerCase())
  );

  const selectedRecord = records.find(record => record.id === selected);

  function handleStatusChosen(code) {
    setActiveStatus(code);
    setAddStatus(code);
    setSelected(null);
    setModal("addForm");
  }

  async function handleSaveNew(payload) {
    await createClient(payload);
    setModal(null);
  }

  function handleModify() {
    if (!selectedRecord) {
      alert("Please select a record first.");
      return;
    }
    setModal("modify");
  }

 async function handleSaveModify(id, payload) {
  const recordToUpdate = records.find(r => r.id === id);
  
  if (!recordToUpdate) {
    alert("Record not found");
    return;
  }
  
  const recordStatus = recordToUpdate.status;
  const correctEndpoint = ENTITY_ENDPOINTS[recordStatus];
  
  if (!correctEndpoint || correctEndpoint === "ALL") {
    alert(`Cannot update: Invalid endpoint for status ${recordStatus}`);
    return;
  }
  
  console.log("Updating:", { id, recordStatus, correctEndpoint, payload });
  
  try {
    setSaving(true);
    const updated = await clientsApi.update(correctEndpoint, id, payload);
    console.log("Updated successfully:", updated);
    
    // IMPORTANT: Wait for refetch to complete
    await refetch();
    
    // Clear selection and close modal AFTER data is refreshed
    setSelected(null);
    setModal(null);
    
    // Optional: Show success message
    alert("Record updated successfully!");
    
  } catch (err) {
    console.error("Update error:", err);
    alert(err.response?.data?.message || "Update failed. Please try again.");
  } finally {
    setSaving(false);
  }
}

  function handleFilling() {
    if (!selectedRecord) {
      alert("Please select a record first.");
      return;
    }
    setModal("filling");
  }

  function handleGroup() {
    if (!selectedRecord) {
      alert("Please select a record first.");
      return;
    }
    setModal("group");
  }

  function closeModal() {
    setModal(null);
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, color: "#111" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: error ? "#b91c1c" : "#374151", fontSize: 12 }}>
          {loading ? "Loading records..." : error || `${filtered.length} record(s) loaded`}
        </div>
        <select
          value={activeStatus}
          onChange={event => {
            setActiveStatus(event.target.value);
            setSelected(null);
          }}
          style={{ padding: "5px 8px", border: "1px solid #c5cfd8", borderRadius: 4, fontSize: 12 }}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.code} value={option.code}>
              [{option.code}] {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          cursor: "pointer",
          color: "#374151",
        }}>
          <input
            type="checkbox"
            checked={maskPAN}
            onChange={event => setMaskPAN(event.target.checked)}
          />
          Mask PAN Search
        </label>
      </div>

      <MasterTable
        filtered={filtered}
        selected={selected}
        onSelectRow={setSelected}
        maskPAN={maskPAN}
        searchCode={searchCode}
        searchName={searchName}
        searchFather={searchFather}
        onSearchCode={setSearchCode}
        onSearchName={setSearchName}
        onSearchFather={setSearchFather}
      />

      <ActionBar
        onAdd={() => setModal("statusPick")}
        onModify={handleModify}
        onFilling={handleFilling}
        onGroup={handleGroup}
        selectedRecord={selectedRecord}
      />

      {modal === "statusPick" && (
        <StatusModal onSelect={handleStatusChosen} onClose={closeModal} />
      )}
      {modal === "addForm" && (
        <AddFormModal
          statusCode={addStatus}
          onSave={handleSaveNew}
          onBack={() => setModal("statusPick")}
          onClose={closeModal}
          saving={saving}
        />
      )}
      {modal === "modify" && selectedRecord && (
        <ModifyModal 
          record={selectedRecord} 
          onSave={handleSaveModify} 
          onClose={closeModal} 
          saving={saving}
        />
      )}
      {modal === "group" && (
        <GroupModal onClose={closeModal} />
      )}
      {modal === "filling" && (
        <FillingModal onClose={closeModal} />
      )}
    </div>
  );
}