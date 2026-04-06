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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  ClipboardList,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Priority, Status } from "../backend.d";
import {
  useAddMaintenanceTask,
  useCompleteTask,
  useDeleteMaintenanceTask,
  useGetAllTasks,
  useGetAppliances,
} from "../hooks/useQueries";
import {
  dateToNanoseconds,
  formatDate,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
} from "../lib/formatters";

const PRIORITIES = [
  { value: Priority.low, label: "Low" },
  { value: Priority.medium, label: "Medium" },
  { value: Priority.high, label: "High" },
  { value: Priority.critical, label: "Critical" },
];

function getDefaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

export function TasksPage() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: appliances = [] } = useGetAppliances();
  const addTask = useAddMaintenanceTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteMaintenanceTask();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: Priority.medium as Priority,
    dueDate: getDefaultDueDate(),
    applianceId: "",
  });

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: Status.pending,
        dueDate: dateToNanoseconds(new Date(form.dueDate)),
        applianceId: form.applianceId ? BigInt(form.applianceId) : undefined,
      });
      toast.success("Task added!");
      setShowAddModal(false);
      setForm({
        title: "",
        description: "",
        priority: Priority.medium,
        dueDate: getDefaultDueDate(),
        applianceId: "",
      });
    } catch {
      toast.error("Failed to add task.");
    }
  };

  const handleComplete = async (taskId: bigint) => {
    try {
      await completeTask.mutateAsync(taskId);
      toast.success("Task completed!");
    } catch {
      toast.error("Failed to complete task.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask.mutateAsync(deleteTarget);
      toast.success("Task deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  return (
    <div className="space-y-6" data-ocid="tasks.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Maintenance Tasks
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          data-ocid="tasks.add.open_modal_button"
        >
          <Plus size={16} className="mr-2" /> Add Task
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as "all" | Status)}
        data-ocid="tasks.filter.tab"
      >
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs px-3">
            All
          </TabsTrigger>
          <TabsTrigger value={Status.pending} className="text-xs px-3">
            Pending
          </TabsTrigger>
          <TabsTrigger value={Status.inProgress} className="text-xs px-3">
            In Progress
          </TabsTrigger>
          <TabsTrigger value={Status.overdue} className="text-xs px-3">
            Overdue
          </TabsTrigger>
          <TabsTrigger value={Status.completed} className="text-xs px-3">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-10 text-center" data-ocid="tasks.empty_state">
          <ClipboardList
            size={32}
            className="text-muted-foreground/30 mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm">
            {statusFilter === "all"
              ? "No tasks yet. Add your first maintenance task!"
              : `No ${statusFilter} tasks.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3" data-ocid="tasks.list">
          <AnimatePresence>
            {filteredTasks.map((task, i) => (
              <motion.div
                key={task.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                data-ocid={`tasks.item.${i + 1}`}
              >
                <Card
                  className={
                    task.status === Status.completed ? "opacity-60" : ""
                  }
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        task.status !== Status.completed &&
                        handleComplete(task.id)
                      }
                      disabled={
                        task.status === Status.completed ||
                        completeTask.isPending
                      }
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.status === Status.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                      }`}
                      data-ocid={`tasks.checkbox.${i + 1}`}
                      aria-label={`Complete ${task.title}`}
                    >
                      {task.status === Status.completed && (
                        <CheckCircle size={16} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p
                          className={`text-sm font-medium text-foreground ${task.status === Status.completed ? "line-through" : ""}`}
                        >
                          {task.title}
                        </p>
                        <Badge
                          className={`text-xs px-2 py-0 border-0 ${getPriorityColor(task.priority)}`}
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <Badge
                          className={`text-xs px-2 py-0 border-0 ${getStatusColor(task.status)}`}
                        >
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(task.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors flex-shrink-0"
                      data-ocid={`tasks.delete_button.${i + 1}`}
                      aria-label={`Delete ${task.title}`}
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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md" data-ocid="tasks.add.dialog">
          <DialogHeader>
            <DialogTitle>Add Maintenance Task</DialogTitle>
            <DialogDescription>
              Schedule a new maintenance task for your home.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="Replace HVAC filter"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
                data-ocid="tasks.add.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Additional notes..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                data-ocid="tasks.add.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority *</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, priority: v as Priority }))
                  }
                >
                  <SelectTrigger data-ocid="tasks.add.priority.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due Date *</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                  required
                  data-ocid="tasks.add.duedate.input"
                />
              </div>
            </div>
            {appliances.length > 0 && (
              <div className="space-y-1.5">
                <Label>Appliance (optional)</Label>
                <Select
                  value={form.applianceId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, applianceId: v }))
                  }
                >
                  <SelectTrigger data-ocid="tasks.add.appliance.select">
                    <SelectValue placeholder="Select appliance" />
                  </SelectTrigger>
                  <SelectContent>
                    {appliances.map((a) => (
                      <SelectItem key={a.id.toString()} value={a.id.toString()}>
                        {a.name} ({a.brand})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                data-ocid="tasks.add.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addTask.isPending}
                data-ocid="tasks.add.submit_button"
              >
                {addTask.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-ocid="tasks.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="tasks.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              data-ocid="tasks.delete.confirm_button"
            >
              {deleteTask.isPending ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
