/**
 * 1.6.6 View Spare Part Detail — left: General / Stock / Supporting info
 * sections (each with edit pencil → edit dialog, 1.6.8). Right: stock counters
 * (Total / Available / On-Hold), Set Active/Inactive toggle and a history
 * timeline. Layout matches the cross-role standard Spare Part Detail.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../../../components/EmptyState';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { spareParts, systemName, subsystemName, typeName } from '../data/mockData';
import { formatDate, formatDateTime } from '../../../utils/date';

function Field({ k, v }: { k: string; v?: string | number }) {
  return (<Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">{k}</Typography><Typography fontWeight={600}>{v ?? '—'}</Typography></Grid>);
}

const HISTORY_PREVIEW = 5;

export default function SparePartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { toast, node } = useToast();
  const part = spareParts.find((p) => p.id === id);
  const [status, setStatus] = useState(part?.status ?? 'Active');
  const [showAllHistory, setShowAllHistory] = useState(false);

  if (!part) {
    return <Box><PageHeader title="Spare Part" /><EmptyState title="Not found" description="Failed to load spare part details. Please go back and try again." action={<Button onClick={() => navigate('/admin/inventory')}>Back</Button>} /></Box>;
  }
  const available = part.totalStock - part.onHold;
  const visibleHistory = showAllHistory ? part.history : part.history.slice(0, HISTORY_PREVIEW);

  return (
    <Box>
      <PageHeader title={part.name} breadcrumbs={[{ label: 'Inventory', to: '/admin/inventory' }, { label: part.name }]} />
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/inventory')} sx={{ mb: 2 }}>Back to Inventory</Button>

      {/* Header — Name (bold) + creation timestamp + Status badge + SA toggle */}
      <SectionCard>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            <Typography variant="h5" fontWeight={800}>{part.name}</Typography>
            <Typography variant="caption" color="text.secondary">Created {formatDateTime(part.createdAt)}</Typography>
          </Box>
          <AdminStatusChip status={status} />
          <Button variant="outlined" onClick={() => { const ns = status === 'Active' ? 'Inactive' : 'Active'; setStatus(ns); toast(ns === 'Active' ? 'Spare part activated successfully.' : 'Spare part deactivated successfully.'); }}>
            {status === 'Active' ? 'Set Inactive' : 'Set Active'}
          </Button>
        </Box>
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            <SectionCard title="General Info" action={<IconButton size="small" onClick={() => toast('Edit General Info (demo).')}><EditIcon fontSize="small" /></IconButton>}>
              <Grid container spacing={2}>
                <Field k="ID / Code" v={part.code} /><Field k="Location" v={part.location} /><Field k="Asset Type" v={typeName(part.typeId)} />
                <Field k="Sub-system" v={subsystemName(part.subsystemId)} /><Field k="Asset System" v={systemName(part.systemId)} /><Field k="Brand" v={part.brand} />
                <Field k="Model" v={part.model} /><Field k="Serial Number" v={part.serial} />
              </Grid>
            </SectionCard>
            <SectionCard title="Stock Info" action={<IconButton size="small" onClick={() => toast('Edit Stock Info (demo).')}><EditIcon fontSize="small" /></IconButton>}>
              <Grid container spacing={2}>
                <Field k="Quantity" v={part.totalStock} /><Field k="Department" v={part.department} /><Field k="Store Room" v={part.storeRoom} />
                <Field k="Origin" v={part.origin} /><Field k="Purchase Date" v={formatDate(part.purchaseDate)} /><Field k="Year of Manufacture" v={part.yearOfManufacture} />
                <Field k="Usage Date" v={formatDate(part.history.find((h) => h.action === 'Stock-Out')?.date)} /><Field k="Warranty Expiry Date" v={formatDate(part.warrantyExpiry)} />
              </Grid>
            </SectionCard>
            <SectionCard title="Supporting Info" action={<IconButton size="small" onClick={() => toast('Edit Supporting Info (demo).')}><EditIcon fontSize="small" /></IconButton>}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Specification</Typography>
                  <Typography variant="body2">{part.specification || 'No specification.'}</Typography>
                </Grid>
                <Field k="Photos" v="No photos uploaded" />
                <Field k="Relevant Document" v="No document uploaded" />
              </Grid>
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {([['Total Stock', part.totalStock, theme.palette.text.primary],
                 ['Available', available, theme.palette.success.main],
                 ['On-Hold', part.onHold, theme.palette.warning.main]] as const).map(([k, v, color]) => (
                <Grid key={k} size={{ xs: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color }}>{v}</Typography>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>History log</Typography>
            {part.history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No transaction history yet.</Typography>
            ) : (
              <Box>
                {visibleHistory.map((h, i) => (
                  <Box key={h.id} sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Timeline rail */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      {i < visibleHistory.length - 1 && (
                        <Box sx={{ flex: 1, width: 2, bgcolor: alpha(theme.palette.text.primary, 0.12), minHeight: 28 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: 2, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">{formatDateTime(h.date)}</Typography>
                      <Typography variant="body2" fontWeight={600}>{h.action} · {h.quantity}</Typography>
                      <Typography variant="caption" color="text.secondary">{h.reference} · {h.recordedBy}</Typography>
                    </Box>
                  </Box>
                ))}
                {part.history.length > HISTORY_PREVIEW && (
                  <Button size="small" onClick={() => setShowAllHistory((s) => !s)}>
                    {showAllHistory ? 'View less' : 'View more'}
                  </Button>
                )}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
      {node}
    </Box>
  );
}
