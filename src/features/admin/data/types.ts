/**
 * Shared domain types for the Admin CMS (Super Admin) section.
 * Mock-data only — no backend. Mirrors the WBS Feature Checklist field sets.
 */

export type ActiveStatus = 'Active' | 'Inactive';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';
export type RoleName = 'Super Admin' | 'Building Manager' | 'MSP Supervisor' | 'MSP Technician';
export type Frequency = 'Monthly' | 'Quarterly' | 'Yearly';
export type PlanStatus = 'Active' | 'Inactive' | 'Pending' | 'Cancelled' | 'Approval Rejected';
export type WoStatus =
  | 'Pending'
  | 'Pending - Unassigned'
  | 'Assigned'
  | 'Started'
  | 'Completed'
  | 'Verified'
  | 'Closed'
  | 'Cancelled';

export interface AreaUnit {
  id: string;
  name: string;
  type: 'Area' | 'Unit';
}

export interface Floor {
  id: string;
  name: string;
  areas: AreaUnit[];
  /** As-built drawings are per-floor: a floor may have its own uploaded drawing. */
  hasDrawing?: boolean;
  drawingName?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  status: ActiveStatus;
  floors: Floor[];
  /** Derived/legacy: true if any floor has a drawing. */
  hasDrawing: boolean;
  /** Building-level tenant sign-off configuration toggle. */
  tenantSignOffEnabled?: boolean;
  /** Building Managers assigned to this building. */
  managerIds?: string[];
  /** MSP Supervisors assigned to this building (with their group / systems in scope). */
  supervisorIds?: string[];
}

export interface AppRole {
  id: string;
  name: RoleName;
  description: string;
  scope: string;
  permissions: string[];
}

/** A single Asset Config scope entry at System / Sub-system / Type granularity. */
export interface AssetScopeEntry {
  id: string;
  systemId: string;
  /** '' or 'All' means all sub-systems under the system. */
  subsystemId: string;
  /** '' or 'All' means all types under the sub-system. */
  typeId: string;
}

/** A single Location Config scope entry at Building / Floor / Area(Unit) granularity. */
export interface LocationScopeEntry {
  id: string;
  buildingId: string;
  /** '' or 'All' means all floors. */
  floorId: string;
  /** '' or 'All' means all areas/units on the floor. */
  areaId: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  status: ActiveStatus;
  buildingIds: string[];
  systemIds: string[];
  memberIds: string[];
  /** Asset Config entries (System / Sub-system / Type). */
  assetScopes?: AssetScopeEntry[];
  /** Location Config entries (Building / Floor / Area). */
  locationScopes?: LocationScopeEntry[];
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  phone?: string;
  level?: string;
  createdAt: string;
  buildingIds: string[];
  groupId?: string;
  /** Work shift, e.g. 'Day (08:00-17:00)'. */
  workShift?: string;
  /** Team name. */
  team?: string;
  /** Avatar image URL (or empty → initials fallback). */
  avatarUrl?: string;
}

export interface AssetSystem {
  id: string;
  name: string;
  code: string;
  status: ActiveStatus;
  createdAt: string;
}

export interface AssetSubsystem {
  id: string;
  name: string;
  code: string;
  status: ActiveStatus;
  systemId: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  description: 'Off' | 'Optional' | 'Required';
  photos: 'Off' | 'Optional' | 'Required';
}

export interface AssetType {
  id: string;
  name: string;
  code: string;
  systemId: string;
  subsystemId: string;
  status: ActiveStatus;
  createdAt: string;
  checklist: ChecklistItem[];
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  systemId: string;
  subsystemId: string;
  typeId: string;
  buildingId: string;
  floorId: string;
  areaId?: string;
  model?: string;
  serial?: string;
  brand?: string;
  purchaseDate?: string;
  manufacturedDate?: string;
  status: ActiveStatus;
  createdAt: string;
}

export interface SparePartCategory {
  id: string;
  name: string;
  code: string;
  uom: string;
  description: string;
}

export interface StockHistoryEntry {
  id: string;
  date: string;
  action: 'Stock-In' | 'Stock-Out' | 'Reserved' | 'Released';
  quantity: number;
  reference: string;
  recordedBy: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  systemId: string;
  subsystemId: string;
  typeId: string;
  brand?: string;
  model?: string;
  serial?: string;
  storeRoom: string;
  department?: string;
  origin?: string;
  /** Physical location of the spare part (building / store). */
  location?: string;
  totalStock: number;
  onHold: number;
  minThreshold: number;
  status: ActiveStatus;
  createdAt: string;
  purchaseDate?: string;
  yearOfManufacture?: string;
  warrantyExpiry?: string;
  specification?: string;
  history: StockHistoryEntry[];
}

export interface StockInRecord {
  id: string;
  date: string;
  partId: string;
  quantity: number;
  reference: string;
  recordedBy: string;
}

export interface StockOutRecord {
  id: string;
  date: string;
  partId: string;
  quantity: number;
  woId: string;
  reference: string;
  processedBy: string;
  status: 'Consumed' | 'Reversed';
}

export interface OnHoldRecord {
  id: string;
  partId: string;
  quantity: number;
  woId: string;
  reservedDate: string;
  status: 'Active' | 'Released' | 'Consumed';
}

export interface UnavailableRecord {
  id: string;
  woId: string;
  partId: string;
  requestedQty: number;
  availableQty: number;
  buildingId: string;
  bmNote: string;
  status: 'Awaiting BM Decision' | 'Approved to Continue' | 'Waiting for Restock';
  dateFlagged: string;
}

export interface UsageRecord {
  id: string;
  woId: string;
  partId: string;
  buildingId: string;
  plannedQty: number;
  actualQty: number;
  date: string;
  technician: string;
}

export interface PlanRound {
  roundNo: string;
  startDate: string;
  endDate: string;
  status: 'In Progress' | 'Completed';
  completionRate: number;
}

export interface PlanWorkOrder {
  id: string;
  assetId: string;
  round: string;
  technician: string;
  status: WoStatus;
  completionDate?: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  systemId: string;
  subsystemId: string;
  typeId: string;
  buildingId: string;
  frequency: Frequency;
  timeRequired: string;
  description?: string;
  remark?: string;
  status: PlanStatus;
  createdBy: string;
  createdAt: string;
  assetIds: string[];
  rounds: PlanRound[];
  workOrders: PlanWorkOrder[];
  history: { date: string; event: string; actor: string }[];
}

/* ---- Reporting mock-data types ---- */

/** A flagged faulty asset for the Monthly Progress report. */
export interface FaultyAsset {
  id: string;
  assetTypeId: string;
  quantityFlagged: number;
  dateIdentified: string;
  cause: string;
}

/** An ad-hoc (non-planned) work order for the Monthly Progress report. */
export interface AdHocWorkOrder {
  id: string;
  assetId: string;
  description: string;
  status: WoStatus;
  /** Set when completed. */
  completionDate?: string;
  /** Set when still pending. */
  targetCompletionDate?: string;
}

/** A per-asset round result for the Round Completion report. */
export interface RoundAssetResult {
  assetId: string;
  status: WoStatus;
  location: string;
  completionRate: number;
  remark: string;
}

/** A fault identified during a maintenance round. */
export interface RoundFault {
  id: string;
  assetId: string;
  location: string;
  description: string;
  dateFound: string;
  actionTaken: string;
  woId: string;
}
