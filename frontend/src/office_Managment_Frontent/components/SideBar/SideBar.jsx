// import { memo, useState } from "react";
// import {
//   LayoutDashboard,
//   CalendarClock,
//   BriefcaseBusiness,
//   Users,
//   ClipboardCheck,
//   MessageSquareMore,
//   ShieldCheck,
//   ReceiptIndianRupee,
//   FileText,
//   BellRing,
//   ChevronDown,
//   FileWarning,
//   BarChart3,
//   History,
//   Settings,
//   UserCog,
//   Layers,
// } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { HiUserCircle } from "react-icons/hi2";
// import { usePermission } from "../../Hooks/usePermission";
// 
// const canSee = (canAny, anyPermissions) =>
//   !anyPermissions?.length || canAny(anyPermissions);

// const SideBar = ({ isCollapsed }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [openMenu, setOpenMenu] = useState(null);
//   const { canAny } = usePermission();

//   const baseMenu = [
//     {
//       label: "Dashboard",
//       path: "/officeManagment_DashBoard",
//       icon: <LayoutDashboard size={20} />,
//     },
//     {
//       label: "Client Management",
//       path: "/clients",
//       icon: <Users size={20} />,
//       anyPermissions: [
//         "view_all_clients",
//         "view_assigned_clients",
//       ],
//     },
//     {
//       label: "Service Types",
//       path: "/service-types",
//       icon: <Layers size={18} />,
//     },
//     {
//       label: "User Management",
//       path: "/users",
//       icon: <HiUserCircle size={20} />,
//       anyPermissions: ["list_users", "create_user"],
//     },
//     {
//       label: "Due Date Reminder",
//       path: "/due-date-reminder",
//       icon: <CalendarClock size={20} />,
//       anyPermissions: [
//         "view_all_tasks",
//         "view_own_tasks",
//         "request_due_date_change",
//         "change_due_date",
//       ],
//     },
//     {
//       label: "Task Management",
//       icon: <ClipboardCheck size={20} />,
//       anyPermissions: [
//         "view_all_tasks",
//         "view_own_tasks",
//         "create_task",
//       ],
//       subItems: [
//         {
//           label: "All Tasks",
//           path: "/tasks",
//           anyPermissions: [
//             "view_all_tasks",
//             "view_own_tasks",
//           ],
//         },
//         {
//           label: "Task Completion",
//           path: "/task-completion",
//           anyPermissions: [
//             "mark_task_complete",
//             "update_task_status",
//           ],
//         },
//         {
//           label: "Reassign Summary",
//           path: "/reassign-summary",
//           anyPermissions: [
//             "reassign_task",
//             "reassign_task_within_team",
//           ],
//         },
//       ],
//     },
//     {
//       label: "Quotation & Fees",
//       icon: <ReceiptIndianRupee size={20} />,
//       anyPermissions: [
//         "create_quotation",
//         "view_quotation",
//         "create_change_fees",
//         "generate_invoice",
//       ],
//       subItems: [
//         {
//           label: "Quotation",
//           path: "/quotation",
//           anyPermissions: [
//             "create_quotation",
//             "view_quotation",
//           ],
//         },
//         {
//           label: "Fees",
//           path: "/fees",
//           anyPermissions: ["create_change_fees"],
//         },
//         {
//           label: "Invoices",
//           path: "/invoice",
//           anyPermissions: ["generate_invoice"],
//         },
//       ],
//     },
//     {
//       label: "Billing",
//       path: "/billing",
//       icon: <FileText size={20} />,
//       anyPermissions: ["generate_invoice"],
//     },
//     {
//       label: "Document Center",
//       path: "/documents",
//       icon: <FileWarning size={20} />,
//       anyPermissions: [
//         "upload_documents",
//         "delete_documents",
//       ],
//     },
//     {
//       label: "Client Messaging",
//       icon: <MessageSquareMore size={20} />,
//       anyPermissions: ["send_client_messages"],
//       subItems: [
//         {
//           label: "Dynamic Messaging",
//           path: "/dynamic-messaging",
//           anyPermissions: ["send_client_messages"],
//         },
//         {
//           label: "Notification Link",
//           path: "/notification-link",
//           anyPermissions: ["send_client_messages"],
//         },
//       ],
//     },
//     {
//       label: "Reports",
//       icon: <BarChart3 size={20} />,
//       anyPermissions: [
//         "view_all_reports",
//         "view_operational_reports",
//         "view_own_reports",
//       ],
//       subItems: [
//         {
//           label: "Task Report",
//           path: "/reports/tasks",
//           anyPermissions: [
//             "view_all_reports",
//             "view_operational_reports",
//           ],
//         },
//         {
//           label: "Overdue Report",
//           path: "/reports/overdue",
//           anyPermissions: [
//             "view_all_reports",
//             "view_operational_reports",
//           ],
//         },
//         {
//           label: "Client Report",
//           path: "/reports/clients",
//           anyPermissions: ["view_all_reports"],
//         },
//         {
//           label: "Invoice Report",
//           path: "/reports/invoices",
//           anyPermissions: ["view_all_reports"],
//         },
//         {
//           label: "Payment Report",
//           path: "/reports/payments",
//           anyPermissions: ["view_all_reports"],
//         },
//         {
//           label: "Staff Performance",
//           path: "/reports/staff-performance",
//           anyPermissions: [
//             "view_all_reports",
//             "view_operational_reports",
//           ],
//         },
//       ],
//     },
//     {
//       label: "Permission Matrix",
//       path: "/settings/permissions",
//       icon: <ShieldCheck size={20} />,
//       anyPermissions: ["view_audit_logs"],
//     },
//     {
//       label: "Notifications",
//       path: "/notifications",
//       icon: <BellRing size={20} />,
//     },
//   ];

