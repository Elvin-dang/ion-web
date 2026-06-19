/**
 * 3.7.2 Maintenance Plan Detail + 3.7.4 Edit + 3.7.5 Approve + 3.7.6 Reject
 * + 3.7.7 Set Inactive + 3.7.8 Cancel + 3.7.9 Maintenance History.
 *
 * Renders the shared MaintenancePlanDetailView. BM actions: Approve / Reject
 * (Supervisor-submitted Pending plans), Set Inactive / Set Active / Set
 * Cancelled (own plans), Edit (own plans). Cancelled = read-only. The BM-only
 * asset-search + technician-assignment toolbar is injected via assetsTabExtra.
 */
import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import MaintenancePlanDetailView from '../../../components/MaintenancePlanDetailView';
import type { MaintenancePlanDetailViewModel } from '../../../components/MaintenancePlanDetailView';
import { useToast } from '../components/shared';
import { maintenancePlans, buildings } from '../data/mockData';
import type { PlanStatus } from '../data/types';

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

export default function MaintenancePlanDetailPage() {
  const { id } = useParams();
  const { show, node } = useToast();
  const plan = maintenancePlans.find((p) => p.id === id);

  const [status, setStatus] = useState<PlanStatus | undefined>(plan?.status);
  const [editOpen, setEditOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [inactiveOpen, setInactiveOpen] = useState(false);
  const [activeOpen, setActiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [assetWoFilter, setAssetWoFilter] = useState('All');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  if (!plan) {
    return (
      <Box>
        <PageHeader title="Plan Detail" breadcrumbs={[{ label: 'Maintenance Plans', to: '/bm/maintenance-plans' }, { label: 'Not Found' }]} />
        <EmptyState title="Failed to load plan details. Please go back and try again." />
      </Box>
    );
  }

  const isPending = status === 'Pending';
  const isActive = status === 'Active';
  const isInactive = status === 'Inactive';
  const isCancelled = status === 'Cancelled';
  const canEdit = isActive || isInactive;

  const woStatuses = ['All', ...Array.from(new Set(plan.assets.map((a) => a.woStatus)))];
  const filteredAssets = plan.assets
    .filter((a) => (assetWoFilter === 'All' ? true : a.woStatus === assetWoFilter))
    .filter(
      (a) =>
        a.assetCode.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.assetName.toLowerCase().includes(assetSearch.toLowerCase()),
    );
  const toggleOne = (code: string) =>
    setSelectedAssets((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const handleReject = () => {
    if (!reason.trim()) {
      setReasonError('Rejection reason is required.');
      return;
    }
    setStatus('Cancelled');
    show('Maintenance plan rejected.');
    setRejectOpen(false);
    setReason('');
    setReasonError('');
  };

  const vm: MaintenancePlanDetailViewModel = {
    name: plan.name,
    metaLine: `${plan.id} · Created ${plan.createdDate} by ${plan.createdBy}`,
    status: status ?? plan.status,
    details: [
      { label: 'Asset Type', value: plan.assetType },
      { label: 'Sub-system', value: plan.subSystem },
      { label: 'System', value: plan.assetSystem },
      { label: 'Frequency', value: plan.frequency },
      { label: 'Time Required', value: plan.timeRequired },
      { label: 'Building', value: buildingName(plan.buildingId) },
      { label: 'Description', value: plan.description },
      { label: 'Remark', value: plan.remark || '—' },
    ],
    photoCount: plan.photos,
    rounds: plan.rounds.map((r) => ({ roundNo: r.roundNo, startDate: r.startDate, endDate: r.endDate, status: r.status, completionRate: r.completionRate })),
    // Filtered + per-row selection/assign affordances live in the table below via the row's name slot.
    assets: filteredAssets.map((a) => ({
      key: a.assetCode,
      assetCode: <Link component={RouterLink} to={`/bm/assets/${a.assetCode}`} underline="hover">{a.assetCode}</Link>,
      assetName: (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{a.assetName}</span>
          {canEdit && <Button size="small" onClick={() => show('Technician selector opened.')}>Assign</Button>}
        </Stack>
      ),
      location: a.location,
      mainTechnician: a.mainTechnician ?? '—',
    })),
    workOrders: plan.workOrders.map((w) => ({
      key: w.woId,
      woId: <Link component={RouterLink} to={`/bm/work-orders/${w.woId}`} underline="hover">{w.woId}</Link>,
      asset: w.asset,
      round: w.round,
      technician: w.technician,
      status: w.status,
      completionDate: w.completionDate ?? '—',
    })),
    history: plan.history.map((h) => ({ timestamp: h.timestamp, label: h.label })),
  };

  // Cancelled = no action buttons (read-only). Approve/Reject only for Pending.
  const actions = isCancelled ? null : (
    <>
      {isPending && (
        <>
          <Button variant="contained" onClick={() => setApproveOpen(true)}>Approve Plan</Button>
          <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)}>Reject Plan</Button>
        </>
      )}
      {isActive && (
        <>
          <Button variant="outlined" onClick={() => setInactiveOpen(true)}>Set Inactive</Button>
          <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>Set Cancelled</Button>
        </>
      )}
      {isInactive && (
        <>
          <Button variant="contained" onClick={() => setActiveOpen(true)}>Set Active</Button>
          <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>Set Cancelled</Button>
        </>
      )}
    </>
  );

  // BM-only Assets-tab feature: search + WO-status filter + bulk assign-to-technician.
  const assetsTabExtra = plan.assets.length === 0 ? (
    <EmptyState title="No assets added. Click [+ Add Asset] to start." />
  ) : (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
      {canEdit && <Button size="small" startIcon={<AddIcon />} onClick={() => show('Asset selector opened.')}>Add Asset</Button>}
      <TextField
        size="small"
        placeholder="Search asset code or name"
        value={assetSearch}
        onChange={(e) => setAssetSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ minWidth: 220 }}
      />
      <TextField select size="small" label="WO Status" value={assetWoFilter} onChange={(e) => setAssetWoFilter(e.target.value)} sx={{ minWidth: 150 }}>
        {woStatuses.map((s) => (<MenuItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</MenuItem>))}
      </TextField>
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="body2" color="text.secondary">
        Number of assets: {plan.assets.length}
        {selectedAssets.length > 0 ? ` · ${selectedAssets.length} selected` : ''}
      </Typography>
      {canEdit && (
        <Button
          size="small"
          variant="contained"
          startIcon={<AssignmentIndIcon />}
          disabled={selectedAssets.length === 0}
          onClick={() => { show(`Assign-to-technician opened for ${selectedAssets.length} asset(s).`); }}
        >
          Assign to Technician
        </Button>
      )}
      {canEdit && filteredAssets.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
          {filteredAssets.map((a) => (
            <Button
              key={a.assetCode}
              size="small"
              variant={selectedAssets.includes(a.assetCode) ? 'contained' : 'outlined'}
              onClick={() => toggleOne(a.assetCode)}
              sx={{ textTransform: 'none' }}
            >
              {a.assetCode}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );

  return (
    <Box>
      <PageHeader
        title={plan.name}
        breadcrumbs={[{ label: 'Maintenance Plans', to: '/bm/maintenance-plans' }, { label: plan.id }]}
      />

      <MaintenancePlanDetailView
        vm={vm}
        actions={actions}
        onEditDetails={canEdit ? () => setEditOpen(true) : undefined}
        onPrint={() => show('Report download started.')}
        onViewMoreHistory={() => show('Showing full history.')}
        assetsTabExtra={assetsTabExtra}
      />

      {isCancelled && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          This plan is cancelled. All tabs are read-only.
        </Typography>
      )}

      {/* Edit Plan (3.7.4) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Maintenance Plan</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Plan Name" defaultValue={plan.name} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Frequency" defaultValue={plan.frequency} sx={{ mb: 2 }} />
          <TextField fullWidth label="Time Required" defaultValue={plan.timeRequired} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={3} label="Description" defaultValue={plan.description} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={2} label="Remark" defaultValue={plan.remark} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { show('Plan updated successfully.'); setEditOpen(false); }}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={approveOpen}
        title="Approve Maintenance Plan"
        description="Approve this maintenance plan? Work orders will begin generating automatically on the next scheduled cycle."
        confirmLabel="Approve"
        onConfirm={() => { setStatus('Active'); show('Maintenance plan approved successfully.'); setApproveOpen(false); }}
        onClose={() => setApproveOpen(false)}
      />
      <ConfirmDialog
        open={inactiveOpen}
        title="Set Plan Inactive"
        description="Set this plan inactive? No new work orders will be generated until reactivated."
        onConfirm={() => { setStatus('Inactive'); show('Plan set inactive successfully.'); setInactiveOpen(false); }}
        onClose={() => setInactiveOpen(false)}
      />
      <ConfirmDialog
        open={activeOpen}
        title="Set Plan Active"
        description="Reactivate this plan? Work orders will resume generating on the next cycle."
        confirmLabel="Set Active"
        onConfirm={() => { setStatus('Active'); show('Plan set active successfully.'); setActiveOpen(false); }}
        onClose={() => setActiveOpen(false)}
      />
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Maintenance Plan"
        description="Cancel this plan? This is a terminal action and cannot be undone."
        destructive
        confirmLabel="Set Cancelled"
        onConfirm={() => { setStatus('Cancelled'); show('Maintenance plan cancelled.'); setCancelOpen(false); }}
        onClose={() => setCancelOpen(false)}
      />

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Maintenance Plan</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={4} label="Rejection Reason" required placeholder="Enter rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} error={!!reasonError} helperText={reasonError} inputProps={{ maxLength: 500 }} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>Reject</Button>
        </DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}
