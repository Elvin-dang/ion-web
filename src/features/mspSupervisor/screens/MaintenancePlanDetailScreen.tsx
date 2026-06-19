/**
 * 5.5.2 Maintenance Plan Detail + 5.5.5 View Maintenance History (MSP
 * Supervisor). Renders the shared MaintenancePlanDetailView. Hosts 5.5.4 Edit
 * Plan (dialog) and Resubmit to BM for the Supervisor's OWN Pending / Approval
 * Rejected plans. No Approve/Reject, no Set Inactive/Cancelled here.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import MaintenancePlanDetailView from '../../../components/MaintenancePlanDetailView';
import type { MaintenancePlanDetailViewModel } from '../../../components/MaintenancePlanDetailView';
import { useToast } from '../components/useToast';
import { formatDate, formatDateTime } from '../../../utils/date';
import { assets, maintenancePlanById, SUPERVISOR_PROFILE, technicianName, workOrderById } from '../data/mockData';
import type { MaintenancePlan } from '../data/types';

const FREQUENCIES = ['Monthly', 'Quarterly', 'Yearly'];

export default function MaintenancePlanDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast, toastElement } = useToast();

  const base = useMemo(() => maintenancePlanById(id ?? ''), [id]);
  const [plan, setPlan] = useState<MaintenancePlan | undefined>(base);
  const [editOpen, setEditOpen] = useState(params.get('edit') === '1');
  const [editForm, setEditForm] = useState({
    name: base?.name ?? '',
    frequency: base?.frequency ?? 'Monthly',
    timeRequired: base?.timeRequired ?? '',
    description: base?.description ?? '',
    remark: base?.remark ?? '',
  });

  if (!plan) {
    return (
      <Box>
        <PageHeader title="Maintenance Plan" breadcrumbs={[{ label: 'Maintenance Plans', to: '/msp/maintenance-plans' }, { label: 'Not found' }]} />
        <EmptyState
          title="Plan not found"
          description="Failed to load plan details. Please go back and try again."
          action={<Button variant="contained" onClick={() => navigate('/msp/maintenance-plans')}>Back to list</Button>}
        />
      </Box>
    );
  }

  const isOwn = plan.createdBy === SUPERVISOR_PROFILE.name;
  const canEdit = isOwn && (plan.status === 'Pending' || plan.status === 'Approval Rejected');
  const planAssets = assets.filter((a) => plan.assetIds.includes(a.id));
  const planWos = plan.workOrderIds.map((wid) => workOrderById(wid)).filter((w): w is NonNullable<typeof w> => !!w);

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      toast('Plan name is required.', 'error');
      return;
    }
    if (!editForm.timeRequired.trim()) {
      toast('Time required is required.', 'error');
      return;
    }
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            name: editForm.name,
            frequency: editForm.frequency as MaintenancePlan['frequency'],
            timeRequired: editForm.timeRequired,
            description: editForm.description,
            remark: editForm.remark,
            history: [...prev.history, { timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: 'Plan edited by Marcus Delgado.' }],
          }
        : prev,
    );
    toast('Plan updated successfully.');
    setEditOpen(false);
  };

  const handleResubmit = () => {
    setPlan((prev) =>
      prev ? { ...prev, status: 'Pending', history: [...prev.history, { timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: 'Resubmitted by Marcus Delgado.' }] } : prev,
    );
    toast('Plan resubmitted to Building Manager.');
  };

  const vm: MaintenancePlanDetailViewModel = {
    name: plan.name,
    metaLine: `${plan.id} · Created ${formatDateTime(plan.createdDate)} · ${plan.building}`,
    status: plan.status,
    details: [
      { label: 'Asset Type', value: plan.assetType },
      { label: 'Sub-system', value: plan.subSystem },
      { label: 'System', value: plan.assetSystem },
      { label: 'Frequency', value: plan.frequency },
      { label: 'Time Required', value: plan.timeRequired },
      { label: 'Building', value: plan.building },
      { label: 'Description', value: plan.description },
      { label: 'Remark', value: plan.remark },
    ],
    photoCount: plan.photos,
    rounds: plan.rounds.map((r) => ({
      roundNo: r.roundNo,
      startDate: formatDate(r.startDate),
      endDate: formatDate(r.endDate),
      status: r.status,
      completionRate: r.totalWos ? Math.round((r.closedWos / r.totalWos) * 100) : 0,
    })),
    assets: planAssets.map((a) => ({
      key: a.id,
      assetCode: <Link component="button" type="button" underline="hover" onClick={() => navigate(`/msp/assets/${a.id}`)}>{a.code}</Link>,
      assetName: a.name,
      location: `${a.floor} · ${a.area}`,
      mainTechnician: '—',
    })),
    workOrders: planWos.map((w) => ({
      key: w.id,
      woId: <Link component="button" type="button" underline="hover" onClick={() => navigate(`/msp/work-orders/${w.id}`)}>{w.id}</Link>,
      asset: w.assetCode,
      round: w.maintenanceRound ?? '—',
      technician: technicianName(w.mainTechnicianId),
      status: w.status,
      completionDate: formatDate(w.endTime),
    })),
    history: plan.history.map((h) => ({ timestamp: formatDateTime(h.timestamp), label: h.label })),
  };

  // MSP: Edit + edit pencil + Resubmit ONLY for own Pending / Approval Rejected plans.
  // No Approve/Reject, no Set Inactive/Cancelled. Cancelled plans = read-only.
  const actions = (
    <>
      {canEdit && (
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>Edit Plan</Button>
      )}
      {isOwn && plan.status === 'Approval Rejected' && (
        <Button variant="contained" color="secondary" startIcon={<SendIcon />} onClick={handleResubmit}>Resubmit to BM</Button>
      )}
    </>
  );

  return (
    <Box>
      <PageHeader
        title={plan.name}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Maintenance Plans', to: '/msp/maintenance-plans' }, { label: plan.id }]}
      />

      <MaintenancePlanDetailView
        vm={vm}
        actions={actions}
        onEditDetails={canEdit ? () => setEditOpen(true) : undefined}
        onPrint={() => toast('Plan report generated (PDF).', 'info')}
        onViewMoreHistory={() => toast('Showing full history.', 'info')}
        banner={plan.status === 'Approval Rejected' && plan.rejectionReason ? (
          <Alert severity="warning">Rejected by Building Manager. Reason: {plan.rejectionReason}</Alert>
        ) : undefined}
      />

      {/* ---- 5.5.4 Edit Plan dialog ---- */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Maintenance Plan</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Plan Name" required fullWidth value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} inputProps={{ maxLength: 150 }} />
            <TextField select label="Frequency" required fullWidth value={editForm.frequency} onChange={(e) => setEditForm((f) => ({ ...f, frequency: e.target.value as typeof f.frequency }))}>
              {FREQUENCIES.map((fr) => (
                <MenuItem key={fr} value={fr}>
                  {fr}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Time Required to Complete" required fullWidth value={editForm.timeRequired} onChange={(e) => setEditForm((f) => ({ ...f, timeRequired: e.target.value }))} />
            <TextField label="Description" fullWidth multiline minRows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} inputProps={{ maxLength: 500 }} />
            <TextField label="Remark" fullWidth multiline minRows={2} value={editForm.remark} onChange={(e) => setEditForm((f) => ({ ...f, remark: e.target.value }))} />
            <Button component="label" variant="outlined">
              Add Photos
              <input hidden type="file" multiple accept="image/png,image/jpeg" />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {toastElement}
    </Box>
  );
}
