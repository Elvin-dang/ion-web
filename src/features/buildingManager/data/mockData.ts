/**
 * Realistic demo mock data for the Building Manager Portal.
 */
import type {
  Building,
  StaffAccount,
  ServiceRequest,
  WorkOrder,
  Asset,
  SparePart,
  StockTxn,
  MaintenancePlan,
  UnavailableRequest,
  FloorDrawing,
} from './types';

/** Buildings assigned to the signed-in Building Manager (scopes the Drawings module). */
export const bmAssignedBuildingIds = ['B-01', 'B-02'];

export const ASSET_SYSTEMS = ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Elevator'];
export const SUB_SYSTEMS: Record<string, string[]> = {
  HVAC: ['Chiller', 'AHU', 'Cooling Tower', 'FCU'],
  Electrical: ['Switchgear', 'Generator', 'Lighting', 'UPS'],
  Plumbing: ['Pump', 'Water Tank', 'Drainage'],
  'Fire Safety': ['Sprinkler', 'Fire Pump', 'Smoke Detector'],
  Elevator: ['Traction', 'Hydraulic'],
};
export const ASSET_TYPES: Record<string, string[]> = {
  Chiller: ['Centrifugal Chiller', 'Screw Chiller'],
  AHU: ['Air Handling Unit'],
  'Cooling Tower': ['Cooling Tower'],
  FCU: ['Fan Coil Unit'],
  Switchgear: ['LV Switchgear', 'MV Switchgear'],
  Generator: ['Diesel Generator'],
  Lighting: ['LED Panel', 'Emergency Light'],
  UPS: ['UPS System'],
  Pump: ['Booster Pump', 'Sump Pump'],
  'Water Tank': ['Storage Tank'],
  Drainage: ['Drainage System'],
  Sprinkler: ['Sprinkler Head'],
  'Fire Pump': ['Fire Pump'],
  'Smoke Detector': ['Smoke Detector'],
  Traction: ['Traction Elevator'],
  Hydraulic: ['Hydraulic Elevator'],
};

export const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];

export const buildings: Building[] = [
  {
    id: 'B-01',
    name: 'Orchard Tower',
    floors: ['B1', 'L1', 'L2', 'L3', 'L4', 'L5'],
    areas: ['Lobby', 'Plant Room', 'Office Unit 01', 'Office Unit 02', 'Car Park'],
  },
  {
    id: 'B-02',
    name: 'Marina Bay Plaza',
    floors: ['B2', 'B1', 'L1', 'L2', 'L3'],
    areas: ['Lobby', 'Roof Deck', 'Retail Unit A', 'Mechanical Room'],
  },
];

/** Building display name from its id. */
export const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

/**
 * Full human-readable location, e.g. "Plant Room / Floor B1, Orchard Tower".
 * Area is omitted when empty; parts join into "Area / Floor X, Building".
 */
export const fullLocation = (buildingId: string, floor?: string, area?: string) => {
  const bName = buildingName(buildingId);
  const parts: string[] = [];
  if (area) parts.push(area);
  if (floor) parts.push(`Floor ${floor}`);
  const head = parts.join(' / ');
  return head ? `${head}, ${bName}` : bName;
};

export const userGroups = [
  'Orchard Tower - Operations',
  'Orchard Tower - Maintenance',
  'Marina Bay - Operations',
];

