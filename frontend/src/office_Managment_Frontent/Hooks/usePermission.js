import { useSelector } from "react-redux";
import {
  hasPermission,
  hasAllPermissions,
  canAccessModule as canAccessModuleFn,
} from "../helpers/permissions";

export const usePermission = () => {
  const permissions = useSelector((state) => state.auth.permissions) || [];

  const can = (permissionKey) => hasPermission(permissions, permissionKey);

  const canAny = (permissionKeys) => hasPermission(permissions, permissionKeys);

  const canAll = (permissionKeys) => hasAllPermissions(permissions, permissionKeys);

  const canAccessModule = (module) => canAccessModuleFn(permissions, module);

  return {
    permissions,
    can,
    canAny,
    canAll,
    canAccessModule,
  };
};
