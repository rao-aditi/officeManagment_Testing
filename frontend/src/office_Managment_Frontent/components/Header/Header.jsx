import { memo, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { BsFullscreenExit } from "react-icons/bs";
import { RiFullscreenFill, RiLogoutCircleLine, RiUserSettingsLine } from "react-icons/ri";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "../../helpers/ThemeContext";
import { logout } from "../../store/slice/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import Notification from "../Notification";
import defaultImage from "../../../office_Managment_Frontent/assets/image.png"

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetails = useSelector((state) => state.auth.userDetails);

  const notifications = [
    {
      id: 1,
      title: "GST return due tomorrow",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Invoice generated successfully",
      time: "10 min ago",
      read: true,
    },
  ];

  const handleLogout = async () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('.profile-dropdown')) {
        setOpen(false);
      }
      if (notificationOpen && !event.target.closest('.notification-dropdown')) {
        setNotificationOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [open, notificationOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setIsFullScreen(!!isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <header className="h-16 bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] border-b border-white/10 flex items-center justify-between px-4 shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-white/10"
          aria-label="Toggle Menu"
        >
          {isCollapsed ? <HiOutlineMenuAlt1 size={24} /> : <IoClose size={24} />}
        </button>

      </div>

      <div className="flex items-center gap-4">
        <Notification
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          notifications={notifications}
          unreadCount={2}
          onMarkAllRead={() => console.log("Mark all read")}
          onViewAll={() => console.log("View all")}
        />

        {/* Fullscreen Toggle */}
        <button
          className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-white/10"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
        >
          {isFullScreen ? (
            <BsFullscreenExit size={16} />
          ) : (
            <RiFullscreenFill size={18} />
          )}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="relative w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 bg-white/20 backdrop-blur-sm shadow-inner"
          aria-label="Toggle theme"
        >
          <div
            className={`bg-white rounded-full w-5 h-5 shadow-md transform transition-all duration-300 flex items-center justify-center ${isDarkMode ? "translate-x-5" : "translate-x-0"
              }`}
          >
            {isDarkMode ? (
              <MdDarkMode size={12} className="text-gray-700" />
            ) : (
              <MdLightMode size={12} className="text-amber-500" />
            )}
          </div>
        </button>

        {/* Profile Dropdown */}
        <div className="relative profile-dropdown">
          <button
            className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 p-1 rounded-lg"
            onClick={(e) => {
              setOpen(!open);
              e.stopPropagation();
            }}
            aria-label="Profile"
          >
            <img
              src={userDetails?.profilePhoto || defaultImage}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition-all duration-300"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight">
                {userDetails?.name || "Admin User"}
              </p>
              <p className="text-sm text-white/60">
                {userDetails?.role || "Administrator"}
              </p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {open && (
            <div
              className="absolute -right-2 mt-3 w-56 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slideDown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center gap-3">
                  <img
                    src={userDetails?.profilePhoto || defaultImage}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {userDetails?.name || "Admin User"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {userDetails?.email || "admin@caoffice.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                >
                  <RiUserSettingsLine size={16} />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-700 mt-1"
                >
                  <RiLogoutCircleLine size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default memo(Header);