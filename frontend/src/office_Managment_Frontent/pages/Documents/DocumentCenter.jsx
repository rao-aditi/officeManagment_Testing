import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Folder,
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  X,
  Filter,
  RefreshCw,
  FileImage,
  FileSpreadsheet,
  File,
} from "lucide-react";
import Card, { CardBody } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Datatable from "../../components/common/Datatable";
import SearchInput from "../../components/common/SearchInput";
import SelectInput from "../../components/ui/SelectInput";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";
import { useAlert } from "../../helpers/AlertContent";
import { usePermission } from "../../Hooks/usePermission";
import { PERMISSION_KEYS } from "../../helpers/permissions";
import {
  fetchDocuments,
  fetchDocumentStats,
  deleteDocument,
  downloadDocument,
  viewDocument,
} from "../../store/slice/document/documentSlice";
import { formatDate, truncateText } from "../../helpers/commonFunctions";
import { fetchDocumentTypes } from "../../store/slice/documentType/documentTypeSlice";
import { fetchGoogleDriveStatus } from "../../store/slice/googleDrive/googleDriveSlice";
import UploadModal from "./UploadModal";
import ActionButtons from "../../components/common/ActionsButtons";
import DocumentPreviewModal from "../../components/Documents/DocumentPreviewModal";
import {
  createPreviewObjectUrl,
  isInlinePreviewable,
} from "../../helpers/documentPreview";

const DOCUMENT_COLUMNS = [
  { id: "document", label: "Document", minWidth: "220px", enabled: true },
  { id: "documentType", label: "Document Type", minWidth: "120px", enabled: true },
  // { id: "client", label: "Client", minWidth: "140px", enabled: true },
  // { id: "task", label: "Task", minWidth: "120px", enabled: true },
  { id: "size", label: "Size", minWidth: "80px", enabled: true },
  { id: "uploadedBy", label: "Uploaded By", minWidth: "120px", enabled: true },
  { id: "date", label: "Date", minWidth: "100px", enabled: true },
  { id: "actionButton", label: "Actions", minWidth: "120px", enabled: true },
];

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileIcon = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return <FileImage size={16} className="text-blue-400" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return <FileSpreadsheet size={16} className="text-green-500" />;
  if (mimeType === "application/pdf") return <FileText size={16} className="text-red-400" />;
  return <File size={16} className="text-gray-400" />;
};

