import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import { Save, X } from "lucide-react";
import { fetchClients } from "../../store/slice/client/clientSlice";
import { fetchServiceTypes } from "../../store/slice/serviceType/serviceTypeSlice";
import { fetchTasks } from "../../store/slice/task/taskSlice";
import { createQuotation, updateQuotation } from "../../store/slice/quotation/quotationSlice";
import { useAlert } from "../../helpers/AlertContent";

const AddEditQuotationModel = ({
    isOpen,
    onClose,
    mode = "create",
    quotationData = null,
}) => {
    const dispatch = useDispatch();
    const { showAlert } = useAlert();

    const { clients, loading: clientsLoading } = useSelector((state) => state.clients);
    const { list: serviceTypes, loading: serviceTypesLoading } = useSelector((state) => state.serviceTypes);
    const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
    const { loading: saving } = useSelector((state) => state.quotations);

    const [finalAmount, setFinalAmount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchClients({ limit: 100, isActive: true }));
            dispatch(fetchServiceTypes());
            dispatch(fetchTasks());
        }
    }, [isOpen, dispatch]);

    const activeClients = useMemo(() => (clients).filter((c) => c.status === "ACTIVE"), [clients]);

    const activeServiceTypes = useMemo(() => (serviceTypes).filter((s) => s.status === "ACTIVE"), [serviceTypes]);

    const activeTasks = useMemo(() => tasks.filter((t) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(t.status)), [tasks]);

    const validationSchema = Yup.object({
        taskId: Yup.string().required("Task is required"),
        clientId: Yup.number()
            .typeError("Client is required")
            .required("Client is required"),
        serviceTypeId: Yup.number()
            .typeError("Service type is required")
            .required("Service type is required"),
        serviceCharges: Yup.number()
            .typeError("Service charges must be a number")
            .min(0, "Service charges cannot be negative")
            .required("Service charges is required"),
        taxRate: Yup.number()
            .typeError("Tax rate must be a number")
            .min(0, "Tax rate cannot be negative")
            .required("Tax rate is required"),
        discountAmount: Yup.number()
            .typeError("Discount must be a number")
            .min(0, "Discount cannot be negative")
            .default(0),
        quotationDate: Yup.string()
            .required("Quotation date is required"),
    });

    useEffect(() => {
        if (mode === "edit" && quotationData && isOpen) {
            formik.setValues({
                taskId: quotationData.taskId || "",
                clientId: quotationData.clients?.[0]?.id || "",
                serviceTypeId: quotationData.serviceTypeId || "",
                serviceCharges: quotationData.serviceCharges || "",
                taxRate: quotationData.taxRate || "",
                discountAmount: quotationData.discountAmount || 0,
                quotationDate:
                    quotationData.quotationDate?.split("T")[0] ||
                    new Date().toISOString().split("T")[0],
            });

            setFinalAmount(
                Number(quotationData.finalAmount || 0)
            );
        }
    }, [quotationData, mode, isOpen]);

    const formik = useFormik({
        initialValues: {
            taskId: "",
            clientId: "",
            serviceTypeId: "",
            serviceCharges: "",
            taxRate: "",
            discountAmount: "0",
            quotationDate: new Date().toISOString().split('T')[0],
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const payload = {
                    taskId: values.taskId,
                    serviceTypeId: Number(values.serviceTypeId),
                    clientIds: [Number(values.clientId)],
                    serviceCharges: Number(values.serviceCharges),
                    taxRate: Number(values.taxRate),
                    discountAmount: Number(values.discountAmount || 0),
                    finalAmount,
                };

                let response;

                if (mode === "edit") {
                    response = await dispatch(
                        updateQuotation({
                            id: quotationData.id,
                            data: payload,
                        })
                    ).unwrap();
                } else {
                    response = await dispatch(
                        createQuotation({
                            ...payload,
                            quotationDate: values.quotationDate,
                            status: "SENT",
                        })
                    ).unwrap();
                }
                showAlert({
                    type: "success",
                    title: "Success",
                    message: response?.message
                });

                onClose();
            } catch (err) {
                showAlert({
                    type: "error",
                    title: "Error",
                    message:
                        err?.message ||
                        err?.response?.data?.message,
                });
            }
        },
    });

    const selectedServiceType = activeServiceTypes.find(
        (s) => String(s.id) === String(formik.values.serviceTypeId)
    );

    const isDiscountAllowed = selectedServiceType?.discountAllowed === true;


    const calculateFinalAmount = (serviceCharges, taxRate, discountAmount) => {
        const charges = Number(serviceCharges) || 0;
        const tax = Number(taxRate) || 0;
        const discount = Number(discountAmount) || 0;

        const taxAmount = (charges * tax) / 100;
        const total = charges + taxAmount - discount;
        return Math.max(total, 0);
    };

    const handleServiceTypeChange = (serviceTypeId) => {
        formik.setFieldValue("serviceTypeId", serviceTypeId);
        const selected = activeServiceTypes.find(
            (s) => String(s.id) === String(serviceTypeId)
        );
        if (selected) {
            const charges = Number(selected.baseAmount);
            const tax = Number(selected.taxRate);
            formik.setFieldValue("serviceCharges", String(charges));
            formik.setFieldValue("taxRate", String(tax));

            const discount = selected.discountAllowed
                ? Number(formik.values.discountAmount) || 0
                : 0;
            if (!selected.discountAllowed) {
                formik.setFieldValue("discountAmount", "0");
            }

            const calculated = calculateFinalAmount(charges, tax, discount);
            setFinalAmount(calculated);
        }
    };

    const handleTaskChange = (taskId) => {
        formik.setFieldValue("taskId", taskId);
        const selectedTask = activeTasks.find(
            (t) => String(t.id) === String(taskId)
        );
        if (selectedTask) {
            // Auto-fill client if task has client 
            if (selectedTask?.clientId) {
                formik.setFieldValue("clientId", String(selectedTask?.clientId));
            }
            // Auto-fill service type if task has service type 
            if (selectedTask?.serviceTypeId) {
                handleServiceTypeChange(String(selectedTask?.serviceTypeId));
            }
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        formik.handleChange(e);

        // Recalculate final amount 
        if (name === "serviceCharges" || name === "taxRate" || name === "discountAmount") {
            const charges = name === "serviceCharges" ? Number(value) : Number(formik.values.serviceCharges) || 0;
            const tax = name === "taxRate" ? Number(value) : Number(formik.values.taxRate) || 0;
            const discount = name === "discountAmount" ? Number(value) : Number(formik.values.discountAmount) || 0;

            const calculated = calculateFinalAmount(charges, tax, discount);
            setFinalAmount(calculated);
        }
    };

    const loading = clientsLoading || serviceTypesLoading || tasksLoading || saving;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Quotation" : "Create New Quotation"}
            size="lg"
        >
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className=" grid grid-cols-2 gap-3">
                    <TextInput
                        label="Quotation Date"
                        name="quotationDate"
                        type="date"
                        value={formik.values.quotationDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.quotationDate}
                        touched={formik.touched.quotationDate}
                        required
                    />

                    <SelectInput
                        label="Task"
                        name="taskId"
                        value={formik.values.taskId}
                        options={activeTasks.map((t) => ({
                            value: t.id,
                            label: t.taskName || t.title || t.name || `Task #${t.id}`,
                        }))}
                        placeholder="Select task"
                        onChange={handleTaskChange}
                        error={formik.errors.taskId}
                        touched={formik.touched.taskId}
                        required
                        disabled={loading}
                    />

                    <SelectInput
                        label="Client"
                        name="clientId"
                        value={formik.values.clientId}
                        options={activeClients.map((c) => ({
                            value: c.id,
                            label: c.businessName || c.name || c.displayName || "Unnamed Client",
                        }))}
                        placeholder="Select client"
                        onChange={(val) => formik.setFieldValue("clientId", val)}
                        error={formik.errors.clientId}
                        touched={formik.touched.clientId}
                        required
                        disabled={loading}
                    />

                    <SelectInput
                        label="Service Type"
                        name="serviceTypeId"
                        value={formik.values.serviceTypeId}
                        options={activeServiceTypes.map((s) => ({
                            value: s.id,
                            label: `${s.serviceName || s.name} (₹${Number(s.baseAmount).toLocaleString("en-IN")})`,
                        }))}
                        placeholder="Select service type"
                        onChange={handleServiceTypeChange}
                        error={formik.errors.serviceTypeId}
                        touched={formik.touched.serviceTypeId}
                        required
                        disabled={loading}
                    />

                    <TextInput
                        label="Service Charges (₹)"
                        name="serviceCharges"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formik.values.serviceCharges}
                        onChange={handleFieldChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.serviceCharges}
                        touched={formik.touched.serviceCharges}
                        required
                        disabled={loading}
                    />

                    <TextInput
                        label="Tax Rate (%)"
                        name="taxRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formik.values.taxRate}
                        onChange={handleFieldChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.taxRate}
                        touched={formik.touched.taxRate}
                        required
                        disabled={loading}
                    />

                    {selectedServiceType?.discountAllowed && (
                        <TextInput
                            label="Discount Amount (₹)"
                            name="discountAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formik.values.discountAmount}
                            onChange={handleFieldChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.discountAmount}
                            touched={formik.touched.discountAmount}
                            disabled={loading}
                        />
                    )}
                </div>

                {/* Final Amount */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Final Amount</p>
                            <p className="text-xl font-bold text-gray-900">
                                ₹{finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Including Tax & Discount</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-5 pb-3 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        leftIcon={X}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        leftIcon={Save}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Quotation"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEditQuotationModel;