import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import TaskForm from "./TaskForm";

const AssignTask = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdParam = searchParams.get("clientId");
  const { clients } = useSelector((state) => state.clients);

  const preselectedClient = useMemo(() => {
    if (!clientIdParam) return null;
    const fromStore = (clients || []).find(
      (c) => String(c.id) === String(clientIdParam)
    );
    if (fromStore) return fromStore;
    const parsed = parseInt(clientIdParam, 10);
    if (!Number.isNaN(parsed)) return { id: parsed };
    return null;
  }, [clientIdParam, clients]);

  return (
    <TaskForm
      isOpen
      preselectedClient={preselectedClient}
      lockClient={Boolean(clientIdParam)}
      onClose={() => navigate("/tasks")}
    />
  );
};

export default AssignTask;
