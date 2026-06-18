/**
 * 1.5.13 View Asset Detail (+ 1.7.8 Maintenance History access point). Header
 * with QR + Download QR + Edit + Deactivate; classification / location / detail
 * sections; and three history tables (Maintenance / Related WO / Pending WO).
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../../../components/EmptyState';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { formatDate } from '../../../utils/date';
import { assets, maintenancePlans, systemName, subsystemName, typeName, buildingName, floorName, areaName } from '../data/mockData';
import type { ActiveStatus } from '../data/types';

function HistoryTable({ headers, rows, empty }: { headers: string[]; rows: (string | JSX.Element)[][]; empty: string }) {
  if (rows.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>{empty}</Typography>;
  return (
    <Table size="small">
      <TableHead><TableRow>{headers.map((h) => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>
        {rows.map((r, i) => <TableRow key={i} hover>{r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>)}
      </TableBody>
    </Table>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const asset = assets.find((a) => a.id === id);
  const [status, setStatus] = useState<ActiveStatus>(asset?.status ?? 'Active');

  if (!asset) {
    return <Box><PageHeader title="Asset" /><EmptyState title="Asset not found" description="Failed to load asset details. Please go back and try again." action={<Button onClick={() => navigate('/admin/assets')}>Back to Assets</Button>} /></Box>;
  }

  const wos = maintenancePlans.flatMap((p) => p.workOrders.filter((w) => w.assetId === asset.id).map((w) => ({ ...w, plan: p.name })));
  const maintenance = wos.filter((w) => w.status === 'Closed');
  const pending = wos.filter((w) => w.status !== 'Closed' && w.status !== 'Cancelled');

  return (
    <Box>
      <PageHeader title={asset.name} breadcrumbs={[{ label: 'Assets', to: '/admin/assets' }, { label: asset.name }]} />
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/assets')} sx={{ mb: 2 }}>Back to Asset List</Button>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 140, height: 140, mx: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <QrCode2Icon sx={{ fontSize: 96 }} color="action" />
              </Box>
              <Typography variant="h6" fontWeight={700}>{asset.name}</Typography>
              <Box sx={{ mt: 1 }}><AdminStatusChip status={status} /></Box>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => toast(`${asset.code}_QR.png downloaded.`)}>Download QR</Button>
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/admin/assets/${asset.id}/edit`)}>Edit</Button>
                {status === 'Active'
                  ? <Button size="small" color="error" startIcon={<BlockIcon />} onClick={() => { setStatus('Inactive'); toast('Asset deactivated successfully.'); }}>Deactivate</Button>
                  : <Button size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => { setStatus('Active'); toast('Asset activated successfully.'); }}>Activate</Button>}
              </Stack>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Classification">
              <Grid container spacing={2}>
                {[['Asset System', systemName(asset.systemId)], ['Sub-system', subsystemName(asset.subsystemId)], ['Asset Type', typeName(asset.typeId)]].map(([k, v]) => (
                  <Grid key={k} size={{ xs: 12, sm: 4 }}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={600}>{v}</Typography></Grid>
                ))}
              </Grid>
            </SectionCard>
            <SectionCard title="Location">
              <Grid container spacing={2}>
                {[['Building', buildingName(asset.buildingId)], ['Floor', floorName(asset.buildingId, asset.floorId)], ['Area/Unit', areaName(asset.buildingId, asset.floorId, asset.areaId)]].map(([k, v]) => (
                  <Grid key={k} size={{ xs: 12, sm: 4 }}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={600}>{v}</Typography></Grid>
                ))}
              </Grid>
            </SectionCard>
            <SectionCard title="Asset Details">
              <Grid container spacing={2}>
                {[['Asset Code', asset.code], ['Model', asset.model || '—'], ['Serial Number', asset.serial || '—'], ['Brand', asset.brand || '—'], ['Purchase Date', formatDate(asset.purchaseDate)], ['Manufactured Date', formatDate(asset.manufacturedDate)]].map(([k, v]) => (
                  <Grid key={k} size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={600}>{v}</Typography></Grid>
                ))}
                <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Status</Typography><Box><AdminStatusChip status={status} /></Box></Grid>
              </Grid>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2.5 }}>
        <Stack spacing={2.5}>
          <SectionCard title="Maintenance History">
            <HistoryTable
              headers={['WO ID', 'Plan Name', 'Round', 'Completed Date', 'Technician', 'Status']}
              rows={maintenance.map((w) => [w.id, w.plan, w.round, formatDate(w.completionDate), w.technician, <AdminStatusChip key={w.id} status={w.status} />])}
              empty="No maintenance history."
            />
          </SectionCard>
          <SectionCard title="Related Work Orders">
            <HistoryTable
              headers={['WO ID', 'Type', 'Round', 'Technician', 'Status']}
              rows={wos.map((w) => [w.id, 'Maintenance Scheduling', w.round, w.technician, <AdminStatusChip key={w.id} status={w.status} />])}
              empty="No related work orders."
            />
          </SectionCard>
          <SectionCard title="Pending Work Orders">
            <HistoryTable
              headers={['WO ID', 'Type', 'Assigned To', 'Status']}
              rows={pending.map((w) => [w.id, 'Maintenance Scheduling', w.technician, <AdminStatusChip key={w.id} status={w.status} />])}
              empty="No pending work orders."
            />
          </SectionCard>
        </Stack>
      </Box>
      {node}
    </Box>
  );
}
