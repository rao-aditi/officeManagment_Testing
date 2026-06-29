import React from 'react';

const ReportFilters = ({ reportType, filters, onFilterChange, onApplyFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-end gap-4">
      {/* Common Date Filters */}
      {(reportType === 'tasks' || reportType === 'overdue' || reportType === 'invoices' || reportType === 'payments' || reportType === 'clients') && (
        <>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              name="startDate" 
              value={filters.startDate || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              name="endDate" 
              value={filters.endDate || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </>
      )}

      {/* Task & Overdue Filters */}
      {(reportType === 'tasks' || reportType === 'overdue') && (
        <>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status" 
              value={filters.status || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              {reportType !== 'overdue' && <option value="OVERDUE">Overdue</option>}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Task Type</label>
            <select 
              name="taskType" 
              value={filters.taskType || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="GST">GST</option>
              <option value="ITR">ITR</option>
              <option value="AUDIT">Audit</option>
              <option value="TDS">TDS</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              name="priority" 
              value={filters.priority || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </>
      )}

      {/* Invoice & Payment Filters */}
      {(reportType === 'invoices' || reportType === 'payments') && (
        <>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status" 
              value={filters.status || ''} 
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {reportType === 'invoices' ? (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </>
              ) : (
                <>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </>
              )}
            </select>
          </div>
        </>
      )}

      <div className="ml-auto flex gap-2">
        <button 
          onClick={() => {
            onFilterChange('reset', null);
            setTimeout(onApplyFilters, 0);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
        <button 
          onClick={onApplyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default ReportFilters;
