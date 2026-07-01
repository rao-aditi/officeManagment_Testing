import React, { useEffect, useState } from "react";
import { invoiceApi } from "../../api/invoiceApi";
import { paymentApi } from "../../api/paymentApi";
import { useSelector, useDispatch } from "react-redux";
import { getEnums } from "../../store/slice/auth/authSlice";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import { getApiErrorMessage } from "../../helpers/apiError";
import { FileSpreadsheet, Printer, PlusCircle, Check, X, Edit2, AlertTriangle } from "lucide-react";
import { useAlert } from "../../helpers/AlertContent";
import Loader from "../../components/Loader/Loader";
import Datatable from "@/office_Managment_Frontent/components/common/Datatable";
import SearchInput from "@/office_Managment_Frontent/components/common/SearchInput";
import { useNavigate } from "react-router-dom";

const InvoiceList = () => {
  const { userDetails, enums } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const paymentModeOptions = enums.paymentMode.map(mode => {
    if (mode === "UPI") return { value: mode, label: "UPI" };
    return {
      value: mode,
      label: mode.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
    };
  })

  const isAdminUser = userDetails?.role === "ADMIN";
  const { showAlert } = useAlert();

  const [invoices, setInvoices] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openedFromHeader, setOpenedFromHeader] = useState(false);

  const [selectedQuotationId, setSelectedQuotationId] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [adminOverride, setAdminOverride] = useState(false);
  const navigate = useNavigate();
  const [editForm, setEditForm] = useState({
    serviceCharges: "",
    taxRate: "",
    discountAmount: "",
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    mode: "BANK_TRANSFER",
    referenceNo: "",
  });

  useEffect(() => {
    dispatch(getEnums({ invoiceStatus: true, paymentMode: true }));
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resInvoices = await invoiceApi.getAllInvoices({ limit: 100 });
      setInvoices(resInvoices.data.data.invoices || []);
      setInvoiceData(resInvoices.data.data.quotations || []);
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to fetch data."),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await invoiceApi.getAllInvoices({ limit: 100 });
      setInvoices(res.data.data.invoices || []);
      setInvoiceData(res.data.data.quotations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = () => {
    setOpenedFromHeader(true);
    setSelectedQuotationId("");
    setSelectedQuotation(null);
    setAdminOverride(false);
    setIsCreateModalOpen(true);
  };

  const handleQuotationChange = (val) => {
    setSelectedQuotationId(val);
    const matched = invoiceData.find((q) => String(q.id) === String(val));
    setSelectedQuotation(matched || null);
  };

  const handleCreateInvoice = async () => {
    if (!selectedQuotationId) return;

    if (selectedQuotation.taskId) {
      const taskDone = ["COMPLETED", "APPROVED"].includes(selectedQuotation.taskStatus);
      if (!taskDone && !adminOverride) {
        showAlert({
          type: "warning",
          title: "Incomplete Task",
          message: "The related task is not Completed or Approved. Admin Override is required to proceed.",
        });
        return;
      }
    }
    try {
      const res = await invoiceApi.createInvoice({
        quotationId: selectedQuotationId,
        adminOverride: adminOverride,
      });

      showAlert({
        type: "success",
        title: "Success",
        message: "Invoice created successfully.",
      });
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to create invoice."),
      });
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    if (nextStatus === "PAID") {
      const invoice = invoices.find((inv) => inv.id === id) || selectedInvoice;
      if (!invoice) return;
      setSelectedInvoice(invoice);
      setPaymentForm({
        amountPaid: String(invoice.balance ?? invoice.total),
        mode: "BANK_TRANSFER",
        referenceNo: "",
      });
      setIsPaymentModalOpen(true);
      return;
    }

    try {
      const res = await invoiceApi.updateInvoiceStatus(id, nextStatus);
      const updated = res.data.data.invoice;
      showAlert({
        type: "success",
        title: "Status Updated",
        message: `Invoice status updated to ${nextStatus}.`,
      });
      fetchInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updated);
      }
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to update status."),
      });
    }
  };

  const handleCancelInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this invoice?")) return;
    try {
      const res = await invoiceApi.cancelInvoice(id);
      const updated = res.data.data.invoice;
      showAlert({
        type: "success",
        title: "Invoice Cancelled",
        message: "Invoice has been successfully cancelled.",
      });
      fetchInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(updated);
      }
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to cancel invoice."),
      });
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedInvoice) return;
    setEditForm({
      serviceCharges: String(selectedInvoice.serviceCharges),
      taxRate: String(selectedInvoice.taxRate),
      discountAmount: String(selectedInvoice.discountAmount),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = async () => {
    try {
      const res = await invoiceApi.updateInvoice(selectedInvoice.id, {
        serviceCharges: Number(editForm.serviceCharges),
        taxRate: Number(editForm.taxRate),
        discountAmount: Number(editForm.discountAmount),
      });
      const updated = res.data.data.invoice;
      showAlert({
        type: "success",
        title: "Invoice Updated",
        message: "Invoice financial details updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedInvoice(updated);
      fetchInvoices();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to update invoice financial details."),
      });
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    try {
      await paymentApi.create({
        invoiceId: selectedInvoice.id,
        amountPaid: Number(paymentForm.amountPaid),
        mode: paymentForm.mode,
        referenceNo: paymentForm.referenceNo || undefined,
        paymentDate: new Date().toISOString(),
      });
      showAlert({
        type: "success",
        title: "Payment Recorded",
        message: "Payment recorded and invoice status updated.",
      });
      setIsPaymentModalOpen(false);
      setIsPdfModalOpen(false);
      fetchInvoices();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: getApiErrorMessage(err, "Failed to record payment."),
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border border-green-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border border-red-200";
      case "SENT":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-500 border border-gray-200 line-through";
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  };

  // Combine invoices and approved quotations into one list
  const combinedRecords = [
    ...invoices.map((inv) => ({
      ...inv,
      isInvoice: true,
      recordNo: inv.invoiceNo,
      recordDate: inv.issuedAt,
      recordAmount: inv.total,
      recordStatus: inv.status,
    })),
    ...invoiceData.map((q) => ({
      ...q,
      isInvoice: false,
      recordNo: q.quotationNo,
      recordDate: q.createdAt,
      recordAmount: q.finalAmount,
      recordStatus: "PENDING_BILLING",
    })),
  ];

  // Filter combined records based on search term
  const filteredRecords = combinedRecords.filter((rec) =>
    (rec.client?.displayName || rec.client?.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    rec.recordNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic values calculation for edit modal
  const editTaxable = Math.max(0, Number(editForm.serviceCharges || 0) - Number(editForm.discountAmount || 0));
  const editTax = Math.round(((editTaxable * Number(editForm.taxRate || 0)) / 100) * 100) / 100;
  const editTotal = Math.round((editTaxable + editTax) * 100) / 100;

  const columns = [
    {
      id: "invoiceNo",
      label: "Invoice No",
      minWidth: "125px",
    },
    {
      id: "client",
      label: "Client",
      minWidth: "150px",
    },
    {
      id: "amount",
      label: "Amount",
      minWidth: "120px",
    },
    {
      id: "actionButton",
      label: "Action",
      minWidth: "100px",
    },
  ];

  const renderRow = (data, visibleColumns) => {
    return data.map((rec) => (
      <tr key={rec.id + (rec.isInvoice ? "-inv" : "-q")} className="hover:bg-gray-50 border-b border-gray-100 text-sm">
        {visibleColumns.map((col) => {
          if (col.id === "invoiceNo") {
            return (
              <td key={col.id} className="px-4 py-3 font-mono text-gray-500 whitespace-nowrap">
                {rec.isInvoice ? (rec.quotationNo || "-") : rec.recordNo}
              </td>
            );
          }
          if (col.id === "client") {
            return (
              <td key={col.id} className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                {rec.client?.displayName || "-"}
              </td>
            );
          }

          if (col.id === "amount") {
            return (
              <td key={col.id} className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                ₹{Number(rec.recordAmount).toLocaleString("en-IN")}
              </td>
            );
          }
          if (col.id === "status") {
            return (
              <td key={col.id} className="px-4 py-3 whitespace-nowrap">
                {rec.isInvoice && (
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getStatusBadge(rec.recordStatus)}`}>
                    {rec.recordStatus}
                  </span>
                )}
              </td>
            );
          }
          if (col.id === "actionButton") {
            return (
              <td key={col.id} className="px-4 py-3 whitespace-nowrap">
                <Button
                  onClick={() => {
                    if (rec.isInvoice) {
                      navigate(`/invoices/${rec.id}`);
                    } else {
                      setOpenedFromHeader(false);
                      setSelectedQuotationId(rec.id);
                      setSelectedQuotation(rec);
                      setAdminOverride(false);
                      setIsCreateModalOpen(true);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  styleClass="!w-auto"
                >
                  View
                </Button>
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  if (loading) {
    return <Loader />
  }

  const quotationOptions = invoiceData.map((q) => ({
    value: q.id,
    label: `${q?.quotationNo} — ${q?.client?.name} (${q?.serviceName || "No Service"})`,
  }));

  const isTaskEligible = selectedQuotation?.taskId
    ? ["COMPLETED", "APPROVED"].includes(selectedQuotation.taskStatus)
    : true;

  const canCreate = selectedQuotationId && (isTaskEligible || (adminOverride && isAdminUser));

  return (
    <div className="space-y-5 mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSpreadsheet size={24} /> Invoice Billing Center
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Create Invoices from approved quotations, track status workflows, and manage billing payments.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
          >
            <PlusCircle size={16} /> Create Invoice
          </button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
      </div>

      <Card>
        <CardBody className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">Invoices & Billing Records</h2>
            <SearchInput
              placeholder="Search by ID or Client..."
              value={searchTerm}
              onChange={setSearchTerm}
              size="md"
              className="w-80"
            />
          </div>

          <Datatable
            columns={columns}
            data={filteredRecords}
            renderRow={renderRow}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            totalRecords={filteredRecords.length}
            setRowsPerPage={setRowsPerPage}
            setCurrentPage={setCurrentPage}
            sortable={true}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Invoice"
        size="lg"
      >
        <div className="space-y-5">
          {openedFromHeader ? (
            <SelectInput
              label="Approved Quotation"
              value={selectedQuotationId}
              options={quotationOptions}
              onChange={handleQuotationChange}
              placeholder="Search and select quotation"
              required
            />
          ) : (
            <div className="bg-gradient-to-r from-[#04364A] to-[#176B87] text-white rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80">Selected Quotation</p>
                  <h3 className="font-bold text-lg">
                    {selectedQuotation?.recordNo ||
                      selectedQuotation?.quotationNo}
                  </h3>
                </div>

                <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">
                  APPROVED
                </span>
              </div>
            </div>
          )}

          {selectedQuotation && (
            <>
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <h3 className="font-bold text-[#04364A] mb-3">
                  Quotation Details :
                </h3>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-gray-500 text-xs">CLIENT</p>
                    <p className="font-semibold text-gray-900">
                      {selectedQuotation?.client?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">SERVICE TYPE</p>
                    <p className="font-semibold text-gray-900">
                      {selectedQuotation.serviceName || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-gray-300 rounded-lg p-3">
                <h3 className="font-bold text-[#04364A] mb-2">
                  Amount Summary
                </h3>

                <div className="grid grid-cols-4 gap-4">

                  <div className="bg-white rounded-lg p-2 border border-gray-300">
                    <p className="text-sm text-gray-500">
                      Service Charges
                    </p>
                    <p className="font-bold text-gray-900">
                      ₹{selectedQuotation.serviceCharges.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-300">
                    <p className="text-sm text-gray-500">
                      Tax Rate
                    </p>
                    <p className="font-bold text-gray-900">
                      {selectedQuotation.taxRate}%
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-2 border border-gray-300">
                    <p className="text-sm text-gray-500">
                      Discount
                    </p>
                    <p className="font-bold text-red-600">
                      ₹{selectedQuotation.discountAmount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="bg-[#04364A] text-white rounded-lg p-3">
                    <p className="text-sm opacity-80">
                      Final Amount
                    </p>
                    <p className="text-xl font-bold">
                      ₹{selectedQuotation.finalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>
              </div>

              {/* Task Information */}
              {selectedQuotation.taskId && (
                <div className="bg-white border border-gray-300 rounded-lg p-3">
                  <h3 className="font-semibold text-[#04364A] mb-2">
                    Task Information
                  </h3>

                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-xs text-gray-500">
                        Related Task
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedQuotation.taskTitle || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${isTaskEligible
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {selectedQuotation.taskStatus}
                    </span>
                  </div>

                  {!isTaskEligible && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">

                      <div className="flex gap-2">
                        <AlertTriangle
                          size={16}
                          className="text-blue-600 mt-0.5"
                        />

                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">
                            Invoice generation is restricted.
                          </p>

                          <p className="text-xs text-blue-700 mt-1">
                            Task must be Completed or Approved
                            before invoice generation.
                          </p>

                          {isAdminUser ? (
                            <label className="flex items-center gap-2 mt-3">
                              <input
                                type="checkbox"
                                checked={adminOverride}
                                onChange={(e) =>
                                  setAdminOverride(
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="text-sm font-medium">
                                Admin Override
                              </span>
                            </label>
                          ) : (
                            <p className="text-red-600 text-xs mt-2 font-medium">
                              Admin approval required.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <div className="border-t border-gray-300 pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={!canCreate}
              className="bg-[#04364A] hover:bg-[#032736]"
            >
              Create Invoice
            </Button>
          </div>

        </div>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment - ${selectedInvoice.invoiceNo}`}
          size="md"
        >
          <div className="space-y-4">
            <TextInput
              label="Amount Paid (₹)"
              type="number"
              min="0.01"
              step="0.01"
              value={paymentForm.amountPaid}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amountPaid: e.target.value })
              }
              required
            />
            <SelectInput
              label="Payment Mode"
              value={paymentForm.mode}
              options={paymentModeOptions}
              onChange={(val) => setPaymentForm({ ...paymentForm, mode: val })}
              required
            />
            <TextInput
              label="Reference No (optional)"
              value={paymentForm.referenceNo}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, referenceNo: e.target.value })
              }
              placeholder="Transaction / cheque reference"
            />
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT FINANCIAL DETAILS MODAL (Admin Only) */}
      {selectedInvoice && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Invoice Financial Amounts"
          size="md"
        >
          <div className="space-y-4">
            <TextInput
              label="Service Charges (₹)"
              type="number"
              value={editForm.serviceCharges}
              onChange={(e) => setEditForm({ ...editForm, serviceCharges: e.target.value })}
              required
            />

            <TextInput
              label="Discount Amount (₹)"
              type="number"
              value={editForm.discountAmount}
              onChange={(e) => setEditForm({ ...editForm, discountAmount: e.target.value })}
              required
            />

            <TextInput
              label="Tax Rate (%)"
              type="number"
              value={editForm.taxRate}
              onChange={(e) => setEditForm({ ...editForm, taxRate: e.target.value })}
              required
            />

            <div className="bg-gray-50 rounded-xl p-3 border text-xs space-y-1.5">
              <span className="font-bold text-[#04364A] block">Recalculated Summary</span>
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-bold text-gray-900">₹{editTaxable.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({editForm.taxRate}%):</span>
                <span className="font-bold text-gray-900">₹{editTax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 font-bold text-sm">
                <span>New Total:</span>
                <span className="text-[#04364A] font-mono">₹{editTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateInvoice}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceList;