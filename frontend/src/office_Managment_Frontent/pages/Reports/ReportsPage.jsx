import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReportFilters from './components/ReportFilters';
import ReportTable from './components/ReportTable';
import { exportToExcel, exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { fetchReportData } from '../../store/slice/reports/reportsSlice';

const REPORT_TABS = [
  { id: 'tasks', label: 'Tasks Report' },
  { id: 'overdue', label: 'Overdue Report' },
  { id: 'clients', label: 'Client Report' },
  { id: 'fees', label: 'Fee Report' },
  { id: 'invoices', label: 'Invoice Report' },
  { id: 'payments', label: 'Payment Report' },
  { id: 'staff-performance', label: 'Staff Performance' },
];

const COLUMNS = {
  tasks: [
    { header: 'Title', dataKey: 'title' },
    { header: 'Client', dataKey: 'client', render: (row) => row.client?.name || row.client?.businessName || '-' },
    { header: 'Task Type', dataKey: 'taskType' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Priority', dataKey: 'priority' },
    { header: 'Assigned To', dataKey: 'assignedTo', render: (row) => row.assignedTo?.name || '-' },
    { header: 'Created At', dataKey: 'createdAt', format: 'date' },
    { header: 'Due Date', dataKey: 'dueDate', format: 'date' },
  ],
  overdue: [
    { header: 'Title', dataKey: 'title' },
    { header: 'Client', dataKey: 'client', render: (row) => row.client?.name || row.client?.businessName || '-' },
    { header: 'Task Type', dataKey: 'taskType' },
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
    { header: 'Mode', dataKey: 'mode' },
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

  useEffect(() => {
    handleFetchReportData();
  }, [activeTab]); // Fetch on tab change without filters

  const handleFetchReportData = () => {
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
    const filename = `${activeTab}_report_${new Date().getTime()}`;
    const columns = COLUMNS[activeTab];
    
    // Flatten data for export to avoid [object Object] in Excel/CSV
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
      exportToPDF(flattenedData, columns, filename, `${REPORT_TABS.find(t => t.id === activeTab).label}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports and Exports</h1>
          <p className="text-sm text-gray-500 mt-1">View and export various office management reports</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            CSV
          </button>
          <button onClick={() => handleExport('excel')} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors shadow-sm">
            Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors shadow-sm">
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden flex">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setFilters({}); // Reset filters on tab switch
              navigate(`/reports/${tab.id}`);
            }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ReportFilters 
        reportType={activeTab}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleFetchReportData}
      />

      <ReportTable 
        columns={COLUMNS[activeTab]} 
        data={data} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ReportsPage;
