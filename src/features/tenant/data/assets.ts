/**
 * Mock asset taxonomy for the Service Request form.
 *
 * Asset System (required) -> Asset Sub-system (optional) -> Asset Type (optional)
 * -> Asset (optional). Each level cascades from its parent (WBS 2.1.1 step 3).
 */

export interface AssetOption {
  id: string;
  name: string;
}

export interface AssetTypeOption {
  id: string;
  name: string;
  assets: AssetOption[];
}

export interface AssetSubSystemOption {
  id: string;
  name: string;
  types: AssetTypeOption[];
}

export interface AssetSystemOption {
  id: string;
  name: string;
  subSystems: AssetSubSystemOption[];
}

export const assetSystems: AssetSystemOption[] = [
  {
    id: 'sys-hvac',
    name: 'HVAC',
    subSystems: [
      {
        id: 'sub-hvac-cooling',
        name: 'Cooling',
        types: [
          {
            id: 'type-hvac-chiller',
            name: 'Chiller',
            assets: [
              { id: 'asset-chiller-01', name: 'Chiller Unit CH-01' },
              { id: 'asset-chiller-02', name: 'Chiller Unit CH-02' },
            ],
          },
          {
            id: 'type-hvac-ahu',
            name: 'Air Handling Unit',
            assets: [
              { id: 'asset-ahu-l5', name: 'AHU Level 5' },
              { id: 'asset-ahu-l12', name: 'AHU Level 12' },
            ],
          },
        ],
      },
      {
        id: 'sub-hvac-vent',
        name: 'Ventilation',
        types: [
          {
            id: 'type-hvac-fan',
            name: 'Exhaust Fan',
            assets: [{ id: 'asset-fan-b1', name: 'Exhaust Fan B1' }],
          },
        ],
      },
    ],
  },
  {
    id: 'sys-electrical',
    name: 'Electrical',
    subSystems: [
      {
        id: 'sub-elec-lighting',
        name: 'Lighting',
        types: [
          {
            id: 'type-elec-fixture',
            name: 'Light Fixture',
            assets: [
              { id: 'asset-light-lobby', name: 'Lobby Downlights' },
              { id: 'asset-light-park', name: 'Parking Floodlights' },
            ],
          },
        ],
      },
      {
        id: 'sub-elec-power',
        name: 'Power Distribution',
        types: [
          {
            id: 'type-elec-db',
            name: 'Distribution Board',
            assets: [{ id: 'asset-db-l5', name: 'DB Level 5' }],
          },
        ],
      },
    ],
  },
  {
    id: 'sys-plumbing',
    name: 'Plumbing',
    subSystems: [
      {
        id: 'sub-plumb-water',
        name: 'Water Supply',
        types: [
          {
            id: 'type-plumb-pump',
            name: 'Water Pump',
            assets: [{ id: 'asset-pump-roof', name: 'Booster Pump (Roof)' }],
          },
        ],
      },
      {
        id: 'sub-plumb-drain',
        name: 'Drainage',
        types: [],
      },
    ],
  },
  {
    id: 'sys-elevator',
    name: 'Vertical Transport',
    subSystems: [
      {
        id: 'sub-elev-pass',
        name: 'Passenger Lift',
        types: [
          {
            id: 'type-elev-cabin',
            name: 'Lift Car',
            assets: [
              { id: 'asset-lift-1', name: 'Passenger Lift 1' },
              { id: 'asset-lift-2', name: 'Passenger Lift 2' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sys-fire',
    name: 'Fire & Safety',
    subSystems: [
      {
        id: 'sub-fire-alarm',
        name: 'Fire Alarm',
        types: [
          {
            id: 'type-fire-detector',
            name: 'Smoke Detector',
            assets: [{ id: 'asset-smoke-l1', name: 'Smoke Detector Level 1' }],
          },
        ],
      },
    ],
  },
];
