import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  FiUpload,
  FiCheckCircle,
  FiLoader
} from 'react-icons/fi';
import { MdCloudUpload, MdFilePresent } from 'react-icons/md';
import SelectInput from "../../components/ui/SelectInput";
import Button from "../../components/ui/Button";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";
import { useAlert } from "../../helpers/AlertContent";
import { usePermission } from "../../Hooks/usePermission";
import { PERMISSION_KEYS } from "../../helpers/permissions";
import { fetchDocumentTypes } from "../../store/slice/documentType/documentTypeSlice";
import { fetchGoogleDriveStatus } from "../../store/slice/googleDrive/googleDriveSlice";
import {
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  viewDocument,
} from "../../store/slice/document/documentSlice";
import { formatDate } from "../../helpers/commonFunctions";
import CustomTable from "../common/CustomTable";
import ActionButtons from "../common/ActionsButtons";
import DocumentPreviewModal from "./DocumentPreviewModal";
import {
  createPreviewObjectUrl,
  isInlinePreviewable,
} from "../../helpers/documentPreview";

const ALLOWED_MIME_TYPES = [
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatFrequencyLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const DocumentsSection = ({ clientId, taskId, compact = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { can } = usePermission();
  const fileInputRef = useRef(null);
  const [frequencyTypes, setFrequencyTypes] = useState([]);

  const { list: documentTypes, loading: typesLoading } = useSelector(
    (state) => state.documentTypes
  );
  const { connected: driveConnected, loading: driveLoading } = useSelector(
    (state) => state.googleDrive
  );
  const {
    documents,
    loading,
    uploading,
    deleting,
    downloading,
    viewing,
  } = useSelector((state) => state.documents);

  const [documentTypeId, setDocumentTypeId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [preview, setPreview] = useState(null);

  const canUpload = can(PERMISSION_KEYS.UPLOAD_DOCUMENTS);
  const canDelete = can(PERMISSION_KEYS.DELETE_DOCUMENTS);

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

  const frequencyOptions = useMemo(() => {
    const values = selectedDocumentType?.frequencyTypes || [];

    return [
      { label: "Select All", value: "ALL" },
      ...values.map((item) => ({
        value: item,
        label: formatFrequencyLabel(item),
      })),
    ]
  }, [selectedDocumentType]);

  useEffect(() => {
    setFrequencyTypes([]);
  }, [documentTypeId]);

  const listParams = useMemo(() => {
    const params = { page: 1, limit: compact ? 10 : 20 };
    if (clientId) params.clientId = clientId;
    if (taskId) params.taskId = taskId;
    return params;
  }, [clientId, taskId, compact]);

  useEffect(() => {
    dispatch(fetchDocumentTypes({ status: "ACTIVE", limit: 100 }));
    dispatch(fetchGoogleDriveStatus());
  }, [dispatch]);

  useEffect(() => {
    if (canUpload || canDelete) {
      dispatch(fetchDocuments(listParams));
    }
  }, [dispatch, listParams, canUpload, canDelete]);

  const resetForm = () => {
    setDocumentTypeId("");
    setFrequencyTypes([]);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      showAlert({
        type: "error",
        title: "Invalid file",
        message: "This file type is not supported.",
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showAlert({
        type: "error",
        title: "File too large",
        message: "Maximum allowed file size is 10 MB.",
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!driveConnected) {
      showAlert({
        type: "warning",
        title: "Google Drive required",
        message:
          "Firstly connect with Google Drive before uploading documents.",
      });
      return;
    }

    if (!documentTypeId) {
      showAlert({
        type: "error",
        title: "Validation",
        message: "Please select a document type.",
      });
      return;
    }

    if (!selectedFile) {
      showAlert({
        type: "error",
        title: "Validation",
        message: "Please choose a file to upload.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("documentTypeId", documentTypeId);
    formData.append("frequencyTypes", JSON.stringify(frequencyTypes));

    if (clientId) formData.append("clientId", String(clientId));
    if (taskId) formData.append("taskId", taskId);

    try {
      await dispatch(uploadDocument(formData)).unwrap();
      showAlert({
        type: "success",
        title: "Uploaded",
        message: "Document uploaded to Google Drive successfully.",
      });
      resetForm();
      dispatch(fetchDocuments(listParams));
    } catch (error) {
      showAlert({
        type: "error",
        title: "Upload failed",
        message: error || "Failed to upload document.",
      });
    }
  };

  const handleDelete = async (doc) => {
    try {
      await dispatch(deleteDocument(doc.id)).unwrap();
      showAlert({
        type: "success",
        title: "Deleted",
        message: "Document deleted successfully.",
      });
      setDeleteTarget(null);
      dispatch(fetchDocuments(listParams));
    } catch (error) {
      showAlert({
        type: "error",
        title: "Delete failed",
        message: error || "Failed to delete document.",
      });
    }
  };

  const handleDownload = async (doc) => {
    try {
      const result = await dispatch(
        downloadDocument({ id: doc.id, fileName: doc.originalName })
      ).unwrap();
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName || doc.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Download failed",
        message: error || "Failed to download document.",
      });
    }
  };

  const closePreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  const handleView = async (doc) => {
    try {
      const blob = await dispatch(
        viewDocument({ id: doc.id, mimeType: doc.mimeType })
      ).unwrap();
      const url = createPreviewObjectUrl(blob, doc.mimeType);

      if (isInlinePreviewable(doc.mimeType)) {
        setPreview({
          url,
          mimeType: doc.mimeType,
          fileName: doc.originalName,
        });
        return;
      }

      if (doc.driveUrl) {
        URL.revokeObjectURL(url);
        window.open(doc.driveUrl, "_blank", "noopener,noreferrer");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      showAlert({
        type: "error",
        title: "Preview failed",
        message: error || "Failed to preview document.",
      });
    }
  };

  const DOCUMENT_COLUMNS = [
    { key: "originalName", label: "Document", minWidth: "200px" },
    { key: "documentType", label: "Type & Frequency", minWidth: "200px" },
    { key: "fileSize", label: "Size", minWidth: "100px" },
    { key: "uploadedBy.name", label: "Uploaded By", minWidth: "130px" },
    { key: "createdAt", label: "Uploaded On", minWidth: "150px" },
    { key: "driveLink", label: "Drive Link", minWidth: "100px" },
    { key: "actionbutton", label: "Actions", minWidth: "200px" },
  ];

  const renderDocumentRow = (data, visibleColumns) => {
    return data.map((doc) => (
      <tr key={doc.id} className="hover:bg-gray-50">
        {visibleColumns.map((col) => {
          let content = null;
          switch (col.key) {
            case "originalName":
              content = (
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-[#04364A] shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {doc.originalName}
                  </span>
                </div>
              );
              break;
            case "documentType":
              content = (
                <div>
                  <div className="text-sm text-gray-700">
                    {doc.documentType?.name || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {doc.frequencyType?.length
                      ? doc.frequencyType
                        .map((freq) => formatFrequencyLabel(freq))
                        .join(", ")
                      : "—"}
                  </div>
                </div>
              );
              break;
            case "fileSize":
              content = (
                <span className="text-gray-700">
                  {formatBytes(doc.fileSize)}
                </span>
              );
              break;
            case "uploadedBy.name":
              content = (
                <span className="text-gray-700">
                  {doc.uploadedBy?.name || "—"}
                </span>
              );
              break;
            case "createdAt":
              content = (
                <span className="text-gray-700">
                  {formatDate(doc.createdAt)}
                </span>
              );
              break;
            case "driveLink":
              content = (
                <div>
                  {doc.driveUrl ? (
                    <a
                      href={doc.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                    >
                      <ExternalLink size={14} />
                      Drive
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              );
              break;
            case "actionbutton":
              content = (
                <div className="flex items-center gap-2">
                  <ActionButtons
                    onView={() => handleView(doc)}
                    onDelete={() => setDeleteTarget(doc)}
                    showView={true}
                    showEdit={false}
                    showDelete={canDelete}
                    disabled={viewing || deleting}
                  />
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    disabled={downloading}
                    className="w-8 h-8 flex justify-center items-center rounded text-sm transition-all duration-200 bg-[#E8FFEE] text-[#00A651] hover:border hover:border-[#00A651] disabled:opacity-50"
                  >
                    <Download size={16} />
                  </button>
                </div>
              );
              break;
            default:
              content = "—";
          }
          return (
            <td
              key={col.key}
              className="px-4 py-3 text-sm border-b border-gray-200 align-middle"
            >
              {content}
            </td>
          );
        })}
      </tr>
    ));
  };

  if (!canUpload && !canDelete) {
    return null;
  }

  const sectionLoading = typesLoading || driveLoading;

  return (
    <div className="space-y-5">
      {canUpload && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
          {!driveConnected && !driveLoading && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm">
                  Firstly connect with Google Drive before uploading documents.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/profile")}
              >
                Connect Google Drive
              </Button>
            </div>
          )}

          {sectionLoading ? (
            <div className="flex justify-center py-6">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label="Document Type"
                value={documentTypeId}
                options={documentTypeOptions}
                placeholder="Select document type"
                onChange={setDocumentTypeId}
                disabled={!driveConnected}
              />

              <SelectInput
                label="Frequency Type"
                value={frequencyTypes}
                options={frequencyOptions}
                placeholder="Select frequency types"
                onChange={setFrequencyTypes}
                isMulti={true}
                disabled={!documentTypeId}
              />

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    File Upload
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (Max 10MB)
                    </span>
                  </label>
                  {driveConnected && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600">
                      <FiCheckCircle className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                      Drive Connected
                    </span>
                  )}
                </div>

                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${driveConnected
                      ? 'border-gray-300 hover:border-[#04364A] bg-gray-50/50 hover:bg-gray-100/50'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    disabled={!driveConnected}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="px-6 py-3 text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`p-2 rounded-full ${driveConnected ? 'bg-[#04364A]/10' : 'bg-gray-200'
                        }`}>
                        <MdCloudUpload className={`w-6 h-6 ${driveConnected ? 'text-[#04364A]' : 'text-gray-400'
                          }`} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {driveConnected ? 'Drop your file here or click to browse' : 'Connect Google Drive to upload'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Supported files: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                    {selectedFile && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 ">
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!driveConnected || uploading || !selectedFile}
                    className={`min-w-[120px] transition-all ${uploading ? 'opacity-80' : ''
                      }`}
                  >
                    {uploading ? (
                      <>
                        <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800">
            Uploaded Documents
          </h4>
          <span className="text-xs text-gray-500">
            {documents?.length || 0} file(s)
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : documents?.length ? (
          <CustomTable
            data={documents}
            columns={DOCUMENT_COLUMNS}
            loading={loading}
            emptyMessage="No documents uploaded yet."
            renderRow={renderDocumentRow}
            className="border border-gray-200 rounded-lg"
            rowClassName="hover:bg-gray-50"
          />
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
            No documents uploaded yet.
          </p>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget.originalName}</span>?
              This will remove the file from Google Drive.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DocumentPreviewModal
        isOpen={!!preview}
        onClose={closePreview}
        previewUrl={preview?.url}
        mimeType={preview?.mimeType}
        fileName={preview?.fileName}
      />
    </div>
  );
};

export default DocumentsSection;