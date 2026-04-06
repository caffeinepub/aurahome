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
import { Loader2, Plus, Search, Trash2, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend.d";
import { CategoryIcon } from "../components/CategoryIcon";
import {
  useAddAppliance,
  useDeleteAppliance,
  useGetAppliances,
} from "../hooks/useQueries";
import {
  dateToNanoseconds,
  formatDate,
  getCategoryLabel,
  getHealthBarColor,
  getHealthColor,
  getHealthLabel,
} from "../lib/formatters";

const CATEGORIES = [
  { value: Category.hvac, label: "HVAC" },
  { value: Category.plumbing, label: "Plumbing" },
  { value: Category.kitchen, label: "Kitchen" },
  { value: Category.electrical, label: "Electrical" },
  { value: Category.laundry, label: "Laundry" },
  { value: Category.other, label: "Other" },
];

function getDefaultDate(yearsAgo = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d.toISOString().split("T")[0];
}

export function AppliancesPage() {
  const { data: appliances = [], isLoading } = useGetAppliances();
  const addAppliance = useAddAppliance();
  const deleteAppliance = useDeleteAppliance();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: Category.hvac as Category,
    installDate: getDefaultDate(5),
    lastServiceDate: getDefaultDate(1),
  });

  const filtered = appliances.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.brand.toLowerCase().includes(search.toLowerCase()) ||
      getCategoryLabel(a.category).toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAppliance.mutateAsync({
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        installDate: dateToNanoseconds(new Date(form.installDate)),
        lastServiceDate: dateToNanoseconds(new Date(form.lastServiceDate)),
      });
      toast.success("Appliance added successfully!");
      setShowAddModal(false);
      setForm({
        name: "",
        brand: "",
        category: Category.hvac,
        installDate: getDefaultDate(5),
        lastServiceDate: getDefaultDate(1),
      });
    } catch {
      toast.error("Failed to add appliance.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAppliance.mutateAsync(deleteTarget);
      toast.success("Appliance removed.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete appliance.");
    }
  };

  return (
    <div className="space-y-6" data-ocid="appliances.page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Your Appliances
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {appliances.length} appliance{appliances.length !== 1 ? "s" : ""}{" "}
            tracked
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          data-ocid="appliances.add.open_modal_button"
        >
          <Plus size={16} className="mr-2" /> Add Appliance
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search appliances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="appliances.search_input"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-5 w-16" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center" data-ocid="appliances.empty_state">
          <Wrench size={32} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search
              ? "No appliances match your search."
              : "No appliances yet. Add your first one!"}
          </p>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="appliances.list"
        >
          <AnimatePresence>
            {filtered.map((appliance, i) => {
              const healthLabel = getHealthLabel(appliance.healthScore);
              const healthBadge = getHealthColor(appliance.healthScore);
              const barColor = getHealthBarColor(appliance.healthScore);
              return (
                <motion.div
                  key={appliance.id.toString()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  data-ocid={`appliances.item.${i + 1}`}
                >
                  <Card className="hover:shadow-card-hover transition-shadow duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                          <CategoryIcon
                            category={appliance.category}
                            size={22}
                            className="text-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(appliance.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                          data-ocid={`appliances.delete_button.${i + 1}`}
                          aria-label={`Delete ${appliance.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-0.5">
                        {appliance.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {appliance.brand}
                      </p>
                      <Badge variant="outline" className="text-xs mb-3">
                        {getCategoryLabel(appliance.category)}
                      </Badge>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Health Score
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {Number(appliance.healthScore)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Number(appliance.healthScore)}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${healthBadge}`}
                        >
                          {healthLabel}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(appliance.installDate)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="appliances.add.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add New Appliance</DialogTitle>
            <DialogDescription>
              Track a new home appliance for maintenance monitoring.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="app-name">Name *</Label>
                <Input
                  id="app-name"
                  placeholder="Central AC Unit"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  data-ocid="appliances.add.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-brand">Brand *</Label>
                <Input
                  id="app-brand"
                  placeholder="Carrier"
                  value={form.brand}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, brand: e.target.value }))
                  }
                  required
                  data-ocid="appliances.add.brand.input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as Category }))
                }
              >
                <SelectTrigger data-ocid="appliances.add.category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="app-install">Install Date *</Label>
                <Input
                  id="app-install"
                  type="date"
                  value={form.installDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, installDate: e.target.value }))
                  }
                  required
                  data-ocid="appliances.add.installdate.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-service">Last Service *</Label>
                <Input
                  id="app-service"
                  type="date"
                  value={form.lastServiceDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastServiceDate: e.target.value }))
                  }
                  required
                  data-ocid="appliances.add.servicedate.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                data-ocid="appliances.add.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addAppliance.isPending}
                data-ocid="appliances.add.submit_button"
              >
                {addAppliance.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Appliance"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="appliances.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Remove Appliance?</DialogTitle>
            <DialogDescription>
              This will permanently delete the appliance and its associated
              tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="appliances.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAppliance.isPending}
              data-ocid="appliances.delete.confirm_button"
            >
              {deleteAppliance.isPending ? (
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
