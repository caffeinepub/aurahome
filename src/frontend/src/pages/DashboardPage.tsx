import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Lightbulb,
} from "lucide-react";
import { motion } from "motion/react";
import { AlertType } from "../backend.d";
import { CategoryIcon } from "../components/CategoryIcon";
import type { Page } from "../components/Sidebar";
import {
  useGetAlerts,
  useGetAppliances,
  useGetDashboardStats,
  useGetSortedUpcomingTasks,
} from "../hooks/useQueries";
import {
  formatDateShort,
  getAlertTypeColor,
  getCategoryLabel,
  getHealthBarColor,
  getHealthColor,
  getHealthLabel,
  getPriorityColor,
  getPriorityLabel,
} from "../lib/formatters";

const AI_TIPS: Record<string, string> = {
  hvac: "Schedule HVAC filter replacement every 3 months for optimal efficiency and air quality.",
  plumbing: "Inspect pipe insulation before winter to prevent freeze damage.",
  kitchen:
    "Clean refrigerator condenser coils annually to improve energy efficiency by up to 30%.",
  electrical:
    "Test GFCI outlets monthly and replace circuit breakers older than 20 years.",
  laundry:
    "Clean dryer vent annually — lint buildup is a leading cause of household fires.",
  other:
    "Create a home inventory log to track all appliance warranties and service dates.",
};

function AlertIcon({ alertType }: { alertType: AlertType }) {
  if (alertType === AlertType.critical)
    return (
      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
    );
  if (alertType === AlertType.warning)
    return (
      <AlertTriangle
        size={16}
        className="text-amber-500 flex-shrink-0 mt-0.5"
      />
    );
  return <Activity size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />;
}

