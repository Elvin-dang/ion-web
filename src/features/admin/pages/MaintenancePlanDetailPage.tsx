/**
 * 1.7.2 Maintenance Plan Detail (+ 1.7.5 Set Inactive, 1.7.6 Cancel, 1.7.7
 * auto-generated WO context, 1.7.8 history tabs). Header with status-dependent
 * action buttons; Details section; tabs Round / Assets / Work Orders; history
 * log side panel.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../../../components/EmptyState';
import AdminStatusChip from '../components/AdminStatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../components/AdminToast';
import { formatDate, formatDateTime } from '../../../utils/date';
import { assets, maintenancePlans, systemName, subsystemName, typeName, buildingName, assetName, assetCode, floorName, areaName } from '../data/mockData';
import type { PlanStatus } from '../data/types';

export default function MaintenancePlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const plan = maintenancePlans.find((p) => p.id === id);
  const [status, setStatus] = useState<PlanStatus>(plan?.status ?? 'Active');
  const [tab, setTab] = useState(0);
  const [confirm, setConfirm] = useState<'inactive' | 'cancel' | null>(null);

  if (!plan) {
    return <Box><PageHeader title="Maintenance Plan" /><EmptyState title="Not found" description="Failed to load plan details. Please go back and try again." action={<Button onClick={() => navigate('/admin/maintenance-plans')}>Back</Button>} /></Box>;
  }

  return (
    <Box>
      <PageHeader title={plan.name} breadcrumbs={[{ label: 'Maintenance Plans', to: '/admin/maintenance-plans' }, { label: plan.name }]} />
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/maintenance-plans')} sx={{ mb: 2 }}>Back to Plans</Button>

      <SectionCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{plan.name}</Typography>
            <Typography variant="body2" color="text.secondary">{plan.id} · Created {formatDateTime(plan.createdAt)} by {plan.createdBy}</Typography>
            <Box sx={{ mt: 1 }}><AdminStatusChip status={status} /></Box>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => toast('Report sent to printer (demo).')}>Print Report</Button>
            {/* SA plans are Active immediately — no Approve/Reject. SA actions: Set Inactive / Set Cancelled. */}
            {status === 'Active' && <>
              <Button variant="outlined" onClick={() => setConfirm('inactive')}>Set Inactive</Button>
              <Button color="error" onClick={() => setConfirm('cancel')}>Set Cancelled</Button>
            </>}
            {status === 'Inactive' && <>
              <Button variant="contained" onClick={() => { setStatus('Active'); toast('Maintenance plan reactivated.'); }}>Set Active</Button>
              <Button color="error" onClick={() => setConfirm('cancel')}>Set Cancelled</Button>
            </>}
          </Stack>
        </Box>
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Details" action={status !== 'Cancelled' && <IconButton size="small" onClick={() => navigate(`/admin/maintenance-plans/${plan.id}/edit`)}><EditIcon fontSize="small" /></IconButton>}>
            <Grid container spacing={2}>
              {[['Asset Type', typeName(plan.typeId)], ['Sub-system', subsystemName(plan.subsystemId)], ['System', systemName(plan.systemId)], ['Frequency', plan.frequency], ['Time Required', plan.timeRequired], ['Building', buildingName(plan.buildingId)], ['Description', plan.description || '—'], ['Remark', plan.remark || '—']].map(([k, v]) => (
                <Grid key={k} size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={600}>{v}</Typography></Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Photos</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {[0, 1].map((i) => (
                    <Box key={i} sx={{ width: 72, height: 72, borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhotoCameraIcon color="disabled" />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          <Box sx={{ mt: 2.5 }}>
            <SectionCard noPad>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
                <Tab label="Round" /><Tab label="Assets" /><Tab label="Work Orders" />
              </Tabs>
              <Box sx={{ p: 2.5 }}>
                {tab === 0 && (plan.rounds.length === 0 ? <Typography color="text.secondary">No rounds yet. The plan will generate rounds once Active.</Typography> : (
                  <Table size="small">
                    <TableHead><TableRow>{['Round No', 'Start Date', 'End Date', 'Status', 'Completion Rate'].map((h) => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
                    <TableBody>{plan.rounds.map((r) => (<TableRow key={r.roundNo} hover><TableCell>{r.roundNo}</TableCell><TableCell>{formatDate(r.startDate)}</TableCell><TableCell>{formatDate(r.endDate)}</TableCell><TableCell><AdminStatusChip status={r.status} /></TableCell><TableCell>{r.completionRate}%</TableCell></TableRow>))}</TableBody>
                  </Table>
                ))}
                {tab === 1 && (
                  <Box>
                    <Button size="small" startIcon={<EditIcon />} sx={{ mb: 1.5 }} onClick={() => toast('Add asset to plan (demo).')}>Add Asset</Button>
                    {plan.assetIds.length === 0 ? <Typography color="text.secondary">No assets added. Click Add Asset to start.</Typography> : (
                      <Table size="small">
                        <TableHead><TableRow>{['Asset Code', 'Asset Name', 'Location', 'Main Technician'].map((h) => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
                        <TableBody>{plan.assetIds.map((aid) => {
                          const a = assets.find((x) => x.id === aid);
                          const loc = a
                            ? [buildingName(a.buildingId), floorName(a.buildingId, a.floorId), areaName(a.buildingId, a.floorId, a.areaId)].filter((s) => s && s !== '—').join(' / ') || '—'
                            : '—';
                          return (<TableRow key={aid} hover><TableCell>{assetCode(aid)}</TableCell><TableCell><Link component="button" underline="hover" onClick={() => navigate(`/admin/assets/${aid}`)}>{assetName(aid)}</Link></TableCell><TableCell>{loc}</TableCell><TableCell>{plan.workOrders.find((w) => w.assetId === aid)?.technician ?? 'Unassigned'}</TableCell></TableRow>);
                        })}</TableBody>
                      </Table>
                    )}
                  </Box>
                )}
                {tab === 2 && (plan.workOrders.length === 0 ? <Typography color="text.secondary">No work orders generated yet. WOs will be created automatically once the plan is Active.</Typography> : (
                  <Table size="small">
                    <TableHead><TableRow>{['WO ID', 'Asset', 'Round', 'Technician', 'Status', 'Completion Date'].map((h) => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
                    <TableBody>{plan.workOrders.map((w) => (<TableRow key={w.id} hover><TableCell>{w.id}</TableCell><TableCell>{assetName(w.assetId)}</TableCell><TableCell>{w.round}</TableCell><TableCell>{w.technician}</TableCell><TableCell><AdminStatusChip status={w.status} /></TableCell><TableCell>{formatDate(w.completionDate)}</TableCell></TableRow>))}</TableBody>
                  </Table>
                ))}
              </Box>
            </SectionCard>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="History">
            <Stack spacing={1.5}>
              {plan.history.map((h, i) => (
                <Box key={i}>
                  <Typography variant="body2" fontWeight={600}>{h.event}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDateTime(h.date)} · {h.actor}</Typography>
                </Box>
              ))}
              {plan.history.length === 0 && <Typography variant="body2" color="text.secondary">No history yet.</Typography>}
            </Stack>
            {plan.history.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Link component="button" underline="hover" onClick={() => toast('Showing full history (demo).')}>View more</Link>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

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
