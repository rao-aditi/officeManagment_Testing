import { useCallback } from "react";
import { useSelector } from "react-redux";
import { hasPermission, hasAllPermissions } from "../helpers/permissions";

const REPORT_TYPES = [
  "tasks",
  "overdue",
  "staff-performance",
  "clients",
  "invoices",
  "payments",
  "fees",
];

export const usePermission = () => {
  const permissions = useSelector((state) => state.auth.permissions) || [];
  const permissionsLoading = useSelector(
    (state) => state.auth.permissionsLoading
  );

  const can = useCallback(
    (permissionKey) => hasPermission(permissions, permissionKey),
    [permissions]
  );

  const canAny = useCallback(
    (permissionKeys) => hasPermission(permissions, permissionKeys),
    [permissions]
  );

  const canAll = useCallback(
    (permissionKeys) => hasAllPermissions(permissions, permissionKeys),
    [permissions]
  );

  const canAccessReport = useCallback(
    (reportType) => {
      if (can("view_all_reports")) return true;

      if (reportType === "tasks") {
        return canAny(["view_operational_reports", "view_own_reports"]);
      }

      if (can("view_operational_reports")) {
        return ["overdue", "staff-performance"].includes(reportType);
      }

      return false;
    },
    [can, canAny]
  );

  const getDefaultReportPath = useCallback(() => {
    const firstAccessible = REPORT_TYPES.find((type) => canAccessReport(type));
    return firstAccessible ? `/reports/${firstAccessible}` : null;
  }, [canAccessReport]);

  return {
    permissions,
    permissionsLoading,
    can,
    canAny,
    canAll,
    canAccessReport,
    getDefaultReportPath,
  };
};
