/**
 * Realistic CMMS mock data for the Admin CMS demo (buildings, users, asset
 * classification, assets, spare parts, inventory transactions, maintenance
 * plans). All static — used to drive the DataGrids, detail pages and charts.
 */
import type {
  AppRole,
  Asset,
  AssetSubsystem,
  AssetSystem,
  AssetType,
  Building,
  Campus,
  MaintenancePlan,
  OnHoldRecord,
  SparePart,
  SparePartCategory,
  StockInRecord,
  StockOutRecord,
  UnavailableRecord,
  UsageRecord,
  AppUser,
  UserGroup,
  FaultyAsset,
  AdHocWorkOrder,
  RoundAssetResult,
  RoundFault,
} from './types';

/**
 * Optional Campus groupings. Purely organizational — see the `Campus` type doc.
 * Buildings reference a campus via `campusId`; an undefined `campusId` is standalone.
 */
export const campuses: Campus[] = [
  { id: 'CMP-001', name: 'Ho Chi Minh City Portfolio', code: 'HCMC', description: 'Properties located in Ho Chi Minh City.', status: 'Active', createdAt: '2025-01-15' },
  { id: 'CMP-002', name: 'Hanoi Portfolio', code: 'HN', description: 'Properties located in Hanoi.', status: 'Active', createdAt: '2025-02-02' },
  { id: 'CMP-003', name: 'Legacy Portfolio', code: 'LEG', description: 'Decommissioned grouping kept for reference.', status: 'Archived', createdAt: '2024-08-20' },
];

/** Campus display-name lookup (empty string for standalone / unknown). */
export const campusName = (id?: string) => (id ? campuses.find((c) => c.id === id)?.name ?? '' : '');

export const buildings: Building[] = [
  {
    id: 'BLD-001',
    name: 'Landmark 81',
    address: '720A Dien Bien Phu, Binh Thanh, Ho Chi Minh City',
    status: 'Active',
    campusId: 'CMP-001',
    hasDrawing: true,
    tenantSignOffEnabled: true,
    managerIds: ['USR-002'],
    supervisorIds: ['USR-003', 'USR-005'],
    floors: [
      { id: 'F-001', name: 'B2', hasDrawing: true, drawingName: 'L81-B2-asbuilt.pdf', areas: [{ id: 'A-001', name: 'Parking B2', type: 'Area' }] },
      { id: 'F-002', name: 'Ground Floor', hasDrawing: true, drawingName: 'L81-GF-asbuilt.pdf', areas: [
        { id: 'A-002', name: 'Lobby', type: 'Area' },
        { id: 'A-003', name: 'Retail Unit G-01', type: 'Unit' },
      ] },
      { id: 'F-003', name: 'Level 5', hasDrawing: false, areas: [{ id: 'A-004', name: 'Plant Room', type: 'Area' }] },
      { id: 'F-004', name: 'Rooftop', hasDrawing: false, areas: [{ id: 'A-005', name: 'Cooling Tower Deck', type: 'Area' }] },
    ],
    buildingDrawingName: 'L81-site-plan.pdf',
    teams: [
      { id: 'TM-010', name: 'HVAC Team', description: 'Chiller plant and air handling.' },
      { id: 'TM-011', name: 'Electrical Team', description: 'MEP electrical maintenance.' },
    ],
  },
  {
    id: 'BLD-002',
    name: 'Bitexco Financial Tower',
    address: '2 Hai Trieu, District 1, Ho Chi Minh City',
    status: 'Active',
    campusId: 'CMP-001',
    hasDrawing: false,
    tenantSignOffEnabled: false,
    managerIds: ['USR-006'],
    supervisorIds: ['USR-005'],
    floors: [
      { id: 'F-005', name: 'B1', hasDrawing: false, areas: [{ id: 'A-006', name: 'MEP Room', type: 'Area' }] },
      { id: 'F-006', name: 'Level 12', hasDrawing: false, areas: [{ id: 'A-007', name: 'Office Suite 12A', type: 'Unit' }] },
    ],
    teams: [
      { id: 'TM-001', name: 'Fire Protection Team', description: 'Fire alarm, sprinkler and suppression systems.' },
      { id: 'TM-002', name: 'HVAC Team', description: 'Chillers, AHUs, FCUs and ventilation.' },
      { id: 'TM-003', name: 'Electrical Team', description: 'Power distribution, lighting and generators.' },
      { id: 'TM-004', name: 'Plumbing Team', description: 'Water supply, drainage and pumps.' },
    ],
  },
  {
    id: 'BLD-003',
    name: 'Vincom Center Dong Khoi',
    address: '72 Le Thanh Ton, District 1, Ho Chi Minh City',
    status: 'Active',
    hasDrawing: true,
    tenantSignOffEnabled: true,
    managerIds: [],
    supervisorIds: ['USR-005'],
    floors: [
      { id: 'F-007', name: 'Ground Floor', hasDrawing: true, drawingName: 'VCDK-GF-asbuilt.pdf', areas: [{ id: 'A-008', name: 'Atrium', type: 'Area' }] },
      { id: 'F-008', name: 'Level 3', hasDrawing: false, areas: [] },
    ],
  },
  {
    id: 'BLD-004',
    name: 'Keangnam Hanoi Landmark',
    address: 'Pham Hung, Nam Tu Liem, Hanoi',
    status: 'Inactive',
    campusId: 'CMP-002',
    hasDrawing: false,
    tenantSignOffEnabled: false,
    managerIds: [],
    supervisorIds: [],
    floors: [{ id: 'F-009', name: 'Level 1', hasDrawing: false, areas: [{ id: 'A-009', name: 'Reception', type: 'Area' }] }],
  },
];

