import React from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "../Hooks/usePermission";
import Loader from "../components/Loader/Loader";

const ProtectedRoute = ({ element, permission, anyPermissions, allPermissions }) => {
  const { can, canAny, canAll, permissionsLoading } = usePermission();

  if (permissionsLoading) {
    return <Loader fullPage />;
  }

  let allowed = true;
  if (permission) {
    allowed = can(permission);
  } else if (anyPermissions?.length) {
    allowed = canAny(anyPermissions);
  } else if (allPermissions?.length) {
    allowed = canAll(allPermissions);
  }

  return allowed ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
