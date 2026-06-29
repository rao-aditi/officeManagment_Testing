import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createUser,
  updateUser,
  fetchUsers,
  clearSelectedUser,
  setSelectedUser,
  getUserById,
} from "../../store/slice/user/userSlice";
import { rolesApi } from "../../api/rolesApi";
import { clientApi } from "../../api/clientApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import SelectInput from "../../components/ui/SelectInput";
import { ArrowLeft, UserPlus, Save, X, Users, EyeOff, Eye } from "lucide-react";
import Loader from "../../components/Loader/Loader";
import { useAlert } from "@/office_Managment_Frontent/helpers/AlertContent";

const UserForm = ({ isOpen, onClose, editUser: propEditUser }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { selectedUser, loading } = useSelector((state) => state.users);
  const [showPassword, setShowPassword] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [teamLeaderOptions, setTeamLeaderOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [clientOptions, setClientOptions] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const isEdit = Boolean(propEditUser?.id) || Boolean(id);
  const editUser = propEditUser || selectedUser;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await rolesApi.listRoles();
        const roles = res.data?.data?.roles || [];
        setRoleOptions(
          roles
            .filter((r) => r.isActive)
            .map((r) => ({
              value: r.name,
              label: r.name.replace(/_/g, " "),
            }))
        );
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: "Failed to load roles.",
        });
      } finally {
        setRolesLoading(false);
      }
    };
    loadRoles();
  }, [showAlert]);

  useEffect(() => {
    const loadTeamLeaders = async () => {
      try {
        const result = await dispatch(
          fetchUsers({ status: "ACTIVE", limit: 100 })
        ).unwrap();
        const leaders = (result.users || []).filter(
          (u) => u.role === "TEAM_LEADER"
        );
        setTeamLeaderOptions(
          leaders.map((l) => ({ value: l.id, label: l.name }))
        );
      } catch {
        setTeamLeaderOptions([]);
      }
    };
    if (isOpen) {
      loadTeamLeaders();
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setClientsLoading(true);
        const res = await clientApi.getAllClients({ limit: 1000, isActive: true });
        const clients = res.data?.data?.clients || [];
        setClientOptions([
          { label: "Select All", value: "ALL" },
          ...clients.map((c) => ({
            value: c.id,
            label: c.name + (c.code ? ` (${c.code})` : ""),
          })),
        ]);
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: "Failed to load clients.",
        });
      } finally {
        setClientsLoading(false);
      }
    };
    if (isOpen) {
      loadClients();
    }
  }, [isOpen, showAlert]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isEdit || !id || propEditUser) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        await dispatch(getUserById(id)).unwrap();
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: error,
        });
        onClose();
      } finally {
        setInitialLoading(false);
      }
    };

    if (isOpen && isEdit && !propEditUser) {
      fetchUserDetails();
    }

    return () => {
      if (!isOpen) {
        dispatch(clearSelectedUser());
      }
    };
  }, [id, dispatch, showAlert, isEdit, isOpen, propEditUser, onClose]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(2).max(80),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().min(8, "Phone must be at least 8 characters").nullable(),
    password: isEdit
      ? Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain an uppercase letter")
        .matches(/[0-9]/, "Must contain a digit")
        .nullable()
      : Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain an uppercase letter")
        .matches(/[0-9]/, "Must contain a digit"),
    role: Yup.string().required("Role is required"),
    teamLeaderId: Yup.string().when("role", {
      is: "TEAM_MEMBER",
      then: (schema) => schema.required("Team leader is required for team members"),
      otherwise: (schema) => schema.nullable(),
    }),
    clientIds: Yup.array().of(Yup.number()).nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: editUser?.name || "",
      email: editUser?.email || "",
      phone: editUser?.phone || "",
      password: "",
      role: editUser?.role || "",
      teamLeaderId: editUser?.teamLeaderId || "",
      clientIds: editUser?.clientIds || (editUser?.clients ? editUser.clients.map(c => c.id || c.clientId) : []),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          role: values.role,
          clientIds: values.clientIds || [],
        };
        if (values.role === "TEAM_MEMBER") {
          payload.teamLeaderId = values.teamLeaderId;
        }
        if (values.password) {
          payload.password = values.password;
        }

        if (isEdit) {
          await dispatch(updateUser({ id: editUser.id, data: payload })).unwrap();
          showAlert({
            type: "success",
            title: "User Updated",
            message: "User account details updated successfully.",
          });
        } else {
          await dispatch(createUser({ ...payload, password: values.password })).unwrap();
          showAlert({
            type: "success",
            title: "User Created",
            message: "New user account created successfully.",
          });
        }
        dispatch(clearSelectedUser());
        onClose();
      } catch (error) {
        showAlert({
          type: "error",
          title: "Error",
          message: error || "Failed to save user account.",
        });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (initialLoading) {
    return <Loader fullPage />;
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-10 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#04506B]" />
              <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit User Account" : "Create New User"}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <Card>
            <div className="">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
                  <TextInput
                    label="Full Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.name}
                    touched={formik.touched.name}
                    required
                    placeholder="e.g. Rahul Verma"
                  />

                  <TextInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.email}
                    touched={formik.touched.email}
                    required
                    placeholder="e.g. rahul@caoffice.com"
                  />

                  <TextInput
                    label="Phone Number"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.phone}
                    touched={formik.touched.phone}
                    placeholder="e.g. 9876543210"
                  />

                  <TextInput
                    label={
                      isEdit
                        ? "New Password (leave blank to keep current)"
                        : "Password"
                    }
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.password}
                    touched={formik.touched.password}
                    required={!isEdit}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    showToggle={true}
                    onToggle={() => setShowPassword(!showPassword)}
                  />

                  <SelectInput
                    label="Role"
                    name="role"
                    value={formik.values.role}
                    onChange={(val) => {
                      formik.setFieldValue("role", val);
                      if (val !== "TEAM_MEMBER") {
                        formik.setFieldValue("teamLeaderId", "");
                      }
                    }}
                    options={roleOptions}
                    placeholder={rolesLoading ? "Loading roles..." : "Select role"}
                    disabled={rolesLoading}
                    required
                  />

                  {formik.values.role === "TEAM_MEMBER" && (
                    <SelectInput
                      label="Team Leader"
                      name="teamLeaderId"
                      value={formik.values.teamLeaderId}
                      onChange={(val) => formik.setFieldValue("teamLeaderId", val)}
                      options={teamLeaderOptions}
                      placeholder="Select team leader"
                      required
                    />
                  )}

                  <SelectInput
                    label="Clients"
                    name="clientIds"
                    value={formik.values.clientIds}
                    onChange={(val) => formik.setFieldValue("clientIds", val)}
                    options={clientOptions}
                    placeholder={clientsLoading ? "Loading clients..." : "Select clients"}
                    disabled={clientsLoading}
                    isMulti={true}
                    searchable={true}
                    wrapperClass="col-span-1 md:col-span-2"
                  />
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-300">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} leftIcon={isEdit ? Save : UserPlus}>
                    {isEdit ? "Save Changes" : "Create User"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserForm;