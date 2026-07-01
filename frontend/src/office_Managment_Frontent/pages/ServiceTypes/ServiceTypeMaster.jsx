import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchServiceTypes,
  fetchServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  clearSelectedServiceType,
} from "../../store/slice/serviceType/serviceTypeSlice";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Layers, PlusCircle, Save, X } from "lucide-react";
import Loader from "../../components/Loader/Loader";
import { usePermission } from "../../Hooks/usePermission";
import DataTable from "../../components/common/Datatable";
import ActionButtons from "../../components/common/ActionsButtons";
import Modal from "../../components/ui/Modal";
import { useAlert } from "@/office_Managment_Frontent/helpers/AlertContent";
import AddEditServiceFeeModel from "./AddEditServiceFeeModel";
import ServiceFeeDetails from "./ServiceFeeDetails";
import DiscountAllowedModel from "./DiscountAllowedModel";
import StatusChangeModel from "../../components/common/StatusChangeModel";
import { getEnums } from "../../store/slice/auth/authSlice";

const ServiceTypeMaster = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { can } = usePermission();
  const canCreate = can("create_service_type");
  const canUpdate = can("update_service_type");
  const canDelete = can("delete_service_type");
  const [mode, setMode] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountItem, setDiscountItem] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusItem, setStatusItem] = useState(null);
  const { list, selectedItem, loading, error } = useSelector((state) => state.serviceTypes);
  const { enums } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getEnums({ status: true , userStatus: true,  }));
  }, [dispatch]);

  const statusOptions = useMemo(() => {
    return [
      { label: "All Status", value: "ALL" },
      ...(enums?.status || []).map((status) => ({
        value: status,
        label: status,
      })),
    ];
  }, [enums?.clientStatus]);

  useEffect(() => {
    if (error) {
      showAlert({ type: "error", title: "Error", message: error });
    }
  }, [error, showAlert]);

  const validationSchema = Yup.object({
    serviceTypeName: Yup.string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .required("Service name is required"),
    baseAmount: Yup.number()
      .typeError("Base amount must be a number")
      .min(0, "Base amount cannot be negative")
      .required("Base amount is required"),
    taxRate: Yup.number()
      .typeError("Tax rate must be a number")
      .min(0, "Tax rate cannot be negative")
      .required("Tax rate is required"),
    discountAllowed: Yup.boolean().required("Discount allowed is required"),
    status: Yup.string()
      .oneOf(["ACTIVE", "INACTIVE"], "Invalid status")
      .required("Status is required"),
    couponCode: Yup.string().when("discountAllowed", {
      is: true,
      then: (schema) =>
        schema.trim().required("Coupon code is required when discount is allowed"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      serviceTypeName: "",
      baseAmount: "",
      taxRate: "",
      discountAllowed: false,
      couponCode: "",
      status: "ACTIVE",
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        serviceTypeName: values.serviceTypeName.trim(),
        baseAmount: Number(values.baseAmount),
        taxRate: Number(values.taxRate),
        discountAllowed: values.discountAllowed,
        status: values.status,
        ...(values.discountAllowed
          ? { couponCode: values.couponCode.trim() }
          : {}),
      };

      try {
        if (mode === "edit" && selectedItem?.id) {
          await dispatch(
            updateServiceType({ id: selectedItem.id, data: payload })
          ).unwrap();
          showAlert({
            type: "success",
            title: "Updated",
            message: "Service type updated successfully.",
          });
        } else {
          await dispatch(createServiceType(payload)).unwrap();
          showAlert({
            type: "success",
            title: "Created",
            message: "Service type created successfully.",
          });
        }
        handleCancelForm();
        dispatch(fetchServiceTypes());
      } catch (err) {
        showAlert({
          type: "error",
          title: "Error",
          message: err || "Failed to save service type.",
        });
      }
    },
  });

  const handleCancelForm = () => {
    setMode(null);
    formik.resetForm();
    dispatch(clearSelectedServiceType());
  };

  const handleAdd = () => {
    setMode("create");
    formik.resetForm({
      values: {
        serviceTypeName: "",
        baseAmount: "",
        taxRate: "",
        discountAllowed: false,
        couponCode: "",
        status: "ACTIVE",
      },
    });
    dispatch(clearSelectedServiceType());
  };

  const handleDiscountClick = (item) => {
    setDiscountItem(item);
    setDiscountModalOpen(true);
  };

  const handleStatusClick = (item) => {
    setStatusItem(item);
    setStatusModalOpen(true);
  };

  const handleEdit = async (item) => {
    setMode("edit");
    formik.setValues({
      serviceTypeName: item.serviceName || "",
      baseAmount: String(item.baseAmount ?? ""),
      taxRate: String(item.taxRate ?? ""),
      discountAllowed: Boolean(item.discountAllowed),
      couponCode: item.couponCode || "",
      status: item.status || "ACTIVE",
    });
    dispatch(clearSelectedServiceType());
    await dispatch(fetchServiceTypeById(item.id));
  };

  const handleView = async (item) => {
    setViewOpen(true);
    await dispatch(fetchServiceTypeById(item.id));
  };

  const closeView = () => {
    setViewOpen(false);
    dispatch(clearSelectedServiceType());
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteServiceType(deleteTarget.id)).unwrap();
      showAlert({
        type: "success",
        title: "Deleted",
        message: `"${deleteTarget.serviceName}" was deleted.`,
      });
      setDeleteTarget(null);
      if (mode === "edit" && selectedItem?.id === deleteTarget.id) {
        handleCancelForm();
      }
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Failed to delete service type.",
      });
    }
  };

  const displayItem = selectedItem || null;

  const columns = [
    { id: "serviceName", label: "Service Name", minWidth: "180px" },
    { id: "baseAmount", label: "Base Amount", minWidth: "120px" },
    { id: "taxRate", label: "Tax Rate (%)", minWidth: "100px" },
    { id: "discountAllowed", label: "Discount", minWidth: "100px" },
    { id: "status", label: "Status", minWidth: "100px" },
    { id: "actionButton", label: "Actions", minWidth: "150px" },
  ];

  const renderRow = (data, visibleColumns) => {
    return data.map((item) => (
      <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
        {visibleColumns.map((col) => {
          if (col.id === "serviceName") {
            return (
              <td key={col.id} className="px-6 py-4 text-sm font-semibold text-gray-900">
                {item.serviceName}
              </td>
            );
          }
          if (col.id === "baseAmount") {
            return (
              <td key={col.id} className="px-6 py-4 font-bold text-gray-800">
                ₹{Number(item.baseAmount).toLocaleString("en-IN")}
              </td>
            );
          }
          if (col.id === "taxRate") {
            return (
              <td key={col.id} className="px-6 py-4 text-sm text-gray-700">
                {item.taxRate}%
              </td>
            );
          }
          if (col.id === "discountAllowed") {
            return (
              <td key={col.id} className="px-6 py-4 text-sm">
                <span
                  onClick={() => handleDiscountClick(item)}
                  className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                    item.discountAllowed
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {item.discountAllowed ? "Yes" : "No"}
                </span>
              </td>
            );
          }
          if (col.id === "status") {
            return (
              <td key={col.id} className="px-6 py-4 text-sm">
                <span
                  onClick={() => handleStatusClick(item)}
                  className={`px-2 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 ${
                    item.status === "ACTIVE"
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            );
          }
          if (col.id === "actionButton") {
            return (
              <td key={col.id} className="px-6 py-2">
                <ActionButtons
                  onView={() => handleView(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => setDeleteTarget(item)}
                  showEdit={canUpdate}
                  showDelete={canDelete}
                  showView={true}
                />
              </td>
            );
          }
          return null;
        })}
      </tr>
    ));
  };

  const paginatedData = list.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <>
      {loading && <Loader />}

      <div className="space-y-6 mx-auto">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Layers size={24} /> Service Wise Fee master
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Manage service categories, charges, tax rates, and discount coupons.
              </p>
            </div>
            {canCreate && !mode && (
              <button
                type="button"
                onClick={handleAdd}
                className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
              >
                <PlusCircle size={16} /> Add Service Type
              </button>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-0">
            <DataTable
              columns={columns}
              data={paginatedData}
              renderRow={renderRow}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRecords={list.length}
              setRowsPerPage={setRowsPerPage}
              setCurrentPage={setCurrentPage}
              sortable={false}
            />
          </CardBody>
        </Card>

        {/* Delete Modal */}
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Service Type"
          size="sm"
        >
          {deleteTarget && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete &quot;{deleteTarget.serviceName}&quot;?
              </p>
              <div className="flex justify-end gap-2 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger-outline"
                  size="sm"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </>
          )}
        </Modal>

        {/* Add/Edit Modal */}
        <AddEditServiceFeeModel
          isOpen={mode === "create" || mode === "edit"}
          onClose={handleCancelForm}
          mode={mode}
          formik={formik}
          loading={loading}
          STATUS_OPTIONS={statusOptions}
        />

        <ServiceFeeDetails
          isOpen={viewOpen}
          onClose={closeView}
          displayItem={displayItem}
        />

        <DiscountAllowedModel
          isOpen={discountModalOpen}
          onClose={() => setDiscountModalOpen(false)}
          discountItem={discountItem}
          setDiscountItem={setDiscountItem}
          loading={loading}
          dispatch={dispatch}
          showAlert={showAlert}
          fetchServiceTypes={fetchServiceTypes}
          updateServiceType={updateServiceType}
        />

        <StatusChangeModel
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          statusItem={statusItem}
          setStatusItem={setStatusItem}
          loading={loading}
          dispatch={dispatch}
          showAlert={showAlert}
          fetchServiceTypes={fetchServiceTypes}
          updateServiceType={updateServiceType}
        />
      </div>
    </>
  );
};

export default ServiceTypeMaster;