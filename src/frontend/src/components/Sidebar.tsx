import { useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export type Page = "dashboard" | "appliances" | "tasks" | "alerts";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userProfile: UserProfile | null;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appliances", label: "Appliances", icon: Wrench },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "alerts", label: "Alerts", icon: BellRing },
];

export function Sidebar({
  currentPage,
  onNavigate,
  userProfile,
}: SidebarProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const displayName = userProfile?.name || "Guest";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-30 sidebar-gradient border-r border-white/5"
      data-ocid="nav.panel"
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-400/40">
            <img
              src="/assets/generated/aura-ring-transparent.dim_80x80.png"
              alt="AuraHome"
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">
            AuraHome
          </span>
          <p className="text-white/40 text-xs">Smart Maintenance</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-white/70 text-xs font-medium">
            Hello, {userProfile?.name?.split(" ")[0] || "there"}!
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1" aria-label="Main navigation">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-500/20 text-white border border-blue-400/20 shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={17}
                className={isActive ? "text-blue-400" : "text-white/40"}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-blue-400" />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/90 text-sm font-medium truncate">
              {displayName}
            </p>
            <p className="text-white/40 text-xs">Member</p>
          </div>
          <ChevronDown size={14} className="text-white/30" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="nav.logout.button"
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/5 text-xs font-medium transition-all duration-200"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
