import React from "react";

const RecentInvoices = ({ invoices }) => {
  const getStatusStyles = (status) => {
    if (status === "Paid") return "bg-green-100 text-green-700";
    if (status === "Pending") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-2 border-b border-gray-300 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">Recent Invoices</h3>
        <button className="text-cyanDark text-sm font-semibold">View All</button>
      </div>
      <div className="divide-y divide-gray-200">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
            <div>
              <h4 className="font-semibold text-[14px] text-gray-800">{invoice.client}</h4>
              <p className="text-sm text-gray-500">{invoice.id}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{invoice.amount}</p>
              <span className={`text-sm px-3 py-1 rounded-full ${getStatusStyles(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInvoices;