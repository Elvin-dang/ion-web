# Fix Plan — Quynh Trinh feedback

Status legend: ✅ done · 🔧 to do · ❓ needs clarification

Grounded against the current code (file paths + lines from a full screen audit).

---

## 1. Login screen — ✅ DONE
Required: Email, Password, Remember me, Forgot password, Sign In only. Remove Google SSO, GitHub SSO, Sign Up.
- Current `src/pages/auth/Login.tsx` already has **only** the 5 in-scope elements; no SSO buttons, no Sign Up (the `/signup` route was already removed in `App.tsx`).
- Cleaned stale "SignUp" mentions in `AuthShell.tsx` / `DemoAccounts.tsx` doc comments.
- Note: kept the **demo-account picker** (no-backend demo affordance, not SSO/registration). Remove if undesired.

## 2. Asset Management nav structure — ✅ MOSTLY DONE (verify only)
Proposed: Asset Systems (= current Asset Classification: create Asset System + Sub-system) → Asset Types → Assets.
- `admin/registry.tsx` nav already reads **Asset Systems** (`/admin/asset-classification`) → **Asset Types** → **Assets**.
- `AssetClassificationPage.tsx` already does System + Sub-system CRUD (2-panel, lines 107–166).
- Action: confirm the label/order reads exactly "Asset Systems" and the three sit adjacent. No code change expected.

---

## 3. Asset Detail — standardize layout across all roles — 🔧
Make SA / BM / MSP share ONE layout + sections; only action buttons differ.
- Files: `admin/pages/AssetDetailPage.tsx`, `buildingManager/pages/AssetDetailPage.tsx`, `mspSupervisor/screens/AssetDetailScreen.tsx`.
- Today: 3 divergent layouts (SA side-QR; BM adds as-built drawing/tag UI; MSP read-only).
- Target standard sections: (1) Header — Asset Name (bold), QR image, Download QR. (2) Asset Classification — System/Sub-system/Type (read-only). (3) Location — Building/Floor/Area (read-only). (4) Asset Details — Code/Model/Serial/Brand/Purchase Date/Mfg Date/Status (read-only). (5) Maintenance History — WO ID/Plan/Round/Completed Date/Technician/Status. (6) Related WO History. (7) Pending WOs (open, not Closed/Cancelled).
- Action buttons by role: **SA & BM** → Edit, Deactivate/Activate, Download QR. **MSP** → Download QR only (read-only).
- Plan: extract a shared `AssetDetail` component (in `src/components` or a shared feature module) taking data + a role/actions prop; each role's page renders it with its action set. Decide where BM's as-built drawing tab lives (keep as BM-only extra tab, or drop to match standard — needs confirm).

## 4. Spare Part Detail — standardize layout across all roles — 🔧
- Files: `admin/pages/SparePartDetailPage.tsx`, `buildingManager/pages/SparePartDetailPage.tsx`, `mspSupervisor/screens/SparePartDetailScreen.tsx`.
- Target standard layout: (1) Header — Name (bold), created timestamp, Status badge; **Set Active/Inactive** for SA & BM only. (2) Left panel, 3 sections each with edit pencil for SA & BM (read-only for MSP): General Info, Stock Info, Supporting Info. (3) Right panel — Total Stock (large), Available (green), On-Hold (amber), History log with View more.
- Role differences: SA & BM → pencils + Set Active/Inactive. MSP → fully read-only.
- Covers item **"action button cho approve spare part / deactivate / reactivate"**: wire Set Active (reactivate) / Set Inactive (deactivate) on header for SA & BM. ❓ "Approve spare part" — confirm whether this means the BM **Unavailable Requests** approval flow (`buildingManager/pages/UnavailableRequestsPage.tsx`) vs. activating a spare part.
- Plan: shared `SparePartDetail` component + role/actions prop. BM's Reserve/Release stays BM-only.

## 5. Maintenance Plan Detail — standardize layout + consistent UI — 🔧
(covers the two "maintenance plan UI consistent" notes)
- Files: `admin/pages/MaintenancePlanDetailPage.tsx`, `buildingManager/pages/MaintenancePlanDetailPage.tsx`, `mspSupervisor/screens/MaintenancePlanDetailScreen.tsx`.
- Target standard layout: (1) Header — Plan Name (bold), Plan ID + created timestamp, Status badge, Print Report. (2) Details — Asset Type/Sub-system/System/Frequency/Time Required/Building/Description/Remark/Photos; edit pencil for SA & BM on own plans; MSP pencil only for own Pending/Approval-Rejected; else read-only. (3) Tab Round — Round No/Start/End/Status/Completion Rate. (4) Tab Assets — Code/Name/Location/Main Technician. (5) Tab Work Orders — WO ID/Asset/Round/Technician/Status/Completion Date. (6) Right panel — History log + View more.
- Action buttons by role:
  - **SA** → Set Inactive, Set Cancelled (no Approve/Reject; SA plans Active immediately).
  - **BM** → Approve/Reject (Supervisor Pending plans), Set Inactive, Set Active, Set Cancelled (own plans).
  - **MSP** → Edit Plan (own Pending/Approval-Rejected only), Resubmit to BM (after rejection); no Approve/Reject, no Set Inactive/Cancelled on others'.
  - **Cancelled plans → fully read-only for everyone, no buttons.**
- Plan: shared `MaintenancePlanDetail` component + role/permission prop deriving button visibility from (role, plan.status, isOwner).

## 6. Supervisor → Maintenance Plan: allow Edit Details — 🔧
- File: `mspSupervisor/screens/MaintenancePlanDetailScreen.tsx` (edit gating ~lines 141–150).
- Enable editing the **Details** section for the owner when plan is Pending or Approval-Rejected (folds into #5). ❓ The loose note **"cho edit Details, execution section"** — confirm whether "execution section" = the Rounds/Work-Orders execution tab or a WO field; currently no named "execution section" exists.

## 7. Supervisor → Work Orders: separate Main vs Sub technician controls — 🔧
- File: `mspSupervisor/screens/WorkOrderDetailScreen.tsx` (tech panel ~629–699, assign dialog ~714–776).
- Today: one "Send to Technician" dialog with a Main Autocomplete + a Sub multi-select; Sub list has inline delete.
- Target: **independent add/edit controls** — Main Technician has its own add/edit control; Sub Technicians have their own separate add/edit control. Split the single dialog into two flows (or two sections with their own edit buttons), keep Sub-excludes-Main rule.

## 8. Supervisor account — "gộp 2 WO vào" — ❓ NEEDS CLARIFICATION
- Note is ambiguous. Candidate meanings: (a) merge two Work Order **lists/tabs** into one for the supervisor; (b) on the supervisor **Account Settings** screen show a combined WO summary; (c) merge two specific WOs. Need to confirm intent before scoping. Files likely `mspSupervisor/screens/WorkOrderListScreen.tsx` and/or `AccountSettingsScreen.tsx`.

---

## Suggested execution order
1. ✅ Login (done) + ✅ verify Asset nav (#1, #2).
2. Shared-component refactors, one per detail screen: Maintenance Plan (#5+#6) → Asset (#3) → Spare Part (#4). Each: extract shared layout, drive buttons by (role, status, owner).
3. WO technician control split (#7).
4. Resolve clarifications (#4 "approve", #6 "execution section", #8) then implement.

## Open questions to confirm with Quynh Trinh
- #4: "approve spare part" = Unavailable-Requests approval, or just activate?
- #6: what is the "execution section"?
- #8: what does "gộp 2 WO" mean exactly?
- #3: keep BM as-built drawing as a BM-only extra tab, or drop for strict layout parity?
