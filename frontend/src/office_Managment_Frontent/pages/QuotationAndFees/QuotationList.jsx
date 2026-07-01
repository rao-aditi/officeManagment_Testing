import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuotationById,
  fetchQuotations,
  updateQuotationStatus,
} from "../../store/slice/quotation/quotationSlice";
import Card, { CardBody } from "../../components/ui/Card";
import { Receipt, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useAlert } from "../../helpers/AlertContent";
import Loader from "../../components/Loader/Loader";
import Datatable from "@/office_Managment_Frontent/components/common/Datatable";
import AddEditQuotationModel from "./AddEditQuotationModel";
import { getEnums } from "../../store/slice/auth/authSlice";
import SelectInput from "../../components/ui/SelectInput";
import ActionButtons from "../../components/common/ActionsButtons";
import { formatDate } from "../../helpers/commonFunctions";
import { usePermission } from "../../Hooks/usePermission";

const QuotationList = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { list: quotations, loading, error } = useSelector(
    (state) => state.quotations
  );
  const { enums } = useSelector((state) => state.auth);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const { can } = usePermission();

  useEffect(() => {
    dispatch(fetchQuotations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  }, [error, showAlert]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await dispatch(updateQuotationStatus({ id, status })).unwrap();
      showAlert({
        type: "success",
        title: "Success",
        message: response.message,
      });
      dispatch(fetchQuotations());
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Failed to update quotation.",
      });
    }
  };

  useEffect(() => {
    dispatch(
      getEnums({
        quotationStatus: true,
      })
    );
  }, [dispatch]);

  const statusOptions = useMemo(() => {
    return (enums?.quotationStatus || []).map((status) => ({
      value: status,
      label: status,
    }));
  }, [enums?.quotationStatus]);

  const handleEditQuotation = async (id) => {
    try {
      const quotation = await dispatch(fetchQuotationById(id)).unwrap();
      setSelectedQuotation(quotation);
      setModalOpen(true);
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err,
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedQuotation(null);
    dispatch(fetchQuotations());
  };

  const columns = [
    { id: "date", label: "Date", minWidth: "120px" },
    { id: "quoteRef", label: "Quote Ref", minWidth: "120px" },
    { id: "clientName", label: "Client Name", minWidth: "150px" },
    { id: "service", label: "Service", minWidth: "180px" },
    { id: "amount", label: "Amount", minWidth: "120px" },
    { id: "status", label: "Status", minWidth: "100px" },
    { id: "action", label: "Action", minWidth: "100px" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex px-4 py-1 rounded-full text-sm border border-green-700 font-semibold bg-green-100 text-green-700">
            Approved
          </span>
        );

      case "REJECTED":
        return (
          <span className="inline-flex px-4 py-1 rounded-full text-sm border border-red-700 font-semibold bg-red-100 text-red-700">
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex px-4 py-1 rounded-full text-sm border border-gray-500 font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const renderRow = (data, visibleColumns) => {
    return data.map((q) => (
      <tr key={q.id} className="hover:bg-gray-50 border-b border-gray-100 text-sm">
        {visibleColumns.map((col) => {
          if (col.id === "date") {
            return (
              <td key={col.id} className="px-6 py-3 whitespace-nowrap">
                {formatDate(q.quotationDate || "—")}
              </td>
            );
          }
          if (col.id === "quoteRef") {
            return (
              <td key={col.id} className="px-6 py-3 font-mono font-bold text-[#04506B] whitespace-nowrap">
                {q.quotationNo || q.id}
              </td>
            );
          }
          if (col.id === "clientName") {
            return (
              <td key={col.id} className="px-6 py-3 text-gray-900 font-semibold whitespace-nowrap">
                {q.clientNames || q.clientName || "—"}
              </td>
            );
          }
          if (col.id === "service") {
            return (
              <td key={col.id} className="px-6 py-3 text-gray-600 font-medium">
                {q.serviceName || "—"}
              </td>
            );
          }
          if (col.id === "amount") {
            return (
              <td key={col.id} className="px-6 py-3 font-bold text-gray-900 whitespace-nowrap">
                ₹{Number(q.finalAmount || q.amount || 0).toLocaleString("en-IN")}
              </td>
            );
          }
          if (col.id === "status") {
            const isLocked =
              q.status === "APPROVED" || q.status === "REJECTED";
            const canEdit = can("create_quotation");
            return (
              <td key={col.id} className="px-4 py-3">
                {isLocked || !canEdit ? (
                  getStatusBadge(q.status)
                ) : (
                  <SelectInput
                    value={q.status}
                    options={statusOptions}
                    wrapperClass="w-40"
                    onChange={(value) => {
                      if (value !== q.status) {
                        handleUpdateStatus(q.id, value);
                      }
                    }}
                    placeholder="Select Status"
                  />
                )}
              </td>
            );
          }
          if (col.id === "action") {
            const isLocked = q.status === "APPROVED" || q.status === "REJECTED";
            const canEdit = can("create_quotation");
            return (
              <td key={col.id} className="px-4 py-3">
                {!isLocked && canEdit && (
                  <ActionButtons
                    onEdit={() => handleEditQuotation(q.id)}
                    showView={false}
                    showEdit={true}
                    showDelete={false}
                  />
                )}
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  return (
    <>
      {loading && (
        <Loader />
      )}

      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Receipt size={24} /> Client Quotations
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Create, review, and track fee quotations sent to clients.
              </p>
            </div>

            {can("create_quotation") && (
              <button
                onClick={() => setModalOpen(true)}
                className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
              >
                <PlusCircle size={16} /> Create Quotation
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-0">
            {quotations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No quotations created yet.
              </div>
            ) : (
              <Datatable
                columns={columns}
                data={quotations}
                renderRow={renderRow}
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalRecords={quotations.length}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                sortable={true}
              />
            )}
          </CardBody>
        </Card>

        <AddEditQuotationModel
          isOpen={modalOpen}
          onClose={handleModalClose}
          mode={selectedQuotation ? "edit" : "create"}
          quotationData={selectedQuotation}
        />
      </div>
    </>
  );
};

export default QuotationList;