export const staffAccounts: StaffAccount[] = [
  {
    id: 'SUP-001', date: '2026-01-12', fullName: 'Daniel Cheng', email: 'daniel.cheng@msp.io',
    phone: '+65 9123 4567', userGroup: 'Orchard Tower - Operations', level: 'Senior', workShift: 'Day',
    team: 'Alpha', status: 'Active', role: 'MSP Supervisor', buildingId: 'B-01',
  },
  {
    id: 'SUP-002', date: '2026-02-03', fullName: 'Priya Nair', email: 'priya.nair@msp.io',
    phone: '+65 9876 1122', userGroup: 'Marina Bay - Operations', level: 'Lead', workShift: 'Day',
    team: 'Bravo', status: 'Active', role: 'MSP Supervisor', buildingId: 'B-02',
  },
  {
    id: 'SUP-003', date: '2026-03-18', fullName: 'Marcus Tan', email: 'marcus.tan@msp.io',
    phone: '+65 9001 2233', userGroup: 'Orchard Tower - Maintenance', level: 'Senior', workShift: 'Night',
    team: 'Alpha', status: 'Pending', role: 'MSP Supervisor', buildingId: 'B-01',
  },
  {
    id: 'TEC-001', date: '2026-01-20', fullName: 'Aisha Rahman', email: 'aisha.rahman@msp.io',
    phone: '+65 9223 3344', userGroup: 'Orchard Tower - Maintenance', level: 'L2', workShift: 'Day',
    team: 'Alpha', status: 'Active', role: 'MSP Technician', buildingId: 'B-01',
  },
  {
    id: 'TEC-002', date: '2026-02-14', fullName: 'Kenji Watanabe', email: 'kenji.w@msp.io',
    phone: '+65 9334 4455', userGroup: 'Marina Bay - Operations', level: 'L3', workShift: 'Day',
    team: 'Bravo', status: 'Active', role: 'MSP Technician', buildingId: 'B-02',
  },
  {
    id: 'TEC-003', date: '2026-04-02', fullName: 'Lucas Fernandez', email: 'lucas.f@msp.io',
    phone: '+65 9445 5566', userGroup: 'Orchard Tower - Maintenance', level: 'L1', workShift: 'Night',
    team: 'Alpha', status: 'Inactive', role: 'MSP Technician', buildingId: 'B-01',
  },
];

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'REQ-1001', type: 'Tenant Request', status: 'Tenant Request', createdDate: '2026-06-14',
    buildingId: 'B-01', floor: 'L3', area: 'Office Unit 01', assetSystem: 'HVAC', assetType: 'Fan Coil Unit',
    assetCode: 'AST-HVAC-018', description: 'Air conditioning in unit not cooling. Room temperature stays above 28°C.',
    submittedBy: 'Tenant — Globex Pte Ltd', tenantName: 'Sarah Lim', tenantPhone: '+65 9555 1212',
    tenantEmail: 'sarah.lim@globex.com', attachments: [{ name: 'fcu_photo.jpg', kind: 'photo' }],
    history: [{ timestamp: '2026-06-14 09:12', label: 'Request submitted by Tenant' }],
  },
  {
    id: 'REQ-1002', type: 'Supervisor Ad-hoc', status: 'Pending', createdDate: '2026-06-13',
    buildingId: 'B-01', floor: 'B1', area: 'Plant Room', assetSystem: 'Electrical', assetType: 'Diesel Generator',
    assetCode: 'AST-ELE-004', description: 'Generator emits abnormal noise during weekly test run. Recommend ad-hoc inspection.',
    submittedBy: 'MSP Supervisor — Daniel Cheng',
    attachments: [{ name: 'gen_report.pdf', kind: 'pdf' }],
    history: [{ timestamp: '2026-06-13 14:30', label: 'Ad-hoc request submitted by Supervisor' }],
  },
  {
    id: 'REQ-1003', type: 'Service Request Accepted', status: 'Service Request Accepted', createdDate: '2026-06-12',
    buildingId: 'B-02', floor: 'L2', area: 'Retail Unit A', assetSystem: 'Plumbing', assetType: 'Booster Pump',
    assetCode: 'AST-PLM-009', description: 'Low water pressure reported by retail tenant. Awaiting supervisor review.',
    submittedBy: 'Tenant — Aroma Cafe', tenantName: 'James Ong', tenantPhone: '+65 9777 8899',
    tenantEmail: 'james@aromacafe.sg', assignedSupervisor: 'Priya Nair',
    attachments: [],
    history: [
      { timestamp: '2026-06-12 10:05', label: 'Request submitted by Tenant' },
      { timestamp: '2026-06-12 11:20', label: 'Accepted by Building Manager' },
    ],
  },
  {
    id: 'REQ-1004', type: 'Technician Ad-hoc', status: 'Pending', createdDate: '2026-06-11',
    buildingId: 'B-01', floor: 'L1', area: 'Lobby', assetSystem: 'Fire Safety', assetType: 'Smoke Detector',
    assetCode: 'AST-FIR-021', description: 'Smoke detector fault indicator active in lobby zone.',
    submittedBy: 'MSP Supervisor — Daniel Cheng (forwarded)',
    attachments: [],
    history: [{ timestamp: '2026-06-11 16:40', label: 'Forwarded by Supervisor for BM approval' }],
  },
  {
    id: 'REQ-1005', type: 'Tenant Request', status: 'Cancelled', createdDate: '2026-06-05',
    buildingId: 'B-02', floor: 'L1', area: 'Lobby', assetSystem: 'Elevator', assetType: 'Traction Elevator',
    assetCode: 'AST-ELV-002', description: 'Lift button panel flickering.',
    submittedBy: 'Tenant — Marina Retail', tenantName: 'Wei Chen', tenantPhone: '+65 9888 1234',
    tenantEmail: 'wei.chen@marinaretail.sg', attachments: [],
    history: [
      { timestamp: '2026-06-05 08:00', label: 'Request submitted by Tenant' },
      { timestamp: '2026-06-05 09:30', label: 'Declined by Building Manager. Reason: Duplicate of existing WO.' },
    ],
  },
];