export const roles: AppRole[] = [
  {
    id: 'ROLE-1',
    name: 'Super Admin',
    description: 'Full system administrator with global access to all modules.',
    scope: 'All buildings / All systems',
    permissions: [
      'Buildings: Read / Write / Delete',
      'Users & Groups: Read / Write / Delete',
      'Assets & Classification: Read / Write / Delete',
      'Inventory: Read / Write / Delete',
      'Maintenance Plans: Read / Write / Delete',
      'Dashboards & Reports: Read',
    ],
  },
  {
    id: 'ROLE-2',
    name: 'Building Manager',
    description: 'Manages operations for assigned buildings.',
    scope: 'Assigned buildings',
    permissions: [
      'Assets: Read / Write',
      'Work Orders: Read / Write / Approve',
      'Inventory: Read',
      'Service Requests: Read / Approve',
    ],
  },
  {
    id: 'ROLE-3',
    name: 'MSP Supervisor',
    description: 'Supervises maintenance teams within their user group scope.',
    scope: 'User Group scope',
    permissions: ['Work Orders: Read / Assign', 'Maintenance Plans: Read / Submit', 'Assets: Read'],
  },
  {
    id: 'ROLE-4',
    name: 'MSP Technician',
    description: 'Executes work orders on mobile. No web access.',
    scope: 'User Group scope',
    permissions: ['Work Orders: Read / Execute (mobile only)'],
  },
];

export const userGroups: UserGroup[] = [
  {
    id: 'UG-001',
    name: 'HVAC Team A',
    description: 'Handles HVAC systems across District 1 towers.',
    status: 'Active',
    buildingIds: ['BLD-001', 'BLD-002'],
    systemIds: ['SYS-001'],
    memberIds: ['USR-003', 'USR-004'],
    assetScopes: [
      { id: 'ASC-1', systemId: 'SYS-001', subsystemId: 'SUB-001', typeId: 'AT-002' },
      { id: 'ASC-2', systemId: 'SYS-001', subsystemId: 'SUB-002', typeId: 'All' },
    ],
    locationScopes: [
      { id: 'LSC-1', buildingId: 'BLD-001', floorId: 'F-002', areaId: 'All' },
      { id: 'LSC-2', buildingId: 'BLD-002', floorId: 'All', areaId: 'All' },
    ],
  },
  {
    id: 'UG-002',
    name: 'Vertical Transport Crew',
    description: 'Elevators and escalators specialists.',
    status: 'Active',
    buildingIds: ['BLD-001', 'BLD-003'],
    systemIds: ['SYS-002'],
    memberIds: ['USR-005'],
    assetScopes: [{ id: 'ASC-3', systemId: 'SYS-002', subsystemId: 'SUB-003', typeId: 'AT-003' }],
    locationScopes: [{ id: 'LSC-3', buildingId: 'BLD-001', floorId: 'All', areaId: 'All' }],
  },
  {
    id: 'UG-003',
    name: 'Power & Generators',
    description: 'Generator and electrical distribution team.',
    status: 'Inactive',
    buildingIds: ['BLD-002'],
    systemIds: ['SYS-003'],
    memberIds: [],
    assetScopes: [],
    locationScopes: [],
  },
];

