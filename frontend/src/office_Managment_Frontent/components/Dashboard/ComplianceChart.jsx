import React from "react";

const ComplianceChart = ({ data }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-300">
        <h3 className="font-semibold text-gray-800">Compliance Completion</h3>
      </div>
      <div className="p-5 space-y-5">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.category}</span>
              <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceChart;