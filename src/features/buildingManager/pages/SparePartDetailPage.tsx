/**
 * 3.6.2 Spare Part Detail + 3.6.4 Edit (per-section) + 3.6.10 Reserve (On-Hold)
 * + 3.6.11 Release On-Hold + 3.6.12 Handle Unavailable + 3.6.13 Usage per WO.
 */
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import SparePartDetailView, { type SparePartDetailVM } from '../../../components/SparePartDetailView';
import { SectionCard, useToast } from '../components/shared';
import { spareParts, stockOutTxns } from '../data/mockData';

export default function SparePartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, node } = useToast();
  const part = spareParts.find((s) => s.id === id);

  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveWo, setReserveWo] = useState('');

  const vm = useMemo<SparePartDetailVM | null>(() => {
    if (!part) return null;
    return {
      name: part.name,
      createdAt: part.history[0]?.timestamp,
      status: part.status,
      totalStock: part.totalStock,
      available: part.available,
      onHold: part.onHold,
      general: [
        { label: 'Spare Part Code', value: part.code },
        { label: 'Location', value: part.storeRoom },
        { label: 'Asset Type', value: part.assetType },
        { label: 'Sub-system', value: part.subSystem },
        { label: 'Asset System', value: part.assetSystem },
        { label: 'Brand', value: part.brand },
        { label: 'Model', value: part.model },
        { label: 'Serial Number', value: part.serialNumber },
      ],
      stock: [
        { label: 'Quantity', value: part.quantity },
        { label: 'Department', value: part.department },
        { label: 'Store Room', value: part.storeRoom },
        { label: 'Origin', value: part.origin },
        { label: 'Purchase Date', value: part.purchaseDate },
        { label: 'Year of Manufacture', value: part.yearOfManufacture },
        { label: 'Usage Date', value: part.usageDate },
        { label: 'Warranty Expiry Date', value: part.warrantyExpiry },
      ],
      specification: part.specification,
      photos: [],
      documents: [],
      history: part.history.map((h, i) => ({
        id: `${i}`,
        action: h.label,
        timestamp: h.timestamp,
      })),
    };
  }, [part]);

  if (!part || !vm) {
    return (
      <Box>
        <PageHeader title="Spare Part Detail" breadcrumbs={[{ label: 'Spare Parts', to: '/bm/spare-parts' }, { label: 'Not Found' }]} />
        <EmptyState title="Failed to load spare part details. Please go back and try again." />
      </Box>
    );
  }

  const usage = stockOutTxns.filter((t) => t.sparePartCode === part.code);
  const unavailable = part.available <= 0;

  return (
    <Box>
      <PageHeader
        title={part.name}
        breadcrumbs={[{ label: 'Spare Parts', to: '/bm/spare-parts' }, { label: part.code }]}
      />

      {unavailable && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <StatusChip status="overdue" label="Unavailable" />
        </Stack>
      )}

      <SparePartDetailView
        vm={vm}
        headerActions={
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
        onEditGeneral={() => show('General info updated successfully.')}
        onEditStock={() => show('Stock info updated successfully.')}
        onEditSupporting={() => show('Supporting info updated successfully.')}
      />

      <Box sx={{ mt: 2.5 }}>
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
      </Box>

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
