import React, { useEffect } from "react";
import {
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FolderSync,
  Users,
  Calendar,
  Unplug,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { FaGoogleDrive } from "react-icons/fa6";
import Button from "../../components/ui/Button";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";
import { useAlert } from "../../helpers/AlertContent";
import {
  fetchGoogleDriveStatus,
  getGoogleDriveAuthUrl,
  disconnectGoogleDrive,
} from "../../store/slice/googleDrive/googleDriveSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const [searchParams, setSearchParams] = useSearchParams();

  const { userDetails } = useSelector((state) => state.auth);
  const {
    connected: isDriveConnected,
    email: driveEmail,
    loading,
    connecting,
    disconnecting,
  } = useSelector((state) => state.googleDrive);

  const user = userDetails || {};

  useEffect(() => {
    dispatch(fetchGoogleDriveStatus());
  }, [dispatch]);

  useEffect(() => {
    const driveConnected = searchParams.get("driveConnected");
    const driveError = searchParams.get("driveError");

    if (driveConnected === "true") {
      showAlert({
        type: "success",
        title: "Connected",
        message: "Google Drive connected successfully.",
      });
      dispatch(fetchGoogleDriveStatus());
      setSearchParams({}, { replace: true });
    }

    if (driveError) {
      showAlert({
        type: "error",
        title: "Connection failed",
        message: decodeURIComponent(driveError),
      });
      setSearchParams({}, { replace: true });
    }
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const connectGoogleDrive = async () => {
    try {
      const url = await dispatch(getGoogleDriveAuthUrl()).unwrap();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      showAlert({
        type: "error",
        title: "Connection failed",
        message: error || "Unable to start Google Drive connection.",
      });
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await dispatch(disconnectGoogleDrive()).unwrap();
      showAlert({
        type: "success",
        title: "Disconnected",
        message: "Google Drive disconnected successfully.",
      });
    } catch (error) {
      showAlert({
        type: "error",
        title: "Disconnect failed",
        message: error || "Failed to disconnect Google Drive.",
      });
    }
  };

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-lg font-medium text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-md text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              My Profile
            </h1>

            <p className="text-white/70 mt-1 text-sm">
              Manage your account information and Google Drive connection.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isDriveConnected ? (
              <Button
                variant="outline"
                onClick={handleDisconnectDrive}
                disabled={disconnecting}
                leftIcon={Unplug}
                styleClass="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect Drive"}
              </Button>
            ) : (
              <button
                onClick={connectGoogleDrive}
                disabled={connecting}
                className="bg-white text-cyanDark hover:bg-gray-100 font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow flex items-center gap-2 text-sm"
              >
                {connecting ? "Connecting..." : "Connect Google Drive"}
              </button>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
      </div>

      <div className="mt-6">
        <div className="bg-card rounded-2xl shadow-md border border-[var(--color-border)] overflow-hidden">
          <div className="bg-[#04364A] p-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.name || "-"}
                </h2>

                <p className="text-white/80">
                  {user?.role || "-"}
                </p>

                <p className="text-white/60 text-sm mt-1">
                  ID: {user?.id || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Mail size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium break-all">{user?.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Phone size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.phone || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Shield size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{user?.role || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                {user?.status === "ACTIVE" ? (
                  <CheckCircle size={18} className="text-green-600" />
                ) : (
                  <XCircle size={18} className="text-red-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{user?.status || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Clock size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium">{formatDate(user?.lastLoginAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Users size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Assigned Clients</p>
                  <p className="font-medium">{user?.clientIds?.length || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)]">
                <Calendar size={18} className="text-cyanDark" />
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p className="font-medium">{formatDate(user?.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-muted)] md:col-span-2">
                <FaGoogleDrive
                  size={18}
                  className={isDriveConnected ? "text-green-600" : "text-red-700"}
                />
                <div>
                  <p className="text-sm text-gray-500">Google Drive Status</p>
                  <p
                    className={`font-medium ${
                      isDriveConnected ? "text-green-600" : "text-red-700"
                    }`}
                  >
                    {isDriveConnected
                      ? `Connected${driveEmail ? ` (${driveEmail})` : ""}`
                      : "Not Connected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
