/**
 * 5.3.3 View Work Order Detail (MSP Supervisor) — also hosts:
 *  5.3.4 Approve/Decline Technician Request, 5.3.5 Assign to Technician,
 *  5.3.6 Spare Parts Pre-request, 5.3.7 Completion Review & Sign-off,
 *  5.3.8 Reject Completed WO. Action buttons are status-dependent.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
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
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import InfoField from '../components/InfoField';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/useToast';
import { formatDate, formatDateTime } from '../../../utils/date';
import {
  assetByCode,
  assets,
  maintenancePlanById,
  spareParts,
  technicianName,
  technicians,
  workOrderById,
} from '../data/mockData';
import type { ChecklistItem, ChecklistRequirement, WorkOrder, WorkOrderStatus } from '../data/types';

const STAGES = ['New', 'Assignment', 'In Progress', 'Review', 'Approval'];

/** Stage index (0..4) + a context label shown under the active stage. */
function stageInfo(status: WorkOrderStatus): { index: number; context: string } {
  switch (status) {
    case 'Preparation Draft':
      return { index: 0, context: 'Preparation (Draft)' };
    case 'Tenant Request':
    case 'Service Request Accepted':
    case 'Pending':
    case 'Technician Request':
      return { index: 0, context: 'New' };
    case 'Pending - Unassigned':
      return { index: 1, context: 'Pending (Unassigned)' };
    case 'Assigned':
    case 'Started':
      return { index: 2, context: 'In Progress' };
    case 'Completed':
      return { index: 3, context: 'Review (Supervisor sign-off)' };
    case 'Verified':
      return { index: 4, context: 'Approval' };
    case 'Closed':
    case 'Cancelled':
      return { index: 4, context: 'Finalized' };
    case 'Ad-hoc Declined':
    case 'Approval Rejected':
    case 'Completion Rejected':
    case 'Verification Rejected':
      return { index: 4, context: 'Rejection' };
    default:
      return { index: 0, context: 'New' };
  }
}

