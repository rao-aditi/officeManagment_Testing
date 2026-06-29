import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer, Receipt } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

import { useDispatch, useSelector } from "react-redux";
import { getEnums } from "../../store/slice/auth/authSlice";
import { invoiceApi } from "../../api/invoiceApi";
import Loader from "../../components/Loader/Loader";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../helpers/commonFunctions";

const InvoiceDetails = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enums } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getEnums({ invoiceStatus: true }));
        fetchInvoice();
    }, [dispatch]);

    const fetchInvoice = async () => {
        try {
            const res = await invoiceApi.getInvoiceById(id);
            setInvoice(res.data.data.invoice);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            if (!invoiceRef.current) return;

            const dataUrl = await toPng(invoiceRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const img = new Image();

            img.onload = () => {
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight =
                    (img.height * pdfWidth) / img.width;

                pdf.addImage(
                    dataUrl,
                    "PNG",
                    0,
                    0,
                    pdfWidth,
                    pdfHeight
                );

                const blob = pdf.output("blob");

                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.download = `${invoice.invoiceNo}.pdf`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            };

            img.src = dataUrl;
        } catch (error) {
            console.error("PDF Download Error:", error);
        }
    };

    const handlePrint = () => {
        const printContents = invoiceRef.current.innerHTML;
        const existing = document.getElementById("print-iframe");
        if (existing) existing.remove();

        const iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:-1;visibility:hidden;";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        doc.open();
        doc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>${invoice.invoiceNo}</title>
                <script src="https://cdn.tailwindcss.com"><\/script>
                <style>
                    body {
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>${printContents}</body>
        </html>
    `);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.print();
                setTimeout(() => iframe.remove(), 100);
            }, 500);
        };
        setTimeout(() => {
            if (document.getElementById("print-iframe")) {
                iframe.contentWindow.print();
                setTimeout(() => iframe.remove(), 1000);
            }
        }, 1500);
    };

    if (loading) return <Loader />;

    if (!invoice) {
        return (
            <div className="p-8 text-center">
                Invoice not found
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between mb-5">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <Printer size={16} />
                        Save/Print
                    </Button>

                    <Button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <Download size={16} />
                        Generate PDF
                    </Button>
                </div>
            </div>

            <div
                ref={invoiceRef}
                className="bg-white rounded-sm shadow-lg border border-gray-300 p-8"
            >
                <div className="flex justify-between border-b border-gray-300 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-[#04364A]">
                            TAX EASY
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            GSTIN : XXXXXXXXXXXX
                        </p>
                        <p className="text-sm text-gray-500">
                            Email : test@taxeasy.com
                        </p>
                        <p className="text-sm text-gray-500">
                            Phone : +91 9999999999
                        </p>
                    </div>

                    <div className="text-right">
                        <h2 className="text-5xl font-bold text-gray-200">
                            INVOICE
                        </h2>
                        <p className="mt-4">
                            <span className="font-semibold">
                                Invoice No :
                            </span>{" "}
                            {invoice.invoiceNo}
                        </p>

                        <p>
                            <span className="font-semibold">
                                Quotation :
                            </span>{" "}
                            {invoice.quotationNo}
                        </p>

                        <p>
                            <span className="font-semibold">
                                Date :
                            </span>{" "}
                            {new Date(
                                invoice.issuedAt
                            ).toLocaleDateString("en-IN")}
                        </p>

                        <div className="mt-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${invoice.status === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : invoice.status === "PARTIALLY_PAID" || invoice.status === "PARTIAL"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : invoice.status === "OVERDUE"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-blue-100 text-blue-700"
                                    }`}
                            >
                                {(enums?.invoiceStatus || []).includes(invoice.status) ? invoice.status : invoice.status}
                            </span>
                        </div>

                    </div>

                </div>

                <div className="mt-5">
                    <h3 className="text-lg font-bold text-[#04364A] mb-3">
                        Bill To
                    </h3>
                    <div className="bg-gray-50 rounded-lg py-2 px-4">
                        <h3 className="font-semibold text-lg text-[#04364A]">
                            {invoice.client?.displayName}
                        </h3>
                        <div className="grid grid-cols-2 gap-y-2 mt-3 text-sm">
                            <p>
                                <span className="font-medium">Client Code:</span>{" "}
                                {invoice.client?.code}
                            </p>

                            <p>
                                <span className="font-medium">PAN:</span>{" "}
                                {invoice.client?.pan || "-"}
                            </p>

                            <p>
                                <span className="font-medium">GST No:</span>{" "}
                                {invoice.client?.gstNo || "-"}
                            </p>

                            <p>
                                <span className="font-medium">Entity Type:</span>{" "}
                                {invoice.client?.entityType || "-"}
                            </p>

                            <p>
                                <span className="font-medium">Mobile:</span>{" "}
                                {invoice.client?.mobile || "-"}
                            </p>

                            <p>
                                <span className="font-medium">Status:</span>{" "}
                                {invoice.client?.status}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-7">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-[#04364A]">Invoice Details</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="text-left p-2.5 text-sm font-bold text-gray-700 uppercase tracking-wider">#</th>
                                    <th className="text-left p-2.5 text-sm font-bold text-gray-700 uppercase tracking-wider">Description</th>
                                    <th className="text-left p-2.5 text-sm font-bold text-gray-700 uppercase tracking-wider">Service Type</th>
                                    <th className="text-right p-2.5 text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="p-2 text-gray-400">1</td>
                                    <td className="p-2 font-medium text-gray-800">
                                        {invoice?.task?.title || "-"}
                                    </td>
                                    <td className="p-2 text-gray-600">
                                        {invoice.serviceName || "-"}
                                    </td>
                                    <td className="p-2 text-right font-bold text-gray-900">
                                        {formatCurrency(invoice.serviceCharges)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end mt-10">
                    <div className="w-full md:w-[420px]">
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-6 py-2 bg-slate-50 border-b border-gray-300">
                                <h3 className="text-base font-semibold text-[#04364A]">
                                    Payment Summary
                                </h3>
                            </div>
                            <div className="px-6 py-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Service Charges
                                    </span>

                                    <span className="font-semibold text-slate-800">
                                        {formatCurrency(invoice.serviceCharges)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Discount
                                    </span>

                                    <span className="font-semibold text-green-600">
                                        - {formatCurrency(invoice.discountAmount)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Tax ({invoice.taxRate}%)
                                    </span>

                                    <span className="font-semibold text-slate-800">
                                        {formatCurrency(
                                            ((invoice.serviceCharges -
                                                invoice.discountAmount) *
                                                invoice.taxRate) /
                                            100
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-gray-300 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-600">
                                            Sub Total
                                        </span>

                                        <span className="font-bold text-slate-900">
                                            {formatCurrency(invoice.total)}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <div className="bg-slate-50 border-t border-gray-300 px-6 py-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Paid Amount
                                    </span>

                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(invoice.totalPaid)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">
                                        Balance Due
                                    </span>

                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(invoice.balance)}
                                    </span>
                                </div>

                            </div>
                            <div className="bg-[#04364A] px-6 py-2 flex justify-between items-center">
                                <span className="text-white text-base font-medium">
                                    Grand Total
                                </span>
                                <span className="text-white text-lg font-semibold">
                                    {formatCurrency(invoice.total)}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-300">
                    <div className="flex justify-end">
                        <div className="text-center">
                            <div className="h-6"></div>
                            <p className="font-semibold">
                                Authorized Signatory
                            </p>
                            <p className="text-sm text-gray-500">
                                TAX EASY
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;