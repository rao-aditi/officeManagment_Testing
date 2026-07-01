import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "../../store/slice/client/clientSlice";
import Card, { CardBody } from "../../components/ui/Card";
import { Building2, Eye } from "lucide-react";
import ActionButtons from "../../components/common/ActionsButtons";
import SearchInput from "../../components/common/SearchInput";
import SelectInput from "../../components/ui/SelectInput";
import Datatable from "../../components/common/Datatable";
import { Phone, Mail, FileText, CreditCard } from "lucide-react";
import TaskForm from "../TaskManagement/TaskForm";
import { getEnums } from "../../store/slice/auth/authSlice";
import { fetchServiceTypes } from "../../store/slice/serviceType/serviceTypeSlice";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";

const ClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clients, pagination, loading } = useSelector((state) => state.clients);
  const { enums } = useSelector((state) => state.auth);
  const { list: serviceTypes} = useSelector(
    (state) => state.serviceTypes
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [clientForTask, setClientForTask] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, serviceFilter, rowsPerPage]);

  const loadClients = useCallback(() => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
    };
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    dispatch(fetchClients(params));
  }, [dispatch, currentPage, rowsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleAssignTask = (client) => {
    setClientForTask(client);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setClientForTask(null);
  };

  const getDisplayName = (client) => {
    if (client.businessName) return client.businessName;
    if (client.companyName) return client.companyName;
    if (client.name) return client.name;
    if (client.firstName) {
      return `${client.firstName} ${client.lastName || ''}`.trim();
    }
    return "-";
  };

  // Get contact info
  const getContactInfo = (client) => {
    return client.mobileLinkedWithUIN || client.phone || client.mobile || "-";
  };

  // Get PAN/GST info
  const getTaxInfo = (client) => {
    return {
      pan: client.pan || "-",
      gst: client.gstNo || "-"
    };
  };

  const getServiceType = (client) => {
    return (
      client.serviceTypeName ||
      client.serviceType ||
      "—"
    );
  };

  useEffect(() => {
    dispatch(getEnums({ clientStatus: true }));
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  const serviceTypeOptions = useMemo(() => {
    return [
      { label: "All Service Types", value: "ALL" },
      ...(serviceTypes || []).map((service) => ({
        value: service?.serviceName,
        label: service?.serviceName,
      })),
    ];
  }, [serviceTypes]);

  const statusOptions = useMemo(() => {
    return [
      { label: "All Status", value: "ALL" },
      ...(enums?.clientStatus || []).map((status) => ({
        value: status,
        label: status,
      })),
    ];
  }, [enums?.clientStatus]);

  const columns = [
    { id: "clientInfo", label: "Client Name / Company", minWidth: "220px", enabled: true },
    { id: "clientName", label: "Client Name", minWidth: "180px", enabled: true },
    { id: "contact", label: "Contact", minWidth: "180px", enabled: true },
    { id: "taxInfo", label: "PAN / GSTIN", minWidth: "170px", enabled: true },
    { id: "serviceType", label: "Service Type", minWidth: "120px", enabled: true },
    { id: "status", label: "Status", minWidth: "100px", enabled: true },
    { id: "actionButton", label: "Actions", minWidth: "80px", enabled: true },
  ];

  // Filter clients based on service filter
  const filteredClients = useMemo(() => {
    let filtered = clients;
    if (serviceFilter !== "ALL") {
      filtered = filtered.filter(
        (client) => getServiceType(client) === serviceFilter
      );
    }
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (client) => client.status === statusFilter
      );
    }

    return filtered;
  }, [clients, serviceFilter, statusFilter]);

  const renderRow = (data, visibleColumns) =>
    data.map((client) => {
      const taxInfo = getTaxInfo(client);
      const serviceType = getServiceType(client);

      return (
        <tr key={client.id} className="hover:bg-gray-100 transition-colors">
          {visibleColumns.map((col) => {
            let content;
            switch (col.id) {
              case "clientInfo":
                content = (
                  <div>
                    <div className="font-semibold text-gray-900">
                      {getDisplayName(client)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.entityType === "INDIVIDUAL"
                        ? `Individual / ${client.clientCode || "-"}`
                        : `Company / ${client.clientCode || "-"}`}
                    </div>
                    {client.group && (
                      <div className="text-sm text-gray-400 mt-1">
                        Group: {client.group}
                      </div>
                    )}
                  </div>
                );
                break;
              case "contact":
                content = (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone size={14} className="text-cyanDark" />
                      <span className="text-sm font-medium">
                        {getContactInfo(client)}
                      </span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="text-cyanDark" />
                        <span className="text-sm truncate max-w-[150px]" title={client.email}>
                          {client.email}
                        </span>
                      </div>
                    )}
                    {client.contactPerson && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>Contact Person: {client.contactPerson}</span>
                      </div>
                    )}
                  </div>
                );
                break;
              case "clientName":
                content = (
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-800">
                      {`${client.firstName || ""} ${client.middleName || ""} ${client.lastName || ""}`.trim() || "-"}
                    </div>
                    {client.qualification && (
                      <div className="text-sm text-gray-500">
                        Qualification: {client.qualification}
                      </div>
                    )}
                    {client.occupation && (
                      <div className="text-sm text-gray-500">
                        Occupation: {client.occupation}
                      </div>
                    )}
                  </div>
                );
                break;
              case "taxInfo":
                content = (
                  <div className="space-y-1 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-cyanDark" />
                      <span className="text-sm font-medium text-gray-500">PAN:</span>
                      <span className="text-gray-900 text-sm">{taxInfo.pan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-cyanDark" />
                      <span className="text-sm font-medium text-gray-500">GST:</span>
                      <span className="text-gray-600 text-sm">{taxInfo.gst}</span>
                    </div>
                  </div>
                );
                break;
              case "serviceType":
                content = (
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-sm font-semibold inline-block">
                    {serviceType}
                  </span>
                );
                break;
              case "status":
                content = (
                  <span
                    className={`px-2.5 py-1 border rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${client.status === "ACTIVE"
                      ? "bg-green-100 border-green-700 text-green-700"
                      : "bg-red-100 border-red-700 text-red-700"
                      }`}
                  >
                    {client.status}
                  </span>
                );
                break;
              case "actionButton":
                content = (
                  <ActionButtons
                    onView={() => navigate(`/clients/${client.id}`)}
                    showView={true}
                    showEdit={false}
                    showDelete={false}
                  />
                );
                break;
              default:
                content = client[col.id];
            }
            return (
              <td
                key={col.id}
                className="px-4 py-2 text-sm border-b border-gray-200 align-top"
                style={{ textAlign: col.align || "left" }}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );
    });

  return (
    <>
      {loading && <Loader />}

      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 size={24} /> Client Management
            </h1>
            <p className="text-white/70 text-sm mt-1">
              View list of clients, contact details, GSTIN, PAN, and service scopes.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        </div>

        <Card>
          <CardBody className="p-4">
            <div className="flex justify-between flex-wrap gap-4">
              <div className="mt-3">
                <span className="text-base text-gray-500 font-semibold">
                  Total Clients:{" "}
                  <span className="font-semibold text-gray-700">{pagination.total}</span>
                </span>
              </div>
              <div className="flex gap-3">
                <div className="w-[300px]">
                  <SearchInput
                    placeholder="Search by name, company, email or phone..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>
                <SelectInput
                  value={serviceFilter}
                  onChange={setServiceFilter}
                  options={serviceTypeOptions}
                  placeholder="Select service type"
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

        <Card className="mb-10">
          <CardBody className="p-0 relative">
            <div className="mt-2">
              <Datatable
                columns={columns}
                data={filteredClients}
                renderRow={renderRow}
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalRecords={
                  serviceFilter === "ALL" ? pagination.total : filteredClients.length
                }
                setRowsPerPage={setRowsPerPage}
                setCurrentPage={setCurrentPage}
                sortable={false}
              />
            </div>
          </CardBody>
        </Card>

        <TaskForm
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          preselectedClient={clientForTask}
          lockClient={Boolean(clientForTask)}
        />
      </div>
    </>
  );
};

export default ClientList;