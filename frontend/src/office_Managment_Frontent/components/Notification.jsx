import React, { memo, useEffect, useRef } from "react";
import { FaRegBell } from "react-icons/fa";

const Notification = ({
  notificationOpen,
  setNotificationOpen,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onViewAll,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setNotificationOpen]);

  return (
    <div className="relative notification-dropdown" ref={dropdownRef}>
      <button
        className="relative text-[var(--sidebar-foreground-muted)] hover:text-[var(--sidebar-foreground)] transition-all duration-300 hover:scale-110 p-2 rounded-xl hover:bg-[var(--sidebar-accent-hover)]"
        onClick={(e) => {
          e.stopPropagation();
          setNotificationOpen(!notificationOpen);
        }}
        aria-label="Notifications"
      >
        <FaRegBell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div
          className="absolute right-0 mt-3 w-[340px] bg-card text-card-foreground rounded-2xl overflow-hidden border border-gray-300 shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="
              px-5 
              py-4 
              border-b 
              border-gray-300 
              dark:border-white/10
              bg-gradient-to-r 
              from-[#F8FAFC] 
              to-[#EEF2FF]
              dark:from-[#111827]
              dark:to-[#1E293B]
            "
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                Notifications
              </h3>

              <button
                onClick={onMarkAllRead}
                className="
                  text-sm 
                  font-medium
                  text-cyanDark
                  transition-colors
                "
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Notifications List */}

          <div className="max-h-[380px] overflow-y-auto">
            {notifications?.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    px-5 py-4 
                    border-b border-gray-300 
                    dark:border-white/5
                    transition-all duration-200 
                    hover:bg-gray-50 
                    dark:hover:bg-white/5 
                    cursor-pointer
                    ${!notif.read
                      ? "bg-blue-50/60 dark:bg-blue-900/10"
                      : ""
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-2 h-2 rounded-full mt-2
                        ${!notif.read
                          ? "bg-cyanDark"
                          : "bg-gray-300"
                        }
                      `}
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-5">
                        {notif.title}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications found
                </p>
              </div>
            )}
          </div>

          {/* Footer */}

          <div
            className="
              px-4 
              py-3 
              bg-gray-50 
              dark:bg-[#111827]
              border-t 
              border-gray-300 
              dark:border-white/10
              text-center
            "
          >
            <button
              onClick={onViewAll}
              className="
                text-sm 
                font-medium
                text-cyanDark
                dark:text-blue-400
                transition-colors
              "
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Notification);