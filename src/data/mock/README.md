# Mock data

Feature agents add domain mock data here, one file per domain, e.g.:

- `buildings.ts`
- `assets.ts`
- `workOrders.ts`
- `spareParts.ts`
- `maintenancePlans.ts`

Conventions:

- Export typed arrays/factories (`export const mockWorkOrders: WorkOrder[] = [...]`).
- Reuse the helpers in `src/data/mock/helpers.ts` (no faker dependency) to
  generate names, ids, dates and pick from sets deterministically.
- Statuses should use the work-order vocabulary surfaced by `StatusChip`
  (open / in_progress / completed / overdue / scheduled).
- Keep mock data UI-only — no network calls.
