import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  assignPermissionToRole,
  fetchPermissionMatrix,
  removePermissionFromRole,
} from "../../store/slice/permission/permissionSlice";
import { fetchUserPermissions } from "../../store/slice/auth/authSlice";
import {
  useAlert
} from "../../helpers/AlertContent";
import Card, { CardBody } from "../../components/ui/Card";
import { ShieldCheck } from "lucide-react";
import Loader from "../../components/Loader/Loader";

const PermissionMatrix = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert
    ();
  const { matrix, matrixLoading, matrixActionLoading, matrixError } = useSelector(
    (state) => state.permission
  );

  const loadMatrix = useCallback(() => {
    dispatch(fetchPermissionMatrix());
  }, [dispatch]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  useEffect(() => {
    if (matrixError) {
      showAlert({ type: "error", title: "Error", message: matrixError });
    }
  }, [matrixError, showAlert]);

  const roles = matrix?.roles || [];
  const permissions = matrix?.permissions || [];

  const isMapped = (role, permissionId) =>
    (role.mappedPermissionIds || []).includes(permissionId);

  const handleToggle = async (role, permission) => {
    const mapped = isMapped(role, permission.id);
    const payload = { roleId: role.id, permissionIds: [permission.id] };

    try {
      if (mapped) {
        await dispatch(removePermissionFromRole(payload)).unwrap();
      } else {
        await dispatch(assignPermissionToRole(payload)).unwrap();
      }
      await dispatch(fetchUserPermissions(true));
      loadMatrix();
      showAlert({
        type: "success",
        title: "Updated",
        message: `Permission "${permission.key}" ${mapped ? "removed from" : "assigned to"} ${role.name}.`,
      });
    } catch (err) {
      showAlert({
        type: "error",
        title: "Error",
        message: err || "Failed to update permission mapping.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck size={24} /> Permission Matrix
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Role–permission mappings from the server. Changes apply immediately for new requests.
        </p>
      </div>

      <Card>
        <CardBody className="p-4 overflow-x-auto">
          {matrixLoading ? (
            <Loader inline />
          ) : (
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[220px]">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="text-center py-3 px-2 font-semibold text-gray-700 whitespace-nowrap"
                    >
                      {role.name}
                      {!role.isActive && (
                        <span className="block text-xs text-red-500 font-normal">inactive</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 sticky left-0 bg-white z-10">
                      <div className="font-medium text-gray-800">{perm.key}</div>
                      {perm.description && (
                        <div className="text-xs text-gray-500">{perm.description}</div>
                      )}
                    </td>
                    {roles.map((role) => (
                      <td key={`${role.id}-${perm.id}`} className="text-center py-2 px-2">
                        <input
                          type="checkbox"
                          className="rounded accent-[#04506B] w-4 h-4 cursor-pointer"
                          checked={isMapped(role, perm.id)}
                          disabled={matrixActionLoading || !role.isActive || !perm.isActive}
                          onChange={() => handleToggle(role, perm)}
                          aria-label={`${perm.key} for ${role.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!matrixLoading && permissions.length === 0 && (
            <p className="text-gray-500 text-sm py-8 text-center">No permissions found.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PermissionMatrix;
