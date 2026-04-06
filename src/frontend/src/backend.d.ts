import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AddMaintenanceTaskRequest {
    status: Status;
    title: string;
    dueDate: bigint;
    description: string;
    priority: Priority;
    applianceId?: bigint;
}
export interface ApplianceSummary {
    totalAppliances: bigint;
    oldestAppliance?: Appliance;
    averageHealthScore: bigint;
    mostServicedAppliance?: Appliance;
}
export type ApplianceId = bigint;
export interface MaintenanceSummary {
    overdueTasks: bigint;
    totalTasks: bigint;
    completedTasks: bigint;
    upcomingTasks: bigint;
}
export interface UpdateMaintenanceTaskRequest {
    status: Status;
    title: string;
    dueDate: bigint;
    description: string;
    priority: Priority;
}
export interface DashboardStats {
    homeHealthScore: bigint;
    activeAlerts: bigint;
    upcomingTasks: bigint;
}
export interface MaintenanceTask {
    id: bigint;
    status: Status;
    title: string;
    dueDate: bigint;
    description: string;
    priority: Priority;
    applianceId: bigint;
}
export interface AddApplianceRequest {
    name: string;
    installDate: bigint;
    lastServiceDate: bigint;
    category: Category;
    brand: string;
}
export type TaskId = bigint;
export interface Appliance {
    id: bigint;
    name: string;
    installDate: bigint;
    lastServiceDate: bigint;
    category: Category;
    brand: string;
    healthScore: bigint;
}
export interface UpdateApplianceRequest {
    name: string;
    installDate: bigint;
    lastServiceDate: bigint;
    category: Category;
    brand: string;
}
export interface Alert {
    id: bigint;
    alertType: AlertType;
    createdAt: bigint;
    message: string;
}
export interface UserProfile {
    name: string;
}
export enum AlertType {
    warning = "warning",
    info = "info",
    critical = "critical"
}
export enum Category {
    other = "other",
    hvac = "hvac",
    plumbing = "plumbing",
    kitchen = "kitchen",
    electrical = "electrical",
    laundry = "laundry"
}
export enum Priority {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum Status {
    pending = "pending",
    completed = "completed",
    overdue = "overdue",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlert(message: string, alertType: AlertType): Promise<void>;
    addAppliance(request: AddApplianceRequest): Promise<ApplianceId>;
    addMaintenanceTask(request: AddMaintenanceTaskRequest): Promise<TaskId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint): Promise<void>;
    deleteAlert(alertId: bigint): Promise<void>;
    deleteAppliance(applianceId: bigint): Promise<void>;
    deleteMaintenanceTask(taskId: bigint): Promise<void>;
    getActiveAlertsCount(): Promise<bigint>;
    getAlertById(alertId: bigint): Promise<Alert>;
    getAlerts(): Promise<Array<Alert>>;
    getAlertsByDateRange(startDate: bigint, endDate: bigint): Promise<Array<Alert>>;
    getAlertsSortedBySeverity(): Promise<Array<Alert>>;
    getApplianceById(applianceId: bigint): Promise<Appliance>;
    getApplianceSummary(): Promise<ApplianceSummary>;
    getAppliances(): Promise<Array<Appliance>>;
    getAppliancesByCategory(category: Category): Promise<Array<Appliance>>;
    getAppliancesSortedByHealthScore(): Promise<Array<Appliance>>;
    getAppliancesSortedByName(): Promise<Array<Appliance>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCriticalAlerts(): Promise<Array<Alert>>;
    getDashboardStats(): Promise<DashboardStats>;
    getMaintenanceSummary(): Promise<MaintenanceSummary>;
    getMaintenanceTasks(): Promise<Array<MaintenanceTask>>;
    getOverdueTasks(): Promise<Array<MaintenanceTask>>;
    getPendingTasks(): Promise<Array<MaintenanceTask>>;
    getSortedUpcomingTasks(): Promise<Array<MaintenanceTask>>;
    getTaskById(taskId: bigint): Promise<MaintenanceTask>;
    getTasksByPriority(priority: Priority): Promise<Array<MaintenanceTask>>;
    getTasksByStatus(status: Status): Promise<Array<MaintenanceTask>>;
    getTasksForAppliance(applianceId: bigint): Promise<Array<MaintenanceTask>>;
    getTasksWithDueDateBetweenRange(startDate: bigint, endDate: bigint): Promise<Array<MaintenanceTask>>;
    getUpcomingTasks(): Promise<Array<MaintenanceTask>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    insertTestData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    resetUserData(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAppliance(applianceId: bigint, request: UpdateApplianceRequest): Promise<void>;
    updateApplianceHealthScores(): Promise<void>;
    updateMaintenanceTask(taskId: bigint, request: UpdateMaintenanceTaskRequest): Promise<void>;
    updateTaskStatuses(): Promise<void>;
}
