/**
 * Mock/demo data for the MSP Supervisor Portal. Scoped to the Supervisor's
 * User Group "North Tower MEP Team" — buildings: Skyline Tower, Harbour Plaza;
 * asset systems: HVAC, Electrical, Plumbing.
 */
import type {
  Asset,
  BuildingDrawing,
  MaintenancePlan,
  SparePart,
  Technician,
  WorkOrder,
  WorkOrderStatus,
  WorkOrderStatusGroup,
} from './types';

export const SUPERVISOR_PROFILE = {
  id: 'sup-001',
  name: 'Marcus Delgado',
  email: 'manager@ezaxis.io',
  phone: '+65 9123 4567',
  userGroup: 'North Tower MEP Team',
  role: 'MSP Supervisor',
};

export const USER_GROUP_BUILDINGS = ['Skyline Tower', 'Harbour Plaza'];
export const USER_GROUP_SYSTEMS = ['HVAC', 'Electrical', 'Plumbing'];
export const FLOORS = ['B1', 'L1', 'L2', 'L3', 'L10', 'Roof'];
export const AREAS = ['Plant Room', 'Riser', 'Lobby', 'Unit 12-04', 'Mechanical Deck'];

function avatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=0F766E&color=fff&bold=true&format=svg`;
}

export const SUB_SYSTEMS: Record<string, string[]> = {
  HVAC: ['Chiller Plant', 'Air Handling', 'Ventilation'],
  Electrical: ['Power Distribution', 'Lighting', 'Generator'],
  Plumbing: ['Water Supply', 'Drainage', 'Pumps'],
};

export const ASSET_TYPES: Record<string, string[]> = {
  'Chiller Plant': ['Centrifugal Chiller', 'Cooling Tower'],
  'Air Handling': ['AHU', 'FCU'],
  Ventilation: ['Exhaust Fan'],
  'Power Distribution': ['Main Switchboard', 'Distribution Board'],
  Lighting: ['Lighting Panel'],
  Generator: ['Diesel Generator'],
  'Water Supply': ['Booster Pump', 'Water Tank'],
  Drainage: ['Sump Pump'],
  Pumps: ['Transfer Pump'],
};

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

// ---------------------------------------------------------------- Technicians
export const technicians: Technician[] = [
  {
    id: 'tech-001',
    name: 'Liam Carter',
    email: 'liam.carter@ezaxis.io',
    phone: '+65 8001 1001',
    level: 'Senior',
    workShift: 'Day (08:00-17:00)',
    team: 'HVAC Crew',
    status: 'Active',
    userGroup: 'North Tower MEP Team',
    createdDate: '2025-11-02',
    avatar: avatar('Liam Carter'),
    activeWoCount: 4,
  },
  {
    id: 'tech-002',
    name: 'Sophia Nguyen',
    email: 'sophia.nguyen@ezaxis.io',
    phone: '+65 8001 1002',
    level: 'Intermediate',
    workShift: 'Day (08:00-17:00)',
    team: 'Electrical Crew',
    status: 'Active',
    userGroup: 'North Tower MEP Team',
    createdDate: '2025-12-14',
    avatar: avatar('Sophia Nguyen'),
    activeWoCount: 2,
  },
  {
    id: 'tech-003',
    name: 'Daniel Okoro',
    email: 'daniel.okoro@ezaxis.io',
    phone: '+65 8001 1003',
    level: 'Senior',
    workShift: 'Night (20:00-05:00)',
    team: 'Plumbing Crew',
    status: 'Active',
    userGroup: 'North Tower MEP Team',
    createdDate: '2026-01-08',
    avatar: avatar('Daniel Okoro'),
    activeWoCount: 3,
  },
  {
    id: 'tech-004',
    name: 'Mia Fernandez',
    email: 'mia.fernandez@ezaxis.io',
    phone: '+65 8001 1004',
    level: 'Junior',
    workShift: 'Day (08:00-17:00)',
    team: 'HVAC Crew',
    status: 'Pending',
    userGroup: 'North Tower MEP Team',
    createdDate: '2026-06-10',
    avatar: avatar('Mia Fernandez'),
    activeWoCount: 0,
  },
  {
    id: 'tech-005',
    name: 'Noah Williams',
    email: 'noah.williams@ezaxis.io',
    phone: '+65 8001 1005',
    level: 'Intermediate',
    workShift: 'Day (08:00-17:00)',
    team: 'Electrical Crew',
    status: 'Inactive',
    userGroup: 'North Tower MEP Team',
    createdDate: '2025-10-21',
    avatar: avatar('Noah Williams'),
    activeWoCount: 0,
  },
];

export function technicianName(id: string | null): string {
  if (!id) return 'Unassigned';
  return technicians.find((t) => t.id === id)?.name ?? 'Unknown';
}

// -------------------------------------------------------------------- Assets
export const assets: Asset[] = [
  {
    id: 'ast-001',
    code: 'HVAC-CH-001',
    name: 'Centrifugal Chiller #1',
    assetSystem: 'HVAC',
    subSystem: 'Chiller Plant',
    assetType: 'Centrifugal Chiller',
    building: 'Skyline Tower',
    floor: 'B1',
    area: 'Plant Room',
    model: 'York YK-1200',
    serialNumber: 'SN-CH-88231',
    brand: 'York',
    purchaseDate: '2022-03-15',
    manufacturedDate: '2021-11-10',
    status: 'Active',
    qrCode: 'QR-HVAC-CH-001',
  },
  {
    id: 'ast-002',
    code: 'HVAC-AHU-014',
    name: 'Air Handling Unit L10',
    assetSystem: 'HVAC',
    subSystem: 'Air Handling',
    assetType: 'AHU',
    building: 'Skyline Tower',
    floor: 'L10',
    area: 'Mechanical Deck',
    model: 'Daikin AHU-300',
    serialNumber: 'SN-AHU-44120',
    brand: 'Daikin',
    purchaseDate: '2023-06-01',
    manufacturedDate: '2023-01-20',
    status: 'Active',
    qrCode: 'QR-HVAC-AHU-014',
  },
  {
    id: 'ast-003',
    code: 'ELE-MSB-002',
    name: 'Main Switchboard B1',
    assetSystem: 'Electrical',
    subSystem: 'Power Distribution',
    assetType: 'Main Switchboard',
    building: 'Skyline Tower',
    floor: 'B1',
    area: 'Plant Room',
    model: 'ABB MNS-400',
    serialNumber: 'SN-MSB-10093',
    brand: 'ABB',
    purchaseDate: '2021-11-20',
    manufacturedDate: '2021-06-05',
    status: 'Active',
    qrCode: 'QR-ELE-MSB-002',
  },
  {
    id: 'ast-004',
    code: 'PLB-BP-007',
    name: 'Booster Pump Set',
    assetSystem: 'Plumbing',
    subSystem: 'Water Supply',
    assetType: 'Booster Pump',
    building: 'Harbour Plaza',
    floor: 'B1',
    area: 'Plant Room',
    model: 'Grundfos Hydro MPC',
    serialNumber: 'SN-BP-77321',
    brand: 'Grundfos',
    purchaseDate: '2023-02-10',
    manufacturedDate: '2022-10-01',
    status: 'Active',
    qrCode: 'QR-PLB-BP-007',
  },
  {
    id: 'ast-005',
    code: 'ELE-GEN-001',
    name: 'Diesel Generator',
    assetSystem: 'Electrical',
    subSystem: 'Generator',
    assetType: 'Diesel Generator',
    building: 'Harbour Plaza',
    floor: 'Roof',
    area: 'Mechanical Deck',
    model: 'Cummins C1100',
    serialNumber: 'SN-GEN-55012',
    brand: 'Cummins',
    purchaseDate: '2020-08-05',
    manufacturedDate: '2020-02-18',
    status: 'Inactive',
    qrCode: 'QR-ELE-GEN-001',
  },
  {
    id: 'ast-006',
    code: 'HVAC-CT-003',
    name: 'Cooling Tower #3',
    assetSystem: 'HVAC',
    subSystem: 'Chiller Plant',
    assetType: 'Cooling Tower',
    building: 'Harbour Plaza',
    floor: 'Roof',
    area: 'Mechanical Deck',
    model: 'BAC VTL-210',
    serialNumber: 'SN-CT-31908',
    brand: 'BAC',
    purchaseDate: '2022-09-30',
    manufacturedDate: '2022-05-12',
    status: 'Active',
    qrCode: 'QR-HVAC-CT-003',
  },
];

export function assetByCode(code: string): Asset | undefined {
  return assets.find((a) => a.code === code);
}

// --------------------------------------------------------------- Spare Parts
export const spareParts: SparePart[] = [
  {
    id: 'sp-001',
    code: 'SP-FLT-2010',
    name: 'AHU Air Filter (G4)',
    assetSystem: 'HVAC',
    subSystem: 'Air Handling',
    assetType: 'AHU',
    location: 'Skyline Tower · B1',
    storeRoom: 'Store A - B1',
    department: 'Facilities',
    origin: 'Germany',
    brand: 'Camfil',
    model: 'G4-595',
    serialNumber: 'N/A',
    purchaseDate: '2025-09-01',
    yearOfManufacture: '2025',
    usageDate: '2026-01-15',
    warrantyExpiry: '2027-09-01',
    specification: 'Pleated panel filter, MERV 8, 595x595x48mm.',
    photos: 2,
    documents: 1,
    totalStock: 60,
    available: 42,
    onHold: 18,
    status: 'Active',
    history: [
      { timestamp: '2026-06-12 09:10', action: 'On-Hold (WO-1042)', qty: 8, reference: 'WO-1042' },
      { timestamp: '2026-05-30 14:22', action: 'Stock In', qty: 30, reference: 'PO-2299' },
    ],
  },
  {
    id: 'sp-002',
    code: 'SP-BRG-3301',
    name: 'Pump Bearing 6204',
    assetSystem: 'Plumbing',
    subSystem: 'Pumps',
    assetType: 'Transfer Pump',
    location: 'Harbour Plaza · B1',
    storeRoom: 'Store B - B1',
    department: 'Facilities',
    origin: 'Japan',
    brand: 'NSK',
    model: '6204-2RS',
    serialNumber: 'N/A',
    purchaseDate: '2025-07-20',
    yearOfManufacture: '2024',
    usageDate: '-',
    warrantyExpiry: '2026-07-20',
    specification: 'Sealed deep-groove ball bearing, 20x47x14mm.',
    photos: 1,
    documents: 0,
    totalStock: 25,
    available: 20,
    onHold: 5,
    status: 'Active',
    history: [
      { timestamp: '2026-06-01 11:00', action: 'Stock In', qty: 25, reference: 'PO-2310' },
    ],
  },
  {
    id: 'sp-003',
    code: 'SP-CNT-7745',
    name: 'Contactor 3P 40A',
    assetSystem: 'Electrical',
    subSystem: 'Power Distribution',
    assetType: 'Distribution Board',
    location: 'Skyline Tower · B1',
    storeRoom: 'Store A - B1',
    department: 'Electrical',
    origin: 'France',
    brand: 'Schneider',
    model: 'LC1D40',
    serialNumber: 'N/A',
    purchaseDate: '2025-04-12',
    yearOfManufacture: '2025',
    usageDate: '-',
    warrantyExpiry: '2027-04-12',
    specification: '3-pole AC contactor, 40A, 230V coil.',
    photos: 0,
    documents: 2,
    totalStock: 12,
    available: 3,
    onHold: 9,
    status: 'Active',
    history: [
      { timestamp: '2026-06-10 16:45', action: 'On-Hold (WO-1031)', qty: 9, reference: 'WO-1031' },
    ],
  },
  {
    id: 'sp-004',
    code: 'SP-BLT-9920',
    name: 'V-Belt Set A-48',
    assetSystem: 'HVAC',
    subSystem: 'Ventilation',
    assetType: 'Exhaust Fan',
    location: 'Skyline Tower · L1',
    storeRoom: 'Store C - L1',
    department: 'Facilities',
    origin: 'USA',
    brand: 'Gates',
    model: 'A48',
    serialNumber: 'N/A',
    purchaseDate: '2024-12-01',
    yearOfManufacture: '2024',
    usageDate: '-',
    warrantyExpiry: '2025-12-01',
    specification: 'Classical wrapped V-belt, section A, 48 inch.',
    photos: 1,
    documents: 0,
    totalStock: 0,
    available: 0,
    onHold: 0,
    status: 'Inactive',
    history: [],
  },
];

// --------------------------------------------------------------- Work Orders
function hist(label: string, daysAgo: number): { timestamp: string; label: string } {
  const d = new Date('2026-06-17T09:00:00');
  d.setDate(d.getDate() - daysAgo);
  return { timestamp: d.toISOString().slice(0, 16).replace('T', ' '), label };
}

export const workOrders: WorkOrder[] = [
  {
    id: 'WO-1031',
    type: 'Ad-hoc Work',
    status: 'Pending - Unassigned',
    priority: 'High',
    assetCode: 'ELE-MSB-002',
    assetName: 'Main Switchboard B1',
    assetType: 'Main Switchboard',
    subSystem: 'Power Distribution',
    assetSystem: 'Electrical',
    building: 'Skyline Tower',
    floor: 'B1',
    area: 'Plant Room',
    description: 'Intermittent breaker tripping on incomer 2. Requires inspection and contactor check.',
    remark: '',
    duration: '4 hours',
    createdDate: '2026-06-15',
    startTime: null,
    endTime: null,
    dueDate: '2026-06-19',
    overdue: false,
    mainTechnicianId: null,
    subTechnicianIds: [],
    submittedBy: 'Marcus Delgado',
    checklist: [],
    parts: [],
    signOffs: [],
    maintenancePlanId: null,
    maintenanceRound: null,
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: 'Loose busbar termination causing intermittent trip.',
    notes: '',
    attachments: 2,
    rejectionReason: null,
    history: [hist('WO created by Marcus Delgado.', 2)],
  },
  {
    id: 'WO-1032',
    type: 'Technician Request',
    status: 'Technician Request',
    priority: 'Urgent',
    assetCode: 'HVAC-CH-001',
    assetName: 'Centrifugal Chiller #1',
    assetType: 'Centrifugal Chiller',
    subSystem: 'Chiller Plant',
    assetSystem: 'HVAC',
    building: 'Skyline Tower',
    floor: 'B1',
    area: 'Plant Room',
    description: 'Chiller showing high condenser pressure alarm. Ad-hoc inspection requested by technician on site.',
    remark: '',
    duration: '3 hours',
    createdDate: '2026-06-16',
    startTime: null,
    endTime: null,
    dueDate: null,
    overdue: false,
    mainTechnicianId: null,
    subTechnicianIds: [],
    submittedBy: 'Liam Carter',
    checklist: [],
    parts: [],
    signOffs: [],
    maintenancePlanId: null,
    maintenanceRound: null,
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: '',
    notes: '',
    attachments: 3,
    rejectionReason: null,
    history: [hist('Ad-hoc request submitted by Liam Carter.', 1)],
  },
  {
    id: 'WO-1033',
    type: 'Maintenance Scheduling',
    status: 'Assigned',
    priority: 'Medium',
    assetCode: 'HVAC-AHU-014',
    assetName: 'Air Handling Unit L10',
    assetType: 'AHU',
    subSystem: 'Air Handling',
    assetSystem: 'HVAC',
    building: 'Skyline Tower',
    floor: 'L10',
    area: 'Mechanical Deck',
    description: 'Quarterly preventive maintenance: filter change, belt check, coil cleaning.',
    remark: 'Coordinate with tenant for access.',
    duration: '2 hours',
    createdDate: '2026-06-13',
    startTime: null,
    endTime: null,
    dueDate: '2026-06-20',
    overdue: false,
    mainTechnicianId: 'tech-001',
    subTechnicianIds: ['tech-002'],
    submittedBy: 'System (Maintenance Plan)',
    checklist: [
      { id: 'c1', name: 'Replace G4 air filter', description: 'Replace G4 air filter', descriptionMode: 'Require', photosMode: 'Require', completed: false, photos: 0 },
      { id: 'c2', name: 'Check belt tension', description: 'Check belt tension', descriptionMode: 'Optional', photosMode: 'Optional', completed: false, photos: 0 },
      { id: 'c3', name: 'Clean cooling coil', description: 'Clean cooling coil', descriptionMode: 'Require', photosMode: 'Off', completed: false, photos: 0 },
    ],
    parts: [],
    signOffs: [],
    maintenancePlanId: 'MP-2001',
    maintenanceRound: 'Round 2',
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: '',
    notes: '',
    attachments: 0,
    rejectionReason: null,
    history: [
      hist('WO auto-generated from plan MP-2001 (Round 2).', 4),
      hist('Assigned to Liam Carter by Marcus Delgado.', 3),
    ],
  },
  {
    id: 'WO-1034',
    type: 'Service Request',
    status: 'Started',
    priority: 'High',
    assetCode: 'PLB-BP-007',
    assetName: 'Booster Pump Set',
    assetType: 'Booster Pump',
    subSystem: 'Water Supply',
    assetSystem: 'Plumbing',
    building: 'Harbour Plaza',
    floor: 'B1',
    area: 'Plant Room',
    description: 'Low water pressure reported on upper floors. Investigate booster pump operation.',
    remark: '',
    duration: '5 hours',
    createdDate: '2026-06-12',
    startTime: '2026-06-16 09:30',
    endTime: null,
    dueDate: '2026-06-14',
    overdue: true,
    mainTechnicianId: 'tech-003',
    subTechnicianIds: [],
    submittedBy: 'Forwarded by Building Manager',
    checklist: [
      { id: 'c1', description: 'Check pump suction pressure', completed: true, photos: 2 },
      { id: 'c2', description: 'Inspect pressure transducer', completed: false, photos: 0 },
    ],
    parts: [],
    signOffs: [],
    maintenancePlanId: null,
    maintenanceRound: null,
    parentWoId: null,
    tenantContact: 'Aria Thompson · +65 9555 1212 · Unit 12-04',
    tenant: {
      name: 'Aria Thompson',
      location: 'Unit 12-04, Harbour Plaza',
      email: 'aria.thompson@tenant.io',
      phone: '+65 9555 1212',
    },
    cause: 'Pressure transducer drift suspected.',
    notes: 'Tenant available after 14:00 for access.',
    attachments: 1,
    rejectionReason: null,
    history: [
      hist('Service request forwarded by Building Manager.', 5),
      hist('Assigned to Daniel Okoro.', 4),
      hist('Work started by Daniel Okoro.', 1),
    ],
  },
  {
    id: 'WO-1035',
    type: 'Maintenance Scheduling',
    status: 'Completed',
    priority: 'Medium',
    assetCode: 'HVAC-CT-003',
    assetName: 'Cooling Tower #3',
    assetType: 'Cooling Tower',
    subSystem: 'Chiller Plant',
    assetSystem: 'HVAC',
    building: 'Harbour Plaza',
    floor: 'Roof',
    area: 'Mechanical Deck',
    description: 'Monthly cooling tower cleaning and water treatment check.',
    remark: '',
    duration: '3 hours',
    createdDate: '2026-06-08',
    startTime: '2026-06-14 10:00',
    endTime: '2026-06-14 13:15',
    dueDate: '2026-06-15',
    overdue: false,
    mainTechnicianId: 'tech-001',
    subTechnicianIds: ['tech-002', 'tech-003'],
    submittedBy: 'System (Maintenance Plan)',
    checklist: [
      { id: 'c1', description: 'Drain and clean basin', completed: true, photos: 3 },
      { id: 'c2', description: 'Check water treatment dosing', completed: true, photos: 1 },
      { id: 'c3', description: 'Inspect fill media', completed: true, photos: 2 },
    ],
    parts: [
      { id: 'p1', source: 'IMS Stock', name: 'AHU Air Filter (G4)', code: 'SP-FLT-2010', quantity: 4 },
    ],
    signOffs: [
      { role: 'Technician', name: 'Liam Carter', timestamp: '2026-06-14 13:20' },
      { role: 'Building Technician', name: 'Owen Reyes', timestamp: '2026-06-14 13:40' },
      { role: 'Tenant', name: 'N/A', timestamp: null },
    ],
    maintenancePlanId: 'MP-2002',
    maintenanceRound: 'Round 6',
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: '',
    notes: 'Basin cleaned; dosing verified within range.',
    attachments: 0,
    rejectionReason: null,
    history: [
      hist('WO auto-generated from plan MP-2002 (Round 6).', 9),
      hist('Assigned to Liam Carter.', 8),
      hist('Work started by Liam Carter.', 3),
      hist('Completed and submitted by Liam Carter.', 3),
    ],
  },
  {
    id: 'WO-1036',
    type: 'Ad-hoc Work',
    status: 'Verification Rejected',
    priority: 'Low',
    assetCode: 'ELE-MSB-002',
    assetName: 'Main Switchboard B1',
    assetType: 'Main Switchboard',
    subSystem: 'Power Distribution',
    assetSystem: 'Electrical',
    building: 'Skyline Tower',
    floor: 'B1',
    area: 'Plant Room',
    description: 'Thermographic survey of switchboard busbars and terminations.',
    remark: '',
    duration: '2 hours',
    createdDate: '2026-06-05',
    startTime: '2026-06-09 14:00',
    endTime: '2026-06-09 16:10',
    dueDate: '2026-06-10',
    overdue: false,
    mainTechnicianId: 'tech-002',
    subTechnicianIds: [],
    submittedBy: 'Marcus Delgado',
    checklist: [
      { id: 'c1', description: 'Thermal scan all terminations', completed: true, photos: 4 },
      { id: 'c2', description: 'Record hotspot readings', completed: true, photos: 2 },
    ],
    parts: [],
    signOffs: [{ role: 'Technician', name: 'Sophia Nguyen', timestamp: '2026-06-09 16:15' }],
    maintenancePlanId: null,
    maintenanceRound: null,
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: '',
    notes: '',
    attachments: 0,
    rejectionReason: 'Thermal images not labelled per termination. Please re-annotate before sign-off.',
    history: [
      hist('WO created by Marcus Delgado.', 12),
      hist('Assigned to Sophia Nguyen.', 11),
      hist('Completed by Sophia Nguyen.', 8),
      hist('Signed off by Marcus Delgado.', 8),
      hist('Rejected by Building Manager. Reason: Thermal images not labelled per termination.', 6),
    ],
  },
  {
    id: 'WO-1037',
    type: 'Maintenance Scheduling',
    status: 'Closed',
    priority: 'Medium',
    assetCode: 'HVAC-AHU-014',
    assetName: 'Air Handling Unit L10',
    assetType: 'AHU',
    subSystem: 'Air Handling',
    assetSystem: 'HVAC',
    building: 'Skyline Tower',
    floor: 'L10',
    area: 'Mechanical Deck',
    description: 'Quarterly preventive maintenance (Round 1).',
    remark: '',
    duration: '2 hours',
    createdDate: '2026-03-10',
    startTime: '2026-03-12 09:00',
    endTime: '2026-03-12 11:00',
    dueDate: '2026-03-15',
    overdue: false,
    mainTechnicianId: 'tech-001',
    subTechnicianIds: [],
    submittedBy: 'System (Maintenance Plan)',
    checklist: [
      { id: 'c1', description: 'Replace G4 air filter', completed: true, photos: 2 },
      { id: 'c2', description: 'Check belt tension', completed: true, photos: 1 },
    ],
    parts: [{ id: 'p1', source: 'IMS Stock', name: 'AHU Air Filter (G4)', code: 'SP-FLT-2010', quantity: 2 }],
    signOffs: [
      { role: 'Technician', name: 'Liam Carter', timestamp: '2026-03-12 11:05' },
      { role: 'Building Technician', name: 'Owen Reyes', timestamp: '2026-03-12 11:30' },
    ],
    maintenancePlanId: 'MP-2001',
    maintenanceRound: 'Round 1',
    parentWoId: null,
    tenantContact: null,
    tenant: null,
    cause: '',
    notes: '',
    attachments: 0,
    rejectionReason: null,
    history: [hist('WO closed by Building Manager.', 90)],
  },
];

export function workOrderById(id: string): WorkOrder | undefined {
  return workOrders.find((w) => w.id === id);
}

// ---------------------------------------------------------- Maintenance Plans
export const maintenancePlans: MaintenancePlan[] = [
  {
    id: 'MP-2001',
    name: 'Skyline AHU Quarterly PM',
    assetSystem: 'HVAC',
    subSystem: 'Air Handling',
    assetType: 'AHU',
    building: 'Skyline Tower',
    frequency: 'Quarterly',
    timeRequired: '2 hours',
    description: 'Quarterly preventive maintenance for all AHUs in Skyline Tower.',
    remark: 'Coordinate tenant access for occupied floors.',
    status: 'Active',
    createdBy: 'Marcus Delgado',
    createdDate: '2025-12-01',
    photos: 2,
    rejectionReason: null,
    rounds: [
      { roundNo: 'Round 1', startDate: '2026-03-01', endDate: '2026-03-31', status: 'Closed', closedWos: 4, totalWos: 4 },
      { roundNo: 'Round 2', startDate: '2026-06-01', endDate: '2026-06-30', status: 'In Progress', closedWos: 1, totalWos: 4 },
    ],
    assetIds: ['ast-002'],
    workOrderIds: ['WO-1033', 'WO-1037'],
    history: [
      hist('Plan submitted by Marcus Delgado. Status: Pending.', 180),
      hist('Approved by Building Manager. Status: Active.', 178),
    ],
  },
  {
    id: 'MP-2002',
    name: 'Harbour Cooling Tower Monthly',
    assetSystem: 'HVAC',
    subSystem: 'Chiller Plant',
    assetType: 'Cooling Tower',
    building: 'Harbour Plaza',
    frequency: 'Monthly',
    timeRequired: '3 hours',
    description: 'Monthly cleaning and water treatment for cooling towers.',
    remark: '',
    status: 'Active',
    createdBy: 'Avery Sterling (Admin)',
    createdDate: '2025-09-15',
    photos: 0,
    rejectionReason: null,
    rounds: [
      { roundNo: 'Round 6', startDate: '2026-06-01', endDate: '2026-06-30', status: 'In Progress', closedWos: 0, totalWos: 1 },
    ],
    assetIds: ['ast-006'],
    workOrderIds: ['WO-1035'],
    history: [hist('Plan created by Admin.', 270)],
  },
  {
    id: 'MP-2003',
    name: 'Booster Pump Yearly Overhaul',
    assetSystem: 'Plumbing',
    subSystem: 'Water Supply',
    assetType: 'Booster Pump',
    building: 'Harbour Plaza',
    frequency: 'Yearly',
    timeRequired: '6 hours',
    description: 'Annual overhaul of booster pump sets including bearing inspection.',
    remark: '',
    status: 'Pending',
    createdBy: 'Marcus Delgado',
    createdDate: '2026-06-14',
    photos: 1,
    rejectionReason: null,
    rounds: [],
    assetIds: ['ast-004'],
    workOrderIds: [],
    history: [hist('Plan submitted by Marcus Delgado. Status: Pending.', 3)],
  },
  {
    id: 'MP-2004',
    name: 'Generator Load Test Quarterly',
    assetSystem: 'Electrical',
    subSystem: 'Generator',
    assetType: 'Diesel Generator',
    building: 'Harbour Plaza',
    frequency: 'Quarterly',
    timeRequired: '4 hours',
    description: 'Quarterly load bank testing of standby generator.',
    remark: '',
    status: 'Approval Rejected',
    createdBy: 'Marcus Delgado',
    createdDate: '2026-06-09',
    photos: 0,
    rejectionReason: 'Load test window conflicts with tenant peak hours. Reschedule and resubmit.',
    rounds: [],
    assetIds: ['ast-005'],
    workOrderIds: [],
    history: [
      hist('Plan submitted by Marcus Delgado. Status: Pending.', 8),
      hist('Rejected by Building Manager. Reason: Load test window conflicts with tenant peak hours.', 6),
    ],
  },
];

export function maintenancePlanById(id: string): MaintenancePlan | undefined {
  return maintenancePlans.find((p) => p.id === id);
}

// ------------------------------------------------------------------ Drawings
export const drawings: BuildingDrawing[] = [
  {
    building: 'Skyline Tower',
    fileName: 'Skyline-Tower-B1-AsBuilt.pdf',
    uploadDate: '2025-11-20',
    tags: [
      {
        assetId: 'ast-001',
        assetName: 'Centrifugal Chiller #1',
        assetCode: 'HVAC-CH-001',
        assetType: 'Centrifugal Chiller',
        assetSystem: 'HVAC',
        status: 'Active',
        lastMaintenance: '2026-05-20',
        x: 28,
        y: 35,
        inScope: true,
      },
      {
        assetId: 'ast-003',
        assetName: 'Main Switchboard B1',
        assetCode: 'ELE-MSB-002',
        assetType: 'Main Switchboard',
        assetSystem: 'Electrical',
        status: 'Active',
        lastMaintenance: '2026-04-09',
        x: 62,
        y: 58,
        inScope: true,
      },
      {
        assetId: 'out-001',
        assetName: 'Fire Pump (out of scope)',
        assetCode: 'FP-001',
        assetType: 'Fire Pump',
        assetSystem: 'Fire Protection',
        status: 'Active',
        lastMaintenance: '2026-03-01',
        x: 80,
        y: 24,
        inScope: false,
      },
    ],
  },
  {
    building: 'Harbour Plaza',
    fileName: 'Harbour-Plaza-Roof-AsBuilt.pdf',
    uploadDate: '2025-12-02',
    tags: [
      {
        assetId: 'ast-006',
        assetName: 'Cooling Tower #3',
        assetCode: 'HVAC-CT-003',
        assetType: 'Cooling Tower',
        assetSystem: 'HVAC',
        status: 'Active',
        lastMaintenance: '2026-06-14',
        x: 45,
        y: 40,
        inScope: true,
      },
    ],
  },
];

// ---------------------------------------------------- Status-group mapping
export interface StatusGroupInfo {
  group: WorkOrderStatusGroup;
  /** Dot/accent color hex. */
  color: string;
  /** Specific sub-status text shown beneath the group label. */
  subStatus: string;
}

/**
 * Maps a WO status to its status group, dot color and sub-status label.
 * Drives the WO list Status-Group column and the WO detail stepper.
 */
export function statusGroupInfo(status: WorkOrderStatus): StatusGroupInfo {
  switch (status) {
    case 'Preparation Draft':
      return { group: 'Preparation', color: '#94A3B8', subStatus: 'Draft' };
    case 'Technician Request':
    case 'Tenant Request':
    case 'Service Request Accepted':
    case 'Pending':
      return { group: 'New', color: '#EAB308', subStatus: status };
    case 'Pending - Unassigned':
      return { group: 'Assignment', color: '#F97316', subStatus: 'Unassigned' };
    case 'Assigned':
    case 'Started':
      return { group: 'In Progress', color: '#3B82F6', subStatus: status };
    case 'Completed':
      return { group: 'Completed', color: '#10B981', subStatus: 'Completed' };
    case 'Verified':
      return { group: 'Verified', color: '#8B5CF6', subStatus: 'Verified' };
    case 'Completion Rejected':
    case 'Verification Rejected':
    case 'Approval Rejected':
    case 'Ad-hoc Declined':
      return { group: 'Rejected', color: '#EF4444', subStatus: status };
    case 'Closed':
    case 'Cancelled':
      return { group: 'Closed', color: '#9CA3AF', subStatus: status };
    default:
      return { group: 'New', color: '#EAB308', subStatus: status };
  }
}

export const CLOSED_STATUSES: WorkOrderStatus[] = ['Closed', 'Cancelled'];

// ------------------------------------------------------------ Dashboard data
export const dashboardKpis = {
  /** Pending Tech Requests. */
  technicianRequests: workOrders.filter((w) => w.status === 'Technician Request').length,
  /** Awaiting Assignment (Unassigned). */
  awaitingAssignment: workOrders.filter((w) => w.status === 'Pending - Unassigned').length,
  /** In Execution (Assigned + Started). */
  inExecution: workOrders.filter((w) => w.status === 'Assigned' || w.status === 'Started').length,
  /** Awaiting Sign-off (Completed). */
  awaitingSignoff: workOrders.filter((w) => w.status === 'Completed').length,
  /** Total Active WOs (everything not Closed/Cancelled/Declined). */
  totalActive: workOrders.filter(
    (w) => !['Closed', 'Cancelled', 'Ad-hoc Declined'].includes(w.status),
  ).length,
};

/** Simple month-over-month trend deltas for the KPI cards (mock). */
export const kpiTrends = {
  technicianRequests: 1,
  awaitingAssignment: -1,
  inExecution: 2,
  awaitingSignoff: 0,
  totalActive: 1,
};

/** Work Orders needing supervisor attention (action-required statuses). */
export const attentionStatuses: WorkOrderStatus[] = [
  'Technician Request',
  'Pending - Unassigned',
  'Completed',
  'Verification Rejected',
  'Completion Rejected',
];

export const workOrdersNeedingAttention = workOrders.filter((w) =>
  attentionStatuses.includes(w.status),
);

// ------------------------------------------------ Maintenance Progress Gantt
export const GANTT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface GanttRound {
  label: string; // e.g. 'R1'
  /** 0-based month index where the round starts. */
  startMonth: number;
  /** 0-based month index where the round ends (inclusive). */
  endMonth: number;
  /** Completion percentage 0..100. */
  completion: number;
}

export interface GanttRow {
  assetType: string;
  assetSystem: string;
  subSystem: string;
  building: string;
  rounds: GanttRound[];
}

/** Maintenance progress per asset type, scoped to the supervisor's buildings. */
export const maintenanceGantt: GanttRow[] = [
  {
    assetType: 'AHU',
    assetSystem: 'HVAC',
    subSystem: 'Air Handling',
    building: 'Skyline Tower',
    rounds: [
      { label: 'R1', startMonth: 2, endMonth: 2, completion: 100 },
      { label: 'R2', startMonth: 5, endMonth: 5, completion: 50 },
      { label: 'R3', startMonth: 8, endMonth: 8, completion: 0 },
    ],
  },
  {
    assetType: 'Cooling Tower',
    assetSystem: 'HVAC',
    subSystem: 'Chiller Plant',
    building: 'Harbour Plaza',
    rounds: [
      { label: 'R4', startMonth: 3, endMonth: 3, completion: 100 },
      { label: 'R5', startMonth: 4, endMonth: 4, completion: 100 },
      { label: 'R6', startMonth: 5, endMonth: 5, completion: 0 },
    ],
  },
  {
    assetType: 'Booster Pump',
    assetSystem: 'Plumbing',
    subSystem: 'Water Supply',
    building: 'Harbour Plaza',
    rounds: [{ label: 'R1', startMonth: 5, endMonth: 6, completion: 25 }],
  },
  {
    assetType: 'Diesel Generator',
    assetSystem: 'Electrical',
    subSystem: 'Generator',
    building: 'Harbour Plaza',
    rounds: [
      { label: 'R1', startMonth: 1, endMonth: 1, completion: 100 },
      { label: 'R2', startMonth: 4, endMonth: 4, completion: 0 },
    ],
  },
];
