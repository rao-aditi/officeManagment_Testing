import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  AlertCircle,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import SelectInput from "../../components/ui/SelectInput";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { useAlert } from "../../helpers/AlertContent";
import { uploadDocument } from "../../store/slice/document/documentSlice";
import { fetchDocumentTypes } from "../../store/slice/documentType/documentTypeSlice";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileIcon = (mimeType = "") => {
  if (mimeType.startsWith("image/"))
    return <FileImage size={16} className="text-blue-400" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  )
    return <FileSpreadsheet size={16} className="text-green-500" />;
  if (mimeType === "application/pdf")
    return <FileText size={16} className="text-red-400" />;
  return <File size={16} className="text-gray-400" />;
};

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "text/plain",
  "text/csv",
];

const formatFrequencyLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const UploadModal = ({ isOpen, onClose, onSuccess, clientId, taskId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uploading } = useSelector((state) => state.documents);
  const { list: documentTypes } = useSelector((state) => state.documentTypes);
  const { connected: driveConnected } = useSelector((state) => state.googleDrive);
  const { showAlert } = useAlert();

  const [file, setFile] = useState(null);
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const activeDocumentTypes = useMemo(
    () => (documentTypes || []).filter((item) => item.status === "ACTIVE"),
    [documentTypes]
  );

  const documentTypeOptions = useMemo(
    () =>
      activeDocumentTypes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [activeDocumentTypes]
  );

  const selectedDocumentType = useMemo(
    () => activeDocumentTypes.find((item) => item.id === documentTypeId),
    [activeDocumentTypes, documentTypeId]
  );

  const frequencyDisplay = useMemo(() => {
    const values = selectedDocumentType?.frequencyTypes || [];
    if (!values.length) return "";
    return values.map(formatFrequencyLabel).join(", ");
  }, [selectedDocumentType]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDocumentTypes({ status: "ACTIVE", limit: 100 }));
    }
  }, [dispatch, isOpen]);

  const resetForm = () => {
    setFile(null);
    setDocumentTypeId("");
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (selectedFile) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(
        "File type not allowed. Allowed: PDF, Word, Excel, Image, CSV, TXT"
      );
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!driveConnected) {
      setError("Firstly connect with Google Drive before uploading documents.");
      return;
    }
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!documentTypeId) {
      setError("Please select a document type");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentTypeId", documentTypeId);
    if (selectedDocumentType?.frequencyTypes?.[0]) {
      formData.append("frequencyType", selectedDocumentType.frequencyTypes[0]);
    }
    if (description.trim()) formData.append("description", description.trim());
    if (clientId) formData.append("clientId", String(clientId));
    if (taskId) formData.append("taskId", taskId);

    try {
      await dispatch(uploadDocument(formData)).unwrap();
      showAlert({ type: "success", title: "Document uploaded successfully!" });
      handleClose();
      onSuccess();
    } catch (err) {
      const msg = err || "Failed to upload document";
      setError(msg);
      showAlert({ type: "error", title: msg });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!driveConnected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 space-y-3">
            <p className="text-sm text-amber-800">
              Firstly connect with Google Drive before uploading documents.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                handleClose();
                navigate("/profile");
              }}
            >
              Connect Google Drive
            </Button>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => driveConnected && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            driveConnected ? "cursor-pointer" : "cursor-not-allowed opacity-60"
          } ${
            isDragging
              ? "border-[#04364A] bg-cyan-50"
              : "border-gray-300 hover:border-[#04364A] hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={!driveConnected}
            onChange={(e) =>
              e.target.files[0] && handleFileSelect(e.target.files[0])
            }
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
              {getFileIcon(file.type)}
              <span>{file.name}</span>
              <span className="text-gray-400">({formatBytes(file.size)})</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-1 text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, Word, Excel, Image, CSV, TXT — max 10 MB
              </p>
            </>
          )}
        </div>

        <SelectInput
          label="Document Type"
          value={documentTypeId}
          onChange={setDocumentTypeId}
          options={documentTypeOptions}
          placeholder="Select document type"
          required
          disabled={!driveConnected}
        />

        <div>
          <label className="text-[14px] text-foreground font-medium">
            Frequency Type
          </label>
          <input
            type="text"
            readOnly
            value={frequencyDisplay}
            placeholder="Select a document type"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        <TextInput
          label="Description (optional)"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this document..."
        />

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !file || !driveConnected}
            className="px-4 py-2 text-sm font-medium text-white bg-[#04364A] rounded-xl hover:bg-[#06506B] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} /> Upload
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
