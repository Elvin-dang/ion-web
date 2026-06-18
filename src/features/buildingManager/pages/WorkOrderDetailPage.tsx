/**
 * 3.4.2 Work Order Detail + 3.4.3 Sign Off & Close + 3.4.4 Reject Completed WO.
 * 5-stage progress, tabs (Details / Execution), action buttons when Verified.
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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
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
import Link from '@mui/material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PrintIcon from '@mui/icons-material/Print';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { SectionCard, DetailField, HistoryLog, HoverCard, useToast } from '../components/shared';
import { workOrders, buildings } from '../data/mockData';
import type { WorkOrderStatus } from '../data/types';

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;
const STAGES = ['New', 'Pending', 'In Progress', 'Review', 'Approval'];

function stageIndex(status: WorkOrderStatus): number {
  switch (status) {
    case 'Pending - Unassigned':
      return 1;
    case 'Assigned':
    case 'Started':
      return 2;
    case 'Completed':
      return 3;
    case 'Verified':
    case 'Closed':
      return 4;
    default:
      return 0;
  }
}

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const { show, node } = useToast();
  const wo = workOrders.find((w) => w.id === id);

  const [status, setStatus] = useState<WorkOrderStatus | undefined>(wo?.status);
  const [tab, setTab] = useState(0);
  const [signOffOpen, setSignOffOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!wo) {
    return (
      <Box>
        <PageHeader title="Work Order Detail" breadcrumbs={[{ label: 'Work Orders', to: '/bm/work-orders' }, { label: 'Not Found' }]} />
        <EmptyState title="Failed to load work order details. Please go back and try again." />
      </Box>
    );
  }

  const isVerified = status === 'Verified';
  const completedItems = wo.checklist.filter((c) => c.completed).length;

  const handleReject = () => {
    if (!reason.trim()) {
      setReasonError('Rejection reason is required.');
      return;
    }
    setStatus('Verification Rejected');
    show('Work order returned to Supervisor for review.');
    setRejectOpen(false);
    setReason('');
    setReasonError('');
  };

  return (
    <Box>
      <PageHeader
        title={`${wo.assetCode} — ${wo.type}`}
        breadcrumbs={[{ label: 'Work Orders', to: '/bm/work-orders' }, { label: wo.id }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => show('Report download started.')} sx={{ borderRadius: 8 }}>
              Print Report
            </Button>
            {isVerified && (
              <>
                <Button variant="contained" onClick={() => setSignOffOpen(true)} sx={{ borderRadius: 8 }}>
                  Sign Off & Close
                </Button>
                <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)} sx={{ borderRadius: 8 }}>
                  Reject
                </Button>
              </>
            )}
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Chip label={wo.type} variant="outlined" sx={{ borderRadius: 8 }} />
        {status && <StatusChip status={status} />}
        <Typography variant="body2" color="text.secondary">
          {wo.id} · Created {wo.createdDate}
        </Typography>
      </Stack>

      <SectionCard title="Progress">
        <Stepper activeStep={stageIndex(status ?? wo.status)} alternativeLabel>
          {STAGES.map((s) => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </SectionCard>

      <SectionCard title="Overview">
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField label="Start Time" value={wo.startTime} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField
              label="End Time"
              value={<Typography component="span" variant="body2" color={wo.overdue ? 'error.main' : 'text.primary'}>{wo.endTime}{wo.overdue ? ' (overdue)' : ''}</Typography>}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Time Required" value={wo.timeRequired} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Building" value={buildingName(wo.buildingId)} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Floor" value={wo.floor} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Area" value={wo.area} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Asset Code" value={wo.assetCode} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Asset Type" value={wo.assetType} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Sub-system" value={wo.subSystem} /></Grid>
          <Grid size={{ xs: 6, sm: 3 }}><DetailField label="Asset System" value={wo.assetSystem} /></Grid>
        </Grid>
      </SectionCard>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Details" />
        <Tab label="Execution" />
      </Tabs>

      {tab === 0 && (
        <SectionCard title="Details">
          <DetailField label="Description" value={wo.description} />
          <DetailField label="Remark" value={wo.remark || '—'} />
          <DetailField label="Photos" value={`${wo.photos} attached`} />
        </SectionCard>
      )}

      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard title="Technicians">
              {wo.mainTechnician ? (
                <HoverCard sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Main Technician</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{wo.mainTechnician.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{wo.mainTechnician.email} · {wo.mainTechnician.phone} · {wo.mainTechnician.level}</Typography>
                </HoverCard>
              ) : (
                <Typography variant="body2" color="text.secondary">No technician assigned yet.</Typography>
              )}
              {wo.subTechnicians.map((t) => (
                <HoverCard key={t.email} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Sub Technician</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.email} · {t.phone} · {t.level}</Typography>
                </HoverCard>
              ))}
            </SectionCard>

            <SectionCard title={`Work Checklist (${completedItems} of ${wo.checklist.length} completed)`}>
              {wo.checklist.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No checklist items.</Typography>
              ) : (
                wo.checklist.map((item, i) => (
                  <Accordion key={i} disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {item.completed ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" color="disabled" />}
                        <Typography variant="body2">{item.description}</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="caption" color="text.secondary">
                        {item.completed ? 'Completed' : 'Not completed'} · {item.photos} photo(s) uploaded
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </SectionCard>

            <SectionCard title="Part Replacement">
              {wo.parts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No parts replaced.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Spare Part</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell align="right">Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wo.parts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.source}</TableCell>
                        <TableCell>{p.sparePartName}</TableCell>
                        <TableCell>{p.code}</TableCell>
                        <TableCell align="right">{p.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {wo.planRef && (
              <SectionCard title="Maintenance Plan Reference">
                <DetailField label="Round" value={wo.planRef.round} />
                <DetailField
                  label="Plan"
                  value={
                    <Link component={RouterLink} to={`/bm/maintenance-plans/${wo.planRef.planId}`} underline="hover">
                      {wo.planRef.planName} ({wo.planRef.planId})
                    </Link>
                  }
                />
                <DetailField label="Frequency" value={wo.planRef.frequency} />
              </SectionCard>
            )}
            <SectionCard title="History Log">
              <HistoryLog entries={wo.history} />
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* Sign Off & Close (3.4.3) */}
      <ConfirmDialog
        open={signOffOpen}
        title="Sign Off & Close Work Order"
        description={`Sign off and close Work Order ${wo.id}? This action cannot be undone.`}
        confirmLabel="Sign Off & Close"
        onConfirm={() => {
          setStatus('Closed');
          show('Work order closed successfully.');
          setSignOffOpen(false);
        }}
        onClose={() => setSignOffOpen(false)}
      />

      {/* Reject Completed WO (3.4.4) */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Work Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            required
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!!reasonError}
            helperText={reasonError}
            inputProps={{ maxLength: 500 }}
            sx={{ mt: 1 }}
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
      {node}
    </Box>
  );
}
