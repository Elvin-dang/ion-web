/**
 * Section 3 — Web · Building Manager Portal.
 *
 * Registers all Building Manager screens (groups 3.1 - 3.7) as nested routes
 * under the protected layout, plus one sidebar entry per functional group.
 * Role: building_manager. Route prefix: bm/...  Home: bm/dashboard.
 */
import type { AppRoute, NavItem } from '../../config/navTypes';

import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import ArchitectureIcon from '@mui/icons-material/Architecture';

import DashboardPage from './pages/DashboardPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import UsersPage from './pages/UsersPage';
import RequestsWorkOrdersPage from './pages/RequestsWorkOrdersPage';
import RequestDetailPage from './pages/RequestDetailPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import AssetListPage from './pages/AssetListPage';
import AssetDetailPage from './pages/AssetDetailPage';
import SparePartListPage from './pages/SparePartListPage';
import SparePartDetailPage from './pages/SparePartDetailPage';
import StockTransactionsPage from './pages/StockTransactionsPage';
import UnavailableRequestsPage from './pages/UnavailableRequestsPage';
import MaintenancePlanListPage from './pages/MaintenancePlanListPage';
import MaintenancePlanDetailPage from './pages/MaintenancePlanDetailPage';
import DrawingsPage from './pages/DrawingsPage';

export const buildingManagerRoutes: AppRoute[] = [
  // 3.1 Authentication & Dashboard
  { path: 'bm/dashboard', element: <DashboardPage /> },
  { path: 'bm/account-settings', element: <AccountSettingsPage /> },
  // 3.2 User Management
  { path: 'bm/users', element: <UsersPage /> },
  // 3.3 + 3.4 Requests & Work Orders (merged section, two tabs, shared nav entry)
  { path: 'bm/requests', element: <RequestsWorkOrdersPage /> },
  { path: 'bm/requests/:id', element: <RequestDetailPage /> },
  { path: 'bm/work-orders', element: <RequestsWorkOrdersPage /> },
  { path: 'bm/work-orders/:id', element: <WorkOrderDetailPage /> },
  // 3.5 Asset Management
  { path: 'bm/assets', element: <AssetListPage /> },
  { path: 'bm/assets/:id', element: <AssetDetailPage /> },
  // Drawings (as-built floor drawings)
  { path: 'bm/drawings', element: <DrawingsPage /> },
  // 3.6 Inventory & Spare Part Management
  { path: 'bm/spare-parts', element: <SparePartListPage /> },
  { path: 'bm/spare-parts/:id', element: <SparePartDetailPage /> },
  { path: 'bm/stock-transactions', element: <StockTransactionsPage /> },
  { path: 'bm/unavailable-requests', element: <UnavailableRequestsPage /> },
  // 3.7 Maintenance Plan Management
  { path: 'bm/maintenance-plans', element: <MaintenancePlanListPage /> },
  { path: 'bm/maintenance-plans/:id', element: <MaintenancePlanDetailPage /> },
];

export const buildingManagerNav: NavItem[] = [
  { label: 'Dashboard', path: '/bm/dashboard', icon: <DashboardIcon />, roles: ['building_manager'] },
  { label: 'Users', path: '/bm/users', icon: <GroupIcon />, roles: ['building_manager'] },
  {
    label: 'Requests & Work Orders',
    path: '/bm/requests',
    match: ['/bm/work-orders'],
    icon: <AssignmentIcon />,
    roles: ['building_manager'],
  },
  { label: 'Assets', path: '/bm/assets', icon: <PrecisionManufacturingIcon />, roles: ['building_manager'] },
  { label: 'Drawings', path: '/bm/drawings', icon: <ArchitectureIcon />, roles: ['building_manager'] },
  { label: 'Inventory', path: '/bm/spare-parts', icon: <Inventory2Icon />, roles: ['building_manager'] },
  { label: 'Maintenance Plans', path: '/bm/maintenance-plans', icon: <EventRepeatIcon />, roles: ['building_manager'] },
];