const mainTech = { name: 'Aisha Rahman', email: 'aisha.rahman@msp.io', phone: '+65 9223 3344', level: 'L2' };

export const workOrders: WorkOrder[] = [
  {
    id: 'WO-5001', type: 'Maintenance Scheduling', status: 'Verified', createdDate: '2026-06-10',
    buildingId: 'B-01', floor: 'B1', area: 'Plant Room', assetCode: 'AST-HVAC-001', assetType: 'Centrifugal Chiller',
    subSystem: 'Chiller', assetSystem: 'HVAC', startTime: '2026-06-15 09:00', endTime: '2026-06-15 12:00',
    dueDate: '2026-06-15', timeRequired: '3 hours', overdue: false,
    description: 'Quarterly chiller preventive maintenance.', remark: 'All parameters within range.', photos: 4,
    mainTechnician: mainTech, subTechnicians: [{ name: 'Lucas Fernandez', email: 'lucas.f@msp.io', phone: '+65 9445 5566', level: 'L1' }],
    checklist: [
      { description: 'Inspect compressor oil level', completed: true, photos: 1 },
      { description: 'Clean condenser tubes', completed: true, photos: 2 },
      { description: 'Check refrigerant pressure', completed: true, photos: 1 },
    ],
    parts: [{ source: 'Store Room A', sparePartName: 'Oil Filter', code: 'SP-1001', quantity: 1 }],
    planRef: { round: 2, planId: 'MP-301', planName: 'HVAC Chiller Quarterly', frequency: 'Quarterly' },
    history: [
      { timestamp: '2026-06-10 08:00', label: 'Work order auto-generated from plan MP-301' },
      { timestamp: '2026-06-15 12:30', label: 'Completed by Aisha Rahman' },
      { timestamp: '2026-06-16 09:00', label: 'Verified by Supervisor Daniel Cheng' },
    ],
  },
  {
    id: 'WO-5002', type: 'Ad-hoc Work', status: 'Started', createdDate: '2026-06-13',
    buildingId: 'B-01', floor: 'B1', area: 'Plant Room', assetCode: 'AST-ELE-004', assetType: 'Diesel Generator',
    subSystem: 'Generator', assetSystem: 'Electrical', startTime: '2026-06-16 10:00', endTime: '—',
    dueDate: '2026-06-17', timeRequired: '4 hours', overdue: false,
    description: 'Investigate abnormal generator noise.', remark: '', photos: 1,
    mainTechnician: mainTech, subTechnicians: [], checklist: [
      { description: 'Inspect alternator bearings', completed: true, photos: 1 },
      { description: 'Check fuel injection system', completed: false, photos: 0 },
    ],
    parts: [],
    history: [
      { timestamp: '2026-06-13 15:00', label: 'Approved by Building Manager' },
      { timestamp: '2026-06-16 10:00', label: 'Started by Aisha Rahman' },
    ],
  },
  {
    id: 'WO-5003', type: 'Service Request', status: 'Pending - Unassigned', createdDate: '2026-06-14',
    buildingId: 'B-02', floor: 'L2', area: 'Retail Unit A', assetCode: 'AST-PLM-009', assetType: 'Booster Pump',
    subSystem: 'Pump', assetSystem: 'Plumbing', startTime: '—', endTime: '—',
    dueDate: '2026-06-18', timeRequired: '2 hours', overdue: false,
    description: 'Restore water pressure for retail unit.', remark: '', photos: 0,
    subTechnicians: [], checklist: [], parts: [],
    history: [{ timestamp: '2026-06-14 12:00', label: 'Approved and ready for assignment' }],
  },
  {
    id: 'WO-5004', type: 'Maintenance Scheduling', status: 'Completed', createdDate: '2026-06-08',
    buildingId: 'B-01', floor: 'L1', area: 'Lobby', assetCode: 'AST-FIR-021', assetType: 'Smoke Detector',
    subSystem: 'Smoke Detector', assetSystem: 'Fire Safety', startTime: '2026-06-12 09:00', endTime: '2026-06-12 10:30',
    dueDate: '2026-06-12', timeRequired: '1.5 hours', overdue: false,
    description: 'Monthly fire-safety detector test.', remark: 'Replaced faulty detector.', photos: 3,
    mainTechnician: mainTech, subTechnicians: [], checklist: [
      { description: 'Test detector sensitivity', completed: true, photos: 2 },
      { description: 'Replace faulty unit', completed: true, photos: 1 },
    ],
    parts: [{ source: 'Store Room A', sparePartName: 'Smoke Detector Module', code: 'SP-1004', quantity: 1 }],
    planRef: { round: 5, planId: 'MP-302', planName: 'Fire Safety Monthly', frequency: 'Monthly' },
    history: [
      { timestamp: '2026-06-08 08:00', label: 'Work order auto-generated from plan MP-302' },
      { timestamp: '2026-06-12 10:30', label: 'Completed by Aisha Rahman' },
    ],
  },
  {
    id: 'WO-5005', type: 'Ad-hoc Work', status: 'Closed', createdDate: '2026-05-28',
    buildingId: 'B-02', floor: 'L1', area: 'Lobby', assetCode: 'AST-ELV-002', assetType: 'Traction Elevator',
    subSystem: 'Traction', assetSystem: 'Elevator', startTime: '2026-05-30 09:00', endTime: '2026-05-30 14:00',
    dueDate: '2026-05-30', timeRequired: '5 hours', overdue: false,
    description: 'Replace lift button panel.', remark: 'Panel replaced and tested.', photos: 5,
    mainTechnician: { name: 'Kenji Watanabe', email: 'kenji.w@msp.io', phone: '+65 9334 4455', level: 'L3' },
    subTechnicians: [], checklist: [{ description: 'Replace button panel', completed: true, photos: 3 }],
    parts: [{ source: 'Store Room B', sparePartName: 'Button Panel', code: 'SP-1005', quantity: 1 }],
    history: [
      { timestamp: '2026-05-28 10:00', label: 'Approved by Building Manager' },
      { timestamp: '2026-05-30 14:00', label: 'Completed by Kenji Watanabe' },
      { timestamp: '2026-05-31 09:00', label: 'Verified by Supervisor Priya Nair' },
      { timestamp: '2026-06-01 10:00', label: 'Closed by Building Manager' },
    ],
  },
  {
    id: 'WO-5006', type: 'Maintenance Scheduling', status: 'Verification Rejected', createdDate: '2026-06-02',
    buildingId: 'B-01', floor: 'L2', area: 'Office Unit 02', assetCode: 'AST-HVAC-018', assetType: 'Fan Coil Unit',
    subSystem: 'FCU', assetSystem: 'HVAC', startTime: '2026-06-09 09:00', endTime: '2026-06-09 10:00',
    dueDate: '2026-06-09', timeRequired: '1 hour', overdue: true,
    description: 'Monthly FCU cleaning.', remark: 'Photos incomplete.', photos: 1,
    mainTechnician: mainTech, subTechnicians: [], checklist: [
      { description: 'Clean filters', completed: true, photos: 1 },
    ],
    parts: [],
    planRef: { round: 6, planId: 'MP-303', planName: 'HVAC FCU Monthly', frequency: 'Monthly' },
    history: [
      { timestamp: '2026-06-02 08:00', label: 'Auto-generated from plan MP-303' },
      { timestamp: '2026-06-09 10:00', label: 'Completed by Aisha Rahman' },
      { timestamp: '2026-06-09 15:00', label: 'Verified by Supervisor' },
      { timestamp: '2026-06-10 09:00', label: 'Rejected by Building Manager. Reason: Insufficient photo evidence.' },
    ],
  },
];

