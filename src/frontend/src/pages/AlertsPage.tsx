import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BellOff,
  Info,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertType } from "../backend.d";
import { useDeleteAlert, useGetAlerts } from "../hooks/useQueries";
import { formatDate, getAlertTypeColor } from "../lib/formatters";

function AlertIcon({ alertType }: { alertType: AlertType }) {
  if (alertType === AlertType.critical)
    return <XCircle size={18} className="text-red-500 flex-shrink-0" />;
  if (alertType === AlertType.warning)
    return <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />;
  return <Info size={18} className="text-blue-500 flex-shrink-0" />;
}

function AlertTypeBadge({ alertType }: { alertType: AlertType }) {
  if (alertType === AlertType.critical)
    return (
      <Badge className="bg-red-100 text-red-700 border-0 text-xs">
        Critical
      </Badge>
    );
  if (alertType === AlertType.warning)
    return (
      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
        Warning
      </Badge>
    );
  return (
    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Info</Badge>
  );
}

export function AlertsPage() {
  const { data: alerts = [], isLoading } = useGetAlerts();
  const deleteAlert = useDeleteAlert();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  const criticalCount = alerts.filter(
    (a) => a.alertType === AlertType.critical,
  ).length;
  const warningCount = alerts.filter(
    (a) => a.alertType === AlertType.warning,
  ).length;
  const infoCount = alerts.filter((a) => a.alertType === AlertType.info).length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAlert.mutateAsync(deleteTarget);
      toast.success("Alert dismissed.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to dismiss alert.");
    }
  };

  const getBorderClass = (alertType: AlertType) => {
    if (alertType === AlertType.critical) return "border-red-200";
    if (alertType === AlertType.warning) return "border-amber-200";
    return "border-blue-200";
  };

  return (
    <div className="space-y-6" data-ocid="alerts.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Active Alerts</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {!isLoading && alerts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
            <p className="text-xs text-red-600 font-medium">Critical</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{warningCount}</p>
            <p className="text-xs text-amber-600 font-medium">Warning</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{infoCount}</p>
            <p className="text-xs text-blue-600 font-medium">Info</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-12 text-center" data-ocid="alerts.empty_state">
          <BellOff
            size={36}
            className="text-muted-foreground/25 mx-auto mb-3"
          />
          <p className="text-foreground font-medium mb-1">No Active Alerts</p>
          <p className="text-muted-foreground text-sm">
            Your home systems are all running smoothly.
          </p>
        </Card>
      ) : (
        <div className="space-y-3" data-ocid="alerts.list">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id.toString()}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                data-ocid={`alerts.item.${i + 1}`}
              >
                <Card className={`border ${getBorderClass(alert.alertType)}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="mt-0.5">
                      <AlertIcon alertType={alert.alertType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <AlertTypeBadge alertType={alert.alertType} />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(alert.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors flex-shrink-0"
                      data-ocid={`alerts.delete_button.${i + 1}`}
                      aria-label="Dismiss alert"
                    >
                      <Trash2 size={15} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-ocid="alerts.delete.dialog">
          <DialogHeader>
            <DialogTitle>Dismiss Alert?</DialogTitle>
            <DialogDescription>
              This alert will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="alerts.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAlert.isPending}
              data-ocid="alerts.delete.confirm_button"
            >
              {deleteAlert.isPending ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
