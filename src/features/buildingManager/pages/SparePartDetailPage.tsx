/**
 * 3.6.2 Spare Part Detail + 3.6.4 Edit (per-section) + 3.6.10 Reserve (On-Hold)
 * + 3.6.11 Release On-Hold + 3.6.12 Handle Unavailable + 3.6.13 Usage per WO.
 */
import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { SectionCard, DetailField, HistoryLog, KpiCard, useToast } from '../components/shared';
import { brandTokens } from '../../../theme/theme';
import { spareParts, stockOutTxns } from '../data/mockData';
import { formatDateTime } from '../../../utils/date';

export default function SparePartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, node } = useToast();
  const part = spareParts.find((s) => s.id === id);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveWo, setReserveWo] = useState('');

  if (!part) {
    return (
      <Box>
        <PageHeader title="Spare Part Detail" breadcrumbs={[{ label: 'Spare Parts', to: '/bm/spare-parts' }, { label: 'Not Found' }]} />
        <EmptyState title="Failed to load spare part details. Please go back and try again." />
      </Box>
    );
  }

  const usage = stockOutTxns.filter((t) => t.sparePartCode === part.code);
  const unavailable = part.available <= 0;
  const lastUpdated = part.history[part.history.length - 1]?.timestamp;

  return (
    <Box>
      <PageHeader
        title={part.name}
        breadcrumbs={[{ label: 'Spare Parts', to: '/bm/spare-parts' }, { label: part.code }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => setReserveOpen(true)} disabled={part.available <= 0} sx={{ borderRadius: 8 }}>
              Reserve (On-Hold)
            </Button>
            <Button variant="outlined" onClick={() => show('On-hold reservation released. Stock returned to available.')} disabled={part.onHold <= 0} sx={{ borderRadius: 8 }}>
              Release On-Hold
            </Button>
            <Button variant="outlined" color={part.status === 'Active' ? 'error' : 'success'} onClick={() => navigate('/bm/spare-parts')} sx={{ borderRadius: 8 }}>
              {part.status === 'Active' ? 'Set Inactive' : 'Set Active'}
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <StatusChip status={part.status} />
        <Typography variant="body2" color="text.secondary">Code: {part.code}</Typography>
        {lastUpdated && (
          <Typography variant="body2" color="text.secondary">Last updated {formatDateTime(lastUpdated)}</Typography>
        )}
        {unavailable && <StatusChip status="overdue" label="Unavailable" />}
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 4 }}><KpiCard label="Total Stock" value={part.totalStock} color={brandTokens.status.open} icon={<Inventory2Icon />} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><KpiCard label="Available" value={part.available} color={brandTokens.status.completed} icon={<CheckCircleOutlineIcon />} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><KpiCard label="On-Hold" value={part.onHold} color={brandTokens.status.scheduled} icon={<PauseCircleOutlineIcon />} /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="General Info" action={<IconButton size="small" onClick={() => show('General info updated successfully.')}><EditIcon fontSize="small" /></IconButton>}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Spare Part Code" value={part.code} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Type" value={part.assetType} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Sub-system" value={part.subSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset System" value={part.assetSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Brand" value={part.brand} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Model" value={part.model} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Serial Number" value={part.serialNumber} /></Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Stock Info" action={<IconButton size="small" onClick={() => show('Stock info updated successfully.')}><EditIcon fontSize="small" /></IconButton>}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Quantity" value={part.quantity} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Department" value={part.department} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Store Room" value={part.storeRoom} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Origin" value={part.origin} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Purchase Date" value={part.purchaseDate} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Year of Manufacture" value={part.yearOfManufacture} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Usage Date" value={part.usageDate} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Warranty Expiry" value={part.warrantyExpiry} /></Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Supporting Info" action={<IconButton size="small" onClick={() => show('Supporting info updated successfully.')}><EditIcon fontSize="small" /></IconButton>}>
            <DetailField label="Specification" value={part.specification} />
            <Typography variant="caption" color="text.secondary">Photos & relevant documents attached.</Typography>
          </SectionCard>

          <SectionCard title="Usage per Work Order">
            {usage.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No usage records yet.</Typography>
            ) : (
              <Table size="small">
                <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Quantity</TableCell><TableCell>Work Order</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                <TableBody>
                  {usage.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.date}</TableCell>
                      <TableCell>{u.quantity}</TableCell>
                      <TableCell>{u.woId ? <Link component={RouterLink} to={`/bm/work-orders/${u.woId}`} underline="hover">{u.woId}</Link> : '—'}</TableCell>
                      <TableCell>{u.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="History Log">
            <HistoryLog entries={part.history} />
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={reserveOpen} onClose={() => setReserveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reserve Spare Part (On-Hold)</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="number" label="Quantity" value={reserveQty} onChange={(e) => setReserveQty(Number(e.target.value))} sx={{ mt: 1, mb: 2 }} inputProps={{ min: 1, max: part.available }} />
          <TextField fullWidth label="Work Order ID" value={reserveWo} onChange={(e) => setReserveWo(e.target.value)} placeholder="WO-5003" />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setReserveOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { show(`Reserved ${reserveQty} unit(s) on hold${reserveWo ? ` for ${reserveWo}` : ''}.`); setReserveOpen(false); }}>Reserve</Button>
        </DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}
