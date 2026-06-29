import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { mockDB } from "../../services/mockData";
import { fetchServiceTypes } from "../../store/slice/serviceType/serviceTypeSlice";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";

import { DollarSign, PlusCircle, Edit2, Trash2, Save, X } from "lucide-react";
import {
  useAlert
} from "../../helpers/AlertContent";
import Loader from "../../components/Loader/Loader";
import Datatable from "@/office_Managment_Frontent/components/common/Datatable";
import ActionButtons from "@/office_Managment_Frontent/components/common/ActionsButtons";

const FeeMaster = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { list: serviceTypes, loading: serviceTypesLoading } = useSelector(
    (state) => state.serviceTypes
  );
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: "",
    standardRate: "",
    category: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = () => {
    try {
      setLoading(true);
      const data = mockDB.getTable("fees");
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(() => {
    return (serviceTypes || []).map((st) => ({
      value: st.serviceTypeName,
      label: st.serviceTypeName,
    }));
  }, [serviceTypes]);

  const defaultCategory = categoryOptions[0]?.value || "";

  const handleEdit = (fee) => {
    setEditingId(fee.id);
    setFormData({
      serviceName: fee.serviceName,
      standardRate: fee.standardRate,
      category: fee.category,
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ serviceName: "", standardRate: "", category: defaultCategory });
  };

  const handleSave = () => {
    if (!formData.serviceName || !formData.standardRate || !formData.category) {
      showAlert({ type: "error", title: "Error", message: "All fields are required." });
      return;
    }

    try {
      const data = mockDB.getTable("fees");
      const logs = mockDB.getTable("audit_logs");

      if (editingId) {
        const idx = data.findIndex((f) => f.id === editingId);
        if (idx !== -1) {
          const oldFee = data[idx];
          data[idx] = {
            ...oldFee,
            ...formData,
            standardRate: Number(formData.standardRate),
          };

          logs.unshift({
            id: `log-${Date.now()}`,
            user: "Vikram Kumar",
            action: `Updated Fee Catalog: ${formData.serviceName}`,
            details: `Rate changed from ₹${oldFee.standardRate} to ₹${formData.standardRate}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          });
        }
      } else {
        const newFee = {
          id: `fee-${Date.now()}`,
          serviceName: formData.serviceName,
          category: formData.category,
          standardRate: Number(formData.standardRate),
        };
        data.push(newFee);

        logs.unshift({
          id: `log-${Date.now()}`,
          user: "Vikram Kumar",
          action: `Created Fee Catalog: ${formData.serviceName}`,
          details: `Standard Rate: ₹${formData.standardRate}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        });
      }

      mockDB.saveTable("fees", data);
      mockDB.saveTable("audit_logs", logs);

      showAlert({
        type: "success",
        title: "Success",
        message: "Standard fee rate saved successfully.",
      });
      fetchFees();
      handleCancel();
    } catch (err) {
      showAlert({ type: "error", title: "Error", message: "Failed to save rate." });
    }
  };

  const handleDelete = (id, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete "${serviceName}" standard fee catalog?`))
      return;
    try {
      let data = mockDB.getTable("fees");
      data = data.filter((f) => f.id !== id);
      mockDB.saveTable("fees", data);

      const logs = mockDB.getTable("audit_logs");
      logs.unshift({
        id: `log-${Date.now()}`,
        user: "Vikram Kumar",
        action: `Deleted Fee Catalog: ${serviceName}`,
        details: "Removed standard pricing catalog record",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      });
      mockDB.saveTable("audit_logs", logs);

      showAlert({
        type: "success",
        title: "Deleted",
        message: "Standard fee rate deleted successfully.",
      });
      fetchFees();
    } catch (err) {
      showAlert({ type: "error", title: "Error", message: "Failed to delete rate." });
    }
  };

  const openAddForm = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      serviceName: "",
      standardRate: "",
      category: defaultCategory,
    });
  };

  const columns = [
    {
      id: "category",
      label: "Service Category",
      minWidth: "150px",
    },
    {
      id: "serviceName",
      label: "Service Name",
      minWidth: "250px",
    },
    {
      id: "standardRate",
      label: "Standard Rate",
      minWidth: "150px",
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: "100px",
      enabled: true,
    },
  ];

  const renderRow = (data, visibleColumns) => {
    return data.map((fee) => (
      <tr key={fee.id} className="hover:bg-gray-50 border-b border-gray-100  text-sm">
        {visibleColumns.map((col) => {
          if (col.id === "category") {
            return (
              <td key={col.id} className="px-6 py-3 whitespace-nowrap">
                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-sm font-semibold uppercase">
                  {fee.category}
                </span>
              </td>
            );
          }
          if (col.id === "serviceName") {
            return (
              <td key={col.id} className="px-6 py-3 font-semibold text-gray-900 whitespace-nowrap">
                {fee.serviceName}
              </td>
            );
          }
          if (col.id === "standardRate") {
            return (
              <td key={col.id} className="px-6 py-3 font-bold text-gray-800 whitespace-nowrap">
                ₹{fee.standardRate.toLocaleString()}
              </td>
            );
          }
          if (col.id === "actions") {
            return (
              <td key={col.id} className="px-6 py-3 whitespace-nowrap">
                <ActionButtons
                  onEdit={() => handleEdit(fee)}
                  onDelete={() => handleDelete(fee.id, fee.serviceName)}
                  showView={false}
                  showEdit={true}
                  showDelete={true}
                />
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  const tableLoading = loading || serviceTypesLoading;

  return (
    <div className="space-y-6 mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign size={24} /> Standard Fee Master
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Reference catalog of standard pricing rates for consulting, taxation, and auditing services.
            </p>
          </div>
          {!isAdding && !editingId && categoryOptions.length > 0 && (
            <button
              type="button"
              onClick={openAddForm}
              className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
            >
              <PlusCircle size={16} /> Add Standard Fee
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
      </div>

      {!serviceTypesLoading && categoryOptions.length === 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          No service types found. An admin must add service types in Service Type Master before creating fee entries.
        </p>
      )}

      {(isAdding || editingId) && (
        <Card className="border border-gray-200">
          <CardBody className="p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {editingId ? "Edit Fee Entry" : "Add Standard Fee Entry"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Service Name"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="e.g. Annual ITR-6 filing"
              />
              <TextInput
                label="Standard Rate (₹)"
                type="number"
                value={formData.standardRate}
                onChange={(e) => setFormData({ ...formData, standardRate: e.target.value })}
                placeholder="e.g. 15000"
              />
              <SelectInput
                label="Service Category"
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={categoryOptions}
                disabled={serviceTypesLoading || !categoryOptions.length}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel} leftIcon={X}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} leftIcon={Save}>
                Save Catalog Rate
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="p-0">
          {tableLoading ? (
            <div className="relative min-h-[200px]">
              <Loader />
            </div>
          ) : fees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No services catalogued yet.
            </div>
          ) : (
            <Datatable
              columns={columns}
              data={fees}
              renderRow={renderRow}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRecords={fees.length}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              sortable={true}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default FeeMaster;