export const assets: Asset[] = [
  {
    id: 'AST-HVAC-001', name: 'Chiller Unit 1', code: 'AST-HVAC-001', assetTag: 'HVAC-CHL-B1-01',
    assetSystem: 'HVAC', subSystem: 'Chiller',
    assetType: 'Centrifugal Chiller', buildingId: 'B-01', floor: 'B1', area: 'Plant Room', model: 'CVHG-450',
    serialNumber: 'TR-2021-0091', brand: 'Trane', purchaseDate: '2021-03-15', manufacturedDate: '2020-11-01',
    status: 'Active', photos: 2, health: 92,
    origin: 'USA', yearOfManufacture: '2020', usageDate: '2021-04-01', warrantyExpiry: '2026-03-15',
    specification: '450 RT centrifugal chiller, R-134a refrigerant, magnetic bearing.',
    maintenanceFrequency: 'Quarterly', documents: 2,
    checklist: [
      { name: 'Inspect compressor oil level', requireDescription: true, requirePhotos: true },
      { name: 'Clean condenser tubes', requireDescription: false, requirePhotos: true },
      { name: 'Check refrigerant pressure', requireDescription: true, requirePhotos: false },
    ],
  },
  {
    id: 'AST-ELE-004', name: 'Backup Generator', code: 'AST-ELE-004', assetTag: 'ELE-GEN-B1-01',
    assetSystem: 'Electrical', subSystem: 'Generator',
    assetType: 'Diesel Generator', buildingId: 'B-01', floor: 'B1', area: 'Plant Room', model: 'DG-500KVA',
    serialNumber: 'CAT-2019-2211', brand: 'Caterpillar', purchaseDate: '2019-06-20', manufacturedDate: '2019-01-10',
    status: 'Under Maintenance', photos: 1, health: 68,
    origin: 'USA', yearOfManufacture: '2019', usageDate: '2019-07-01', warrantyExpiry: '2024-06-20',
    specification: '500 kVA standby diesel generator with automatic transfer switch.',
    maintenanceFrequency: 'Monthly', documents: 1,
    checklist: [
      { name: 'Inspect alternator bearings', requireDescription: true, requirePhotos: true },
      { name: 'Check fuel injection system', requireDescription: true, requirePhotos: false },
    ],
  },
  {
    id: 'AST-PLM-009', name: 'Booster Pump A', code: 'AST-PLM-009', assetTag: 'PLM-PMP-B1-01',
    assetSystem: 'Plumbing', subSystem: 'Pump',
    assetType: 'Booster Pump', buildingId: 'B-02', floor: 'B1', area: 'Mechanical Room', model: 'BP-220',
    serialNumber: 'GR-2022-3345', brand: 'Grundfos', purchaseDate: '2022-08-01', manufacturedDate: '2022-04-12',
    status: 'Active', photos: 0, health: 85,
    origin: 'Denmark', yearOfManufacture: '2022', usageDate: '2022-09-01', warrantyExpiry: '2027-08-01',
    specification: 'Variable-speed booster pump, 22 m head, 220 L/min.',
    maintenanceFrequency: 'Semi-Annually', documents: 0,
    checklist: [
      { name: 'Check seal for leaks', requireDescription: false, requirePhotos: true },
    ],
  },
  {
    id: 'AST-FIR-021', name: 'Lobby Smoke Detector', code: 'AST-FIR-021', assetTag: 'FIR-SMK-L1-01',
    assetSystem: 'Fire Safety',
    subSystem: 'Smoke Detector', assetType: 'Smoke Detector', buildingId: 'B-01', floor: 'L1', area: 'Lobby',
    model: 'SD-100', serialNumber: 'HW-2023-7781', brand: 'Honeywell', purchaseDate: '2023-02-10',
    manufacturedDate: '2022-12-01', status: 'Active', photos: 1, health: 78,
    origin: 'USA', yearOfManufacture: '2022', usageDate: '2023-03-01', warrantyExpiry: '2028-02-10',
    specification: 'Photoelectric smoke detector, addressable loop device.',
    maintenanceFrequency: 'Monthly', documents: 1,
    checklist: [
      { name: 'Test detector sensitivity', requireDescription: true, requirePhotos: true },
    ],
  },
  {
    id: 'AST-ELV-002', name: 'Passenger Lift 2', code: 'AST-ELV-002', assetTag: 'ELV-TRC-L1-02',
    assetSystem: 'Elevator', subSystem: 'Traction',
    assetType: 'Traction Elevator', buildingId: 'B-02', floor: 'L1', area: 'Lobby', model: 'GeN2-1000',
    serialNumber: 'OT-2020-5567', brand: 'Otis', purchaseDate: '2020-09-30', manufacturedDate: '2020-05-15',
    status: 'Active', photos: 3, health: 88,
    origin: 'USA', yearOfManufacture: '2020', usageDate: '2020-10-15', warrantyExpiry: '2025-09-30',
    specification: 'Gearless traction elevator, 1000 kg capacity, 13 persons.',
    maintenanceFrequency: 'Monthly', documents: 3,
    checklist: [
      { name: 'Inspect traction cables', requireDescription: true, requirePhotos: true },
      { name: 'Test emergency brake', requireDescription: true, requirePhotos: false },
    ],
  },
  {
    id: 'AST-HVAC-018', name: 'FCU Office L2', code: 'AST-HVAC-018', assetTag: 'HVAC-FCU-L2-01',
    assetSystem: 'HVAC', subSystem: 'FCU',
    assetType: 'Fan Coil Unit', buildingId: 'B-01', floor: 'L2', area: 'Office Unit 02', model: 'FCU-04',
    serialNumber: 'DK-2021-1190', brand: 'Daikin', purchaseDate: '2021-07-22', manufacturedDate: '2021-03-01',
    status: 'Inactive', photos: 0, health: 54,
    origin: 'Japan', yearOfManufacture: '2021', usageDate: '2021-08-01', warrantyExpiry: '2026-07-22',
    specification: '4-pipe fan coil unit, 3-speed fan, 2.5 kW cooling.',
    maintenanceFrequency: 'Monthly', documents: 0,
    checklist: [
      { name: 'Clean filters', requireDescription: false, requirePhotos: true },
    ],
  },
];