const getClientDisplayName = (client) => {
  if (!client) return "—";
  return (
    client.businessName ||
    client.name ||
    `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
    "—"
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, doc, onConfirm, deleting }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Document" size="sm">
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-900">{doc?.originalName}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
        >
          {deleting ? "Deleting..." : <><Trash2 size={14} /> Delete</>}
        </button>
      </div>
    </div>
  </Modal>
);

const StatsBar = ({ stats }) => {
  if (!stats) return null;
  const items = [
    { label: "Total Documents :", value: stats.total, color: "text-[#04364A] font-bold" },
    ...((stats.byDocumentType || stats.byCategory || []).map((s) => ({
      label: s.documentTypeName || s.category,
      value: s.count,
      color: "text-gray-700 font-semibold",
    }))),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm"
        >
          <span className="text-gray-500">{item.label}</span>
          <span className={item.color}>({item.value})</span>
        </div>
      ))}
    </div>
  );
};

const DocumentCenter = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { can } = usePermission();
  const canUpload = can(PERMISSION_KEYS.UPLOAD_DOCUMENTS);
  const canDelete = can(PERMISSION_KEYS.DELETE_DOCUMENTS);

  const { documents, stats, pagination, loading, deleting } = useSelector(
    (state) => state.documents
  );
  const { list: documentTypes } = useSelector((state) => state.documentTypes);
  const { connected: driveConnected } = useSelector((state) => state.googleDrive);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchDocumentTypes({ status: "ACTIVE", limit: 100 }));
    dispatch(fetchGoogleDriveStatus());
    dispatch(fetchDocumentStats());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (documentTypeFilter !== "ALL") params.documentTypeId = documentTypeFilter;

    dispatch(fetchDocuments(params))
      .unwrap()
      .catch((err) => {
        showAlert({ type: "error", title: err || "Failed to load documents" });
      });
  }, [dispatch, currentPage, rowsPerPage, debouncedSearch, documentTypeFilter]);

  const reloadDocuments = () => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (documentTypeFilter !== "ALL") params.documentTypeId = documentTypeFilter;
    return dispatch(fetchDocuments(params));
  };

  const documentTypeFilterOptions = useMemo(
    () => [
      { label: "All Document Types", value: "ALL" },
      ...(documentTypes || [])
        .filter((item) => item.status === "ACTIVE")
        .map((item) => ({
          value: item.id,
          label: item.name,
        })),
    ],
    [documentTypes]
  );

  const handleRefresh = () => {
    reloadDocuments();
    dispatch(fetchDocumentStats());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteDocument(deleteTarget.id)).unwrap();
      showAlert({ type: "success", title: "Document deleted" });
      setDeleteTarget(null);
      reloadDocuments();
      dispatch(fetchDocumentStats());
    } catch (err) {
      showAlert({ type: "error", title: err || "Failed to delete" });
    }
  };

  const downloadFile = async (doc) => {
    try {
      const { blob, fileName } = await dispatch(
        downloadDocument({ id: doc.id, fileName: doc.originalName })
      ).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showAlert({ type: "error", title: err || "Failed to download document" });
    }
  };

  const closePreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  const viewFile = async (doc) => {
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

  const renderRow = (data, visibleColumns) =>
    data.map((doc) => (
      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
        {visibleColumns.map((col) => {
          let content;
          switch (col.id) {
            case "document":
              content = (
                <div className="flex items-start gap-2 max-w-[220px]">
                  <div className="mt-0.5">{getFileIcon(doc.mimeType)}</div>
                  <div>
                    <p className="font-medium text-gray-900 truncate leading-tight">
                      {truncateText(doc.originalName, 40)}
                    </p>
                  </div>
                </div>
              );
              break;
            case "documentType":
              content = (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                  {doc.documentType?.name || "—"}
                </span>
              );
              break;
            case "client":
              content = (
                <span className="text-gray-600 max-w-[140px] truncate block">
                  {getClientDisplayName(doc.client)}
                </span>
              );
              break;
            case "task":
              content = (
                <span className="text-gray-500 max-w-[120px] truncate block">
                  {doc.task?.title || "—"}
                </span>
              );
              break;
            case "size":
              content = (
                <span className="text-gray-500 whitespace-nowrap">
                  {formatBytes(doc.fileSize)}
                </span>
              );
              break;
            case "uploadedBy":
              content = (
                <span className="text-gray-600 whitespace-nowrap">
                  {doc.uploadedBy?.name || "—"}
                </span>
              );
              break;
            case "date":
              content = (
                <span className="text-gray-500 whitespace-nowrap">
                  {formatDate(doc.createdAt)}
                </span>
              );
              break;
            case "actionButton":
              content = (
                <div className="flex items-center gap-2">
                  <ActionButtons
                    onView={() => viewFile(doc)}
                    onDelete={() => setDeleteTarget(doc)}
                    showView={true}
                    showEdit={false}
                    showDelete={canDelete}
                  />
                  <button
                    type="button"
                    onClick={() => downloadFile(doc)}
                    className="w-8 h-8 flex justify-center items-center rounded text-sm transition-all duration-200 bg-[#E8FFEE] text-[#00A651] hover:border hover:border-[#00A651] disabled:opacity-50"
                  >
                    <Download size={16} />
                  </button>
                </div>
              );
              break;
            default:
              content = doc[col.id];
          }
          return (
            <td
              key={col.id}
              className="px-4 py-3 text-sm border-b border-gray-200 align-middle"
            >
              {content}
            </td>
          );
        })}
      </tr>
    ));

  return (
    <>
      {loading && <Loader />}

      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Folder size={24} /> Document Center
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Securely store, manage, and organize tax files, filings, KYC docs, and more.
              </p>
            </div>
            {/* {canUpload && (
              <button
                onClick={() => {
                  if (!driveConnected) {
                    showAlert({
                      type: "warning",
                      title: "Google Drive required",
                      message:
                        "Firstly connect with Google Drive before uploading documents.",
                    });
                    return;
                  }
                  setShowUpload(true);
                }}
                className="bg-white text-[#04364A] hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all shadow flex items-center gap-2 text-sm"
              >
                <Upload size={16} /> Upload Document
              </button>
            )} */}
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16" />
        </div>

        <StatsBar stats={stats} />

        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-[300px] max-w-sm">
                <SearchInput
                  placeholder="Search documents or clients..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  width="100%"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-[200px]">
                  <SelectInput
                    value={documentTypeFilter}
                    onChange={(val) => {
                      setDocumentTypeFilter(val);
                      setCurrentPage(1);
                    }}
                    options={documentTypeFilterOptions}
                    placeholder="Select document type"
                    searchable={false}
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <Datatable
              columns={DOCUMENT_COLUMNS}
              data={documents}
              renderRow={renderRow}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRecords={pagination.total}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              sortable={false}
            />
          </CardBody>
        </Card>

        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            reloadDocuments();
            dispatch(fetchDocumentStats());
          }}
        />
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          doc={deleteTarget}
          onConfirm={handleDelete}
          deleting={deleting}
        />
        <DocumentPreviewModal
          isOpen={!!preview}
          onClose={closePreview}
          previewUrl={preview?.url}
          mimeType={preview?.mimeType}
          fileName={preview?.fileName}
        />
      </div>
    </>
  );
};

export default DocumentCenter;