export const users: AppUser[] = [
  { id: 'USR-001', fullName: 'Nguyen Van An', email: 'an.nguyen@ezaxis.com', role: 'Super Admin', status: 'Active', phone: '+84 901 234 567', level: 'L5', createdAt: '2026-05-20T09:00:00Z', buildingIds: [], workShift: 'Day (08:00-17:00)', team: 'Administration', avatarUrl: '' },
  { id: 'USR-002', fullName: 'Tran Thi Bich', email: 'bich.tran@ezaxis.com', role: 'Building Manager', status: 'Active', phone: '+84 902 345 678', level: 'L4', createdAt: '2026-05-18T09:00:00Z', buildingIds: ['BLD-001'], workShift: 'Day (08:00-17:00)', team: 'Building Ops', avatarUrl: '' },
  { id: 'USR-003', fullName: 'Le Hoang Cuong', email: 'cuong.le@ezaxis.com', role: 'MSP Supervisor', status: 'Active', phone: '+84 903 456 789', level: 'L4', createdAt: '2026-05-15T09:00:00Z', buildingIds: [], groupId: 'UG-001', workShift: 'Day (08:00-17:00)', team: 'HVAC Team A', avatarUrl: '' },
  { id: 'USR-004', fullName: 'Pham Minh Duc', email: 'duc.pham@ezaxis.com', role: 'MSP Technician', status: 'Active', phone: '+84 904 567 890', level: 'L2', createdAt: '2026-05-12T09:00:00Z', buildingIds: [], groupId: 'UG-001', workShift: 'Night (20:00-05:00)', team: 'HVAC Team A', avatarUrl: '' },
  { id: 'USR-005', fullName: 'Vo Thi Hoa', email: 'hoa.vo@ezaxis.com', role: 'MSP Supervisor', status: 'Active', phone: '+84 905 678 901', level: 'L3', createdAt: '2026-05-10T09:00:00Z', buildingIds: [], groupId: 'UG-002', workShift: 'Day (08:00-17:00)', team: 'Vertical Transport Crew', avatarUrl: '' },
  { id: 'USR-006', fullName: 'Dang Quoc Hung', email: 'hung.dang@ezaxis.com', role: 'Building Manager', status: 'Pending', phone: '', level: '', createdAt: '2026-06-14T09:00:00Z', buildingIds: ['BLD-002'], workShift: '', team: '', avatarUrl: '' },
  { id: 'USR-007', fullName: 'Bui Thanh Lam', email: 'lam.bui@ezaxis.com', role: 'MSP Technician', status: 'Inactive', phone: '+84 906 789 012', level: 'L1', createdAt: '2026-04-28T09:00:00Z', buildingIds: [], workShift: 'Day (08:00-17:00)', team: 'Power & Generators', avatarUrl: '' },
];

export const assetSystems: AssetSystem[] = [
  { id: 'SYS-001', name: 'HVAC', code: 'HVAC', status: 'Active', createdAt: '2026-01-10T09:00:00Z' },
  { id: 'SYS-002', name: 'Vertical Transportation', code: 'VT', status: 'Active', createdAt: '2026-01-11T09:00:00Z' },
  { id: 'SYS-003', name: 'Electrical Power', code: 'ELEC', status: 'Active', createdAt: '2026-01-12T09:00:00Z' },
  { id: 'SYS-004', name: 'Fire Protection', code: 'FIRE', status: 'Active', createdAt: '2026-01-13T09:00:00Z' },
  { id: 'SYS-005', name: 'Plumbing', code: 'PLB', status: 'Inactive', createdAt: '2026-01-14T09:00:00Z' },
];

export const assetSubsystems: AssetSubsystem[] = [
  { id: 'SUB-001', name: 'Chilled Water', code: 'HVAC-CW', status: 'Active', systemId: 'SYS-001', createdAt: '2026-01-15T09:00:00Z' },
  { id: 'SUB-002', name: 'Air Distribution', code: 'HVAC-AD', status: 'Active', systemId: 'SYS-001', createdAt: '2026-01-15T09:00:00Z' },
  { id: 'SUB-003', name: 'Passenger Lifts', code: 'VT-PL', status: 'Active', systemId: 'SYS-002', createdAt: '2026-01-16T09:00:00Z' },
  { id: 'SUB-004', name: 'Escalators', code: 'VT-ESC', status: 'Active', systemId: 'SYS-002', createdAt: '2026-01-16T09:00:00Z' },
  { id: 'SUB-005', name: 'Standby Generators', code: 'ELEC-GEN', status: 'Active', systemId: 'SYS-003', createdAt: '2026-01-17T09:00:00Z' },
  { id: 'SUB-006', name: 'Sprinkler', code: 'FIRE-SPR', status: 'Active', systemId: 'SYS-004', createdAt: '2026-01-18T09:00:00Z' },
];

