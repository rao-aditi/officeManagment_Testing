import { useNavigate, useLocation } from "react-router-dom";
import { Database } from "lucide-react";
import { cn } from "@/gst_Frontend/lib/utils";

const SIDEBAR_ITEMS = [
  {
    id: "master-data",
    label: "Master Data",
    icon: Database,
    path: "/master-data",
  },
  
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-56 min-h-screen bg-[var(--sidebar-background)] border-r border-[var(--sidebar-border)]  flex flex-col py-4 px-2">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 w-full cursor-pointer text-left",
              isActive
                ? "bg-[var(--sidebar-accent)] text-black"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent-hover)] hover:text-black"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
}