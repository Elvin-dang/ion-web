/**
 * Mock location reference data for the Tenant Public Portal Service Request form.
 *
 * Building (required) -> Floor (optional, cascades) -> Area/Unit (optional, cascades).
 * Only ACTIVE buildings are surfaced to the public form (WBS 2.1.1 step 2 / 3).
 */

export interface AreaOption {
  id: string;
  name: string;
}

export interface FloorOption {
  id: string;
  name: string;
  areas: AreaOption[];
}

export interface BuildingOption {
  id: string;
  name: string;
  active: boolean;
  floors: FloorOption[];
}

export const buildings: BuildingOption[] = [
  {
    id: 'bld-001',
    name: 'EZAxis Tower A',
    active: true,
    floors: [
      {
        id: 'flr-a-l1',
        name: 'Level 1 - Lobby',
        areas: [
          { id: 'area-a-l1-recep', name: 'Reception' },
          { id: 'area-a-l1-cafe', name: 'Cafeteria' },
          { id: 'area-a-l1-rest', name: 'Restrooms' },
        ],
      },
      {
        id: 'flr-a-l5',
        name: 'Level 5 - Offices',
        areas: [
          { id: 'area-a-l5-501', name: 'Unit 501' },
          { id: 'area-a-l5-502', name: 'Unit 502' },
          { id: 'area-a-l5-pantry', name: 'Pantry' },
        ],
      },
      {
        id: 'flr-a-l12',
        name: 'Level 12 - Offices',
        areas: [
          { id: 'area-a-l12-1201', name: 'Unit 1201' },
          { id: 'area-a-l12-meet', name: 'Meeting Room 12A' },
        ],
      },
    ],
  },
  {
    id: 'bld-002',
    name: 'EZAxis Tower B',
    active: true,
    floors: [
      {
        id: 'flr-b-b1',
        name: 'Basement 1 - Parking',
        areas: [
          { id: 'area-b-b1-zonea', name: 'Parking Zone A' },
          { id: 'area-b-b1-zoneb', name: 'Parking Zone B' },
        ],
      },
      {
        id: 'flr-b-l3',
        name: 'Level 3 - Retail',
        areas: [
          { id: 'area-b-l3-r301', name: 'Retail Unit 301' },
          { id: 'area-b-l3-r302', name: 'Retail Unit 302' },
        ],
      },
    ],
  },
  {
    id: 'bld-003',
    name: 'Harbour Point Plaza',
    active: true,
    floors: [
      {
        id: 'flr-c-l2',
        name: 'Level 2 - Offices',
        areas: [
          { id: 'area-c-l2-201', name: 'Unit 201' },
          { id: 'area-c-l2-202', name: 'Unit 202' },
        ],
      },
      {
        id: 'flr-c-roof',
        name: 'Rooftop',
        areas: [{ id: 'area-c-roof-hvac', name: 'HVAC Plant Room' }],
      },
    ],
  },
  // Inactive — intentionally hidden from the public form to exercise the filter.
  {
    id: 'bld-099',
    name: 'Legacy Annex (Decommissioned)',
    active: false,
    floors: [],
  },
];

/** Only buildings that are active are usable in the public form (WBS step 2.2). */
export const activeBuildings = buildings.filter((b) => b.active);