export const assetTypes: AssetType[] = [
  {
    id: 'AT-001', name: 'Fan Coil Unit', code: 'FCU', systemId: 'SYS-001', subsystemId: 'SUB-002', status: 'Active', createdAt: '2026-02-01T09:00:00Z',
    checklist: [
      { id: 'CL-1', name: 'Inspect air filter', description: 'Required', photos: 'Optional' },
      { id: 'CL-2', name: 'Check condensate drain', description: 'Optional', photos: 'Off' },
      { id: 'CL-3', name: 'Measure supply air temperature', description: 'Required', photos: 'Required' },
    ],
  },
  {
    id: 'AT-002', name: 'Chiller', code: 'CHLR', systemId: 'SYS-001', subsystemId: 'SUB-001', status: 'Active', createdAt: '2026-02-02T09:00:00Z',
    checklist: [
      { id: 'CL-4', name: 'Check refrigerant pressure', description: 'Required', photos: 'Required' },
      { id: 'CL-5', name: 'Inspect compressor oil level', description: 'Required', photos: 'Optional' },
    ],
  },
  {
    id: 'AT-003', name: 'Passenger Elevator', code: 'ELV', systemId: 'SYS-002', subsystemId: 'SUB-003', status: 'Active', createdAt: '2026-02-03T09:00:00Z',
    checklist: [
      { id: 'CL-6', name: 'Test emergency stop', description: 'Required', photos: 'Off' },
      { id: 'CL-7', name: 'Inspect door sensors', description: 'Required', photos: 'Optional' },
    ],
  },
  {
    id: 'AT-004', name: 'Diesel Generator', code: 'GEN', systemId: 'SYS-003', subsystemId: 'SUB-005', status: 'Active', createdAt: '2026-02-04T09:00:00Z',
    checklist: [{ id: 'CL-8', name: 'Check fuel level', description: 'Required', photos: 'Optional' }],
  },
  {
    id: 'AT-005', name: 'Escalator', code: 'ESC', systemId: 'SYS-002', subsystemId: 'SUB-004', status: 'Inactive', createdAt: '2026-02-05T09:00:00Z',
    checklist: [],
  },
];

export const assets: Asset[] = [
  { id: 'AS-001', name: 'FCU Lobby North', code: 'FCU-001', systemId: 'SYS-001', subsystemId: 'SUB-002', typeId: 'AT-001', buildingId: 'BLD-001', floorId: 'F-002', areaId: 'A-002', model: 'Daikin FWB-04', serial: 'SN-FCU-9001', brand: 'Daikin', purchaseDate: '2024-03-15', manufacturedDate: '2023-11-01', status: 'Active', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'AS-002', name: 'Chiller #1', code: 'CHLR-001', systemId: 'SYS-001', subsystemId: 'SUB-001', typeId: 'AT-002', buildingId: 'BLD-001', floorId: 'F-003', areaId: 'A-004', model: 'Trane CVHE-500', serial: 'SN-CHLR-5001', brand: 'Trane', purchaseDate: '2023-06-20', manufacturedDate: '2023-01-10', status: 'Active', createdAt: '2026-03-02T09:00:00Z' },
  { id: 'AS-003', name: 'Passenger Lift A', code: 'ELV-001', systemId: 'SYS-002', subsystemId: 'SUB-003', typeId: 'AT-003', buildingId: 'BLD-001', floorId: 'F-002', model: 'Otis Gen2', serial: 'SN-ELV-2001', brand: 'Otis', purchaseDate: '2022-09-01', manufacturedDate: '2022-05-01', status: 'Active', createdAt: '2026-03-03T09:00:00Z' },
  { id: 'AS-004', name: 'Standby Generator G1', code: 'GEN-001', systemId: 'SYS-003', subsystemId: 'SUB-005', typeId: 'AT-004', buildingId: 'BLD-002', floorId: 'F-005', areaId: 'A-006', model: 'Cummins C1100D5', serial: 'SN-GEN-1101', brand: 'Cummins', purchaseDate: '2023-02-14', manufacturedDate: '2022-10-01', status: 'Active', createdAt: '2026-03-04T09:00:00Z' },
  { id: 'AS-005', name: 'FCU Office 12A', code: 'FCU-002', systemId: 'SYS-001', subsystemId: 'SUB-002', typeId: 'AT-001', buildingId: 'BLD-002', floorId: 'F-006', areaId: 'A-007', model: 'Daikin FWB-02', serial: 'SN-FCU-9002', brand: 'Daikin', purchaseDate: '2024-05-10', status: 'Active', createdAt: '2026-03-05T09:00:00Z' },
  { id: 'AS-006', name: 'Escalator E1', code: 'ESC-001', systemId: 'SYS-002', subsystemId: 'SUB-004', typeId: 'AT-005', buildingId: 'BLD-003', floorId: 'F-007', areaId: 'A-008', model: 'Schindler 9300', serial: 'SN-ESC-3001', brand: 'Schindler', status: 'Inactive', createdAt: '2026-03-06T09:00:00Z' },
];

