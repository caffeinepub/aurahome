import { AlertType, Category, Priority, Status } from "../backend.d";

export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function formatDate(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(ns: bigint): string {
  const date = nanosecondsToDate(ns);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getHealthLabel(score: bigint): "Good" | "Fair" | "Poor" {
  const n = Number(score);
  if (n >= 75) return "Good";
  if (n >= 50) return "Fair";
  return "Poor";
}

export function getHealthColor(score: bigint): string {
  const label = getHealthLabel(score);
  if (label === "Good") return "bg-emerald-100 text-emerald-700";
  if (label === "Fair") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function getHealthBarColor(score: bigint): string {
  const label = getHealthLabel(score);
  if (label === "Good") return "#10b981";
  if (label === "Fair") return "#f59e0b";
  return "#ef4444";
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.critical:
      return "bg-red-100 text-red-700";
    case Priority.high:
      return "bg-orange-100 text-orange-700";
    case Priority.medium:
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export function getStatusColor(status: Status): string {
  switch (status) {
    case Status.completed:
      return "bg-emerald-100 text-emerald-700";
    case Status.inProgress:
      return "bg-blue-100 text-blue-700";
    case Status.overdue:
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getAlertTypeColor(alertType: AlertType): string {
  switch (alertType) {
    case AlertType.critical:
      return "bg-red-50 border-red-200 text-red-800";
    case AlertType.warning:
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-blue-50 border-blue-200 text-blue-800";
  }
}

export function getCategoryLabel(category: Category): string {
  switch (category) {
    case Category.hvac:
      return "HVAC";
    case Category.plumbing:
      return "Plumbing";
    case Category.kitchen:
      return "Kitchen";
    case Category.electrical:
      return "Electrical";
    case Category.laundry:
      return "Laundry";
    default:
      return "Other";
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.critical:
      return "Critical";
    case Priority.high:
      return "High";
    case Priority.medium:
      return "Medium";
    default:
      return "Low";
  }
}

export function getStatusLabel(status: Status): string {
  switch (status) {
    case Status.completed:
      return "Completed";
    case Status.inProgress:
      return "In Progress";
    case Status.overdue:
      return "Overdue";
    default:
      return "Pending";
  }
}