/** Per-floor as-built drawings used by the Drawings module. */
export const floorDrawings: FloorDrawing[] = [
  {
    id: 'DRW-001', buildingId: 'B-01', floor: 'B1', fileName: 'OrchardTower_B1_AsBuilt.pdf',
    uploadedAt: '2026-02-10 09:30',
    tags: [
      { id: 'T-1', label: 'AST-HVAC-001', x: 32, y: 44 },
      { id: 'T-2', label: 'AST-ELE-004', x: 64, y: 60 },
    ],
  },
  {
    id: 'DRW-002', buildingId: 'B-01', floor: 'L1', fileName: 'OrchardTower_L1_AsBuilt.pdf',
    uploadedAt: '2026-02-12 14:05',
    tags: [{ id: 'T-3', label: 'AST-FIR-021', x: 50, y: 38 }],
  },
  {
    id: 'DRW-003', buildingId: 'B-02', floor: 'L1', fileName: 'MarinaBay_L1_AsBuilt.pdf',
    uploadedAt: '2026-03-01 11:20',
    tags: [{ id: 'T-4', label: 'AST-ELV-002', x: 42, y: 55 }],
  },
];

export const spareParts: SparePart[] = [
  {
    id: 'SP-1001', code: 'SP-1001', name: 'Oil Filter', assetSystem: 'HVAC', subSystem: 'Chiller',
    assetType: 'Centrifugal Chiller', brand: 'Trane', model: 'OF-450', serialNumber: '—', quantity: 24,
    totalStock: 24, available: 20, onHold: 4, department: 'Maintenance', storeRoom: 'Store Room A',
    origin: 'USA', purchaseDate: '2026-01-05', yearOfManufacture: '2025', usageDate: '—',
    warrantyExpiry: '2027-01-05', specification: 'High-flow oil filter for centrifugal chillers.',
    status: 'Active', buildingId: 'B-01',
    history: [
      { timestamp: '2026-01-05 10:00', label: 'Initial stock-in: 24 units' },
      { timestamp: '2026-06-15 12:30', label: 'Reserved 4 units for WO-5001' },
    ],
  },
  {
    id: 'SP-1002', code: 'SP-1002', name: 'Air Filter Cartridge', assetSystem: 'HVAC', subSystem: 'AHU',
    assetType: 'Air Handling Unit', brand: 'Camfil', model: 'AF-30', serialNumber: '—', quantity: 50,
    totalStock: 50, available: 50, onHold: 0, department: 'Maintenance', storeRoom: 'Store Room A',
    origin: 'Sweden', purchaseDate: '2026-02-10', yearOfManufacture: '2025', usageDate: '—',
    warrantyExpiry: '2028-02-10', specification: 'MERV-13 air filter cartridge.',
    status: 'Active', buildingId: 'B-01',
    history: [{ timestamp: '2026-02-10 09:00', label: 'Initial stock-in: 50 units' }],
  },
  {
    id: 'SP-1004', code: 'SP-1004', name: 'Smoke Detector Module', assetSystem: 'Fire Safety',
    subSystem: 'Smoke Detector', assetType: 'Smoke Detector', brand: 'Honeywell', model: 'SD-100M',
    serialNumber: '—', quantity: 8, totalStock: 8, available: 7, onHold: 0, department: 'Fire Safety',
    storeRoom: 'Store Room A', origin: 'USA', purchaseDate: '2026-03-01', yearOfManufacture: '2025',
    usageDate: '2026-06-12', warrantyExpiry: '2029-03-01', specification: 'Photoelectric smoke sensor module.',
    status: 'Active', buildingId: 'B-01',
    history: [
      { timestamp: '2026-03-01 10:00', label: 'Initial stock-in: 8 units' },
      { timestamp: '2026-06-12 10:30', label: 'Stock-out: 1 unit for WO-5004' },
    ],
  },
  {
    id: 'SP-1005', code: 'SP-1005', name: 'Lift Button Panel', assetSystem: 'Elevator', subSystem: 'Traction',
    assetType: 'Traction Elevator', brand: 'Otis', model: 'BP-GEN2', serialNumber: '—', quantity: 0,
    totalStock: 3, available: 0, onHold: 0, department: 'Elevator', storeRoom: 'Store Room B',
    origin: 'China', purchaseDate: '2025-12-01', yearOfManufacture: '2025', usageDate: '2026-05-30',
    warrantyExpiry: '2027-12-01', specification: 'Replacement button panel for GeN2 elevators.',
    status: 'Inactive', buildingId: 'B-02',
    history: [
      { timestamp: '2025-12-01 09:00', label: 'Initial stock-in: 3 units' },
      { timestamp: '2026-05-30 14:00', label: 'Stock-out: 1 unit for WO-5005' },
    ],
  },
];

