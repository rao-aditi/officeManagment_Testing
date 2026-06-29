import { Bell, ChevronDown, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/gst_Frontend/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/gst_Frontend/components/ui/dropdown-menu";
import { Badge } from "@/gst_Frontend/components/ui/badge";

export function Navbar() {
  return (
    <header className="w-full bg-[var(--sidebar-background)] border-b border-[var(--sidebar-border)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--sidebar-accent)]">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="#0bb3c7" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="#0bb3c7" opacity="0.6" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="#0bb3c7" opacity="0.6" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="#0bb3c7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight tracking-wide">
              CompuOffice
            </p>
            <p className="text-[var(--sidebar-foreground-muted)] text-[10px] leading-tight">
              Automation Suite for Professionals
            </p>
          </div>
        </div>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {["User Profile", "Software Registration", "Help", "E-Filing"].map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="sm"
              className="text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent-hover)] hover:text-white text-xs font-medium px-3"
            >
              {item}
              {item === "Help" && <ChevronDown className="ml-1 w-3 h-3 opacity-60" />}
            </Button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent-hover)] w-8 h-8"
          >
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-[var(--sidebar-accent-hover)] text-[var(--sidebar-foreground)] px-2 h-8"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--sidebar-accent)] flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium hidden sm:block">Admin</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold">Administrator</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  agssoftwaredsc@gmail.com
                </p>
              </div>
              <DropdownMenuItem className="text-xs gap-2 mt-1">
                <User className="w-3.5 h-3.5" /> User Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2">
                <Settings className="w-3.5 h-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive">
                <LogOut className="w-3.5 h-3.5" /> Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-6 py-1.5 bg-[var(--sidebar-accent)] border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-[var(--sidebar-foreground)] font-mono">
              u#P1235
            </span>
          </div>
          <span className="text-[var(--sidebar-border)] text-xs">|</span>
          <span className="text-[11px] text-[var(--sidebar-foreground-muted)]">
            Node: 5/11/3
          </span>
          <span className="text-[var(--sidebar-border)] text-xs">|</span>
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 border-[var(--sidebar-border)] text-[var(--sidebar-foreground-muted)] bg-transparent"
          >
            FX: 4.8 (11)
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-amber-400 font-medium">
            GST on CMS: 08AABCO9650J1Z2
          </span>
          <span className="text-[var(--sidebar-border)] text-xs">|</span>
          <span className="text-[11px] text-[var(--sidebar-foreground-muted)]">
            Updated: 22/05/2026
          </span>
        </div>
      </div>
    </header>
  );
}