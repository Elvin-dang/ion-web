/**
 * 3.7.2 Maintenance Plan Detail + 3.7.4 Edit + 3.7.5 Approve + 3.7.6 Reject
 * + 3.7.7 Set Inactive + 3.7.8 Cancel + 3.7.9 Maintenance History.
 */
import { useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { SectionCard, DetailField, HistoryLog, useToast } from '../components/shared';
import { maintenancePlans, buildings } from '../data/mockData';
import type { PlanStatus } from '../data/types';

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

export default function MaintenancePlanDetailPage() {
  const { id } = useParams();
  const { show, node } = useToast();
  const plan = maintenancePlans.find((p) => p.id === id);

  const [status, setStatus] = useState<PlanStatus | undefined>(plan?.status);
  const [tab, setTab] = useState(0);
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
  const allSelected = filteredAssets.length > 0 && filteredAssets.every((a) => selectedAssets.includes(a.assetCode));
  const someSelected = filteredAssets.some((a) => selectedAssets.includes(a.assetCode));
  const toggleAll = () =>
    setSelectedAssets(allSelected ? [] : filteredAssets.map((a) => a.assetCode));
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

  return (
    <Box>
      <PageHeader
        title={plan.name}
        breadcrumbs={[{ label: 'Maintenance Plans', to: '/bm/maintenance-plans' }, { label: plan.id }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => show('Report download started.')} sx={{ borderRadius: 8 }}>
              Print Report
            </Button>
            {isPending && (
              <>
                <Button variant="contained" onClick={() => setApproveOpen(true)} sx={{ borderRadius: 8 }}>Approve Plan</Button>
                <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)} sx={{ borderRadius: 8 }}>Reject Plan</Button>
              </>
            )}
            {isActive && (
              <>
                <Button variant="outlined" onClick={() => setInactiveOpen(true)} sx={{ borderRadius: 8 }}>Set Inactive</Button>
                <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)} sx={{ borderRadius: 8 }}>Set Cancelled</Button>
              </>
            )}
            {isInactive && (
              <>
                <Button variant="contained" onClick={() => setActiveOpen(true)} sx={{ borderRadius: 8 }}>Set Active</Button>
                <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)} sx={{ borderRadius: 8 }}>Set Cancelled</Button>
              </>
            )}
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        {status && <StatusChip status={status} />}
        <Chip label={plan.frequency} variant="outlined" sx={{ borderRadius: 8 }} />
        <Typography variant="body2" color="text.secondary">{plan.id} · Created {plan.createdDate} by {plan.createdBy}</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard
            title="Details"
            action={canEdit ? <IconButton size="small" onClick={() => setEditOpen(true)}><EditIcon fontSize="small" /></IconButton> : undefined}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset System" value={plan.assetSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Sub-system" value={plan.subSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Type" value={plan.assetType} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Frequency" value={plan.frequency} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Time Required" value={plan.timeRequired} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Building" value={buildingName(plan.buildingId)} /></Grid>
              <Grid size={{ xs: 12 }}><DetailField label="Description" value={plan.description} /></Grid>
              <Grid size={{ xs: 12 }}><DetailField label="Remark" value={plan.remark || '—'} /></Grid>
            </Grid>
          </SectionCard>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Rounds" />
            <Tab label="Assets" />
            <Tab label="Work Orders" />
          </Tabs>

          {tab === 0 && (
            <SectionCard title="Rounds">
              {plan.rounds.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No rounds yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead><TableRow><TableCell>Round</TableCell><TableCell>Start</TableCell><TableCell>End</TableCell><TableCell>Status</TableCell><TableCell>Completion</TableCell></TableRow></TableHead>
                  <TableBody>
                    {plan.rounds.map((r) => (
                      <TableRow key={r.roundNo}>
                        <TableCell>{r.roundNo}</TableCell>
                        <TableCell>{r.startDate}</TableCell>
                        <TableCell>{r.endDate}</TableCell>
                        <TableCell><StatusChip status={r.status} /></TableCell>
                        <TableCell sx={{ width: 180 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LinearProgress variant="determinate" value={r.completionRate} sx={{ flexGrow: 1, borderRadius: 1, height: 6 }} />
                            <Typography variant="caption">{r.completionRate}%</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          )}

          {tab === 1 && (
            <SectionCard
              title="Assets"
              action={canEdit ? <Button size="small" startIcon={<AddIcon />} onClick={() => show('Asset selector opened.')} sx={{ borderRadius: 8 }}>Add Asset</Button> : undefined}
            >
              {plan.assets.length === 0 ? (
                <EmptyState title="No assets added. Click [+ Add Asset] to start." />
              ) : (
                <>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
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
                        sx={{ borderRadius: 8 }}
                      >
                        Assign to Technician
                      </Button>
                    )}
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {canEdit && (
                          <TableCell padding="checkbox">
                            <Checkbox size="small" checked={allSelected} indeterminate={!allSelected && someSelected} onChange={toggleAll} />
                          </TableCell>
                        )}
                        <TableCell>Asset Code</TableCell><TableCell>Asset Name</TableCell><TableCell>Location</TableCell><TableCell>Main Technician</TableCell><TableCell>WO Status</TableCell><TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAssets.map((a) => (
                        <TableRow key={a.assetCode} selected={selectedAssets.includes(a.assetCode)}>
                          {canEdit && (
                            <TableCell padding="checkbox">
                              <Checkbox size="small" checked={selectedAssets.includes(a.assetCode)} onChange={() => toggleOne(a.assetCode)} />
                            </TableCell>
                          )}
                          <TableCell><Link component={RouterLink} to={`/bm/assets/${a.assetCode}`} underline="hover">{a.assetCode}</Link></TableCell>
                          <TableCell>{a.assetName}</TableCell>
                          <TableCell>{a.location}</TableCell>
                          <TableCell>{a.mainTechnician ?? '—'}</TableCell>
                          <TableCell><StatusChip status={a.woStatus} /></TableCell>
                          <TableCell>{canEdit && <Button size="small" onClick={() => show('Technician selector opened.')}>Assign</Button>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </SectionCard>
          )}

          {tab === 2 && (
            <SectionCard title="Work Orders">
              {plan.workOrders.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No work orders generated yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead><TableRow><TableCell>WO ID</TableCell><TableCell>Asset</TableCell><TableCell>Round</TableCell><TableCell>Technician</TableCell><TableCell>Status</TableCell><TableCell>Completion Date</TableCell></TableRow></TableHead>
                  <TableBody>
                    {plan.workOrders.map((w) => (
                      <TableRow key={w.woId} hover>
                        <TableCell><Link component={RouterLink} to={`/bm/work-orders/${w.woId}`} underline="hover">{w.woId}</Link></TableCell>
                        <TableCell>{w.asset}</TableCell>
                        <TableCell>{w.round}</TableCell>
                        <TableCell>{w.technician}</TableCell>
                        <TableCell><StatusChip status={w.status} /></TableCell>
                        <TableCell>{w.completionDate ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="History Log">
            <HistoryLog entries={plan.history} />
          </SectionCard>
          {isCancelled && (
            <Typography variant="caption" color="text.secondary">This plan is cancelled. All tabs are read-only.</Typography>
          )}
        </Grid>
      </Grid>

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
