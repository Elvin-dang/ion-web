/**
 * Section 1 — Web · Admin CMS (Super Admin).
 *
 * Registers all Super Admin screens (groups 1.1–1.7 of the WBS). List/detail/
 * form sub-screens are reached via in-page navigation; one nav item per group.
 */
import type { AppRoute, NavItem } from '../../config/navTypes';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import MapIcon from '@mui/icons-material/Map';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import AssignmentIcon from '@mui/icons-material/Assignment';

import DashboardPage from './pages/DashboardPage';
import AssetUtilizationPage from './pages/AssetUtilizationPage';
import ReportsPage from './pages/ReportsPage';
import BuildingsPage from './pages/BuildingsPage';
import UsersPage from './pages/UsersPage';
import UserGroupFormPage from './pages/UserGroupFormPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import AssetClassificationPage from './pages/AssetClassificationPage';
import AssetTypesPage from './pages/AssetTypesPage';
import AssetTypeFormPage from './pages/AssetTypeFormPage';
import AssetsPage from './pages/AssetsPage';
import AssetFormPage from './pages/AssetFormPage';
import AssetDetailPage from './pages/AssetDetailPage';
import DrawingsPage from './pages/DrawingsPage';
import InventoryPage from './pages/InventoryPage';
import SparePartDetailPage from './pages/SparePartDetailPage';
import SparePartFormPage from './pages/SparePartFormPage';
import AdminRequestsWorkOrdersPage from './pages/AdminRequestsWorkOrdersPage';
import MaintenancePlansPage from './pages/MaintenancePlansPage';
import MaintenancePlanDetailPage from './pages/MaintenancePlanDetailPage';
import MaintenancePlanFormPage from './pages/MaintenancePlanFormPage';

const roles: ['super_admin'] = ['super_admin'];

export const adminRoutes: AppRoute[] = [
  // 1.4 Dashboard & Reporting
  { path: 'admin/dashboard', element: <DashboardPage /> },
  { path: 'admin/asset-utilization', element: <AssetUtilizationPage /> },
  { path: 'admin/reports', element: <ReportsPage /> },

  // 1.2 Building & Location Management (Buildings + Campus tabs in one module)
  { path: 'admin/buildings', element: <BuildingsPage /> },

  // 1.3 User Management
  { path: 'admin/users', element: <UsersPage /> },
  { path: 'admin/user-groups/new', element: <UserGroupFormPage /> },
  { path: 'admin/user-groups/:id', element: <UserGroupFormPage /> },
  { path: 'admin/account', element: <AccountSettingsPage /> },

  // 1.5 Asset Classification & Management
  { path: 'admin/asset-classification', element: <AssetClassificationPage /> },
  { path: 'admin/asset-types', element: <AssetTypesPage /> },
  { path: 'admin/asset-types/new', element: <AssetTypeFormPage /> },
  { path: 'admin/asset-types/:id', element: <AssetTypeFormPage /> },
  { path: 'admin/assets', element: <AssetsPage /> },
  { path: 'admin/assets/new', element: <AssetFormPage /> },
  { path: 'admin/assets/:id', element: <AssetDetailPage /> },
  { path: 'admin/assets/:id/edit', element: <AssetFormPage /> },
  { path: 'admin/drawings', element: <DrawingsPage /> },

  // 1.6 Inventory & Spare Part Management
  { path: 'admin/inventory', element: <InventoryPage /> },
  { path: 'admin/inventory/parts/new', element: <SparePartFormPage /> },
  { path: 'admin/inventory/parts/:id', element: <SparePartDetailPage /> },

  // Requests & Work Orders (merged section, two tabs, portal-wide read-only oversight)
  { path: 'admin/requests', element: <AdminRequestsWorkOrdersPage /> },
  { path: 'admin/work-orders', element: <AdminRequestsWorkOrdersPage /> },

  // 1.7 Maintenance Plan Management
  { path: 'admin/maintenance-plans', element: <MaintenancePlansPage /> },
  { path: 'admin/maintenance-plans/new', element: <MaintenancePlanFormPage /> },
  { path: 'admin/maintenance-plans/:id', element: <MaintenancePlanDetailPage /> },
  { path: 'admin/maintenance-plans/:id/edit', element: <MaintenancePlanFormPage /> },
];

export const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon />, roles },
  { label: 'Asset Utilization', path: '/admin/asset-utilization', icon: <InsightsIcon />, roles },
  { label: 'Reports', path: '/admin/reports', icon: <AssessmentIcon />, roles },
  { label: 'Building Management', path: '/admin/buildings', icon: <ApartmentIcon />, roles },
  { label: 'Users & Roles', path: '/admin/users', icon: <PeopleIcon />, roles },
  // --- Asset Management group (Asset Systems / Asset Types / Assets kept adjacent) ---
  { label: 'Asset Systems', path: '/admin/asset-classification', icon: <CategoryIcon />, roles },
  { label: 'Asset Types', path: '/admin/asset-types', icon: <LabelIcon />, roles },
  { label: 'Assets', path: '/admin/assets', icon: <DevicesOtherIcon />, roles },
  { label: 'Drawings', path: '/admin/drawings', icon: <MapIcon />, roles },
  { label: 'Inventory', path: '/admin/inventory', icon: <Inventory2Icon />, roles },
  { label: 'Requests & Work Orders', path: '/admin/requests', match: ['/admin/work-orders'], icon: <AssignmentIcon />, roles },
  { label: 'Maintenance Plans', path: '/admin/maintenance-plans', icon: <EventRepeatIcon />, roles },
  // Account Settings intentionally NOT in nav — reachable from profile menu only.
];
