import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  activateUser,
  deactivateUser,
  setSelectedUser,
} from "../../store/slice/user/userSlice";
import Card, { CardBody } from "../../components/ui/Card";
import Datatable from "../../components/common/Datatable";
import SearchInput from "../../components/common/SearchInput";
import SelectInput from "../../components/ui/SelectInput";
import ActionButtons from "../../components/common/ActionsButtons";
import { Users, PlusCircle, UserCheck, UserX } from "lucide-react";
import {
  useAlert
} from "../../helpers/AlertContent";
import Button from "../../components/ui/Button";
import { getEnums } from "../../store/slice/auth/authSlice";
import UserForm from "./UserForm";
import StatusConfirmModal from "./StatusConfirmModal";
import CustomTooltip from "@/office_Managment_Frontent/components/ui/Tooltip";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";

const USER_COLUMNS = [
  { id: "userInfo", label: "User", minWidth: "200px", enabled: true },
  { id: "clients", label: "Clients", minWidth: "200px", enabled: true },
  { id: "email", label: "Email", minWidth: "180px", enabled: true },
  { id: "phone", label: "Phone", minWidth: "130px", enabled: true },
  { id: "role", label: "Role", minWidth: "130px", enabled: true },
  { id: "status", label: "Status", minWidth: "110px", enabled: true },
  { id: "actionButton", label: "Actions", minWidth: "180px", enabled: true },
];

const UserList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert
    ();
  const { users, pagination, loading } = useSelector((state) => state.users);
  const { enums, enumsLoading } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionUserId, setActionUserId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, rowsPerPage]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      q: debouncedSearch || undefined,
    };
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    dispatch(fetchUsers(params));
  }, [dispatch, currentPage, rowsPerPage, debouncedSearch, statusFilter]);

  const handleDeactivate = (user) => {
    setSelectedUser(user);
    setStatusAction("deactivate");
    setIsConfirmModalOpen(true);
  };

  const handleActivate = (user) => {
    setSelectedUser(user);
    setStatusAction("activate");
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedUser(null);
    setStatusAction(null);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;

    try {
      setStatusLoading(true);
      setActionUserId(selectedUser.id);

      if (statusAction === "activate") {
        await dispatch(activateUser(selectedUser.id)).unwrap();

        showAlert({
          type: "success",
          title: "Activated",
          message: `${selectedUser.name} has been activated.`,
        });
      } else {
        await dispatch(deactivateUser(selectedUser.id)).unwrap();

        showAlert({
          type: "success",
          title: "Deactivated",
          message: `${selectedUser.name} has been deactivated.`,
        });
      }

      closeConfirmModal();
    } catch (error) {
      showAlert({
        type: "error",
        title: "Error",
        message: error,
      });
    } finally {
      setStatusLoading(false);
      setActionUserId(null);
    }
  };

  const handleEditUser = (user) => {
    setSelectedEditUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedEditUser(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEditUser(null);
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      q: debouncedSearch || undefined,
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    };
    dispatch(fetchUsers(params));
  };

  useEffect(() => {
    dispatch(
      getEnums({
        userStatus: true,
      })
    );
  }, [dispatch]);

  const statusOptions = useMemo(() => {
    return [
      { label: "All Status", value: "ALL" },
      ...(enums?.userStatus || []).map((status) => ({
        value: status,
        label: status,
      })),
    ];
  }, [enums?.userStatus]);

  const truncateClients = (clients) => {
    if (!clients || clients.length === 0) return "—";
    if (clients.length === 1) return clients[0].name;
    return `${clients[0].name} +${clients.length - 1} more`;
  };

  const renderRow = (data, visibleColumns) =>
    data.map((user) => (
      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
        {visibleColumns.map((col) => {
          let content;
          switch (col.id) {
            case "userInfo":
              content = (
                <div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
                </div>
              );
              break;
            case "clients":
              content = (
                <div>
                  {user.clients && user.clients.length > 0 ? (
                    <CustomTooltip
                      content={user.clients}
                      position="bottom"
                      delay={200}
                      variant="dark"
                      size="md"
                    >
                      <div className="flex items-center gap-1 cursor-help">
                        <span className="text-sm text-gray-700">
                          {truncateClients(user.clients)}
                        </span>
                        {user.clients.length > 1 && (
                          <span className="text-xs text-gray-400">
                            ({user.clients.length})
                          </span>
                        )}
                      </div>
                    </CustomTooltip>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              );
              break;
            case "email":
              content = <span className="text-gray-700">{user.email}</span>;
              break;
            case "phone":
              content = <span className="text-gray-700">{user.phone || "—"}</span>;
              break;
            case "role":
              content = (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${user.role === "ADMIN"
                    ? "bg-red-50 text-red-700"
                    : user.role === "TEAM_LEADER"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-cyan-50 text-cyan-700"
                    }`}
                >
                  {user.role}
                </span>
              );
              break;
            case "status":
              content = (
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${user.status === "ACTIVE"
                    ? "bg-green-100 border border-green-700 text-green-700"
                    : "bg-red-100 border border-red-700 text-red-700"
                    }`}
                >
                  {user.status}
                </span>
              );
              break;
            case "actionButton":
              content = (
                <div className="flex items-center gap-2">
                  <ActionButtons
                    onEdit={() => handleEditUser(user)}
                    showView={false}
                    showEdit={true}
                    showDelete={false}
                  />
                  {user.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="danger-outline"
                      onClick={() => handleDeactivate(user)}
                      disabled={actionUserId === user.id}
                      leftIcon={UserX}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="success-outline"
                      onClick={() => handleActivate(user)}
                      disabled={actionUserId === user.id}
                      leftIcon={UserCheck}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              );
              break;
            default:
              content = user[col.id];
          }
          return (
            <td
              key={col.id}
              className="px-4 py-3 text-sm border-b border-gray-200 align-middle"
            >
              {content}
            </td>
          );
        })}
      </tr>
    ));

  return (
    <>
      {loading && (
        <Loader />
      )}

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users size={24} /> User Management
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Add new User members, update roles, and activate/deactivate user accounts.
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
            >
              <PlusCircle size={16} /> Create User
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-4">
            <div className="flex flex-wrap justify-between gap-4 items-center">
              <span className="text-base text-gray-500 font-semibold">
                Total Users:{" "}
                <span className="font-semibold text-gray-700">{pagination.total}</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 max-w-xl">
                <SearchInput
                  placeholder="Search user name, email, or phone..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  width="100%"
                />
                <SelectInput
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  placeholder="Select status"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-0 relative">
            <div className="mt-2">
              <Datatable
                columns={USER_COLUMNS}
                data={users}
                renderRow={renderRow}
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalRecords={pagination.total}
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                sortable={false}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editUser={selectedEditUser}
      />

      {/* <StatusConfirmModal
        isOpen={isConfirmModalOpen}
        user={userToDeactivate}
        onClose={closeConfirmModal}
        onConfirm={confirmDeactivate}
        loading={isDeactivating}
      /> */}

      <StatusConfirmModal
        isOpen={isConfirmModalOpen}
        user={selectedUser}
        action={statusAction}
        onClose={closeConfirmModal}
        onConfirm={confirmStatusChange}
        loading={statusLoading}
      />

    </>
  );
};

export default UserList;