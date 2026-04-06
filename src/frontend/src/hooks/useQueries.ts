import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddApplianceRequest,
  AddMaintenanceTaskRequest,
  Alert,
  Appliance,
  DashboardStats,
  MaintenanceTask,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export type {
  Appliance,
  MaintenanceTask,
  Alert,
  DashboardStats,
  AddApplianceRequest,
  AddMaintenanceTaskRequest,
  UserProfile,
};

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats | null>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAppliances() {
  const { actor, isFetching } = useActor();
  return useQuery<Appliance[]>({
    queryKey: ["appliances"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAppliances();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetSortedUpcomingTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<MaintenanceTask[]>({
    queryKey: ["upcomingTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSortedUpcomingTasks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<MaintenanceTask[]>({
    queryKey: ["allTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMaintenanceTasks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlerts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useAddAppliance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: AddApplianceRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAppliance(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appliances"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteAppliance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applianceId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteAppliance(applianceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appliances"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAddMaintenanceTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: AddMaintenanceTaskRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addMaintenanceTask(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteMaintenanceTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMaintenanceTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useInsertTestData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.insertTestData();
      await Promise.all([
        actor.updateApplianceHealthScores(),
        actor.updateTaskStatuses(),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
