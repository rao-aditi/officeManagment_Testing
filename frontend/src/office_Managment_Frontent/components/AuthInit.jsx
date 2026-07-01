import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserPermissions } from "../store/slice/auth/authSlice";
import Loader from "./Loader/Loader";

const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { permissions, permissionsLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    dispatch(fetchUserPermissions(true));
  }, [dispatch]);

  const bootstrapping =
    permissionsLoading && (!permissions || permissions.length === 0);

  if (bootstrapping) {
    return <Loader fullPage />;
  }

  return children;
};

export default AuthInit;
