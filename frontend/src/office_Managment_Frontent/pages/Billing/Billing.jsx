import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceApi } from "../../api/invoiceApi";
import { paymentApi } from "../../api/paymentApi";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TextInput from "../../components/ui/TextInput";
import {
  TrendingUp, DollarSign, Wallet, FileText, ArrowRight, Users, CreditCard,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getEnums } from "../../store/slice/auth/authSlice";
import Loader from "../../components/Loader/Loader";
import Datatable from "../../components/common/Datatable";
import SelectInput from "../../components/ui/SelectInput";
import { useAlert } from "../../helpers/AlertContent";
import { getApiErrorMessage } from "../../helpers/apiError";

const PAYMENT_MODE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARD", label: "Card" },
];

const Billing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enums, userDetails } = useSelector((state) => state.auth);
  const isAdmin = userDetails?.role === "ADMIN";
  const { showAlert } = useAlert();

  const [totals, setTotals] = useState({
    revenue: 0,
    outstanding: 0,
    invoiceCount: 0,
    paidCount: 0,
    overdueCount: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    mode: "",
    referenceNo: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    dispatch(getEnums({ invoiceStatus: true }));
  }, [dispatch]);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getAllInvoices({
        limit: rowsPerPage,
        page: currentPage,
        status: filterStatus !== "ALL" ? filterStatus : undefined
      });

      const data = res.data.data;
      const invoicesList = data.invoices || [];
      const allInvoices = data.allInvoices || invoicesList;
      const paid = allInvoices.filter((i) => i.status === "PAID");
      const unpaid = allInvoices.filter(
        (i) => i.status !== "PAID" && i.status !== "CANCELLED"
      );
      const overdue = allInvoices.filter((i) => i.status === "OVERDUE");

      const totalRevenue = paid.reduce((sum, inv) => sum + Number(inv.total), 0);
      const totalOutstanding = unpaid.reduce(
        (sum, inv) => sum + Number(inv.balance ?? inv.total),
        0
      );

      setTotals({
        revenue: totalRevenue,
        outstanding: totalOutstanding,
        invoiceCount: allInvoices.length,
        paidCount: paid.length,
        overdueCount: overdue.length
      });

      setInvoices(invoicesList);
      setTotalRecords(data.pagination?.total || invoicesList.length);
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, currentPage, filterStatus]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amountPaid: String(invoice.balance ?? invoice.total ?? ""),
      mode: "BANK_TRANSFER",
      referenceNo: "",
      paymentDate: new Date().toISOString().split("T")[0],
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;
    if (!paymentForm.amountPaid || Number(paymentForm.amountPaid) <= 0) {
      showAlert({ type: "warning", title: "Validation", message: "Amount must be greater than zero." });
      return;
    }
    try {
      setPaymentSubmitting(true);
      await paymentApi.create({
        invoiceId: selectedInvoice.id,
        amountPaid: Number(paymentForm.amountPaid),
        mode: paymentForm.mode,
        referenceNo: paymentForm.referenceNo || undefined,
        paymentDate: paymentForm.paymentDate
          ? new Date(paymentForm.paymentDate).toISOString()
          : new Date().toISOString(),
      });
      showAlert({ type: "success", title: "Payment Recorded", message: "Payment recorded and invoice status updated." });
      setIsPaymentModalOpen(false);
      fetchBillingData();
    } catch (err) {
      showAlert({ type: "error", title: "Error", message: getApiErrorMessage(err, "Failed to record payment.") });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <Card className={`${bgColor} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardBody className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {typeof value === "number" ? `₹${value.toLocaleString()}` : value}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const BILLING_COLUMNS = [
    { id: "invoiceNo", label: "Invoice No", minWidth: "140px", enabled: true, },
    { id: "client", label: "Client", minWidth: "200px", enabled: true, },
    { id: "service", label: "Service", minWidth: "180px", enabled: true, },
    { id: "amount", label: "Amount", minWidth: "130px", enabled: true, },
    { id: "balance", label: "Balance", minWidth: "130px", enabled: true, },
    { id: "status", label: "Status", minWidth: "120px", enabled: true, },
    { id: "issuedAt", label: "Invoice Date", minWidth: "140px", enabled: true, },
    { id: "actionButton", label: "Actions", minWidth: "150px", enabled: true, },
  ];

  const renderRow = (data, visibleColumns) =>
    data.map((invoice) => (
      <tr
        key={invoice.id}
        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        {visibleColumns.map((col) => {
          let content;

          switch (col.id) {
            case "invoiceNo":
              content = (
                <div className="font-semibold text-[#04506B]">
                  {invoice.invoiceNo}
                </div>
              );
              break;

            case "client":
              content = (
                <div>
                  <div className="font-medium text-gray-900">
                    {invoice.client?.displayName || "-"}
                  </div>

                  <div className="text-xs text-gray-500">
                    {invoice.client?.code || ""}
                  </div>
                </div>
              );
              break;

            case "service":
              content = (
                <div>
                  {invoice.serviceName ||
                    invoice.task?.title ||
                    "-"}
                </div>
              );
              break;

            case "amount":
              content = (
                <span className="font-semibold text-green-700">
                  ₹{Number(invoice.total || 0).toLocaleString()}
                </span>
              );
              break;

            case "balance":
              content = (
                <span
                  className={
                    Number(invoice.balance) > 0
                      ? "font-semibold text-red-600"
                      : "font-semibold text-green-600"
                  }
                >
                  ₹{Number(invoice.balance || 0).toLocaleString()}
                </span>
              );
              break;

            case "status":
              content = (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${invoice.status === "PAID"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : invoice.status === "OVERDUE"
                      ? "bg-red-100 text-red-700 border-red-300"        
                      : invoice.status === "PARTIALLY_PAID" || invoice.status === "PARTIAL"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : invoice.status === "SENT"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                          : invoice.status === "DRAFT"
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                >
                  {(enums?.invoiceStatus || []).includes(invoice.status) ? invoice.status : invoice.status}
                </span>
              );
              break;

            case "issuedAt":
              content = invoice.issuedAt
                ? new Date(invoice.issuedAt).toLocaleDateString(
                  "en-IN"
                )
                : "-";
              break;

            case "actionButton": {
              const canPay = isAdmin && !['PAID', 'CANCELLED'].includes(invoice.status);
              content = (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/invoices/${invoice?.id}`)}
                  >
                    View
                  </Button>
                  {canPay && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenPaymentModal(invoice)}
                      className="flex items-center gap-1 bg-[#04364A] hover:bg-[#032736] text-white !w-auto"
                    >
                      <CreditCard size={12} />
                      Pay
                    </Button>
                  )}
                </div>
              );
              break;
            }

            default:
              content = invoice[col.id];
          }

          return (
            <td
              key={col.id}
              className="px-4 py-3 text-sm"
              style={{
                minWidth: col.minWidth || "100px",
              }}
            >
              {content}
            </td>
          );
        })}
      </tr>
    ));

  return (
    <div className="space-y-6 mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} /> Financial Billing & Payments
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Review company ledger totals, collectable balances, and generate bills.
        </p>
      </div>

      {loading ? (
        <Loader inline />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              title="Total Revenue"
              value={totals.revenue}
              color="bg-gradient-to-r from-green-500 to-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={Wallet}
              title="Outstanding Balance"
              value={totals.outstanding}
              subtitle={`${totals.overdueCount} invoices overdue`}
              color="bg-gradient-to-r from-amber-500 to-amber-600"
              bgColor="bg-amber-50"
            />
            <StatCard
              icon={FileText}
              title="Total Invoices"
              value={totals.invoiceCount}
              subtitle={`${totals.paidCount} paid`}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={Users}
              title="Active Clients"
              value={new Set(invoices.map(i => i.client?.id)).size || 0}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              bgColor="bg-purple-50"
            />
          </div>

          <Card className="shadow-sm">
            <CardBody className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Invoice Records</h3>
                  <p className="text-sm text-gray-400">Manage and track all your invoices</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SelectInput
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(val)}
                    options={[
                      { value: "ALL", label: "All Status" },
                      ...(enums?.invoiceStatus || []).map((status) => ({
                        value: status,
                        label: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
                      })),
                    ]}
                    wrapperClass="w-44"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/invoice")}
                  >
                    Manage Invoices <ArrowRight size={14} />
                  </Button>
                </div>
              </div>

              <Datatable
                columns={BILLING_COLUMNS}
                data={invoices}
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalRecords={totalRecords}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                sortable={true}
                renderRow={renderRow}
              />
            </CardBody>
          </Card>
        </>
      )}

      {/* ── Record Payment Modal ── */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment — ${selectedInvoice.invoiceNo}`}
          size="md"
        >
          <div className="space-y-4">
            {/* Balance context */}
            <div className="bg-gradient-to-r from-[#04364A] to-[#06506B] rounded-xl p-4 text-white">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-white/70">Invoice Total</p>
                  <p className="font-bold text-lg">₹{Number(selectedInvoice.total || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Total Paid</p>
                  <p className="font-bold text-lg text-green-300">₹{Number(selectedInvoice.totalPaid || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Balance Due</p>
                  <p className="font-bold text-lg text-red-300">₹{Number(selectedInvoice.balance || selectedInvoice.total || 0).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            <TextInput
              id="billing-payment-amount"
              label="Amount Paid (₹)"
              type="number"
              min="0.01"
              step="0.01"
              value={paymentForm.amountPaid}
              onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              placeholder={`Max: ₹${Number(selectedInvoice.balance ?? selectedInvoice.total ?? 0).toLocaleString("en-IN")}`}
              required
            />

            <SelectInput
              id="billing-payment-mode"
              label="Payment Mode"
              value={paymentForm.mode}
              options={PAYMENT_MODE_OPTIONS}
              onChange={(val) => setPaymentForm({ ...paymentForm, mode: val })}
              required
            />

            <TextInput
              id="billing-payment-date"
              label="Payment Date"
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
            />

            <TextInput
              id="billing-payment-reference"
              label="Reference No (optional)"
              value={paymentForm.referenceNo}
              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
              placeholder="Transaction / cheque / UPI reference"
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={paymentSubmitting}
              >
                Cancel
              </Button>
              <Button
                id="billing-submit-payment-btn"
                size="sm"
                onClick={handleRecordPayment}
                disabled={paymentSubmitting}
                className="bg-[#04364A] hover:bg-[#032736] text-white"
              >
                {paymentSubmitting ? "Recording…" : "Record Payment"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Billing;