export const spareCategories: SparePartCategory[] = [
  { id: 'SPC-001', name: 'Air Filters', code: 'FLT', uom: 'pcs', description: 'Replacement filters for HVAC units.' },
  { id: 'SPC-002', name: 'Lubricants', code: 'LUB', uom: 'litre', description: 'Greases and oils for mechanical systems.' },
  { id: 'SPC-003', name: 'Belts & Bearings', code: 'BLT', uom: 'pcs', description: 'Drive belts and bearings.' },
  { id: 'SPC-004', name: 'Electrical Components', code: 'ELC', uom: 'pcs', description: 'Contactors, relays, fuses.' },
];

export const spareParts: SparePart[] = [
  {
    id: 'SP-001', name: 'HEPA Filter 24x24', code: 'FLT-001', categoryId: 'SPC-001', systemId: 'SYS-001', subsystemId: 'SUB-002', typeId: 'AT-001',
    brand: 'Camfil', model: 'Hi-Flo', serial: '', location: 'Landmark 81 - Basement Store', storeRoom: 'Store A - Shelf 3', department: 'Facilities', origin: 'Sweden',
    totalStock: 42, onHold: 4, minThreshold: 20, status: 'Active', createdAt: '2026-03-10T09:00:00Z', purchaseDate: '2026-02-01', yearOfManufacture: '2025', warrantyExpiry: '2027-02-01',
    specification: 'MERV 13, 610x610x292mm, suitable for FCU return air.',
    history: [
      { id: 'H1', date: '2026-06-01T10:00:00Z', action: 'Stock-In', quantity: 30, reference: 'PO-2026-0455', recordedBy: 'Nguyen Van An' },
      { id: 'H2', date: '2026-06-05T14:00:00Z', action: 'Stock-Out', quantity: 6, reference: 'WO-1042', recordedBy: 'System' },
      { id: 'H3', date: '2026-06-08T09:00:00Z', action: 'Reserved', quantity: 4, reference: 'WO-1051', recordedBy: 'System' },
    ],
  },
  {
    id: 'SP-002', name: 'Compressor Oil POE', code: 'LUB-001', categoryId: 'SPC-002', systemId: 'SYS-001', subsystemId: 'SUB-001', typeId: 'AT-002',
    brand: 'Emkarate', model: 'RL68H', serial: '', location: 'Landmark 81 - Basement Store', storeRoom: 'Store A - Shelf 1', department: 'Facilities', origin: 'UK',
    totalStock: 8, onHold: 0, minThreshold: 15, status: 'Active', createdAt: '2026-03-11T09:00:00Z', purchaseDate: '2026-01-15', yearOfManufacture: '2025', warrantyExpiry: '2028-01-15',
    specification: 'Polyolester lubricant for centrifugal chillers, 5L pail.',
    history: [
      { id: 'H4', date: '2026-05-20T10:00:00Z', action: 'Stock-In', quantity: 12, reference: 'PO-2026-0421', recordedBy: 'Nguyen Van An' },
      { id: 'H5', date: '2026-06-02T11:00:00Z', action: 'Stock-Out', quantity: 4, reference: 'WO-1038', recordedBy: 'System' },
    ],
  },
  {
    id: 'SP-003', name: 'Drive Belt B-Section', code: 'BLT-001', categoryId: 'SPC-003', systemId: 'SYS-002', subsystemId: 'SUB-004', typeId: 'AT-005',
    brand: 'Gates', model: 'B-45', serial: '', location: 'Vincom Center - Store B', storeRoom: 'Store B - Shelf 2', department: 'MSP', origin: 'USA',
    totalStock: 25, onHold: 2, minThreshold: 10, status: 'Active', createdAt: '2026-03-12T09:00:00Z',
    specification: 'V-belt for escalator drive, B-section, 45in.',
    history: [{ id: 'H6', date: '2026-05-28T10:00:00Z', action: 'Stock-In', quantity: 25, reference: 'Initial Stock', recordedBy: 'Nguyen Van An' }],
  },
  {
    id: 'SP-004', name: 'Contactor 3-Pole 40A', code: 'ELC-001', categoryId: 'SPC-004', systemId: 'SYS-003', subsystemId: 'SUB-005', typeId: 'AT-004',
    brand: 'Schneider', model: 'LC1D40', serial: '', location: 'Bitexco Tower - MEP Store', storeRoom: 'Store B - Shelf 5', department: 'MSP', origin: 'France',
    totalStock: 0, onHold: 0, minThreshold: 5, status: 'Inactive', createdAt: '2026-03-13T09:00:00Z',
    specification: '3-pole contactor, 40A, 230VAC coil.',
    history: [],
  },
];

