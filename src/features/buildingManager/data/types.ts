/**
 * Domain types for the Building Manager Portal (Section 3).
 * All data is demo mock data — there is no real backend.
 */

export type AccountStatus = 'Active' | 'Inactive' | 'Pending';

export interface Building {
  id: string;
  name: string;
  floors: string[];
  areas: string[];
}

export interface StaffAccount {
  id: string;
  date: string; // creation date ISO
  fullName: string;
  email: string;
  phone: string;
  userGroup: string;
  level: string;
  workShift: string;
  team: string;
  status: AccountStatus;
  role: 'MSP Supervisor' | 'MSP Technician';
  avatar?: string;
  buildingId: string;
}

export type RequestType =
  | 'Tenant Request'
  | 'Technician Ad-hoc'
  | 'Supervisor Ad-hoc'
  | 'Service Request Accepted';

/** Request statuses driving the Request → Work Order flow. */
export type RequestStatus =
  | 'Tenant Request'
  | 'Pending'
  | 'Service Request Accepted'
  | 'Approval Rejected'
  | 'Ad-hoc Declined'
  | 'Cancelled'
  | 'Closed';

export interface HistoryEntry {
  timestamp: string;
  label: string;
}

export interface Attachment {
  name: string;
  kind: 'photo' | 'pdf';
}

export interface ServiceRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  createdDate: string;
  buildingId: string;
  floor: string;
  area: string;
  assetSystem: string;
  assetType: string;
  assetCode?: string;
  description: string;
  submittedBy: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  assignedSupervisor?: string;
  attachments: Attachment[];
  history: HistoryEntry[];
}

export type WorkOrderType = 'Maintenance Scheduling' | 'Ad-hoc Work' | 'Service Request';

/** Work order lifecycle: New → Pending → In Progress → Review → Approval → Finalized. */
export type WorkOrderStatus =
  | 'Pending - Unassigned'
  | 'Assigned'
  | 'Started'
  | 'Completed'
  | 'Verified'
  | 'Closed'
  | 'Cancelled'
  | 'Completion Rejected'
  | 'Verification Rejected';

export interface ChecklistItem {
  description: string;
  completed: boolean;
  photos: number;
}

export interface PartReplacement {
  source: string;
  sparePartName: string;
  code: string;
  quantity: number;
}

export interface Technician {
  name: string;
  email: string;
  phone: string;
  level: string;
}

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  createdDate: string;
  buildingId: string;
  floor: string;
  area: string;
  assetCode: string;
  assetType: string;
  subSystem: string;
  assetSystem: string;
  startTime: string;
  endTime: string;
  dueDate: string;
  timeRequired: string;
  overdue: boolean;
  description: string;
  remark: string;
  photos: number;
  mainTechnician?: Technician;
  subTechnicians: Technician[];
  checklist: ChecklistItem[];
  parts: PartReplacement[];
  planRef?: { round: number; planId: string; planName: string; frequency: string };
  parentWo?: string;
  history: HistoryEntry[];
}

export type AssetStatus = 'Active' | 'Inactive' | 'Under Maintenance';

/** A configurable work-checklist item attached to an asset (read-only on detail). */
export interface AssetChecklistItem {
  name: string;
  requireDescription: boolean;
  requirePhotos: boolean;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  assetTag?: string;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  buildingId: string;
  floor: string;
  area: string;
  model: string;
  serialNumber: string;
  brand: string;
  purchaseDate: string;
  manufacturedDate: string;
  status: AssetStatus;
  photos: number;
  health: number; // 0-100 health score for dashboard
  // Extended asset details
  origin?: string;
  yearOfManufacture?: string;
  usageDate?: string;
  warrantyExpiry?: string;
  // Supporting / additional information
  specification?: string;
  maintenanceFrequency?: string;
  documents?: number;
  checklist?: AssetChecklistItem[];
}

export type SparePartStatus = 'Active' | 'Inactive';

export interface SparePart {
  id: string;
  code: string;
  name: string;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  brand: string;
  model: string;
  serialNumber: string;
  quantity: number;
  totalStock: number;
  available: number;
  onHold: number;
  department: string;
  storeRoom: string;
  origin: string;
  purchaseDate: string;
  yearOfManufacture: string;
  usageDate: string;
  warrantyExpiry: string;
  specification: string;
  status: SparePartStatus;
  buildingId: string;
  history: HistoryEntry[];
}

export interface StockTxn {
  id: string;
  date: string;
  sparePartCode: string;
  sparePartName: string;
  quantity: number;
  sourceReference: string;
  recordedBy: string;
  woId?: string;
  status?: string;
  notes?: string;
}

/** Lifecycle of a spare-part shortage flagged against a Work Order (3.6.12). */
export type UnavailableStatus =
  | 'Unavailable'
  | 'Approved to Continue'
  | 'Waiting for Restock';

export interface UnavailableRequest {
  id: string;
  woId: string;
  sparePartCode: string;
  sparePartName: string;
  requestedQty: number;
  availableQty: number;
  bmNote: string;
  status: UnavailableStatus;
  dateFlagged: string;
}

/** An asset tag placed on a floor drawing (percentage coords for free-drag). */
export interface DrawingTag {
  id: string;
  label: string;
  x: number; // 0-100 percentage of canvas width
  y: number; // 0-100 percentage of canvas height
}

/** A per-floor as-built drawing (PDF) with optional placed asset tags. */
export interface FloorDrawing {
  id: string;
  buildingId: string;
  floor: string;
  fileName: string;
  uploadedAt: string;
  tags: DrawingTag[];
}

export type PlanStatus = 'Pending' | 'Active' | 'Inactive' | 'Cancelled';
export type PlanFrequency = 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually' | 'Weekly';

export interface PlanRound {
  roundNo: number;
  startDate: string;
  endDate: string;
  status: string;
  completionRate: number;
}

export interface PlanAsset {
  assetCode: string;
  assetName: string;
  location: string;
  mainTechnician?: string;
  woStatus: string;
}

export interface PlanWorkOrder {
  woId: string;
  asset: string;
  round: number;
  technician: string;
  status: string;
  completionDate?: string;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  frequency: PlanFrequency;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  buildingId: string;
  timeRequired: string;
  description: string;
  remark: string;
  photos: number;
  status: PlanStatus;
  createdBy: string;
  createdDate: string;
  rounds: PlanRound[];
  assets: PlanAsset[];
  workOrders: PlanWorkOrder[];
  history: HistoryEntry[];
}
