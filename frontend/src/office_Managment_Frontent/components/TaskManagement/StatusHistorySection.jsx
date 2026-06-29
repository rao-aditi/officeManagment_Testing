import React from "react";
import Card, { CardBody } from "../ui/Card";
import { History } from "lucide-react";
import { formatDateTime, formatEnumLabel } from "../../helpers/commonFunctions";

const StatusHistorySection = ({ history }) => {
  return (
    <Card>
      <CardBody className="p-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <History size={18} /> Status History
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No status changes recorded yet.
            </p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex justify-between text-gray-500">
                  <span className="font-semibold text-gray-800">
                    {entry.changedBy?.name || "System"}
                  </span>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
                <p className="text-gray-700 mt-1">
                  {entry.fromStatus
                    ? `${formatEnumLabel(entry.fromStatus)} → `
                    : ""}
                  <strong>{formatEnumLabel(entry.toStatus)}</strong>
                </p>
                {entry.remarks && (
                  <p className="text-gray-500 mt-1">{entry.remarks}</p>
                )}
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default StatusHistorySection;