/**
 * Domain types for the MSP Supervisor Portal (Section 5).
 * All data is mock/demo data scoped to the Supervisor's User Group.
 */

export type AccountStatus = 'Active' | 'Inactive' | 'Pending';

export type WorkOrderStatus =
  | 'Preparation Draft'
  | 'Technician Request'
  | 'Tenant Request'
  | 'Service Request Accepted'
  | 'Pending'
  | 'Pending - Unassigned'
  | 'Assigned'
  | 'Started'
  | 'Completed'
  | 'Completion Rejected'
  | 'Verified'
  | 'Verification Rejected'
  | 'Approval Rejected'
  | 'Closed'
  | 'Cancelled'
  | 'Ad-hoc Declined';

/** Status-group label used for the WO list grouping + detail stepper. */
export type WorkOrderStatusGroup =
  | 'Preparation'
  | 'New'
  | 'Assignment'
  | 'In Progress'
  | 'Completed'
  | 'Review'
  | 'Verified'
  | 'Rejected'
  | 'Finalized'
  | 'Closed';

export type WorkOrderType =
  | 'Ad-hoc Work'
  | 'Maintenance Scheduling'
  | 'Service Request'
  | 'Technician Request';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type PlanStatus =
  | 'Pending'
  | 'Approval Rejected'
  | 'Active'
  | 'Inactive'
  | 'Cancelled';

export type Frequency = 'Monthly' | 'Quarterly' | 'Yearly';

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  workShift: string;
  team: string;
  status: AccountStatus;
  userGroup: string;
  createdDate: string;
  avatar: string;
  activeWoCount: number;
}

export interface HistoryEntry {
  timestamp: string;
  label: string;
}

export type ChecklistRequirement = 'Off' | 'Require' | 'Optional';

export interface ChecklistItem {
  id: string;
  /** Item name / title. */
  name?: string;
  description: string;
  /** Whether a written description is Off / Required / Optional. */
  descriptionMode?: ChecklistRequirement;
  /** Whether a photo is Off / Required / Optional. */
  photosMode?: ChecklistRequirement;
  completed: boolean;
  photos: number;
}

export interface TenantContact {
  name: string;
  location: string;
  email: string;
  phone: string;
}

export interface PartReplacement {
  id: string;
  source: 'IMS Stock' | 'Purchase Separately';
  name: string;
  code: string;
  quantity: number;
}

export interface SignOffRecord {
  role: string;
  name: string;
  timestamp: string | null;
}

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: Priority;
  assetCode: string;
  assetName: string;
  assetType: string;
  subSystem: string;
  assetSystem: string;
  building: string;
  floor: string;
  area: string;
  description: string;
  remark: string;
  duration: string;
  createdDate: string;
  startTime: string | null;
  endTime: string | null;
  dueDate: string | null;
  overdue: boolean;
  mainTechnicianId: string | null;
  subTechnicianIds: string[];
  submittedBy: string;
  checklist: ChecklistItem[];
  parts: PartReplacement[];
  signOffs: SignOffRecord[];
  maintenancePlanId: string | null;
  maintenanceRound: string | null;
  parentWoId: string | null;
  tenantContact: string | null;
  /** Structured tenant info for Service Request WOs (edit-tenant modal). */
  tenant: TenantContact | null;
  cause: string;
  notes: string;
  attachments: number;
  rejectionReason: string | null;
  history: HistoryEntry[];
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  building: string;
  floor: string;
  area: string;
  model: string;
  serialNumber: string;
  brand: string;
  purchaseDate: string;
  manufacturedDate: string;
  status: AccountStatus;
  qrCode: string;
}

export interface SparePart {
  id: string;
  code: string;
  name: string;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  location: string;
  storeRoom: string;
  department: string;
  origin: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  yearOfManufacture: string;
  usageDate: string;
  warrantyExpiry: string;
  specification: string;
  photos: number;
  documents: number;
  totalStock: number;
  available: number;
  onHold: number;
  status: AccountStatus;
  history: { timestamp: string; action: string; qty: number; reference: string }[];
}

export interface MaintenanceRound {
  roundNo: string;
  startDate: string;
  endDate: string;
  status: string;
  closedWos: number;
  totalWos: number;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  assetSystem: string;
  subSystem: string;
  assetType: string;
  building: string;
  frequency: Frequency;
  timeRequired: string;
  description: string;
  remark: string;
  status: PlanStatus;
  createdBy: string;
  createdDate: string;
  photos: number;
  rejectionReason: string | null;
  rounds: MaintenanceRound[];
  assetIds: string[];
  workOrderIds: string[];
  history: HistoryEntry[];
}

export interface DrawingTag {
  assetId: string;
  assetName: string;
  assetCode: string;
  assetType: string;
  assetSystem: string;
  status: AccountStatus;
  lastMaintenance: string;
  x: number;
  y: number;
  inScope: boolean;
}

export interface BuildingDrawing {
  building: string;
  fileName: string;
  uploadDate: string;
  tags: DrawingTag[];
}