export const stockInRecords: StockInRecord[] = [
  { id: 'SI-001', date: '2026-06-01T10:00:00Z', partId: 'SP-001', quantity: 30, reference: 'PO-2026-0455', recordedBy: 'Nguyen Van An' },
  { id: 'SI-002', date: '2026-05-20T10:00:00Z', partId: 'SP-002', quantity: 12, reference: 'PO-2026-0421', recordedBy: 'Nguyen Van An' },
  { id: 'SI-003', date: '2026-05-28T10:00:00Z', partId: 'SP-003', quantity: 25, reference: 'Initial Stock', recordedBy: 'Nguyen Van An' },
];

export const stockOutRecords: StockOutRecord[] = [
  { id: 'SO-001', date: '2026-06-05T14:00:00Z', partId: 'SP-001', quantity: 6, woId: 'WO-1042', reference: 'Maintenance Scheduling', processedBy: 'System', status: 'Consumed' },
  { id: 'SO-002', date: '2026-06-02T11:00:00Z', partId: 'SP-002', quantity: 4, woId: 'WO-1038', reference: 'Ad-hoc Work', processedBy: 'System', status: 'Consumed' },
  { id: 'SO-003', date: '2026-05-30T09:00:00Z', partId: 'SP-003', quantity: 2, woId: 'WO-1031', reference: 'Maintenance Scheduling', processedBy: 'System', status: 'Reversed' },
];

export const onHoldRecords: OnHoldRecord[] = [
  { id: 'OH-001', partId: 'SP-001', quantity: 4, woId: 'WO-1051', reservedDate: '2026-06-08T09:00:00Z', status: 'Active' },
  { id: 'OH-002', partId: 'SP-003', quantity: 2, woId: 'WO-1055', reservedDate: '2026-06-12T09:00:00Z', status: 'Active' },
  { id: 'OH-003', partId: 'SP-002', quantity: 3, woId: 'WO-1040', reservedDate: '2026-06-01T09:00:00Z', status: 'Consumed' },
];

export const unavailableRecords: UnavailableRecord[] = [
  { id: 'UA-001', woId: 'WO-1060', partId: 'SP-002', requestedQty: 10, availableQty: 8, buildingId: 'BLD-001', bmNote: 'Awaiting PO approval.', status: 'Waiting for Restock', dateFlagged: '2026-06-10T09:00:00Z' },
  { id: 'UA-002', woId: 'WO-1062', partId: 'SP-004', requestedQty: 2, availableQty: 0, buildingId: 'BLD-002', bmNote: '', status: 'Awaiting BM Decision', dateFlagged: '2026-06-13T09:00:00Z' },
];

