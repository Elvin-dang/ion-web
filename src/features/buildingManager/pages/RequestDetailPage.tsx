/**
 * 3.3.2 Request Detail + 3.3.3 Approve + 3.3.4 Decline/Reject + 3.3.5 Accept +
 * 3.3.6 Assign to Supervisor (Building Manager). Status-driven action buttons.
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { SectionCard, DetailField, HistoryLog, useToast } from '../components/shared';
import { serviceRequests, buildings, staffAccounts } from '../data/mockData';
import type { RequestStatus } from '../data/types';

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

export default function RequestDetailPage() {
  const { id } = useParams();
  const { show, node } = useToast();
  const request = serviceRequests.find((r) => r.id === id);

  const [status, setStatus] = useState<RequestStatus | undefined>(request?.status);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [supervisor, setSupervisor] = useState('');
  const [supervisorError, setSupervisorError] = useState('');

  if (!request) {
    return (
      <Box>
        <PageHeader title="Request Detail" breadcrumbs={[{ label: 'Requests', to: '/bm/requests' }, { label: 'Not Found' }]} />
        <EmptyState title="Request not found." description="It may have been removed or the link is invalid." />
      </Box>
    );
  }

  const activeSupervisors = staffAccounts.filter((s) => s.role === 'MSP Supervisor' && s.status === 'Active');

  const isTenant = request.type === 'Tenant Request' && status === 'Tenant Request';
  const isAdhoc = status === 'Pending';
  const isAccepted = status === 'Service Request Accepted';
  const isTerminal = status === 'Cancelled' || status === 'Approval Rejected' || status === 'Ad-hoc Declined' || status === 'Closed';

  const handleDeclineConfirm = () => {
    if (!reason.trim()) {
      setReasonError(isAdhoc ? 'Rejection reason is required.' : 'Decline reason is required.');
      return;
    }
    setStatus(isAdhoc ? 'Approval Rejected' : 'Cancelled');
    show(isAdhoc ? 'Work order request rejected.' : 'Service request declined.');
    setDeclineOpen(false);
    setReason('');
    setReasonError('');
  };

  const handleAssign = () => {
    if (!supervisor) {
      setSupervisorError('Please select an MSP Supervisor.');
      return;
    }
    show(`Request assigned to ${supervisor}.`);
    setAssignOpen(false);
    setSupervisorError('');
  };

  return (
    <Box>
      <PageHeader
        title={request.id}
        breadcrumbs={[{ label: 'Requests', to: '/bm/requests' }, { label: request.id }]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isTenant && (
              <>
                <Button variant="contained" onClick={() => setAcceptOpen(true)} sx={{ borderRadius: 8 }}>
                  Accept
                </Button>
                <Button variant="outlined" color="error" onClick={() => setDeclineOpen(true)} sx={{ borderRadius: 8 }}>
                  Decline
                </Button>
              </>
            )}
            {isAdhoc && (
              <>
                <Button variant="contained" onClick={() => setApproveOpen(true)} sx={{ borderRadius: 8 }}>
                  Approve
                </Button>
                <Button variant="outlined" color="error" onClick={() => setDeclineOpen(true)} sx={{ borderRadius: 8 }}>
                  Reject
                </Button>
              </>
            )}
            {isAccepted && (
              <Button variant="contained" onClick={() => setAssignOpen(true)} sx={{ borderRadius: 8 }}>
                Assign to Supervisor
              </Button>
            )}
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Chip label={request.type} variant="outlined" sx={{ borderRadius: 8 }} />
        {status && <StatusChip status={status} />}
        <Typography variant="body2" color="text.secondary">
          Created {request.createdDate}
        </Typography>
      </Stack>

      {isAccepted && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pending MSP Supervisor review.
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Location & Asset">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Building" value={buildingName(request.buildingId)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Floor" value={request.floor} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Area / Unit" value={request.area} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset System" value={request.assetSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Type" value={request.assetType} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset" value={request.assetCode} /></Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Description">
            <Typography variant="body2" sx={{ mb: 2 }}>
              {request.description}
            </Typography>
            <DetailField label="Submitted By" value={request.submittedBy} />
            {request.attachments.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {request.attachments.map((a) => (
                  <Chip key={a.name} icon={<AttachFileIcon />} label={a.name} variant="outlined" sx={{ borderRadius: 8 }} />
                ))}
              </Stack>
            )}
          </SectionCard>

          {request.tenantName && (
            <SectionCard title="Tenant Contact">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Name" value={request.tenantName} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Phone" value={request.tenantPhone} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Email" value={request.tenantEmail} /></Grid>
              </Grid>
            </SectionCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="History Log">
            <HistoryLog entries={request.history} />
          </SectionCard>
          {isTerminal && (
            <Typography variant="caption" color="text.secondary">
              This request is in a terminal state. No further actions are available.
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Accept (3.3.5) */}
      <ConfirmDialog
        open={acceptOpen}
        title="Accept Service Request"
        description="Accept this service request? It will be forwarded to the MSP Supervisor for review before your final approval."
        confirmLabel="Accept"
        onConfirm={() => {
          setStatus('Service Request Accepted');
          show('Service request accepted.');
          setAcceptOpen(false);
        }}
        onClose={() => setAcceptOpen(false)}
      />

      {/* Approve (3.3.3) */}
      <ConfirmDialog
        open={approveOpen}
        title="Approve Work Order Request"
        description="Approve this work order? It will be available for the MSP Supervisor to assign to a Technician."
        confirmLabel="Approve"
        onConfirm={() => {
          show('Work order approved successfully.');
          setApproveOpen(false);
        }}
        onClose={() => setApproveOpen(false)}
      />

      {/* Decline / Reject (3.3.4) */}
      <Dialog open={declineOpen} onClose={() => setDeclineOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isAdhoc ? 'Reject Work Order Request' : 'Decline Service Request'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label={isAdhoc ? 'Rejection Reason' : 'Decline Reason'}
            required
            placeholder="Enter reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!!reasonError}
            helperText={reasonError}
            inputProps={{ maxLength: 500 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeclineOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeclineConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign to Supervisor (3.3.6) */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign to MSP Supervisor</DialogTitle>
        <DialogContent>
          {activeSupervisors.length === 0 ? (
            <Typography variant="body2" color="error">
              No active MSP Supervisors available for your buildings. Please create or activate a Supervisor account first.
            </Typography>
          ) : (
            <TextField
              select
              fullWidth
              label="MSP Supervisor"
              required
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              error={!!supervisorError}
              helperText={supervisorError}
              sx={{ mt: 1 }}
            >
              {activeSupervisors.map((s) => (
                <MenuItem key={s.id} value={s.fullName}>
                  {s.fullName} — {s.userGroup}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setAssignOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={activeSupervisors.length === 0}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}