//   const menuItems = baseMenu
//     .map((item) => {
//       if (!item.subItems) return item;
//       const subItems = item.subItems.filter((sub) =>
//         canSee(canAny, sub.anyPermissions)
//       );
//       return { ...item, subItems };
//     })
//     .filter((item) => {
//       if (!canSee(canAny, item.anyPermissions)) return false;
//       if (item.subItems) return item.subItems.length > 0;
//       return true;
//     });

//   const handleNavigation = (path) => {
//     navigate(path);
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const toggleMenu = (label) => {
//     setOpenMenu(openMenu === label ? null : label);
//   };

//   return (
//     <aside
//       className={`h-screen transition-all duration-300 overflow-y-auto no-scrollbar
//         bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A]
//         border-r border-white/10 shadow-2xl
//         ${isCollapsed ? "w-[70px]" : "w-[260px]"}`}
//     >
//       <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 bg-white/5">
//         <div
//           className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} h-16 p-2`}
//         >
//           <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
//             <BriefcaseBusiness className="text-white" size={20} />
//           </div>
//           {!isCollapsed && (
//             <div>
//               <h1 className="text-white text-lg font-bold leading-tight">CA Office</h1>
//               <p className="text-white/60 text-sm">Management System</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="px-3 py-4 space-y-2">
//         {menuItems.map((item, index) => {
//           const hasSubItems = item.subItems?.length > 0;

//           return (
//             <div key={index}>
//               <div
//                 onClick={() => {
//                   if (hasSubItems) {
//                     toggleMenu(item.label);
//                   } else {
//                     handleNavigation(item.path);
//                   }
//                 }}
//                 className={`
//                   group flex items-center relative
//                   ${isCollapsed ? "justify-center px-2" : "justify-between px-3"}
//                   py-2.5 rounded-lg cursor-pointer
//                   transition-all duration-300
//                   ${!isCollapsed ? "border-l-4" : "border-l-4 border-transparent"}
//                   ${isActive(item.path) && !isCollapsed
//                     ? "border-white bg-white/10 text-white font-semibold"
//                     : "border-transparent text-white/75 hover:bg-white/10 hover:text-white"
//                   }
//                 `}
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="transition-all duration-300 group-hover:scale-110">
//                     {item.icon}
//                   </span>
//                   {!isCollapsed && (
//                     <span className="text-sm font-medium tracking-wide">
//                       {item.label}
//                     </span>
//                   )}
//                 </div>
//                 {!isCollapsed && hasSubItems && (
//                   <ChevronDown
//                     size={18}
//                     className={`transition-transform duration-300 ${openMenu === item.label ? "rotate-180" : ""}`}
//                   />
//                 )}
//               </div>

//               {!isCollapsed && hasSubItems && openMenu === item.label && (
//                 <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3 animate-fadeIn">
//                   {item.subItems.map((subItem, subIndex) => (
//                     <div
//                       key={subIndex}
//                       onClick={() => handleNavigation(subItem.path)}
//                       className={`
//                         px-3 py-2 rounded-lg cursor-pointer
//                         text-sm transition-all duration-300
//                         ${isActive(subItem.path)
//                           ? "bg-white/10 text-white font-semibold"
//                           : "text-white/65 hover:bg-white/10 hover:text-white"
//                         }
//                       `}
//                     >
//                       {subItem.label}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </aside>
//   );
// };

// export default memo(SideBar);


import { memo, useRef, useState } from "react";
import {
  LayoutDashboard,
  CalendarClock,
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  MessageSquareMore,
  ReceiptIndianRupee,
  BellRing,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { IoDocumentsOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { HiUserCircle } from "react-icons/hi2";
import { usePermission } from "../../Hooks/usePermission";

const canSee = (canAny, anyPermissions) =>
  !anyPermissions?.length || canAny(anyPermissions);

const SideBar = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const { can, canAny } = usePermission();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const hideTimeout = useRef(null);

  const baseMenu = [
    {
      label: "Dashboard",
      path: "/officeManagment_DashBoard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Client Management",
      path: "/clients",
      icon: <Users size={20} />,
      anyPermissions: [
        "view_all_clients",
        "view_assigned_clients",
      ],
    },
    {
      label: "User Management",
      path: "/users",
      icon: <HiUserCircle size={20} />,
      anyPermissions: ["list_users", "create_user"],
    },
    {
      label: "Due Date Reminder",
      path: "/due-date-reminder",
      icon: <CalendarClock size={20} />,
      anyPermissions: [
        "view_all_tasks",
        "view_own_tasks",
        "request_due_date_change",
        "change_due_date",
      ],
    },
    {
      label: "Task Management",
      icon: <ClipboardCheck size={20} />,
      anyPermissions: [
        "view_all_tasks",
        "view_own_tasks",
        "create_task",
      ],
      subItems: [
        {
          label: can("view_all_tasks") ? "All Tasks" : "My Tasks",
          path: "/tasks",
          anyPermissions: [
            "view_all_tasks",
            "view_own_tasks",
          ],
        },
        {
          label: "Task Completion",
          path: "/task-completion",
          anyPermissions: [
            "mark_task_complete",
            "update_task_status",
          ],
        },
        {
          label: "Reassign Summary",
          path: "/reassign-summary",
          anyPermissions: [
            "reassign_task",
            "reassign_task_within_team",
          ],
        },
      ],
    },
    {
      label: "Quotation & Fees",
      icon: <ReceiptIndianRupee size={20} />,
      anyPermissions: [
        "create_quotation",
        "view_quotation",
        "create_change_fees",
        "generate_invoice",
      ],
      subItems: [
        {
          label: "Service Fees",
          path: "/service-types",
          anyPermissions: [
            "create_change_fees",
            "create_service_type",
            "update_service_type",
          ],
        },
        {
          label: "Quotation",
          path: "/quotation",
          anyPermissions: [
            "create_quotation",
            "view_quotation",
          ],
        },
        {
          label: "Invoices",
          path: "/invoice",
          anyPermissions: ["generate_invoice"],
        },
      ],
    },
    {
      label: "Billing",
      path: "/billing",
      icon: <ReceiptIndianRupee size={20} />,
      anyPermissions: ["generate_invoice"],
    },
    {
      label: "Documents",
      icon: <IoDocumentsOutline size={20} />,
      anyPermissions: [
        "upload_documents",
        "delete_documents",
      ],
      subItems: [
        {
          label: "Document Type",
          path: "/document-types",
        },
        {
          label: "Document Center",
          path: "/documents",
        }
      ]
    },
    {
      label: "Reports",
      icon: <BarChart3 size={20} />,
      anyPermissions: [
        "view_all_reports",
        "view_operational_reports",
        "view_own_reports",
      ],
      subItems: [
        {
          label: "Task Report",
          path: "/reports/tasks",
          anyPermissions: [
            "view_all_reports",
            "view_operational_reports",
            "view_own_reports",
          ],
        },
        {
          label: "Overdue Report",
          path: "/reports/overdue",
          anyPermissions: [
            "view_all_reports",
            "view_operational_reports",
            "view_own_reports",
          ],
        },
        {
          label: "Client Report",
          path: "/reports/clients",
          anyPermissions: ["view_all_reports"],
        },
        {
          label: "Invoice Report",
          path: "/reports/invoices",
          anyPermissions: ["view_all_reports"],
        },
        {
          label: "Payment Report",
          path: "/reports/payments",
          anyPermissions: ["view_all_reports"],
        },
        {
          label: "Staff Performance",
          path: "/reports/staff-performance",
          anyPermissions: [
            "view_all_reports",
            "view_operational_reports",
          ],
        },
      ],
    },

    {
      label: "Client Messaging",
      icon: <MessageSquareMore size={20} />,
      anyPermissions: ["send_client_messages"],
      subItems: [
        {
          label: "Dynamic Messaging",
          path: "/dynamic-messaging",
          anyPermissions: ["send_client_messages"],
        },
        {
          label: "Notification Link",
          path: "/notification-link",
          anyPermissions: ["send_client_messages"],
        },
      ],
    },

    // {
    //   label: "Permission Matrix",
    //   path: "/settings/permissions",
    //   icon: <ShieldCheck size={20} />,
    //   anyPermissions: ["view_audit_logs"],
    // },

    {
      label: "Notifications",
      path: "/notifications",
      icon: <BellRing size={20} />,
    },
  ];

  const menuItems = baseMenu
    .map((item) => {
      if (!item.subItems) return item;
      const subItems = item.subItems.filter((sub) =>
        canSee(canAny, sub.anyPermissions)
      );
      return { ...item, subItems };
    })
    .filter((item) => {
      if (!canSee(canAny, item.anyPermissions)) return false;
      if (item.subItems) return item.subItems.length > 0;
      return true;
    });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const showTooltip = (label) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    setActiveTooltip(label);
  };

  const hideTooltip = () => {
    hideTimeout.current = setTimeout(() => {
      setActiveTooltip(null);
    }, 800);
  };

  const closeTooltip = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    setActiveTooltip(null);
  };

  const Tooltip = ({ item }) => {
    if (!isCollapsed) return null;

    const isOpen = activeTooltip === item.label;

    return (
      <div
        onMouseEnter={() => showTooltip(item.label)}
        onMouseLeave={hideTooltip}
        className={`absolute left-full top-0 ml-7 z-50 transition-all duration-200 ${isOpen
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
          }`}
      >
        <div
          className=" absolute -left-1.5 top-5 w-3.5 h-3.5 rotate-45 border-l border-t border-gray-700 bg-[#04364A]"
        />
        <div className="min-w-[220px] rounded-lg border border-gray-700 bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] shadow-xl">
          <div className="px-4 py-2.5 border-b border-gray-600 text-sm font-semibold text-white">
            {item.label}
          </div>

          <div className="p-2 mb-2">
            {item.subItems?.map((subItem, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigation(subItem.path);
                  closeTooltip();
                }}
                className={`
                  px-3 py-2 text-sm cursor-pointer rounded-md
                  ${isActive(subItem.path)
                    ? "bg-white/10 text-white my-2"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {subItem.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`h-screen transition-all duration-300 overflow-visible
      bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A]
      border-r border-white/10 shadow-2xl
      ${isCollapsed ? "w-[70px]" : "w-[260px]"}`}
    >
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 bg-white/5">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} h-16 p-2`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
            <BriefcaseBusiness className="text-white" size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white text-lg font-bold leading-tight">CA Office</h1>
              <p className="text-white/60 text-sm">Management System</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-4 space-y-2">
        {menuItems.map((item, index) => {
          const hasSubItems = item.subItems?.length > 0;

          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => isCollapsed && showTooltip(item.label)}
              onMouseLeave={() => isCollapsed && hideTooltip()}
            >
              <div
                onClick={() => {
                  if (hasSubItems && !isCollapsed) {
                    toggleMenu(item.label);
                  } else if (!hasSubItems) {
                    handleNavigation(item.path);
                  }
                }}
                onMouseEnter={() => isCollapsed && hasSubItems && setHoveredMenu(item.label)}
                onMouseLeave={() => setHoveredMenu(null)}
                className={`
                  group relative flex items-center
                  ${isCollapsed ? "justify-center px-2" : "justify-between px-3"}
                  py-2.5 rounded-lg cursor-pointer
                  transition-all duration-300
                  ${!isCollapsed ? "border-l-4" : "border-l-4 border-transparent"}
                  ${isActive(item.path) && !isCollapsed
                    ? "border-white bg-white/10 text-white font-semibold"
                    : "border-transparent text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="transition-all duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium tracking-wide">
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && hasSubItems && (
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${openMenu === item.label ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {isCollapsed && hasSubItems && activeTooltip === item.label && (
                <Tooltip item={item} />
              )}

              {/* Simple tooltip for single items */}
              {isCollapsed &&
                !hasSubItems &&
                activeTooltip === item.label && (
                  <div
                    className="absolute left-full top-0 ml-6 z-50"
                    onMouseEnter={() => showTooltip(item.label)}
                    onMouseLeave={hideTooltip}
                  >
                    <div
                      className=" absolute -left-1.5 top-3.5 w-3 h-3 rotate-45 border-l border-t border-gray-700 bg-[#065273]"
                    />
                    <div className="bg-gradient-to-br from-[#04364A] via-[#06506B] to-[#022B3A] text-white text-sm rounded-md shadow-xl px-4 py-2 whitespace-nowrap border border-gray-700">
                      {item.label}
                    </div>
                  </div>
                )}

              {/* Expanded submenu */}
              {!isCollapsed && hasSubItems && openMenu === item.label && (
                <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3 animate-fadeIn">
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      onClick={() => handleNavigation(subItem.path)}
                      className={`
                        px-3 py-2 rounded-lg cursor-pointer
                        text-sm transition-all duration-300
                        ${isActive(subItem.path)
                          ? "bg-white/10 text-white font-semibold"
                          : "text-white/65 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default memo(SideBar);