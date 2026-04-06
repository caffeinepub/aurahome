# AuraHome

## Current State
Empty workspace — no backend or frontend exists yet.

## Requested Changes (Diff)

### Add
- Full-stack predictive home maintenance assistant app
- Backend: appliance registry, maintenance task tracking, health score calculation, AI-style suggestion generation
- Frontend: dashboard with KPI strip, appliance cards, upcoming tasks, predictive alerts, and AI insights

### Modify
- N/A

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- Data types: Appliance (id, name, category, brand, installDate, lastServiceDate, healthScore), MaintenanceTask (id, applianceId, title, dueDate, status, priority), Alert (id, applianceId, message, severity)
- CRUD for appliances and tasks
- Health score auto-calculation based on age and last service date
- Generate predictive maintenance suggestions based on appliance age/category
- Get upcoming tasks (sorted by due date)
- Get active alerts

### Frontend (React + Tailwind)
- Sidebar navigation: Dashboard, Appliances, Tasks, Alerts, Settings
- Dashboard page:
  - KPI strip: Overall Health, Active Alerts, Upcoming Tasks
  - Appliance cards grid with health progress bars and status pills
  - Upcoming Maintenance Tasks list
  - Predictive Alerts & AI Insights section
- Appliances page: add/edit/delete appliances
- Tasks page: view and complete tasks
- Authorization with Internet Identity login
