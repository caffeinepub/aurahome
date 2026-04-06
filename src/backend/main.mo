import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Authorization "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Appliance {
    public func compareByName(a : Appliance, b : Appliance) : Order.Order {
      Text.compare(a.name, b.name);
    };

    public func compareByHealthScore(a : Appliance, b : Appliance) : Order.Order {
      Int.compare(b.healthScore, a.healthScore);
    };

    public func compareByCategory(a : Appliance, b : Appliance) : Order.Order {
      switch (Text.compare(Category.toText(a.category), Category.toText(b.category))) {
        case (#equal) { compareByName(a, b) };
        case (order) { order };
      };
    };
  };

  module MaintenanceTask {
    public func compare(task1 : MaintenanceTask, task2 : MaintenanceTask) : Order.Order {
      if (task1.status == task2.status) {
        Int.compare(task1.dueDate, task2.dueDate);
      } else {
        Status.compare(task1.status, task2.status);
      };
    };

    public func compareByPriority(task1 : MaintenanceTask, task2 : MaintenanceTask) : Order.Order {
      Priority.compare(task1.priority, task2.priority);
    };

    public func compareByDueDate(task1 : MaintenanceTask, task2 : MaintenanceTask) : Order.Order {
      Int.compare(task1.dueDate, task2.dueDate);
    };
  };

  module Alert {
    public func compareBySeverity(a : Alert, b : Alert) : Order.Order {
      AlertType.compare(a.alertType, b.alertType);
    };

    public func compare(alert1 : Alert, alert2 : Alert) : Order.Order {
      switch (compareBySeverity(alert1, alert2)) {
        case (#equal) { compareByDate(alert1, alert2) };
        case (order) { order };
      };
    };

    public func compareByDate(a1 : Alert, a2 : Alert) : Order.Order {
      Int.compare(a1.createdAt, a2.createdAt);
    };
  };

  public type Appliance = {
    id : Nat;
    name : Text;
    category : Category;
    brand : Text;
    installDate : Int;
    lastServiceDate : Int;
    healthScore : Int;
  };

  public type MaintenanceTask = {
    id : Nat;
    applianceId : Nat;
    title : Text;
    description : Text;
    dueDate : Int;
    priority : Priority;
    status : Status;
  };

  public type Alert = {
    id : Nat;
    message : Text;
    alertType : AlertType;
    createdAt : Int;
  };

  public type Category = {
    #hvac;
    #plumbing;
    #electrical;
    #kitchen;
    #laundry;
    #other;
  };

  module Category {
    public func compare(cat1 : Category, cat2 : Category) : Order.Order {
      Category.compare(cat1, cat2);
    };

    public func toText(cat : Category) : Text {
      switch (cat) {
        case (#hvac) { "HVAC" };
        case (#plumbing) { "Plumbing" };
        case (#electrical) { "Electrical" };
        case (#kitchen) { "Kitchen" };
        case (#laundry) { "Laundry" };
        case (#other) { "Other" };
      };
    };
  };

  public type Priority = {
    #low;
    #medium;
    #high;
    #critical;
  };

  module Priority {
    public func compare(priorityA : Priority, priorityB : Priority) : Order.Order {
      Nat.compare(toNat(priorityA), toNat(priorityB));
    };

    public func toNat(priority : Priority) : Nat {
      switch (priority) {
        case (#low) { 0 };
        case (#medium) { 1 };
        case (#high) { 2 };
        case (#critical) { 3 };
      };
    };

    public func fromNat(n : Nat) : Priority {
      switch (n) {
        case (0) { #low };
        case (1) { #medium };
        case (2) { #high };
        case (3) { #critical };
        case (_) { #low };
      };
    };
  };

  public type Status = {
    #pending;
    #inProgress;
    #completed;
    #overdue;
  };

  module Status {
    public func compare(statusA : Status, statusB : Status) : Order.Order {
      Nat.compare(toNat(statusA), toNat(statusB));
    };

    public func toNat(status : Status) : Nat {
      switch (status) {
        case (#pending) { 0 };
        case (#inProgress) { 1 };
        case (#completed) { 2 };
        case (#overdue) { 3 };
      };
    };
  };

  public type AlertType = {
    #info;
    #warning;
    #critical;
  };

  module AlertType {
    public func compare(typeA : AlertType, typeB : AlertType) : Order.Order {
      Nat.compare(toNat(typeA), toNat(typeB));
    };

    public func toNat(alertType : AlertType) : Nat {
      switch (alertType) {
        case (#info) { 0 };
        case (#warning) { 1 };
        case (#critical) { 2 };
      };
    };
  };

  public type DashboardStats = {
    homeHealthScore : Int;
    activeAlerts : Nat;
    upcomingTasks : Nat;
  };

  public type MaintenanceSummary = {
    totalTasks : Nat;
    completedTasks : Nat;
    overdueTasks : Nat;
    upcomingTasks : Nat;
  };

  public type ApplianceSummary = {
    totalAppliances : Nat;
    averageHealthScore : Int;
    oldestAppliance : ?Appliance;
    mostServicedAppliance : ?Appliance;
  };

  public type UserId = Principal;
  public type ApplianceId = Nat;
  public type TaskId = Nat;
  public type AlertId = Nat;

  public type UserData = {
    appliances : Map.Map<ApplianceId, Appliance>;
    maintenanceTasks : Map.Map<TaskId, MaintenanceTask>;
    alerts : Map.Map<AlertId, Alert>;
    var nextApplianceId : Nat;
    var nextTaskId : Nat;
    var nextAlertId : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  let userDataMap = Map.empty<UserId, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let currentTime = Time.now();

  let accessControlState = Authorization.initState();
  include MixinAuthorization(accessControlState);

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user: Principal) : async ?UserProfile {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getTimeSinceInstall(installDate : Int) : Int {
    let days = (currentTime - installDate) / (24 * 60 * 60 * 1000 * 1_000_000);
    days;
  };

  func getTimeSinceLastService(lastServiceDate : Int) : Int {
    let days = (currentTime - lastServiceDate) / (24 * 60 * 60 * 1000 * 1_000_000);
    days;
  };

  func calculateApplianceHealthScore(installDate : Int, lastServiceDate : Int) : Int {
    let ageInDays = getTimeSinceInstall(installDate);
    let daysSinceService = getTimeSinceLastService(lastServiceDate);

    let ageFactor = if (ageInDays > 3650) { 50 } else {
      100 - ((ageInDays / 365) * 5);
    };

    let serviceFactor = if (daysSinceService > 365) { 50 } else {
      100 - ((daysSinceService / 30) * 2);
    };

    Int.min(100, Int.max(0, (ageFactor + serviceFactor) / 2));
  };

  func ensureUserDataExists(caller : Principal) {
    switch (userDataMap.get(caller)) {
      case (null) {
        let newUserData : UserData = {
          appliances = Map.empty<ApplianceId, Appliance>();
          maintenanceTasks = Map.empty<TaskId, MaintenanceTask>();
          alerts = Map.empty<AlertId, Alert>();
          var nextApplianceId = 0;
          var nextTaskId = 0;
          var nextAlertId = 0;
        };
        userDataMap.add(caller, newUserData);
      };
      case (?_) { /* already exists */ };
    };
  };

  func getUserDataInternal(
    caller : Principal,
    user : Principal,
  ) : UserData {
    ensureUserDataExists(caller);
    if (caller == user) {
      switch (userDataMap.get(user)) {
        case (null) { Runtime.trap("User data does not exist. There must be a system bug."); };
        case (?userData) { userData };
      };
    } else {
      Runtime.trap("Visibility of other users data not implemented yet.
                               Keep private until there is a business-need to make this available.");
    };
  };

  public type AddApplianceRequest = {
    name : Text;
    category : Category;
    brand : Text;
    installDate : Int;
    lastServiceDate : Int;
  };

  public type UpdateApplianceRequest = {
    name : Text;
    category : Category;
    brand : Text;
    installDate : Int;
    lastServiceDate : Int;
  };

  public type AddMaintenanceTaskRequest = {
    applianceId : ?Nat;
    title : Text;
    description : Text;
    dueDate : Int;
    priority : Priority;
    status : Status;
  };

  public type UpdateMaintenanceTaskRequest = {
    title : Text;
    description : Text;
    dueDate : Int;
    priority : Priority;
    status : Status;
  };

  func getApplianceFromUserData(userData : UserData, applianceId : ApplianceId) : Appliance {
    switch (userData.appliances.get(applianceId)) {
      case (null) { Runtime.trap("Appliance not found for user") };
      case (?appliance) { appliance };
    };
  };

  func getTaskFromUserData(userData : UserData, taskId : TaskId) : MaintenanceTask {
    switch (userData.maintenanceTasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found for user") };
      case (?task) { task };
    };
  };

  func getAlertFromUserData(userData : UserData, alertId : AlertId) : Alert {
    switch (userData.alerts.get(alertId)) {
      case (null) { Runtime.trap("Alert not found for user") };
      case (?alert) { alert };
    };
  };

  public query ({ caller }) func getAppliances() : async [Appliance] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliances");
    };
    getUserDataInternal(caller, caller).appliances.values().toArray();
  };

  public query ({ caller }) func getAppliancesSortedByName() : async [Appliance] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliances");
    };
    let appliances = getUserDataInternal(caller, caller).appliances.values().toArray();
    appliances.sort(Appliance.compareByName);
  };

  public query ({ caller }) func getAppliancesByCategory(category : Category) : async [Appliance] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliances");
    };
    let appliances = getUserDataInternal(caller, caller).appliances.values().toArray();
    appliances.filter(func(a) { a.category == category });
  };

  public query ({ caller }) func getAppliancesSortedByHealthScore() : async [Appliance] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliances");
    };
    let appliances = getUserDataInternal(caller, caller).appliances.values().toArray();
    appliances.sort(Appliance.compareByHealthScore);
  };

  public query ({ caller }) func getMaintenanceTasks() : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
  };

  public query ({ caller }) func getTasksByPriority(priority : Priority) : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.priority == priority });
  };

  public query ({ caller }) func getUpcomingTasks() : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.dueDate > currentTime and t.status == #pending });
  };

  public query ({ caller }) func getTasksByStatus(status : Status) : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.status == status });
  };

  public query ({ caller }) func getPendingTasks() : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.status == #pending });
  };

  public query ({ caller }) func getSortedUpcomingTasks() : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.sort(MaintenanceTask.compareByDueDate);
  };

  public query ({ caller }) func getOverdueTasks() : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.status == #overdue });
  };

  public query ({ caller }) func getTasksWithDueDateBetweenRange(startDate : Int, endDate : Int) : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.dueDate >= startDate and t.dueDate <= endDate });
  };

  public query ({ caller }) func getTasksForAppliance(applianceId : Nat) : async [MaintenanceTask] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks.values().toArray();
    tasks.filter(func(t) { t.applianceId == applianceId });
  };

  public query ({ caller }) func getAlerts() : async [Alert] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    getUserDataInternal(caller, caller).alerts.values().toArray();
  };

  public query ({ caller }) func getCriticalAlerts() : async [Alert] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    let alerts = getUserDataInternal(caller, caller).alerts.values().toArray();
    alerts.filter(func(a) { a.alertType == #critical });
  };

  public query ({ caller }) func getAlertsByDateRange(startDate : Int, endDate : Int) : async [Alert] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    let alerts = getUserDataInternal(caller, caller).alerts.values().toArray();
    alerts.filter(func(a) { a.createdAt >= startDate and a.createdAt <= endDate });
  };

  public query ({ caller }) func getAlertsSortedBySeverity() : async [Alert] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    let alerts = getUserDataInternal(caller, caller).alerts.values().toArray();
    alerts.sort(Alert.compareBySeverity);
  };

  public query ({ caller }) func getActiveAlertsCount() : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    getUserDataInternal(caller, caller).alerts.size();
  };

  public query ({ caller }) func getApplianceById(applianceId : Nat) : async Appliance {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliances");
    };
    getApplianceFromUserData(getUserDataInternal(caller, caller), applianceId);
  };

  public query ({ caller }) func getTaskById(taskId : Nat) : async MaintenanceTask {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance tasks");
    };
    getTaskFromUserData(getUserDataInternal(caller, caller), taskId);
  };

  public query ({ caller }) func getAlertById(alertId : Nat) : async Alert {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access alerts");
    };
    getAlertFromUserData(getUserDataInternal(caller, caller), alertId);
  };

  public shared ({ caller }) func addAppliance(request : AddApplianceRequest) : async ApplianceId {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add appliances");
    };
    let healthScore = calculateApplianceHealthScore(request.installDate, request.lastServiceDate);

    var newAppliance : Appliance = {
      id = 0;
      name = request.name;
      category = request.category;
      brand = request.brand;
      installDate = request.installDate;
      lastServiceDate = request.lastServiceDate;
      healthScore;
    };

    let (userData, applianceId) = getNewUserDataWithIdAndUpdateNextId(caller, "appliance");
    newAppliance := { newAppliance with id = applianceId };
    userData.appliances.add(applianceId, newAppliance);
    applianceId;
  };

  public shared ({ caller }) func updateAppliance(applianceId : Nat, request : UpdateApplianceRequest) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update appliances");
    };
    let userData = getUserDataInternal(caller, caller);
    let existingAppliance = getApplianceFromUserData(userData, applianceId);

    let updatedAppliance : Appliance = {
      id = applianceId;
      name = request.name;
      category = request.category;
      brand = request.brand;
      installDate = request.installDate;
      lastServiceDate = request.lastServiceDate;
      healthScore = calculateApplianceHealthScore(request.installDate, request.lastServiceDate);
    };

    userData.appliances.add(applianceId, updatedAppliance);
  };

  public shared ({ caller }) func deleteAppliance(applianceId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete appliances");
    };
    getUserDataInternal(caller, caller).appliances.remove(applianceId);
  };

  public shared ({ caller }) func addMaintenanceTask(request : AddMaintenanceTaskRequest) : async TaskId {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add maintenance tasks");
    };
    if (request.applianceId == null) { Runtime.trap("ApplianceID must not be null and must reference an existing appliance for ordinary maintenance tasks") };
    switch (request.applianceId) {
      case (null) { Runtime.trap("ApplianceID must not be null") };
      case (?applianceId) {
        var task : MaintenanceTask = {
          id = 0;
          applianceId;
          title = request.title;
          description = request.description;
          dueDate = request.dueDate;
          priority = request.priority;
          status = request.status;
        };

        let (userData, taskId) = getNewUserDataWithIdAndUpdateNextId(caller, "task");
        task := { task with id = taskId };
        userData.maintenanceTasks.add(taskId, task);
        taskId;
      };
    };
  };

  public shared ({ caller }) func updateMaintenanceTask(taskId : Nat, request : UpdateMaintenanceTaskRequest) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update maintenance tasks");
    };
    let userData = getUserDataInternal(caller, caller);
    let existingTask = getTaskFromUserData(userData, taskId);

    let updatedTask : MaintenanceTask = {
      id = taskId;
      applianceId = existingTask.applianceId;
      title = request.title;
      description = request.description;
      dueDate = request.dueDate;
      priority = request.priority;
      status = request.status;
    };

    userData.maintenanceTasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func deleteMaintenanceTask(taskId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete maintenance tasks");
    };
    getUserDataInternal(caller, caller).maintenanceTasks.remove(taskId);
  };

  public shared ({ caller }) func completeTask(taskId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };
    let userData = getUserDataInternal(caller, caller);
    let existingTask = getTaskFromUserData(userData, taskId);

    let completedTask : MaintenanceTask = {
      id = taskId;
      applianceId = existingTask.applianceId;
      title = existingTask.title;
      description = existingTask.description;
      dueDate = Time.now();
      priority = existingTask.priority;
      status = #completed;
    };

    userData.maintenanceTasks.add(taskId, completedTask);
  };

  public shared ({ caller }) func addAlert(message : Text, alertType : AlertType) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add alerts");
    };
    var alert : Alert = {
      id = 0;
      message;
      alertType;
      createdAt = Time.now();
    };

    let (userData, alertId) = getNewUserDataWithIdAndUpdateNextId(caller, "alert");
    alert := { alert with id = alertId };
    userData.alerts.add(alertId, alert);
  };

  public shared ({ caller }) func deleteAlert(alertId : Nat) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete alerts");
    };
    getUserDataInternal(caller, caller).alerts.remove(alertId);
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access dashboard stats");
    };
    let userData = getUserDataInternal(caller, caller);

    let totalHealthScore = userData.appliances.values().toArray().foldLeft<Appliance, Int>(
      0,
      func(acc, a) { acc + a.healthScore },
    );

    let totalAppliances = userData.appliances.size();
    let healthScore = if (totalAppliances > 0) {
      totalHealthScore / totalAppliances.toInt();
    } else { 100 };

    let activeAlerts = userData.alerts.size();

    let upcomingTasks = userData.maintenanceTasks.values().toArray().filter(
      func(t) { t.dueDate > currentTime and t.status == #pending }
    ).size();

    {
      homeHealthScore = healthScore;
      activeAlerts;
      upcomingTasks;
    };
  };

  public query ({ caller }) func getMaintenanceSummary() : async MaintenanceSummary {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access maintenance summary");
    };
    let tasks = getUserDataInternal(caller, caller).maintenanceTasks;

    let totalTasks = tasks.size();
    let completedTasks = tasks.values().toArray().filter(func(t) { t.status == #completed }).size();
    let overdueTasks = tasks.values().toArray().filter(func(t) { t.status == #overdue }).size();
    let upcomingTasks = tasks.values().toArray().filter(func(t) { t.dueDate > currentTime and t.status == #pending }).size();

    {
      totalTasks;
      completedTasks;
      overdueTasks;
      upcomingTasks;
    };
  };

  public query ({ caller }) func getApplianceSummary() : async ApplianceSummary {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access appliance summary");
    };
    let appliances = getUserDataInternal(caller, caller).appliances;

    let totalAppliances = appliances.size();
    let averageHealthScore = if (totalAppliances > 0) {
      appliances.values().toArray().foldLeft<Appliance, Int>(0, func(acc, a) { acc + a.healthScore }) / totalAppliances.toInt();
    } else { 100 };

    let oldestAppliance = findOldestAppliance(appliances);
    let mostServicedAppliance = findMostServicedAppliance(appliances);

    {
      totalAppliances;
      averageHealthScore;
      oldestAppliance;
      mostServicedAppliance;
    };
  };

  func findOldestAppliance(appliances : Map.Map<ApplianceId, Appliance>) : ?Appliance {
    let applianceArray = appliances.values().toArray();
    if (applianceArray.size() == 0) { return null };

    var oldest : ?Appliance = null;
    for (appliance in applianceArray.values()) {
      oldest := switch (oldest) {
        case (null) { ?appliance };
        case (?currentOldest) {
          if (appliance.installDate < currentOldest.installDate) {
            ?appliance;
          } else { oldest };
        };
      };
    };
    oldest;
  };

  func findMostServicedAppliance(appliances : Map.Map<ApplianceId, Appliance>) : ?Appliance {
    let applianceArray = appliances.values().toArray();
    if (applianceArray.size() == 0) { return null };

    var mostServiced : ?Appliance = null;
    for (appliance in applianceArray.values()) {
      mostServiced := switch (mostServiced) {
        case (null) { ?appliance };
        case (?currentMostServiced) {
          if (appliance.lastServiceDate > currentMostServiced.lastServiceDate) {
            ?appliance;
          } else { mostServiced };
        };
      };
    };
    mostServiced;
  };

  public shared ({ caller }) func updateApplianceHealthScores() : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update health scores");
    };
    let userData = getUserDataInternal(caller, caller);

    for ((id, appliance) in userData.appliances.entries()) {
      let healthScore = calculateApplianceHealthScore(appliance.installDate, appliance.lastServiceDate);
      let updatedAppliance : Appliance = {
        id = id;
        name = appliance.name;
        category = appliance.category;
        brand = appliance.brand;
        installDate = appliance.installDate;
        lastServiceDate = appliance.lastServiceDate;
        healthScore;
      };
      userData.appliances.add(id, updatedAppliance);
    };
  };

  public shared ({ caller }) func updateTaskStatuses() : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task statuses");
    };
    let userData = getUserDataInternal(caller, caller);

    for ((id, task) in userData.maintenanceTasks.entries()) {
      if (task.dueDate < currentTime and task.status != #completed) {
        let updatedTask : MaintenanceTask = {
          id = id;
          applianceId = task.applianceId;
          title = task.title;
          description = task.description;
          dueDate = task.dueDate;
          priority = task.priority;
          status = #overdue;
        };
        userData.maintenanceTasks.add(id, updatedTask);
      };
    };
  };

  func getNewUserDataWithIdAndUpdateNextId(caller : Principal, idType : Text) : (UserData, Nat) {
    ensureUserDataExists(caller);
    switch (userDataMap.get(caller)) {
      case (null) { Runtime.trap("User data should exist after ensureUserDataExists") };
      case (?userData) {
        let id = switch (idType) {
          case ("appliance") { userData.nextApplianceId };
          case ("task") { userData.nextTaskId };
          case ("alert") { userData.nextAlertId };
          case (_) { 0 };
        };

        switch (idType) {
          case ("appliance") {
            userData.nextApplianceId += 1;
          };
          case ("task") {
            userData.nextTaskId += 1;
          };
          case ("alert") {
            userData.nextAlertId += 1;
          };
          case (_) {};
        };
        (userData, id);
      };
    };
  };

  public shared ({ caller }) func resetUserData() : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset user data");
    };
    switch (userDataMap.get(caller)) {
      case (null) { Runtime.trap("No user data for this caller.") };
      case (?userData) {
        userData.maintenanceTasks.clear();
        userData.appliances.clear();
        userData.alerts.clear();
      };
    };
  };

  public shared ({ caller }) func insertTestData() : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can insert test data");
    };
    let testAppliance1 : Appliance = {
      id = 0;
      name = "Test";
      category = #kitchen;
      brand = "TestBrand";
      installDate = 0;
      lastServiceDate = 0;
      healthScore = 0;
    };

    let testAppliance2 : Appliance = {
      id = 0;
      name = "Test";
      category = #other;
      brand = "TestBrand";
      installDate = 0;
      lastServiceDate = 0;
      healthScore = 0;
    };

    let testUserData : UserData = {
      appliances = Map.empty<ApplianceId, Appliance>();
      maintenanceTasks = Map.empty<TaskId, MaintenanceTask>();
      alerts = Map.empty<AlertId, Alert>();
      var nextApplianceId = 0;
      var nextTaskId = 0;
      var nextAlertId = 0;
    };

    testUserData.appliances.add(0, testAppliance1);
    testUserData.appliances.add(1, testAppliance2);
    userDataMap.add(caller, testUserData);
  };
};
