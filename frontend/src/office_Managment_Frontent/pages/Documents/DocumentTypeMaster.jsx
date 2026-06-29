import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchDocumentTypes,
  fetchDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  clearSelectedDocumentType,
} from "../../store/slice/documentType/documentTypeSlice";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FileType, PlusCircle } from "lucide-react";
import Loader from "../../components/Loader/Loader";
import { usePermission } from "../../Hooks/usePermission";
import { PERMISSION_KEYS } from "../../helpers/permissions";
import DataTable from "../../components/common/Datatable";
import ActionButtons from "../../components/common/ActionsButtons";
import Modal from "../../components/ui/Modal";
import { useAlert } from "@/office_Managment_Frontent/helpers/AlertContent";
import AddEditDocumentTypeModal from "./AddEditDocumentTypeModal";
import { getEnums, fetchUserPermissions } from "../../store/slice/auth/authSlice";

const FREQUENCY_LABELS = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  ONE_TIME: "One Time",
};

const DocumentTypeMaster = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { can } = usePermission();

  const canCreate = can(PERMISSION_KEYS.CREATE_DOCUMENT_TYPE);
  const canUpdate = can(PERMISSION_KEYS.UPDATE_DOCUMENT_TYPE);
  const canDelete = can(PERMISSION_KEYS.DELETE_DOCUMENT_TYPE);

  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { list, selectedItem, loading, error } = useSelector(
    (state) => state.documentTypes
  );
  const { enums } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDocumentTypes());
    dispatch(getEnums({
      status: true,
      frequencyType: true
    }));
    dispatch(fetchUserPermissions(true));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  }, [error, showAlert]);

  const statusOptions = useMemo(
    () => [
      { label: "All Status", value: "ALL" },
      ...(enums?.status || []).map((status) => ({
        value: status,
        label: status,
      })),
    ],
    [enums?.status]
  );
  const frequencyOptions = useMemo(() => {
    return [
      { label: "ALL TYPE", value: "ALL" },
      ...(enums?.frequencyType || []).map((status) => ({
        value: status,
        label: status,
      })),
    ];
  }, [enums?.frequencyType]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .required("Document type name is required"),
    frequencyTypes: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one frequency type")
      .required("Frequency types are required"),
    status: Yup.string()
      .oneOf(["ACTIVE", "INACTIVE"], "Invalid status")
      .required("Status is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      frequencyTypes: [],
      status: "ACTIVE",
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name.trim(),
        frequencyTypes: values.frequencyTypes,
        status: values.status,
      };
      try {
        if (mode === "edit" && editingId) {
          const result = await dispatch(updateDocumentType({ id: editingId, data: payload })).unwrap();
          showAlert({
            type: "success",
            title: "Updated",
            message: result.message,
          });
        } else {
          const result = await dispatch(createDocumentType(payload)).unwrap();
          showAlert({
            type: "success",
            title: "Success",
            message: result.message,
          });
        }
        handleCancelForm();
        dispatch(fetchDocumentTypes());
      } catch (err) {
        showAlert({
          type: "error",
          title: "Error",
          message: err || "Failed to save document type.",
        });
      }
    },
  });

  const handleCancelForm = () => {
    setMode(null);
    setEditingId(null);
    formik.resetForm();
    dispatch(clearSelectedDocumentType());
  };

  const handleAdd = () => {
    setMode("create");
    setEditingId(null);
    formik.resetForm({
      values: {
        name: "",
        frequencyTypes: [],
        status: "ACTIVE",
      },
    });
    dispatch(clearSelectedDocumentType());
  };

  const handleEdit = async (item) => {
    setMode("edit");
    setEditingId(item.id);
    formik.setValues({
      name: item.name || "",
      frequencyTypes: item.frequencyTypes || [],
      status: item.status || "ACTIVE",
    });
    dispatch(clearSelectedDocumentType());
    await dispatch(fetchDocumentTypeById(item.id));
  };

  const handleView = async (item) => {
    setViewOpen(true);
    await dispatch(fetchDocumentTypeById(item.id));
  };

  const closeView = () => {
    setViewOpen(false);
    dispatch(clearSelectedDocumentType());
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const result = await dispatch(deleteDocumentType(deleteTarget.id)).unwrap();
      showAlert({
        type: "success",
        title: "Deleted",
        message: result.message,
      });
      setDeleteTarget(null);
      if (mode === "edit" && editingId === deleteTarget.id) {
        handleCancelForm();
      }
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Failed to delete document type.",
      });
    }
  };

  const displayItem = selectedItem || null;

  const columns = [
    { id: "name", label: "Document Type", minWidth: "180px" },
    { id: "frequencyTypes", label: "Frequency Types", minWidth: "200px" },
    { id: "status", label: "Status", minWidth: "100px" },
    { id: "actionButton", label: "Actions", minWidth: "150px" },
  ];

  const renderRow = (data, visibleColumns) => {
    return data.map((item) => (
      <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
        {visibleColumns.map((col) => {
          if (col.id === "name") {
            return (
              <td
                key={col.id}
                className="px-6 py-4 text-sm font-semibold text-gray-900"
              >
                {item.name}
              </td>
            );
          }
          if (col.id === "frequencyTypes") {
            return (
              <td key={col.id} className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {(item.frequencyTypes || []).map((ft) => (
                    <span
                      key={ft}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {FREQUENCY_LABELS[ft] || ft}
                    </span>
                  ))}
                </div>
              </td>
            );
          }
          if (col.id === "status") {
            return (
              <td key={col.id} className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold border ${item.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                    }`}
                >
                  {item.status}
                </span>
              </td>
            );
          }
          if (col.id === "actionButton") {
            return (
              <td key={col.id} className="px-6 py-2">
                <ActionButtons
                  onView={() => handleView(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  showView={true}
                />
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  const paginatedData = list.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      {loading && <Loader />}

      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileType size={24} /> Document Type Master
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Manage document types and their filing frequency options.
              </p>
            </div>
            {canCreate && !mode && (
              <button
                type="button"
                onClick={handleAdd}
                className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
              >
                <PlusCircle size={16} /> Add Document Type
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedData}
              renderRow={renderRow}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRecords={list.length}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              sortable={false}
            />
          </CardBody>
        </Card>

        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Document Type"
          size="sm"
        >
          {deleteTarget && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete &quot;{deleteTarget.name}&quot;?
              </p>
              <div className="flex justify-end gap-2 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger-outline"
                  size="sm"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </>
          )}
        </Modal>

        <AddEditDocumentTypeModal
          isOpen={mode === "create" || mode === "edit"}
          onClose={handleCancelForm}
          mode={mode}
          formik={formik}
          loading={loading}
          statusOptions={statusOptions}
          frequencyOptions={frequencyOptions}
        />

        <Modal
          isOpen={viewOpen}
          onClose={closeView}
          title="Document Type Details"
          size="md"
        >
          {displayItem && (
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{displayItem.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${displayItem.status === "ACTIVE"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                    }`}
                >
                  {displayItem.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Frequency Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {(displayItem.frequencyTypes || []).map((ft) => (
                    <span
                      key={ft}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                    >
                      {FREQUENCY_LABELS[ft] || ft}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default DocumentTypeMaster;