export const stockInTxns: StockTxn[] = [
  { id: 'SI-001', date: '2026-06-10', sparePartCode: 'SP-1001', sparePartName: 'Oil Filter', quantity: 12, sourceReference: 'PO-2026-0451', recordedBy: 'Building Manager' },
  { id: 'SI-002', date: '2026-06-05', sparePartCode: 'SP-1002', sparePartName: 'Air Filter Cartridge', quantity: 25, sourceReference: 'PO-2026-0448', recordedBy: 'Building Manager' },
  { id: 'SI-003', date: '2026-05-20', sparePartCode: 'SP-1004', sparePartName: 'Smoke Detector Module', quantity: 8, sourceReference: 'PO-2026-0440', recordedBy: 'Building Manager' },
];

export const stockOutTxns: StockTxn[] = [
  { id: 'SO-001', date: '2026-06-15', sparePartCode: 'SP-1001', sparePartName: 'Oil Filter', quantity: 1, woId: 'WO-5001', sourceReference: 'WO-5001', recordedBy: 'System', status: 'Consumed' },
  { id: 'SO-002', date: '2026-06-12', sparePartCode: 'SP-1004', sparePartName: 'Smoke Detector Module', quantity: 1, woId: 'WO-5004', sourceReference: 'WO-5004', recordedBy: 'System', status: 'Consumed' },
  { id: 'SO-003', date: '2026-05-30', sparePartCode: 'SP-1005', sparePartName: 'Lift Button Panel', quantity: 1, woId: 'WO-5005', sourceReference: 'WO-5005', recordedBy: 'System', status: 'Consumed' },
];