export default function WorkOrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();

  const initial = useMemo(() => workOrderById(id ?? ''), [id]);
  const [wo, setWo] = useState<WorkOrder | undefined>(initial);

  // Dialog state — Main & Sub technicians are edited separately
  const [mainTechOpen, setMainTechOpen] = useState(false);
  const [subTechOpen, setSubTechOpen] = useState(false);
  const [mainTech, setMainTech] = useState('');
  const [subTechs, setSubTechs] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  const [signOffOpen, setSignOffOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineError, setDeclineError] = useState('');

  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [resubmitNote, setResubmitNote] = useState('');

  const [partsOpen, setPartsOpen] = useState(false);
  const [partRows, setPartRows] = useState<{ partId: string; qty: number }[]>([{ partId: '', qty: 1 }]);
  const [partsNotes, setPartsNotes] = useState('');

  // Edit Overview modal
  const [editOverviewOpen, setEditOverviewOpen] = useState(false);
  const [ovForm, setOvForm] = useState({ startTime: '', endTime: '', duration: '', assetCode: '' });

  // Edit Tenant modal
  const [editTenantOpen, setEditTenantOpen] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: '', location: '', email: '', phone: '' });

  // Edit Checklist modal
  const [editChecklistOpen, setEditChecklistOpen] = useState(false);
  const [checklistDraft, setChecklistDraft] = useState<ChecklistItem[]>([]);

  if (!wo) {
    return (
      <Box>
        <PageHeader title="Work Order" breadcrumbs={[{ label: 'Work Orders', to: '/msp/work-orders' }, { label: 'Not found' }]} />
        <EmptyState
          title="Work order not found"
          description="Failed to load work order details. Please go back and try again."
          action={
            <Button variant="contained" onClick={() => navigate('/msp/work-orders')}>
              Back to list
            </Button>
          }
        />
      </Box>
    );
  }

  const activeTechs = technicians.filter((t) => t.status === 'Active');
  const checklistDone = wo.checklist.filter((c) => c.completed).length;

  const setStatus = (status: WorkOrderStatus, log: string) =>
    setWo((prev) => (prev ? { ...prev, status, history: [...prev.history, { timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: log }] } : prev));

  // ---- 5.3.5 Main Technician (add / edit) ----
  const openMainTechDialog = () => {
    setMainTech(wo.mainTechnicianId ?? '');
    setDueDate(wo.dueDate ?? '');
    setAssignNotes('');
    setMainTechOpen(true);
  };
  const handleSaveMainTech = () => {
    if (!mainTech) {
      toast('Please select a Main Technician.', 'error');
      return;
    }
    // First-time assignment of an unassigned WO drives the Assigned transition.
    const firstAssign = wo.status === 'Pending - Unassigned';
    setWo((prev) =>
      prev
        ? {
            ...prev,
            status: firstAssign ? 'Assigned' : prev.status,
            mainTechnicianId: mainTech,
            dueDate: dueDate || prev.dueDate,
            history: [
              ...prev.history,
              {
                timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                label: firstAssign
                  ? `Assigned to ${technicianName(mainTech)} by Marcus Delgado.`
                  : `Main Technician changed to ${technicianName(mainTech)} by Marcus Delgado.`,
              },
            ],
          }
        : prev,
    );
    toast(firstAssign ? `Work order assigned to ${technicianName(mainTech)}.` : `Main Technician set to ${technicianName(mainTech)}.`);
    setMainTechOpen(false);
  };

  // ---- 5.3.5 Sub Technicians (add / edit) ----
  const openSubTechDialog = () => {
    setSubTechs(wo.subTechnicianIds);
    setSubTechOpen(true);
  };
  const handleSaveSubTechs = () => {
    setWo((prev) =>
      prev
        ? {
            ...prev,
            subTechnicianIds: subTechs,
            history: [
              ...prev.history,
              { timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: 'Sub Technicians updated by Marcus Delgado.' },
            ],
          }
        : prev,
    );
    toast('Sub Technicians updated.');
    setSubTechOpen(false);
  };

  // ---- 5.3.7 Sign off ----
  const handleSignOff = () => {
    setStatus('Verified', 'Signed off by Marcus Delgado.');
    toast('Work order forwarded to Building Manager.');
    setSignOffOpen(false);
  };

  // ---- 5.3.8 Reject completed ----
  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }
    setWo((prev) =>
      prev ? { ...prev, status: 'Completion Rejected', rejectionReason: rejectReason, history: [...prev.history, { timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: `Rejected by Marcus Delgado. Reason: ${rejectReason}` }] } : prev,
    );
    toast('Work order returned to Technician.');
    setRejectOpen(false);
    setRejectReason('');
    setRejectError('');
  };

  // ---- 5.3.4 Approve / Decline Tech Request ----
  const handleApprove = () => {
    setStatus('Pending', 'Approved and forwarded by Marcus Delgado.');
    toast('Request forwarded to Building Manager.');
    setApproveOpen(false);
  };
  const handleDecline = () => {
    if (!declineReason.trim()) {
      setDeclineError('Decline reason is required.');
      return;
    }
    setStatus('Ad-hoc Declined', `Declined by Marcus Delgado. Reason: ${declineReason}`);
    toast('Request declined.');
    setDeclineOpen(false);
    setDeclineReason('');
    setDeclineError('');
  };

  // ---- 5.3.7 Resubmit after BM rejection ----
  const handleResubmit = () => {
    setStatus('Verified', 'Resubmitted by Marcus Delgado. (After BM rejection.)');
    toast('Work order resubmitted to Building Manager.');
    setResubmitOpen(false);
    setResubmitNote('');
  };

  // ---- 5.3.6 Spare parts pre-request ----
  const handleSubmitParts = () => {
    if (partRows.some((r) => !r.partId)) {
      toast('Please select a spare part.', 'error');
      return;
    }
    if (partRows.some((r) => !r.qty || r.qty < 1)) {
      toast('Please enter a valid quantity.', 'error');
      return;
    }
    toast('Spare parts request submitted for Building Manager approval.');
    setPartsOpen(false);
    setPartRows([{ partId: '', qty: 1 }]);
    setPartsNotes('');
  };

  const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

  // ---- 5.3.x Edit Overview ----
  const openEditOverview = () => {
    setOvForm({
      startTime: wo.startTime ?? '',
      endTime: wo.endTime ?? '',
      duration: wo.duration,
      assetCode: wo.assetCode,
    });
    setEditOverviewOpen(true);
  };
  const handleSaveOverview = () => {
    const a = assetByCode(ovForm.assetCode);
    setWo((prev) =>
      prev
        ? {
            ...prev,
            startTime: ovForm.startTime || null,
            endTime: ovForm.endTime || null,
            duration: ovForm.duration,
            assetCode: ovForm.assetCode,
            assetName: a ? a.name : prev.assetName,
            assetType: a ? a.assetType : prev.assetType,
            subSystem: a ? a.subSystem : prev.subSystem,
            assetSystem: a ? a.assetSystem : prev.assetSystem,
            building: a ? a.building : prev.building,
            floor: a ? a.floor : prev.floor,
            area: a ? a.area : prev.area,
            history: [...prev.history, { timestamp: now(), label: 'Overview edited by Marcus Delgado.' }],
          }
        : prev,
    );
    toast('Overview updated.');
    setEditOverviewOpen(false);
  };

  // ---- 5.3.x Edit Tenant ----
  const openEditTenant = () => {
    setTenantForm({
      name: wo.tenant?.name ?? '',
      location: wo.tenant?.location ?? '',
      email: wo.tenant?.email ?? '',
      phone: wo.tenant?.phone ?? '',
    });
    setEditTenantOpen(true);
  };
  const handleSaveTenant = () => {
    setWo((prev) =>
      prev
        ? {
            ...prev,
            tenant: { ...tenantForm },
            tenantContact: `${tenantForm.name} · ${tenantForm.phone} · ${tenantForm.location}`,
            history: [...prev.history, { timestamp: now(), label: 'Tenant info edited by Marcus Delgado.' }],
          }
        : prev,
    );
    toast('Tenant info updated.');
    setEditTenantOpen(false);
  };

  // ---- 5.3.x Edit Checklist ----
  const openEditChecklist = () => {
    setChecklistDraft(wo.checklist.map((c) => ({ ...c })));
    setEditChecklistOpen(true);
  };
  const handleSaveChecklist = () => {
    setWo((prev) => (prev ? { ...prev, checklist: checklistDraft, history: [...prev.history, { timestamp: now(), label: 'Work checklist edited by Marcus Delgado.' }] } : prev));
    toast('Work checklist updated.');
    setEditChecklistOpen(false);
  };

  const plan = wo.maintenancePlanId ? maintenancePlanById(wo.maintenancePlanId) : undefined;
  const stage = stageInfo(wo.status);

  // Action buttons by status
  const actions: React.ReactNode[] = [];
  if (wo.status === 'Pending - Unassigned') {
    actions.push(
      <Button key="assign" variant="contained" startIcon={<SendIcon />} onClick={openMainTechDialog}>
        Send to Technician
      </Button>,
    );
  }
  if (wo.status === 'Completed') {
    actions.push(
      <Button key="signoff" variant="contained" onClick={() => setSignOffOpen(true)}>
        Sign Off & Forward to BM
      </Button>,
      <Button key="reject" variant="outlined" color="error" onClick={() => setRejectOpen(true)}>
        Reject
      </Button>,
    );
  }
  if (wo.status === 'Verification Rejected') {
    actions.push(
      <Button key="resubmit" variant="contained" onClick={() => setResubmitOpen(true)}>
        Review & Resubmit to BM
      </Button>,
    );
  }
  if (wo.status === 'Technician Request') {
    actions.push(
      <Button key="approve" variant="contained" onClick={() => setApproveOpen(true)}>
        Approve & Forward to BM
      </Button>,
      <Button key="decline" variant="outlined" color="error" onClick={() => setDeclineOpen(true)}>
        Decline
      </Button>,
    );
  }
  if (wo.status === 'Pending - Unassigned' || wo.status === 'Assigned') {
    actions.push(
      <Button key="parts" variant="outlined" onClick={() => setPartsOpen(true)}>
        Request Spare Parts
      </Button>,
    );
  }

  return (
    <Box>
      <PageHeader
        title={`${wo.assetCode} · ${wo.type}`}
        subtitle={`#${wo.id.replace('-', '')} · Created ${formatDateTime(wo.createdDate)}`}
        breadcrumbs={[
          { label: 'MSP Supervisor', to: '/msp/dashboard' },
          { label: 'Work Orders', to: '/msp/work-orders' },
          { label: wo.id },
        ]}
        action={
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <IconButton onClick={() => navigate('/msp/work-orders')}>
              <ArrowBackIcon />
            </IconButton>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => toast('Print report generated (PDF).', 'info')}>
              Print Report
            </Button>
            {actions}
          </Stack>
        }
      />

      {wo.status === 'Verification Rejected' && wo.rejectionReason && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Rejected by Building Manager. Reason: {wo.rejectionReason}
        </Alert>
      )}
      {wo.status === 'Completion Rejected' && wo.rejectionReason && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Returned to Technician. Reason: {wo.rejectionReason}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Stepper activeStep={stage.index} alternativeLabel>
          {STAGES.map((label, i) => (
            <Step key={label}>
              <StepLabel optional={i === stage.index ? <Typography variant="caption" color="primary">{stage.context}</Typography> : undefined}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard
              title="Overview"
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip status={wo.status} />
                  <Button size="small" startIcon={<EditIcon />} onClick={openEditOverview}>
                    Edit Info
                  </Button>
                </Stack>
              }
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Priority" value={<Chip size="small" label={wo.priority} />} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Time Required to Complete" value={wo.duration} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField
                    label="Due Date"
                    value={wo.dueDate ? `${formatDate(wo.dueDate)}${wo.overdue ? ' (overdue)' : ''}` : '-'}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Start Time" value={formatDateTime(wo.startTime)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="End Time" value={formatDateTime(wo.endTime)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Submitted By" value={wo.submittedBy} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <InfoField label="Asset Code" value={wo.assetCode} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <InfoField label="Asset Type" value={wo.assetType} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <InfoField label="Sub-system" value={wo.subSystem} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <InfoField label="Asset System" value={wo.assetSystem} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Location" value={`${wo.area} / ${wo.floor}, ${wo.building}`} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard
              title="Details"
              action={
                <Button size="small" startIcon={<EditIcon />} onClick={() => toast('Edit Details — coming soon.', 'info')}>
                  Edit
                </Button>
              }
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Description" value={wo.description} />
                </Grid>
                {wo.cause && (
                  <Grid size={{ xs: 12 }}>
                    <InfoField label="Cause" value={wo.cause} />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <InfoField label="Attachments / Photos" value={`${wo.attachments} file(s)`} />
                </Grid>
                {wo.notes && (
                  <Grid size={{ xs: 12 }}>
                    <InfoField label="Notes" value={wo.notes} />
                  </Grid>
                )}
              </Grid>
            </SectionCard>

            {(wo.type === 'Service Request' || wo.tenant) && (
              <SectionCard
                title="Tenant"
                action={
                  <Button size="small" startIcon={<EditIcon />} onClick={openEditTenant}>
                    Edit Tenant
                  </Button>
                }
              >
                {wo.tenant ? (
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <InfoField label="Name" value={wo.tenant.name} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <InfoField label="Location" value={wo.tenant.location} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <InfoField label="Email" value={wo.tenant.email} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <InfoField label="Phone" value={wo.tenant.phone} />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tenant info. Click [Edit Tenant] to add.
                  </Typography>
                )}
              </SectionCard>
            )}

            {plan && (
              <SectionCard title="Maintenance Plan Reference">
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <InfoField label="Round" value={wo.maintenanceRound} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <InfoField label="Plan ID" value={plan.id} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <InfoField label="Plan Name" value={plan.name} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <InfoField label="Frequency" value={plan.frequency} />
                  </Grid>
                </Grid>
              </SectionCard>
            )}

            <SectionCard
              title={`Work Checklist (${checklistDone}/${wo.checklist.length} completed)`}
              action={
                <Button size="small" startIcon={<EditIcon />} onClick={openEditChecklist}>
                  Edit Checklist
                </Button>
              }
            >
              {wo.checklist.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No checklist items. Click [Edit Checklist] to add.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {wo.checklist.map((c) => (
                    <ListItem key={c.id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {c.completed ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="disabled" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={c.name ?? c.description}
                        secondary={`Description: ${c.descriptionMode ?? 'Off'} · Photos: ${c.photosMode ?? 'Off'} · ${c.photos} photo(s)`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </SectionCard>

            {wo.parts.length > 0 && (
              <SectionCard title="Part Replacement">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wo.parts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.source}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.code}</TableCell>
                        <TableCell align="right">{p.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </SectionCard>
            )}

            {wo.signOffs.length > 0 && (
              <SectionCard title="Sign-off Records">
                <Stack spacing={1}>
                  {wo.signOffs.map((s, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {s.role}: <strong>{s.name}</strong>
                      </Typography>
                      <Typography variant="caption" color={s.timestamp ? 'success.main' : 'text.secondary'}>
                        {s.timestamp ? formatDateTime(s.timestamp) : 'Pending'}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </SectionCard>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <SectionCard
              title="Main Technician"
              action={
                <Button
                  size="small"
                  startIcon={wo.mainTechnicianId ? <EditIcon /> : <AddIcon />}
                  onClick={openMainTechDialog}
                >
                  {wo.mainTechnicianId ? 'Edit' : 'Add'}
                </Button>
              }
            >
              {wo.mainTechnicianId ? (
                (() => {
                  const t = technicians.find((x) => x.id === wo.mainTechnicianId)!;
                  return (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={t.avatar}>{t.name[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.phone} · {t.level}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })()
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
            </SectionCard>

            <SectionCard
              title="Sub Technicians"
              action={
                <Button size="small" startIcon={<AddIcon />} onClick={openSubTechDialog}>
                  {wo.subTechnicianIds.length === 0 ? 'Add' : 'Edit'}
                </Button>
              }
            >
              {wo.subTechnicianIds.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  None
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {wo.subTechnicianIds.map((sid) => {
                    const t = technicians.find((x) => x.id === sid);
                    return (
                      <Stack key={sid} direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={t?.avatar} sx={{ width: 32, height: 32 }}>
                          {t?.name[0] ?? '?'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2">{t?.name ?? technicianName(sid)}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {t?.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t?.phone}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setWo((prev) =>
                              prev ? { ...prev, subTechnicianIds: prev.subTechnicianIds.filter((x) => x !== sid) } : prev,
                            )
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </SectionCard>

            <SectionCard title="History Log">
              <List dense disablePadding>
                {wo.history.map((h, i) => (
                  <ListItem key={i} disableGutters alignItems="flex-start">
                    <ListItemText primary={h.label} secondary={formatDateTime(h.timestamp)} primaryTypographyProps={{ variant: 'body2' }} secondaryTypographyProps={{ variant: 'caption' }} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      {/* ---- 5.3.5 Main Technician dialog ---- */}
      <Dialog open={mainTechOpen} onClose={() => setMainTechOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{wo.mainTechnicianId ? 'Edit Main Technician' : 'Assign Main Technician'}</DialogTitle>
        <DialogContent>
          {activeTechs.length === 0 ? (
            <Alert severity="warning">No active Technicians available in your group.</Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Autocomplete
                options={activeTechs}
                getOptionLabel={(t) => `${t.name} · ${t.email}`}
                value={activeTechs.find((t) => t.id === mainTech) ?? null}
                onChange={(_, v) => setMainTech(v?.id ?? '')}
                renderOption={(props, t) => (
                  <Box component="li" {...props} key={t.id}>
                    <Box>
                      <Typography variant="body2">{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.email} · {t.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(p) => <TextField {...p} required label="Main Technician" placeholder="Enter name or email" />}
              />
              <DatePicker
                label="Due Date"
                format="DD/MM/YYYY"
                value={dueDate ? dayjs(dueDate) : null}
                onChange={(v) => setDueDate(v ? v.format('YYYY-MM-DD') : '')}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField label="Notes" value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} fullWidth multiline minRows={2} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setMainTechOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} onClick={handleSaveMainTech} disabled={activeTechs.length === 0}>
            {wo.status === 'Pending - Unassigned' ? 'Send to Technician' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.5 Sub Technicians dialog ---- */}
      <Dialog open={subTechOpen} onClose={() => setSubTechOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sub Technicians</DialogTitle>
        <DialogContent>
          {activeTechs.length === 0 ? (
            <Alert severity="warning">No active Technicians available in your group.</Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Autocomplete
                multiple
                options={activeTechs.filter((t) => t.id !== wo.mainTechnicianId)}
                getOptionLabel={(t) => `${t.name} · ${t.email}`}
                value={activeTechs.filter((t) => subTechs.includes(t.id))}
                onChange={(_, v) => setSubTechs(v.map((t) => t.id))}
                renderOption={(props, t) => (
                  <Box component="li" {...props} key={t.id}>
                    <Box>
                      <Typography variant="body2">{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.email} · {t.phone}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(p) => <TextField {...p} label="Sub Technicians" placeholder="Enter name or email" />}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setSubTechOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveSubTechs} disabled={activeTechs.length === 0}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.6 Spare Parts dialog ---- */}
      <Dialog open={partsOpen} onClose={() => setPartsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Spare Parts</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {partRows.map((row, idx) => {
              const part = spareParts.find((p) => p.id === row.partId);
              return (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      select
                      required
                      label="Spare Part"
                      value={row.partId}
                      onChange={(e) => setPartRows((rs) => rs.map((r, i) => (i === idx ? { ...r, partId: e.target.value } : r)))}
                      fullWidth
                    >
                      {spareParts.filter((p) => p.status === 'Active').map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      type="number"
                      required
                      label="Qty"
                      value={row.qty}
                      onChange={(e) => setPartRows((rs) => rs.map((r, i) => (i === idx ? { ...r, qty: Number(e.target.value) } : r)))}
                      sx={{ width: 100 }}
                      inputProps={{ min: 1 }}
                    />
                    {partRows.length > 1 && (
                      <IconButton onClick={() => setPartRows((rs) => rs.filter((_, i) => i !== idx))}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                  {part && (
                    <Typography variant="caption" color={row.qty > part.available ? 'error.main' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                      Available: {part.available} · On-Hold: {part.onHold}
                      {row.qty > part.available ? ' — Requested quantity exceeds available stock. This request will be flagged as Unavailable.' : ''}
                    </Typography>
                  )}
                </Box>
              );
            })}
            <Button startIcon={<AddIcon />} onClick={() => setPartRows((rs) => [...rs, { partId: '', qty: 1 }])} sx={{ alignSelf: 'flex-start' }}>
              Add part
            </Button>
            <TextField label="Notes" value={partsNotes} onChange={(e) => setPartsNotes(e.target.value)} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setPartsOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitParts}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.8 Reject dialog ---- */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Work Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            required
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              setRejectError('');
            }}
            error={!!rejectError}
            helperText={rejectError || 'Describe why this work order is being rejected and what the Technician needs to correct.'}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.4 Decline dialog ---- */}
      <Dialog open={declineOpen} onClose={() => setDeclineOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Decline Technician Request</DialogTitle>
        <DialogContent>
          <TextField
            label="Decline Reason"
            required
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 1 }}
            value={declineReason}
            onChange={(e) => {
              setDeclineReason(e.target.value);
              setDeclineError('');
            }}
            error={!!declineError}
            helperText={declineError}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeclineOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDecline}>
            Decline
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.7 Resubmit dialog ---- */}
      <Dialog open={resubmitOpen} onClose={() => setResubmitOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review & Resubmit to BM</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Confirm that you have reviewed the Building Manager&apos;s rejection reason and the work order is ready for resubmission. The execution content cannot be edited.
          </Typography>
          <TextField label="Note for BM (optional)" fullWidth multiline minRows={2} value={resubmitNote} onChange={(e) => setResubmitNote(e.target.value)} inputProps={{ maxLength: 300 }} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setResubmitOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleResubmit}>
            Resubmit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- 5.3.7 Sign-off confirm ---- */}
      <ConfirmDialog
        open={signOffOpen}
        title="Sign Off & Forward to BM"
        description="Sign off and forward this work order to Building Manager for final review? Verify that all checklist items, photos, and signatures are complete before proceeding."
        confirmLabel="Confirm"
        onConfirm={handleSignOff}
        onClose={() => setSignOffOpen(false)}
      />

      {/* ---- 5.3.4 Approve confirm ---- */}
      <ConfirmDialog
        open={approveOpen}
        title="Approve & Forward to BM"
        description="Forward this request to Building Manager for approval?"
        confirmLabel="Confirm"
        onConfirm={handleApprove}
        onClose={() => setApproveOpen(false)}
      />

      {/* ---- Edit Overview dialog ---- */}
      <Dialog open={editOverviewOpen} onClose={() => setEditOverviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Overview</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DateTimePicker
              label="Start Time"
              format="DD/MM/YYYY HH:mm"
              value={ovForm.startTime ? dayjs(ovForm.startTime) : null}
              onChange={(v) => setOvForm((f) => ({ ...f, startTime: v ? v.format('YYYY-MM-DD HH:mm') : '' }))}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DateTimePicker
              label="End Time"
              format="DD/MM/YYYY HH:mm"
              value={ovForm.endTime ? dayjs(ovForm.endTime) : null}
              onChange={(v) => setOvForm((f) => ({ ...f, endTime: v ? v.format('YYYY-MM-DD HH:mm') : '' }))}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TextField
              label="Time Required to Complete (Day)"
              fullWidth
              value={ovForm.duration}
              onChange={(e) => setOvForm((f) => ({ ...f, duration: e.target.value }))}
            />
            <TextField
              select
              label="Asset"
              fullWidth
              value={ovForm.assetCode}
              onChange={(e) => setOvForm((f) => ({ ...f, assetCode: e.target.value }))}
              helperText="Selecting an asset auto-fills Asset Type / Sub-system / System / Location."
            >
              {assets.map((a) => (
                <MenuItem key={a.id} value={a.code}>
                  {a.code} · {a.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditOverviewOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveOverview}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Edit Tenant dialog ---- */}
      <Dialog open={editTenantOpen} onClose={() => setEditTenantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={tenantForm.name} onChange={(e) => setTenantForm((f) => ({ ...f, name: e.target.value }))} />
            <TextField label="Location" fullWidth value={tenantForm.location} onChange={(e) => setTenantForm((f) => ({ ...f, location: e.target.value }))} />
            <TextField label="Email" fullWidth value={tenantForm.email} onChange={(e) => setTenantForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField label="Phone" fullWidth value={tenantForm.phone} onChange={(e) => setTenantForm((f) => ({ ...f, phone: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditTenantOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveTenant}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Edit Work Checklist dialog ---- */}
      <Dialog open={editChecklistOpen} onClose={() => setEditChecklistOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Work Checklist</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {checklistDraft.map((c, idx) => (
              <Box key={c.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    label="Item Name"
                    fullWidth
                    value={c.name ?? ''}
                    onChange={(e) => setChecklistDraft((rs) => rs.map((r, i) => (i === idx ? { ...r, name: e.target.value, description: e.target.value } : r)))}
                  />
                  <IconButton onClick={() => setChecklistDraft((rs) => rs.filter((_, i) => i !== idx))}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    select
                    label="Description"
                    fullWidth
                    value={c.descriptionMode ?? 'Off'}
                    onChange={(e) => setChecklistDraft((rs) => rs.map((r, i) => (i === idx ? { ...r, descriptionMode: e.target.value as ChecklistRequirement } : r)))}
                  >
                    <MenuItem value="Off">Off</MenuItem>
                    <MenuItem value="Require">Require</MenuItem>
                    <MenuItem value="Optional">Optional</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Photos"
                    fullWidth
                    value={c.photosMode ?? 'Off'}
                    onChange={(e) => setChecklistDraft((rs) => rs.map((r, i) => (i === idx ? { ...r, photosMode: e.target.value as ChecklistRequirement } : r)))}
                  >
                    <MenuItem value="Off">Off</MenuItem>
                    <MenuItem value="Require">Require</MenuItem>
                    <MenuItem value="Optional">Optional</MenuItem>
                  </TextField>
                </Stack>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                setChecklistDraft((rs) => [
                  ...rs,
                  { id: `c-${rs.length + 1}-${rs.length}`, name: '', description: '', descriptionMode: 'Off', photosMode: 'Off', completed: false, photos: 0 },
                ])
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Add item
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditChecklistOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveChecklist}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {toastElement}
    </Box>
  );
}
