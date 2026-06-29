import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserPermissions,
  setPermissions,
} from "../store/slice/auth/authSlice";
import Loader from "./Loader/Loader";

/**
 * Syncs permissions once after login / rehydrate.
 * Skips API call when login already returned permissions (see thunk `condition`).
 */
const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { permissions, permissionsLoading, userDetails } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (userDetails?.permissions?.length && !permissions?.length) {
      dispatch(setPermissions(userDetails.permissions));
      return;
    }

    dispatch(fetchUserPermissions());
  }, [dispatch]);

  const bootstrapping =
    permissionsLoading && (!permissions || permissions.length === 0);

  if (bootstrapping) {
    return <Loader fullPage />;
  }

  return children;
};

export default AuthInit;
