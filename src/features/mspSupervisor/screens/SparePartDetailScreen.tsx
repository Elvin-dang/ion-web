/**
 * 5.4.5 View Spare Part Detail (MSP Supervisor — Read-only). General/stock/
 * supporting info, stock counters (Total / Available / On-Hold) and a history
 * log. No edit controls.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import InfoField from '../components/InfoField';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { brandTokens } from '../../../theme/theme';
import { formatDate, formatDateTime } from '../../../utils/date';
import { spareParts } from '../data/mockData';

function StockCounter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: alpha(color, 0.1) }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default function SparePartDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = useMemo(() => spareParts.find((p) => p.id === id), [id]);

  if (!part) {
    return (
      <Box>
        <PageHeader title="Spare Part" breadcrumbs={[{ label: 'Inventory', to: '/msp/inventory' }, { label: 'Not found' }]} />
        <EmptyState title="Spare part not found" description="Failed to load spare part details. Please go back and try again." action={<Button variant="contained" onClick={() => navigate('/msp/inventory')}>Back to list</Button>} />
      </Box>
    );
  }

  // Task 26 — creation timestamp: earliest history entry, else purchase date.
  const createdLabel = part.history.length
    ? formatDateTime(part.history[part.history.length - 1].timestamp)
    : formatDate(part.purchaseDate);

  return (
    <Box>
      <PageHeader
        title={part.name}
        subtitle={`${part.code} · ${part.assetSystem} · Created ${createdLabel}`}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Inventory', to: '/msp/inventory' }, { label: part.code }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => navigate('/msp/inventory')}>
              <ArrowBackIcon />
            </IconButton>
            <StatusChip status={part.status} />
          </Stack>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard title="General Info">
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Spare Part Code" value={part.code} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Location" value={part.location} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Asset Type" value={part.assetType} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Sub-system" value={part.subSystem} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="System" value={part.assetSystem} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Brand" value={part.brand} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Model" value={part.model} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Serial Number" value={part.serialNumber} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Stock Info">
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Quantity" value={part.totalStock} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Department" value={part.department} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Store Room" value={part.storeRoom} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Origin" value={part.origin} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Purchase Date" value={formatDate(part.purchaseDate)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Year of Manufacture" value={part.yearOfManufacture} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Usage Date" value={formatDate(part.usageDate)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Warranty Expiry" value={formatDate(part.warrantyExpiry)} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Supporting Info">
              <InfoField label="Specification" value={part.specification} />
              <InfoField label="Photos" value={`${part.photos} photo(s)`} />
              <InfoField label="Documents" value={`${part.documents} document(s)`} />
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Stock Levels">
              <Stack direction="row" spacing={1.5}>
                <StockCounter label="Total" value={part.totalStock} color={brandTokens.brand.primary.main} />
                <StockCounter label="Available" value={part.available} color={brandTokens.status.completed} />
                <StockCounter label="On-Hold" value={part.onHold} color={brandTokens.status.scheduled} />
              </Stack>
            </SectionCard>

            <SectionCard title="History Log">
              {part.history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transaction history yet.
                </Typography>
              ) : (
                <>
                  <Stack spacing={0}>
                    {part.history.map((h, i) => {
                      const last = i === part.history.length - 1;
                      return (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="stretch">
                          <Stack alignItems="center" sx={{ width: 16, flexShrink: 0 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                mt: 0.5,
                                borderRadius: '50%',
                                bgcolor: brandTokens.brand.primary.main,
                                flexShrink: 0,
                              }}
                            />
                            {!last && (
                              <Box sx={{ flex: 1, width: '2px', bgcolor: 'divider', my: 0.25 }} />
                            )}
                          </Stack>
                          <Box sx={{ pb: last ? 0 : 2, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {h.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {h.reference} · Qty {h.qty}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(h.timestamp)}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => {}}>
                      View more
                    </Button>
                  </Box>
                </>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
