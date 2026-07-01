import React, { useEffect, useMemo } from 'react';
import SelectInput from '../ui/SelectInput';
import { useTaskEnums } from '../../Hooks/useTaskEnums';
import { formatEnumLabel } from '../../helpers/commonFunctions';
import { fetchServiceTypes } from '../../store/slice/serviceType/serviceTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getEnums } from '../../store/slice/auth/authSlice';
import Button from '../ui/Button';
import { X } from 'lucide-react';

const ReportFilters = ({ reportType, filters, onFilterChange, onApplyFilters, onClose, }) => {
  const { enums: taskEnums } = useTaskEnums();
  const { list } = useSelector((state) => state.serviceTypes);
  const { enums } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getEnums({
        invoiceStatus: true,
      })
    );
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: "All Status" },
      ...(taskEnums?.taskStatus || []).map((s) => ({
        value: s,
        label: formatEnumLabel(s),
      })),
    ],
    [enums?.taskStatus]
  );

  const priorityOptions = useMemo(
    () => [
      { value: "ALL", label: "All Priorities" },
      ...(enums?.taskPriority || []).map((p) => ({
        value: p,
        label: (p),
      })),
    ],
    [enums?.taskPriority]
  );

  const serviceTypeOptions = useMemo(
    () =>
      (list).map((t) => ({
        value: t.id,
        label: `${t.serviceName}${t.baseAmount ? ` - (${t.baseAmount})` : ""}`,
      })),
    [list]
  );

  const InvoiceStatusOptions = useMemo(() => {
    return [
      { label: "All Status", value: "ALL" },
      ...(enums?.invoiceStatus || []).map((status) => ({
        value: status,
        label: status,
      })),
    ];
  }, [enums?.invoiceStatus]);

  return (

    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Filter
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {(reportType === "tasks" ||
          reportType === "overdue" ||
          reportType === "invoices" ||
          reportType === "payments" ||
          reportType === "clients") && (
            <>
              <div className="w-[240px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate || ""}
                  onChange={handleChange}
                  className="w-full h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#04506B]"
                />
              </div>

              <div className="w-[240px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate || ""}
                  onChange={handleChange}
                  className="w-full h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#04506B]"
                />
              </div>
            </>
          )}

        {/* Task Filters */}
        {(reportType === "tasks" || reportType === "overdue") && (
          <>
            <div className="w-[240px]">
              <SelectInput
                label="Status"
                name="status"
                value={filters.status || ""}
                onChange={(val) => onFilterChange("status", val)}
                options={statusOptions}
                placeholder="Select Status"
                wrapperClass="w-full"
              />
            </div>

            <div className="w-[240px]">
              <SelectInput
                label="Task Type"
                name="taskType"
                value={filters.taskType || ""}
                onChange={(val) => onFilterChange("taskType", val)}
                options={serviceTypeOptions}
                placeholder="Select Task Type"
                wrapperClass="w-full"
              />
            </div>

            <div className="w-[240px]">
              <SelectInput
                label="Priority"
                name="priority"
                value={filters.priority || ""}
                onChange={(val) => onFilterChange("priority", val)}
                options={priorityOptions}
                placeholder="Select Priority"
                wrapperClass="w-full"
              />
            </div>
          </>
        )}

        {/* Invoice / Payment */}
        {(reportType === "invoices" || reportType === "payments") && (
          <div className="w-[240px]">
            <SelectInput
              label="Status"
              name="status"
              value={filters.status || ""}
              onChange={(val) => onFilterChange("status", val)}
              options={InvoiceStatusOptions}
              placeholder="Select Status"
              wrapperClass="w-full"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="ml-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onFilterChange("reset", null);
              setTimeout(onApplyFilters, 0);
            }}
          >
            Reset
          </Button>

          <Button
            variant="primary"
            onClick={onApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
