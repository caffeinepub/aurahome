import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { type Page, Sidebar } from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetAlerts,
  useGetCallerUserProfile,
  useInsertTestData,
} from "./hooks/useQueries";
import { AlertsPage } from "./pages/AlertsPage";
import { AppliancesPage } from "./pages/AppliancesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfileSetupModal } from "./pages/ProfileSetupModal";
import { TasksPage } from "./pages/TasksPage";

const SEED_KEY = "aura_seeded";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const insertTestData = useInsertTestData();
  const { data: alerts = [] } = useGetAlerts();

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [seeding, setSeeding] = useState(false);
  const seedingAttempted = useRef(false);

  useEffect(() => {
    if (!actor || actorFetching || !isAuthenticated || seedingAttempted.current)
      return;
    const principal = identity?.getPrincipal().toString() ?? "";
    const seedKey = `${SEED_KEY}_${principal}`;
    if (localStorage.getItem(seedKey)) return;

    seedingAttempted.current = true;
    setSeeding(true);
    insertTestData.mutate(undefined, {
      onSuccess: () => {
        localStorage.setItem(seedKey, "true");
        setSeeding(false);
      },
      onError: () => {
        seedingAttempted.current = false;
        setSeeding(false);
      },
    });
  });

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  if (isInitializing || (isAuthenticated && actorFetching)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center">
            <img
              src="/assets/generated/aura-ring-transparent.dim_80x80.png"
              alt="AuraHome"
              className="w-8 h-8 object-contain"
            />
          </div>
          <Loader2 size={20} className="animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading AuraHome...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userProfile={userProfile ?? null}
      />

      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Header
          currentPage={currentPage}
          userProfile={userProfile ?? null}
          alertCount={alerts.length}
        />

        {seeding && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            data-ocid="app.loading_state"
          >
            <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl px-8 py-6 shadow-card">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Setting up your home data...
              </p>
              <p className="text-xs text-muted-foreground">
                This only happens once
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentPage === "dashboard" && (
                <DashboardPage onNavigate={setCurrentPage} />
              )}
              {currentPage === "appliances" && <AppliancesPage />}
              {currentPage === "tasks" && <TasksPage />}
              {currentPage === "alerts" && <AlertsPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border py-4 px-6 bg-card flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/aura-ring-transparent.dim_80x80.png"
                alt=""
                className="w-4 h-4 object-contain"
              />
              <span className="font-medium text-foreground/60">AuraHome</span>
            </div>
            <p>
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Built with ♥ using caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>

      <ProfileSetupModal open={showProfileSetup} />
      <Toaster richColors position="top-right" />
    </div>
  );
}