export const usageRecords: UsageRecord[] = [
  { id: 'US-001', woId: 'WO-1042', partId: 'SP-001', buildingId: 'BLD-001', plannedQty: 6, actualQty: 6, date: '2026-06-05T14:00:00Z', technician: 'Pham Minh Duc' },
  { id: 'US-002', woId: 'WO-1038', partId: 'SP-002', buildingId: 'BLD-001', plannedQty: 5, actualQty: 4, date: '2026-06-02T11:00:00Z', technician: 'Pham Minh Duc' },
  { id: 'US-003', woId: 'WO-1031', partId: 'SP-003', buildingId: 'BLD-003', plannedQty: 2, actualQty: 0, date: '2026-05-30T09:00:00Z', technician: 'Vo Thi Hoa' },
];

export const maintenancePlans: MaintenancePlan[] = [
  {
    id: 'MP-001', name: 'Monthly FCU Servicing - Landmark 81', systemId: 'SYS-001', subsystemId: 'SUB-002', typeId: 'AT-001', buildingId: 'BLD-001',
    frequency: 'Monthly', timeRequired: '4 hours', description: 'Monthly preventive maintenance for fan coil units.', remark: 'Coordinate with tenant for unit access.',
    status: 'Active', createdBy: 'Nguyen Van An', createdAt: '2026-04-01T09:00:00Z', assetIds: ['AS-001', 'AS-005'],
    rounds: [
      { roundNo: 'R1', startDate: '2026-04-01', endDate: '2026-04-30', status: 'Completed', completionRate: 100 },
      { roundNo: 'R2', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Completed', completionRate: 75 },
      { roundNo: 'R3', startDate: '2026-06-01', endDate: '2026-06-30', status: 'In Progress', completionRate: 40 },
    ],
    workOrders: [
      { id: 'WO-1042', assetId: 'AS-001', round: 'R3', technician: 'Pham Minh Duc', status: 'Closed', completionDate: '2026-06-05' },
      { id: 'WO-1051', assetId: 'AS-005', round: 'R3', technician: 'Pham Minh Duc', status: 'Started' },
    ],
    history: [
      { date: '2026-04-01T09:00:00Z', event: 'Created', actor: 'Nguyen Van An' },
      { date: '2026-04-01T09:01:00Z', event: 'Activated', actor: 'Nguyen Van An' },
      { date: '2026-06-01T00:00:00Z', event: 'WO Generated (R3)', actor: 'System' },
    ],
  },
  {
    id: 'MP-002', name: 'Quarterly Chiller Overhaul', systemId: 'SYS-001', subsystemId: 'SUB-001', typeId: 'AT-002', buildingId: 'BLD-001',
    frequency: 'Quarterly', timeRequired: '2 days', description: 'Quarterly chiller inspection and overhaul.', remark: '',
    status: 'Active', createdBy: 'Nguyen Van An', createdAt: '2026-03-15T09:00:00Z', assetIds: ['AS-002'],
    rounds: [{ roundNo: 'R1', startDate: '2026-04-01', endDate: '2026-06-30', status: 'In Progress', completionRate: 50 }],
    workOrders: [{ id: 'WO-1038', assetId: 'AS-002', round: 'R1', technician: 'Le Hoang Cuong', status: 'Completed', completionDate: '2026-06-02' }],
    history: [
      { date: '2026-03-15T09:00:00Z', event: 'Created', actor: 'Nguyen Van An' },
      { date: '2026-03-15T09:01:00Z', event: 'Activated', actor: 'Nguyen Van An' },
    ],
  },
  {
    id: 'MP-003', name: 'Yearly Generator Load Test', systemId: 'SYS-003', subsystemId: 'SUB-005', typeId: 'AT-004', buildingId: 'BLD-002',
    frequency: 'Yearly', timeRequired: '1 day', description: 'Annual full-load generator test.', remark: 'Notify tenants of brief power test.',
    status: 'Inactive', createdBy: 'Vo Thi Hoa', createdAt: '2026-02-20T09:00:00Z', assetIds: ['AS-004'],
    rounds: [],
    workOrders: [],
    history: [
      { date: '2026-02-20T09:00:00Z', event: 'Created', actor: 'Vo Thi Hoa' },
      { date: '2026-05-01T09:00:00Z', event: 'Deactivated', actor: 'Nguyen Van An' },
    ],
  },
  {
    id: 'MP-004', name: 'Monthly Elevator Inspection', systemId: 'SYS-002', subsystemId: 'SUB-003', typeId: 'AT-003', buildingId: 'BLD-001',
    frequency: 'Monthly', timeRequired: '3 hours', description: 'Supervisor-submitted plan awaiting approval.', remark: '',
    status: 'Pending', createdBy: 'Le Hoang Cuong', createdAt: '2026-06-12T09:00:00Z', assetIds: ['AS-003'],
    rounds: [],
    workOrders: [],
    history: [{ date: '2026-06-12T09:00:00Z', event: 'Created', actor: 'Le Hoang Cuong' }],
  },
];

/* ---- Reporting mock data ---- */

export const faultyAssets: FaultyAsset[] = [
  { id: 'FA-001', assetTypeId: 'AT-001', quantityFlagged: 2, dateIdentified: '2026-06-05', cause: 'Clogged air filter restricting airflow' },
  { id: 'FA-002', assetTypeId: 'AT-002', quantityFlagged: 1, dateIdentified: '2026-06-09', cause: 'Low refrigerant pressure detected' },
  { id: 'FA-003', assetTypeId: 'AT-004', quantityFlagged: 1, dateIdentified: '2026-06-12', cause: 'Battery failed load test' },
];

export const adHocWorkOrders: AdHocWorkOrder[] = [
  { id: 'WO-1038', assetId: 'AS-002', description: 'Emergency chiller oil top-up', status: 'Closed', completionDate: '2026-06-02' },
  { id: 'WO-1070', assetId: 'AS-001', description: 'Replace tripped FCU contactor', status: 'Closed', completionDate: '2026-06-11' },
  { id: 'WO-1072', assetId: 'AS-004', description: 'Investigate generator alarm', status: 'Started', targetCompletionDate: '2026-06-25' },
  { id: 'WO-1075', assetId: 'AS-003', description: 'Lift door sensor recalibration', status: 'Assigned', targetCompletionDate: '2026-06-28' },
];

export const roundAssetResults: RoundAssetResult[] = [
  { assetId: 'AS-001', status: 'Closed', location: 'Landmark 81 / Ground Floor / Lobby', completionRate: 100, remark: 'All checklist items passed.' },
  { assetId: 'AS-005', status: 'Started', location: 'Bitexco Tower / Level 12 / Office Suite 12A', completionRate: 40, remark: 'Awaiting tenant access for final checks.' },
];

export const roundFaults: RoundFault[] = [
  { id: 'RF-001', assetId: 'AS-001', location: 'Landmark 81 / Ground Floor / Lobby', description: 'Minor condensate leak at drain pan', dateFound: '2026-06-05', actionTaken: 'Cleared drain line, monitored', woId: 'WO-1042' },
  { id: 'RF-002', assetId: 'AS-005', location: 'Bitexco Tower / Level 12 / Office Suite 12A', description: 'Filter past service interval', dateFound: '2026-06-08', actionTaken: 'Filter scheduled for replacement', woId: 'WO-1051' },
];

/** Stable, sorted list of the last 12 month buckets (APR-25 … MAR-26) for charts. */
export const trendMonths: string[] = [
  'APR-25', 'MAY-25', 'JUN-25', 'JUL-25', 'AUG-25', 'SEP-25',
  'OCT-25', 'NOV-25', 'DEC-25', 'JAN-26', 'FEB-26', 'MAR-26',
];

/* ---- lookup helpers ---- */
export const systemName = (id: string) => assetSystems.find((s) => s.id === id)?.name ?? '—';
export const subsystemName = (id: string) => assetSubsystems.find((s) => s.id === id)?.name ?? '—';
export const typeName = (id: string) => assetTypes.find((t) => t.id === id)?.name ?? '—';
export const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? '—';
export const categoryName = (id: string) => spareCategories.find((c) => c.id === id)?.name ?? '—';
export const partName = (id: string) => spareParts.find((p) => p.id === id)?.name ?? '—';
export const partCode = (id: string) => spareParts.find((p) => p.id === id)?.code ?? '—';
export const assetName = (id: string) => assets.find((a) => a.id === id)?.name ?? '—';
export const assetCode = (id: string) => assets.find((a) => a.id === id)?.code ?? '—';
export const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? '—';
export const floorName = (bId: string, fId: string) =>
  buildings.find((b) => b.id === bId)?.floors.find((f) => f.id === fId)?.name ?? '—';
export const areaName = (bId: string, fId: string, aId?: string) =>
  aId
    ? buildings.find((b) => b.id === bId)?.floors.find((f) => f.id === fId)?.areas.find((a) => a.id === aId)?.name ?? '—'
    : '—';
