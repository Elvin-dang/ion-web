/**
 * Lightweight mock-data helpers — no external dependency (no faker). Feature
 * agents use these to build realistic demo data for tables, charts and lists.
 */

const FIRST_NAMES = [
  'Avery', 'Marcus', 'Priya', 'Jordan', 'Helena', 'Daniel', 'Sofia', 'Liam',
  'Noah', 'Maya', 'Ethan', 'Olivia', 'Lucas', 'Amara', 'Diego', 'Yara',
  'Hannah', 'Omar', 'Chloe', 'Ravi',
];

const LAST_NAMES = [
  'Sterling', 'Delgado', 'Raman', 'Whitfield', 'Brooks', 'Okafor', 'Marin',
  'Nguyen', 'Patel', 'Castillo', 'Hartman', 'Ibrahim', 'Larsson', 'Mbeki',
  'Rossi', 'Tanaka', 'Walsh', 'Zimmer', 'Andersson', 'Cohen',
];

const BUILDINGS = [
  'Meridian Towers', 'Crestline Plaza', 'Harbor Point', 'Summit Centre',
  'Beacon House', 'Orchard Square', 'Riverside One', 'Atlas Building',
];

const ASSET_SYSTEMS = ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Elevators', 'Security'];

export const workOrderStatuses = ['open', 'in_progress', 'completed', 'overdue', 'scheduled'] as const;
export type WorkOrderStatus = (typeof workOrderStatuses)[number];

/** Deterministic-ish pseudo-random in [0,1) from a numeric seed. */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9973.13) * 43758.5453;
  return x - Math.floor(x);
}

export function pick<T>(arr: readonly T[], seed?: number): T {
  const r = seed === undefined ? Math.random() : seededRandom(seed);
  return arr[Math.floor(r * arr.length)];
}

export function fullName(seed?: number): string {
  const a = pick(FIRST_NAMES, seed);
  const b = pick(LAST_NAMES, seed === undefined ? undefined : seed + 1);
  return `${a} ${b}`;
}

export function buildingName(seed?: number): string {
  return pick(BUILDINGS, seed);
}

export function assetSystem(seed?: number): string {
  return pick(ASSET_SYSTEMS, seed);
}

export function id(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

/** A date `daysFromNow` away (negative = past), ISO string. */
export function relativeDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

/** Build an array of `count` items via a factory that receives the index. */
export function range<T>(count: number, factory: (i: number) => T): T[] {
  return Array.from({ length: count }, (_, i) => factory(i));
}