export function DashboardPage({
  onNavigate,
}: { onNavigate: (page: Page) => void }) {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: appliances = [], isLoading: appLoading } = useGetAppliances();
  const { data: tasks = [], isLoading: tasksLoading } =
    useGetSortedUpcomingTasks();
  const { data: alerts = [], isLoading: alertsLoading } = useGetAlerts();

  const homeHealth = stats ? Number(stats.homeHealthScore) : 0;
  const activeAlerts = stats ? Number(stats.activeAlerts) : 0;
  const upcomingCount = stats ? Number(stats.upcomingTasks) : 0;
  const upcomingTasksDisplay = tasks.slice(0, 3);
  const alertsDisplay = alerts.slice(0, 3);
  const appliancesDisplay = appliances.slice(0, 5);

  const mostCommonCategory =
    appliances.length > 0 ? appliances[0].category : "other";
  const aiTip = AI_TIPS[mostCommonCategory] || AI_TIPS.other;
  const avgHealth =
    appliances.length > 0
      ? Math.round(
          appliances.reduce((sum, a) => sum + Number(a.healthScore), 0) /
            appliances.length,
        )
      : 0;

  return (
    <div className="space-y-6" data-ocid="dashboard.page">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Smart Home Dashboard
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Monitor and manage your home's health
          </p>
        </div>
        <Button
          onClick={() => onNavigate("appliances")}
          data-ocid="dashboard.primary_button"
        >
          <Cpu size={15} className="mr-2" />
          Manage Appliances
        </Button>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-3 gap-0 bg-card border border-border rounded-xl overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 border-r border-border last:border-0">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-9 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-3 gap-0 bg-card border border-border rounded-xl overflow-hidden shadow-card"
          data-ocid="dashboard.stats.card"
        >
          <div className="p-5 border-r border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Overall Home Health
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {homeHealth}%
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${
                  homeHealth >= 75
                    ? "bg-emerald-100 text-emerald-700"
                    : homeHealth >= 50
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {homeHealth >= 75
                  ? "Excellent"
                  : homeHealth >= 50
                    ? "Fair"
                    : "Poor"}
              </span>
            </div>
            <Progress value={homeHealth} className="mt-2 h-1.5" />
          </div>
          <div className="p-5 border-r border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Active Alerts
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {activeAlerts}
              </span>
              {activeAlerts > 0 ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1 bg-amber-100 text-amber-700">
                  Attention
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1 bg-emerald-100 text-emerald-700">
                  All Clear
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeAlerts === 0
                ? "No active issues"
                : `${activeAlerts} need${activeAlerts > 1 ? "" : "s"} attention`}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Upcoming Tasks
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">
                {upcomingCount}
              </span>
              {upcomingCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1 bg-blue-100 text-blue-700">
                  Scheduled
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingCount === 0 ? "All caught up" : "Next 30 days"}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Appliance Overview
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("appliances")}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              data-ocid="dashboard.appliances.link"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {appLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-14 mb-3" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-5 w-12" />
                </Card>
              ))}
            </div>
          ) : appliancesDisplay.length === 0 ? (
            <Card
              className="p-8 text-center"
              data-ocid="dashboard.appliances.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No appliances added yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onNavigate("appliances")}
              >
                Add Appliance
              </Button>
            </Card>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              data-ocid="dashboard.appliances.list"
            >
              {appliancesDisplay.map((appliance, i) => {
                const healthLabel = getHealthLabel(appliance.healthScore);
                const healthBadge = getHealthColor(appliance.healthScore);
                const barColor = getHealthBarColor(appliance.healthScore);
                return (
                  <motion.div
                    key={appliance.id.toString()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    data-ocid={`dashboard.appliance.item.${i + 1}`}
                  >
                    <Card className="p-4 hover:shadow-card-hover transition-shadow duration-200 cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                        <CategoryIcon
                          category={appliance.category}
                          size={20}
                          className="text-blue-500"
                        />
                      </div>
                      <p className="font-semibold text-sm text-foreground truncate">
                        {appliance.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {appliance.brand} ·{" "}
                        {getCategoryLabel(appliance.category)}
                      </p>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Health
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {Number(appliance.healthScore)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Number(appliance.healthScore)}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${healthBadge}`}
                      >
                        {healthLabel}
                      </span>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Upcoming Tasks
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("tasks")}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              data-ocid="dashboard.tasks.link"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <Card className="shadow-card" data-ocid="dashboard.tasks.card">
            {tasksLoading ? (
              <CardContent className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </CardContent>
            ) : upcomingTasksDisplay.length === 0 ? (
              <CardContent
                className="p-6 text-center"
                data-ocid="dashboard.tasks.empty_state"
              >
                <CheckCircle2
                  size={28}
                  className="text-emerald-500 mx-auto mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  All tasks complete!
                </p>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                {upcomingTasksDisplay.map((task, i) => (
                  <div
                    key={task.id.toString()}
                    className="flex items-start gap-3 p-4 border-b border-border last:border-0"
                    data-ocid={`dashboard.task.item.${i + 1}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateShort(task.dueDate)}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs px-2 py-0.5 border-0 ${getPriorityColor(task.priority)}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Predictive Maintenance Alerts &amp; AI Insights
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-card border border-border rounded-xl p-4 shadow-card">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Active Alerts
            </p>
            {alertsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : alertsDisplay.length === 0 ? (
              <div
                className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                data-ocid="dashboard.alerts.empty_state"
              >
                <CheckCircle2 size={20} className="text-emerald-500" />
                <p className="text-sm text-emerald-700">
                  No active alerts. Your home is in great shape!
                </p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="dashboard.alerts.list">
                {alertsDisplay.map((alert, i) => (
                  <div
                    key={alert.id.toString()}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${getAlertTypeColor(alert.alertType)}`}
                    data-ocid={`dashboard.alert.item.${i + 1}`}
                  >
                    <AlertIcon alertType={alert.alertType} />
                    <p className="flex-1 text-xs leading-relaxed">
                      {alert.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate("alerts")}
                      className="text-xs font-medium underline underline-offset-2 flex-shrink-0 hover:opacity-70 transition-opacity"
                      data-ocid={`dashboard.alert.action.${i + 1}`}
                    >
                      Action
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              AI Insights
            </p>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Maintenance Tip
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    {aiTip}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">
                    {appliances.length}
                  </p>
                  <p className="text-xs text-blue-600">Appliances</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-900">
                    {avgHealth}%
                  </p>
                  <p className="text-xs text-blue-600">Avg. Health</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
