/**
 * 5.5.2 Maintenance Plan Detail + 5.5.5 View Maintenance History (MSP
 * Supervisor). Tabs: Round / Assets / Work Orders, with a history log side
 * panel. Hosts 5.5.4 Edit Plan (dialog) and Resubmit to BM for own
 * Pending / Approval Rejected plans.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import InfoField from '../components/InfoField';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
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
  const [tab, setTab] = useState(0);
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

  const woLink = (woId: string) => (
    <Link component="button" type="button" onClick={() => navigate(`/msp/work-orders/${woId}`)}>
      {woId}
    </Link>
  );

  return (
    <Box>
      <PageHeader
        title={plan.name}
        subtitle={`${plan.id} · Created ${formatDateTime(plan.createdDate)} · ${plan.building}`}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Maintenance Plans', to: '/msp/maintenance-plans' }, { label: plan.id }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <IconButton onClick={() => navigate('/msp/maintenance-plans')}>
              <ArrowBackIcon />
            </IconButton>
            <StatusChip status={plan.status} />
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => toast('Plan report generated (PDF).', 'info')}>
              Print Report
            </Button>
            {canEdit && (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Edit Plan
              </Button>
            )}
            {isOwn && plan.status === 'Approval Rejected' && (
              <Button variant="contained" color="secondary" startIcon={<SendIcon />} onClick={handleResubmit}>
                Resubmit to BM
              </Button>
            )}
          </Stack>
        }
      />

      {plan.status === 'Approval Rejected' && plan.rejectionReason && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Rejected by Building Manager. Reason: {plan.rejectionReason}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Details">
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Asset System" value={plan.assetSystem} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Sub-system" value={plan.subSystem} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Asset Type" value={plan.assetType} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Frequency" value={plan.frequency} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Time Required" value={plan.timeRequired} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Building" value={plan.building} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Description" value={plan.description} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Remark" value={plan.remark} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Photos" value={`${plan.photos} photo(s)`} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard noPadding>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Rounds" />
                <Tab label="Assets" />
                <Tab label="Work Orders" />
              </Tabs>
              <Box sx={{ p: 2 }}>
                {tab === 0 &&
                  (plan.rounds.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No rounds yet.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Round No</TableCell>
                          <TableCell>Date Range</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell sx={{ minWidth: 160 }}>Completion Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {plan.rounds.map((r) => {
                          const rate = r.totalWos ? Math.round((r.closedWos / r.totalWos) * 100) : 0;
                          return (
                            <TableRow key={r.roundNo}>
                              <TableCell>{r.roundNo}</TableCell>
                              <TableCell>
                                {formatDate(r.startDate)} – {formatDate(r.endDate)}
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={r.status} />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <LinearProgress variant="determinate" value={rate} sx={{ flex: 1 }} />
                                  <Typography variant="caption">{rate}%</Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ))}

                {tab === 1 &&
                  (planAssets.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No assets added to this plan.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset Code</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Building</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {planAssets.map((a) => (
                          <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/msp/assets/${a.id}`)}>
                            <TableCell>{a.code}</TableCell>
                            <TableCell>{a.name}</TableCell>
                            <TableCell>
                              {a.floor} · {a.area}
                            </TableCell>
                            <TableCell>{a.building}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ))}

                {tab === 2 &&
                  (planWos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No work orders generated yet.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>WO ID</TableCell>
                          <TableCell>Asset</TableCell>
                          <TableCell>Round</TableCell>
                          <TableCell>Technician</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Completion Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {planWos.map((w) => (
                          <TableRow key={w.id} hover>
                            <TableCell>{woLink(w.id)}</TableCell>
                            <TableCell>{w.assetCode}</TableCell>
                            <TableCell>{w.maintenanceRound}</TableCell>
                            <TableCell>{technicianName(w.mainTechnicianId)}</TableCell>
                            <TableCell>
                              <StatusChip status={w.status} />
                            </TableCell>
                            <TableCell>{formatDate(w.endTime)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ))}
              </Box>
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="History Log">
            <List dense disablePadding>
              {plan.history.map((h, i) => (
                <ListItem key={i} disableGutters alignItems="flex-start">
                  <ListItemText primary={h.label} secondary={formatDateTime(h.timestamp)} primaryTypographyProps={{ variant: 'body2' }} secondaryTypographyProps={{ variant: 'caption' }} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>

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
