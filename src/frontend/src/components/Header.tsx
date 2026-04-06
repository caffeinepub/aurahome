import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import type { UserProfile } from "../backend.d";
import type { Page } from "./Sidebar";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  appliances: "Appliances",
  tasks: "Maintenance Tasks",
  alerts: "Alerts",
};

interface HeaderProps {
  currentPage: Page;
  userProfile: UserProfile | null;
  alertCount?: number;
}

export function Header({
  currentPage,
  userProfile,
  alertCount = 0,
}: HeaderProps) {
  const displayName = userProfile?.name || "Guest";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-foreground">
        {pageTitles[currentPage]}
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search..."
            className="pl-9 h-9 w-52 text-sm bg-muted/50 border-border focus:bg-card"
            data-ocid="header.search_input"
          />
        </div>
        <button
          type="button"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-ocid="header.notifications.button"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
