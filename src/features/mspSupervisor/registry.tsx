/**
 * Section 5 — Web · MSP Supervisor Portal.
 *
 * Consolidates the 27 features (groups 5.1–5.5) into real screens, registered
 * under the "msp/..." route prefix with one nav item per group.
 *
 *  5.1 Authentication & Dashboard → Dashboard + Account Settings
 *      (Login/Logout/Forgot Password/Language are global; MSP-specific
 *       dashboard, profile, language & sign-out live here).
 *  5.2 User Management            → MSP Technician list (create/edit/deactivate/resend)
 *  5.3 Request Management         → WO list (table/kanban), create ad-hoc WO,
 *                                   WO detail (assign, sign-off, reject,
 *                                   approve/decline tech request, resubmit,
 *                                   spare-parts pre-request)
 *  5.4 Asset & Inventory (R/O)    → Asset list/detail, drawing tags,
 *                                   spare-part list/detail
 *  5.5 Maintenance Plan Mgmt      → Plan list, create, detail (rounds/assets/
 *                                   WOs + history), edit, resubmit
 */
import type { AppRoute, NavItem } from '../../config/navTypes';

import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InventoryIcon from '@mui/icons-material/Inventory2';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';

import DashboardScreen from './screens/DashboardScreen';
import AccountSettingsScreen from './screens/AccountSettingsScreen';
import TechnicianListScreen from './screens/TechnicianListScreen';
import WorkOrderListScreen from './screens/WorkOrderListScreen';
import CreateWorkOrderScreen from './screens/CreateWorkOrderScreen';
import WorkOrderDetailScreen from './screens/WorkOrderDetailScreen';
import AssetListScreen from './screens/AssetListScreen';
import AssetDetailScreen from './screens/AssetDetailScreen';
import AssetDrawingScreen from './screens/AssetDrawingScreen';
import SparePartListScreen from './screens/SparePartListScreen';
import SparePartDetailScreen from './screens/SparePartDetailScreen';
import MaintenancePlanListScreen from './screens/MaintenancePlanListScreen';
import CreateMaintenancePlanScreen from './screens/CreateMaintenancePlanScreen';
import MaintenancePlanDetailScreen from './screens/MaintenancePlanDetailScreen';

export const mspSupervisorRoutes: AppRoute[] = [
  // 5.1
  { path: 'msp/dashboard', element: <DashboardScreen /> },
  { path: 'msp/account-settings', element: <AccountSettingsScreen /> },
  // 5.2
  { path: 'msp/technicians', element: <TechnicianListScreen /> },
  // 5.3
  { path: 'msp/work-orders', element: <WorkOrderListScreen /> },
  { path: 'msp/work-orders/open', element: <WorkOrderListScreen scope="open" /> },
  { path: 'msp/work-orders/closed', element: <WorkOrderListScreen scope="closed" /> },
  { path: 'msp/work-orders/new', element: <CreateWorkOrderScreen /> },
  { path: 'msp/work-orders/:id', element: <WorkOrderDetailScreen /> },
  // 5.4 (read-only)
  { path: 'msp/assets', element: <AssetListScreen /> },
  { path: 'msp/assets/drawing', element: <AssetDrawingScreen /> },
  { path: 'msp/assets/:id', element: <AssetDetailScreen /> },
  { path: 'msp/inventory', element: <SparePartListScreen /> },
  { path: 'msp/inventory/:id', element: <SparePartDetailScreen /> },
  // 5.5
  { path: 'msp/maintenance-plans', element: <MaintenancePlanListScreen /> },
  { path: 'msp/maintenance-plans/new', element: <CreateMaintenancePlanScreen /> },
  { path: 'msp/maintenance-plans/:id', element: <MaintenancePlanDetailScreen /> },
];

export const mspSupervisorNav: NavItem[] = [
  { label: 'Dashboard', path: '/msp/dashboard', icon: <DashboardIcon />, roles: ['msp_supervisor'] },
  { label: 'Technicians', path: '/msp/technicians', icon: <EngineeringIcon />, roles: ['msp_supervisor'] },
  { label: 'Open Work Orders', path: '/msp/work-orders/open', icon: <AssignmentIcon />, roles: ['msp_supervisor'] },
  { label: 'Closed Work Orders', path: '/msp/work-orders/closed', icon: <AssignmentTurnedInIcon />, roles: ['msp_supervisor'] },
  { label: 'Assets & Inventory', path: '/msp/assets', icon: <InventoryIcon />, roles: ['msp_supervisor'] },
  { label: 'Maintenance Plans', path: '/msp/maintenance-plans', icon: <EventRepeatIcon />, roles: ['msp_supervisor'] },
];
