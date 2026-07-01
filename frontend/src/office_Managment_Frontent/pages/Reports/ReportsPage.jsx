import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReportFilters from '../../components/Reports/ReportFilters';
import ReportTable from '../../components/Reports/ReportTable';
import { exportToExcel, exportToCSV, exportToPDF } from '../../helpers/exportUtils';
import { fetchReportData } from '../../store/slice/reports/reportsSlice';
import { Filter } from "lucide-react";
import Button from '../../components/ui/Button';
import excelIcon from "../../assets/images/excel.png";
import pdfIcon from "../../assets/images/pdf.png";
import csvIcon from "../../assets/images/csv.png";
import { usePermission } from '../../Hooks/usePermission';

const COLUMNS = {
  tasks: [
    { header: 'Title', dataKey: 'title' },
    { header: 'Client', dataKey: 'client', render: (row) => row.client?.name || row.client?.businessName || '-' },
    { header: 'Service Type', dataKey: 'serviceType' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Priority', dataKey: 'priority' },
    { header: 'Assigned To', dataKey: 'assignedTo', render: (row) => row.assignedTo?.name || '-' },
    { header: 'Created At', dataKey: 'createdAt', format: 'date' },
    { header: 'Due Date', dataKey: 'dueDate', format: 'date' },
  ],
  overdue: [
    { header: 'Title', dataKey: 'title' },
    { header: 'Client', dataKey: 'client', render: (row) => row.client?.name || row.client?.businessName || '-' },
    { header: 'Service Type', dataKey: 'serviceType' },
    { header: 'Due Date', dataKey: 'dueDate', format: 'date' },
    { header: 'Assigned To', dataKey: 'assignedTo', render: (row) => row.assignedTo?.name || '-' },
  ],
  clients: [
    { header: 'Name', dataKey: 'name' },
    { header: 'Business Name', dataKey: 'businessName' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Phone', dataKey: 'phone' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Created At', dataKey: 'createdAt', format: 'date' },
  ],
  fees: [
    { header: 'Service Name', dataKey: 'name' },
    { header: 'Amount', dataKey: 'serviceCharges', format: 'currency' },
    { header: 'Tax Rate (%)', dataKey: 'taxRate' },
    { header: 'Discount Allowed', dataKey: 'discountAllowed', render: (row) => row.discountAllowed ? 'Yes' : 'No' },
    { header: 'Status', dataKey: 'status' },
  ],
  invoices: [
    { header: 'Invoice No', dataKey: 'invoiceNo' },
    { header: 'Client', dataKey: 'client', render: (row) => row.client?.name || '-' },
    { header: 'Task', dataKey: 'task', render: (row) => row.task?.title || '-' },
    { header: 'Total', dataKey: 'total', format: 'currency' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Issued At', dataKey: 'issuedAt', format: 'date' },
  ],
  payments: [
    { header: 'Reference No', dataKey: 'referenceNo' },
    { header: 'Invoice No', dataKey: 'invoice', render: (row) => row.invoice?.invoiceNo || '-' },
    { header: 'Client', dataKey: 'invoice', render: (row) => row.invoice?.client?.name || '-' },
    { header: 'Amount Paid', dataKey: 'amountPaid', format: 'currency' },
    { header: 'Payment Mode', dataKey: 'mode' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Payment Date', dataKey: 'paymentDate', format: 'date' },
  ],
  'staff-performance': [
    { header: 'Name', dataKey: 'name' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Total Tasks', dataKey: 'totalTasks' },
    { header: 'Completed', dataKey: 'completed' },
    { header: 'Overdue', dataKey: 'overdue' },
    { header: 'Rejected', dataKey: 'rejected' },
    { header: 'Avg Completion (Hrs)', dataKey: 'avgCompletionTimeHours' },
  ]
};

const ReportsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = type || 'tasks';
  const { data, loading: isLoading } = useSelector((state) => state.reports);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const { permissionsLoading, canAccessReport, getDefaultReportPath } = usePermission();

  useEffect(() => {
    if (permissionsLoading) return;

    if (!canAccessReport(activeTab)) {
      const fallbackPath = getDefaultReportPath();
      navigate(fallbackPath || '/officeManagment_DashBoard', { replace: true });
    }
  }, [activeTab, permissionsLoading, navigate, canAccessReport, getDefaultReportPath]);

  useEffect(() => {
    if (permissionsLoading || !canAccessReport(activeTab)) return;
    setFilters({});
    dispatch(fetchReportData({ reportType: activeTab, filters: {} }));
  }, [activeTab, permissionsLoading, dispatch, canAccessReport]);

  const handleFetchReportData = () => {
    if (!canAccessReport(activeTab)) return;
    dispatch(fetchReportData({ reportType: activeTab, filters }));
  };

  const handleFilterChange = (name, value) => {
    if (name === 'reset') {
      setFilters({});
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExport = (format) => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const filename = `${activeTab}_report_${new Date().getTime()}`;
    const columns = COLUMNS[activeTab];

    const flattenedData = data.map(row => {
      const newRow = {};
      columns.forEach(col => {
        let val = row[col.dataKey];
        if (col.render) {
          val = col.render(row);
        } else if (col.format === 'date' && val) {
          val = new Date(val).toLocaleDateString();
        }
        newRow[col.header] = val;
      });
      return newRow;
    });

    if (format === 'excel') {
      exportToExcel(flattenedData, filename);
    } else if (format === 'csv') {
      exportToCSV(flattenedData, filename);
    } else if (format === 'pdf') {
      exportToPDF(flattenedData, columns, filename);
    }
  };

  if (permissionsLoading || !canAccessReport(activeTab)) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports and Exports</h1>
          <p className="text-sm text-gray-500 mt-1">View and export various office management reports</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>

          <Button
            variant="outline"
            leftIcon={
              <img
                src={csvIcon}
                alt="Excel"
                className="w-5 h-5"
              />
            }
            onClick={() => handleExport("csv")}
          >
            Export
          </Button>

          <Button
            variant='outline'
            leftIcon={
              <img
                src={excelIcon}
                alt="Excel"
                className="w-5 h-5"
              />
            }
            onClick={() => handleExport("excel")}
          >
            Export
          </Button>

          <Button
            variant='outline'
            leftIcon={
              <img
                src={pdfIcon}
                alt="Excel"
                className="w-5 h-5"
              />
            }
            onClick={() => handleExport("pdf")}
          >
            Export
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out
        ${showFilters
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
          }`}
      >
        <ReportFilters
          reportType={activeTab}
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={() => {
            handleFetchReportData();
            setShowFilters(false);
          }}
          onClose={() => setShowFilters(false)}
        />
      </div>

      <ReportTable
        columns={COLUMNS[activeTab]}
        data={data}
        isLoading={isLoading}
        pageSize={5}
      />
    </div>
  );
};

export default ReportsPage;
