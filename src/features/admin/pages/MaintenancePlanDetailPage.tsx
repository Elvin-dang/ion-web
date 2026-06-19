/**
 * 1.7.2 Maintenance Plan Detail (+ 1.7.5 Set Inactive, 1.7.6 Cancel, 1.7.7
 * auto-generated WO context, 1.7.8 history tabs). Renders the shared
 * MaintenancePlanDetailView; SA plans are Active immediately, so SA actions are
 * Set Inactive / Set Active / Set Cancelled (no Approve/Reject). Cancelled
 * plans are fully read-only.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import MaintenancePlanDetailView from '../../../components/MaintenancePlanDetailView';
import type { MaintenancePlanDetailViewModel } from '../../../components/MaintenancePlanDetailView';
import { useToast } from '../components/AdminToast';
import { formatDate, formatDateTime } from '../../../utils/date';
import { assets, assetTypes, maintenancePlans, systemName, subsystemName, typeName, buildingName, assetName, assetCode, floorName, areaName } from '../data/mockData';
import type { PlanStatus } from '../data/types';

export default function MaintenancePlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const plan = maintenancePlans.find((p) => p.id === id);
  const [status, setStatus] = useState<PlanStatus>(plan?.status ?? 'Active');
  const [confirm, setConfirm] = useState<'inactive' | 'cancel' | null>(null);

  if (!plan) {
    return <Box><PageHeader title="Maintenance Plan" /><EmptyState title="Not found" description="Failed to load plan details. Please go back and try again." action={<Button onClick={() => navigate('/admin/maintenance-plans')}>Back</Button>} /></Box>;
  }

  const assetLocation = (aid: string) => {
    const a = assets.find((x) => x.id === aid);
    return a
      ? [buildingName(a.buildingId), floorName(a.buildingId, a.floorId), areaName(a.buildingId, a.floorId, a.areaId)].filter((s) => s && s !== '—').join(' / ') || '—'
      : '—';
  };

  const vm: MaintenancePlanDetailViewModel = {
    name: plan.name,
    metaLine: `${plan.id} · Created ${formatDateTime(plan.createdAt)} by ${plan.createdBy}`,
    status,
    details: [
      { label: 'Asset Type', value: typeName(plan.typeId) },
      { label: 'Sub-system', value: subsystemName(plan.subsystemId) },
      { label: 'System', value: systemName(plan.systemId) },
      { label: 'Frequency', value: plan.frequency },
      { label: 'Time Required', value: plan.timeRequired },
      { label: 'Building', value: buildingName(plan.buildingId) },
      { label: 'Description', value: plan.description || '—' },
      { label: 'Remark', value: plan.remark || '—' },
    ],
    photoCount: 2,
    rounds: plan.rounds.map((r) => ({ roundNo: r.roundNo, startDate: formatDate(r.startDate), endDate: formatDate(r.endDate), status: r.status, completionRate: r.completionRate })),
    assets: plan.assetIds.map((aid) => ({
      key: aid,
      assetCode: assetCode(aid),
      assetName: <Link component="button" type="button" underline="hover" onClick={() => navigate(`/admin/assets/${aid}`)}>{assetName(aid)}</Link>,
      location: assetLocation(aid),
      mainTechnician: plan.workOrders.find((w) => w.assetId === aid)?.technician ?? 'Unassigned',
    })),
    workOrders: plan.workOrders.map((w) => ({ key: w.id, woId: w.id, asset: assetName(w.assetId), round: w.round, technician: w.technician, status: w.status, completionDate: formatDate(w.completionDate) })),
    history: plan.history.map((h) => ({ timestamp: `${formatDateTime(h.date)} · ${h.actor}`, label: h.event })),
    checklist: (assetTypes.find((t) => t.id === plan.typeId)?.checklist ?? []).map((c) => ({ key: c.id, name: c.name, description: c.description, photos: c.photos })),
  };

  const isCancelled = status === 'Cancelled';
  // SA plans are Active immediately — no Approve/Reject. Cancelled = read-only.
  const actions = isCancelled ? null : (
    <>
      {status === 'Active' && <>
        <Button variant="outlined" onClick={() => setConfirm('inactive')}>Set Inactive</Button>
        <Button color="error" onClick={() => setConfirm('cancel')}>Set Cancelled</Button>
      </>}
      {status === 'Inactive' && <>
        <Button variant="contained" onClick={() => { setStatus('Active'); toast('Maintenance plan reactivated.'); }}>Set Active</Button>
        <Button color="error" onClick={() => setConfirm('cancel')}>Set Cancelled</Button>
      </>}
    </>
  );

  return (
    <Box>
      <PageHeader title={plan.name} breadcrumbs={[{ label: 'Maintenance Plans', to: '/admin/maintenance-plans' }, { label: plan.name }]} />

      <MaintenancePlanDetailView
        vm={vm}
        actions={actions}
        onEditDetails={isCancelled ? undefined : () => navigate(`/admin/maintenance-plans/${plan.id}/edit`)}
        onPrint={() => toast('Report sent to printer (demo).')}
        onViewMoreHistory={() => toast('Showing full history (demo).')}
      />

      <ConfirmDialog
        open={confirm === 'inactive'} title="Set plan inactive" confirmLabel="Confirm"
        description="Set this plan to Inactive? No new Work Orders will be generated until the plan is reactivated. Active Work Orders already in progress will not be affected."
        onConfirm={() => { setStatus('Inactive'); setConfirm(null); toast('Maintenance plan set to inactive.'); }} onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'cancel'} title="Cancel plan" destructive confirmLabel="Cancel Plan" cancelLabel="Keep Plan"
        description="Cancel this maintenance plan? No future Work Orders will be generated. This action CANNOT be undone."
        onConfirm={() => { setStatus('Cancelled'); setConfirm(null); toast('Maintenance plan cancelled.'); }} onClose={() => setConfirm(null)}
      />
      {node}
    </Box>
  );
}
