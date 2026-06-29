import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createTask,
  fetchAssignees,
} from "../../store/slice/task/taskSlice";
import { fetchClients } from "../../store/slice/client/clientSlice";
import { fetchServiceTypes } from "../../store/slice/serviceType/serviceTypeSlice";
import { useTaskEnums } from "../../Hooks/useTaskEnums";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import {
  useAlert
} from "../../helpers/AlertContent";
import {
  formatEnumLabel,
  getClientDisplayName,
  toIsoDateTime,
} from "../../helpers/commonFunctions";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ModalPortal } from "../../components/Model/ModalPortal";

const TaskForm = ({
  isOpen = false,
  onClose = () => { },
  preselectedClient = null,
  lockClient = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { assignees, assigneesLoading, loading } = useSelector(
    (state) => state.tasks
  );
  const { clients, loading: clientsLoading } = useSelector((state) => state.clients);
  const { list, loading: serviceTypesLoading } = useSelector((state) => state.serviceTypes);
  const { enums, enumsLoading } = useTaskEnums();
  const [checklistDraft, setChecklistDraft] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAssignees());
    dispatch(fetchClients({ limit: 100, isActive: "true" }));
    dispatch(fetchServiceTypes());
  }, [dispatch, isOpen]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string()
          .trim()
          .min(2, "Title must be at least 2 characters")
          .max(300, "Title must not exceed 300 characters")
          .required("Title is required"),
        client_Id: Yup.string().required("Client is required"),
        serviceTypeId: Yup.number().required("Service Type is required"),
        assignedToId: Yup.string().required("Assignee is required"),
        dueDate: Yup.string().required("DueDate is required"),
        remarks: Yup.string().max(1000, "Remarks must not exceed 1000 characters"),
      }),
    []
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: "",
      client_Id: preselectedClient?.id != null ? String(preselectedClient.id) : "",
      serviceTypeId: "",
      assignedToId: "",
      priority: "",
      dueDate: "",
      requiresApproval: true,
      remarks: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          client_Id: values.client_Id,
          title: values.title.trim(),
          serviceTypeId: Number(values.serviceTypeId),
          assignedToId: values.assignedToId,
          priority: values.priority,
          requiresApproval: values.requiresApproval,
          remarks: values.remarks?.trim() || undefined,
          ...(values.dueDate ? { dueDate: toIsoDateTime(values.dueDate) } : {}),
          ...(checklistItems.length ? { checklistItems } : {}),
        };

        await dispatch(createTask(payload)).unwrap();
        showAlert({
          type: "success",
          title: "Task Created",
          message: "Task created and assigned successfully.",
        });
        onClose();
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: error || "Failed to create task.",
        });
      }
    },
  });

  const clientOptions = useMemo(
    () =>
      (clients || [])
        .filter((c) => c.status === "ACTIVE" || c.isActive !== false)
        .map((c) => ({
          value: c.id,
          label: `${getClientDisplayName(c)}${c.clientCode ? ` (${c.clientCode})` : ""}`,
        })),
    [clients]
  );

  const assigneeOptions = useMemo(
    () =>
      (assignees || []).map((u) => ({
        value: u.id,
        label: `${u.name}${u.role ? ` — ${formatEnumLabel(u.role)}` : ""}`,
      })),
    [assignees]
  );

  const serviceTypeOptions = useMemo(
    () =>
      (list).map((t) => ({
        value: t.id,
        label: `${t.serviceName}${t.baseAmount ? ` - (${t.baseAmount})` : ""}`,
      })),
    [list]
  );

  const priorityOptions = useMemo(
    () =>
      (enums?.taskPriority || []).map((p) => ({
        value: p,
        label: p,
      })),
    [enums?.taskPriority]
  );

  const addChecklistDraft = () => {
    const trimmed = checklistDraft.trim();
    if (!trimmed || checklistItems.length >= 20) return;
    setChecklistItems((prev) => [...prev, trimmed]);
    setChecklistDraft("");
  };


  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <ModalPortal>
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <h1 className="text-xl font-bold text-gray-900">
                    Assign New Task
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <Card>
                <CardBody className="p-6">
                  <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextInput
                        label="Task Title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.title && formik.errors.title}
                        required
                        placeholder="e.g. GST Filing April 2026"
                      />

                      <SelectInput
                        label="Client"
                        name="client_Id"
                        value={formik.values.client_Id}
                        onChange={(val) => formik.setFieldValue("client_Id", val)}
                        options={clientOptions}
                        placeholder="Select Client"
                        required
                        disabled={clientsLoading || lockClient}
                      />

                      <SelectInput
                        label="Assign To"
                        name="assignedToId"
                        value={formik.values.assignedToId}
                        onChange={(val) => formik.setFieldValue("assignedToId", val)}
                        options={assigneeOptions}
                        placeholder={
                          assigneesLoading ? "Loading team..." : "Select Team Member"
                        }
                        required
                        disabled={assigneesLoading}
                      />

                      <SelectInput
                        label="Service Type"
                        name="serviceTypeId"
                        value={formik.values.serviceTypeId}
                        onChange={(val) => formik.setFieldValue("serviceTypeId", val)}
                        options={serviceTypeOptions}
                        placeholder="Select Service Type"
                        required
                        disabled={serviceTypesLoading}
                      />

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date <span className="text-red-500"> *</span>
                        </label>
                        <input
                          type="datetime-local"
                          name="dueDate"
                          value={formik.values.dueDate}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#04506B]"
                        />
                        {formik.touched.dueDate && formik.errors.dueDate && (
                          <p className="text-red-500 text-xs mt-1">{formik.errors.dueDate}</p>
                        )}
                      </div>

                      <SelectInput
                        label="Priority"
                        name="priority"
                        value={formik.values.priority}
                        onChange={(val) => formik.setFieldValue("priority", val)}
                        options={priorityOptions}
                        disabled={enumsLoading}
                      />
                    </div>

                    <div className="mb-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks / Instructions
                      </label>
                      <textarea
                        name="remarks"
                        value={formik.values.remarks}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04506B]"
                        placeholder="Optional notes for the assignee..."
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={formik.values.requiresApproval}
                        onChange={(e) =>
                          formik.setFieldValue("requiresApproval", e.target.checked)
                        }
                        className="rounded accent-[#04506B]"
                      />
                      Requires manager approval before completion
                    </label>

                    <div className="border-t border-gray-200 pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Checklist Items (optional, max 20)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={checklistDraft}
                          onChange={(e) => setChecklistDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addChecklistDraft();
                            }
                          }}
                          maxLength={200}
                          placeholder="Add checklist item..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <div className=" text-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addChecklistDraft}
                            disabled={checklistItems.length >= 20}
                            leftIcon={Plus}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {checklistItems.map((item, index) => (
                          <li
                            key={`${item}-${index}`}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setChecklistItems((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end gap-3 py-3 border-t border-gray-100">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={loading}>
                        Assign Task
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default TaskForm;
