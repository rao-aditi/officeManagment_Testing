import { useSelector } from "react-redux";

export const useAuth = () => {
  const { userDetails, permissions } = useSelector((state) => state.auth);

  return {
    user: userDetails,
    role: userDetails?.role || null,
    permissions: permissions || userDetails?.permissions || [],
    isAuthenticated: Boolean(userDetails?.id || localStorage.getItem("accessToken")),
  };
};