export const maintenancePlans: MaintenancePlan[] = [
  {
    id: 'MP-301', name: 'HVAC Chiller Quarterly', frequency: 'Quarterly', assetSystem: 'HVAC', subSystem: 'Chiller',
    assetType: 'Centrifugal Chiller', buildingId: 'B-01', timeRequired: '3 hours',
    description: 'Quarterly preventive maintenance for all chiller units.', remark: 'Schedule during off-peak.',
    photos: 2, status: 'Active', createdBy: 'Building Manager', createdDate: '2026-01-15',
    rounds: [
      { roundNo: 1, startDate: '2026-01-15', endDate: '2026-01-31', status: 'Closed', completionRate: 100 },
      { roundNo: 2, startDate: '2026-04-15', endDate: '2026-04-30', status: 'In Progress', completionRate: 75 },
    ],
    assets: [
      { assetCode: 'AST-HVAC-001', assetName: 'Chiller Unit 1', location: 'B1 / Plant Room', mainTechnician: 'Aisha Rahman', woStatus: 'Verified' },
    ],
    workOrders: [
      { woId: 'WO-5001', asset: 'AST-HVAC-001', round: 2, technician: 'Aisha Rahman', status: 'Verified', completionDate: '2026-06-15' },
    ],
    history: [
      { timestamp: '2026-01-15 09:00', label: 'Plan created by Building Manager' },
      { timestamp: '2026-04-15 08:00', label: 'Round 2 work orders generated' },
    ],
  },
  {
    id: 'MP-302', name: 'Fire Safety Monthly', frequency: 'Monthly', assetSystem: 'Fire Safety',
    subSystem: 'Smoke Detector', assetType: 'Smoke Detector', buildingId: 'B-01', timeRequired: '1.5 hours',
    description: 'Monthly fire-safety detector inspection.', remark: '', photos: 0, status: 'Active',
    createdBy: 'Building Manager', createdDate: '2026-01-20',
    rounds: [
      { roundNo: 5, startDate: '2026-06-01', endDate: '2026-06-30', status: 'In Progress', completionRate: 100 },
    ],
    assets: [
      { assetCode: 'AST-FIR-021', assetName: 'Lobby Smoke Detector', location: 'L1 / Lobby', mainTechnician: 'Aisha Rahman', woStatus: 'Completed' },
    ],
    workOrders: [
      { woId: 'WO-5004', asset: 'AST-FIR-021', round: 5, technician: 'Aisha Rahman', status: 'Completed', completionDate: '2026-06-12' },
    ],
    history: [{ timestamp: '2026-01-20 10:00', label: 'Plan created by Building Manager' }],
  },
  {
    id: 'MP-303', name: 'HVAC FCU Monthly', frequency: 'Monthly', assetSystem: 'HVAC', subSystem: 'FCU',
    assetType: 'Fan Coil Unit', buildingId: 'B-01', timeRequired: '1 hour',
    description: 'Monthly FCU cleaning across office units.', remark: 'Submitted for BM approval.', photos: 0,
    status: 'Pending', createdBy: 'MSP Supervisor — Daniel Cheng', createdDate: '2026-06-01',
    rounds: [], assets: [], workOrders: [],
    history: [{ timestamp: '2026-06-01 14:00', label: 'Plan submitted by MSP Supervisor for approval' }],
  },
  {
    id: 'MP-304', name: 'Elevator Annual Overhaul', frequency: 'Annually', assetSystem: 'Elevator',
    subSystem: 'Traction', assetType: 'Traction Elevator', buildingId: 'B-02', timeRequired: '8 hours',
    description: 'Annual elevator overhaul and certification.', remark: '', photos: 0, status: 'Inactive',
    createdBy: 'Building Manager', createdDate: '2025-09-01',
    rounds: [{ roundNo: 1, startDate: '2025-09-01', endDate: '2025-09-15', status: 'Closed', completionRate: 100 }],
    assets: [
      { assetCode: 'AST-ELV-002', assetName: 'Passenger Lift 2', location: 'L1 / Lobby', mainTechnician: 'Kenji Watanabe', woStatus: 'Closed' },
    ],
    workOrders: [],
    history: [{ timestamp: '2025-09-01 09:00', label: 'Plan created by Building Manager' }],
  },
];

export const unavailableRequests: UnavailableRequest[] = [
  {
    id: 'UR-001', woId: 'WO-5005', sparePartCode: 'SP-1005', sparePartName: 'Lift Button Panel',
    requestedQty: 2, availableQty: 0, bmNote: '', status: 'Unavailable', dateFlagged: '2026-06-14',
  },
  {
    id: 'UR-002', woId: 'WO-5004', sparePartCode: 'SP-1004', sparePartName: 'Smoke Detector Module',
    requestedQty: 5, availableQty: 7, bmNote: 'Restock arriving next week.', status: 'Waiting for Restock', dateFlagged: '2026-06-11',
  },
  {
    id: 'UR-003', woId: 'WO-5001', sparePartCode: 'SP-1001', sparePartName: 'Oil Filter',
    requestedQty: 6, availableQty: 4, bmNote: 'Proceed with other checklist items.', status: 'Approved to Continue', dateFlagged: '2026-06-09',
  },
];
