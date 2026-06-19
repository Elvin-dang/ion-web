/**
 * SparePartDetailView — the cross-role standard Spare Part Detail layout.
 *
 * This is a pure presentational component driven by a typed view-model. It
 * contains NO role logic: roles map their own data into `SparePartDetailVM`
 * and pass role-appropriate actions/pencils.
 *
 *  (1) Header        — bold name, creation timestamp, Status badge + optional
 *                      header actions slot (e.g. Set Active/Inactive).
 *  (2) Left panel    — General / Stock / Supporting info sections. Each shows
 *                      an edit pencil ONLY when its `onEdit*` callback is given.
 *  (3) Right panel   — Total / Available / On-Hold counters + history log.
 */
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import StatusChip from './StatusChip';
import { formatDateTime } from '../utils/date';

/** A label/value pair rendered in a section grid. */
export interface DetailFieldVM {
  label: string;
  value?: string | number;
}

/** A single thumbnail entry (photo / document). */
export interface ThumbnailVM {
  label: string;
}

/** A history-log entry, normalised across roles. */
export interface HistoryEntryVM {
  id: string;
  /** Stock In / Stock Out / Reserved / Released, etc. */
  action: string;
  quantity?: number;
  /** Running balance after the entry, when available. */
  balance?: number;
  /** ISO timestamp (or any dayjs-parsable value). */
  timestamp?: string;
  reference?: string;
}

export interface SparePartDetailVM {
  name: string;
  /** ISO creation timestamp. */
  createdAt?: string;
  status: string;
  totalStock: number;
  available: number;
  onHold: number;
  general: DetailFieldVM[];
  stock: DetailFieldVM[];
  /** Free-text specification shown above the thumbnail rows. */
  specification?: string;
  photos: ThumbnailVM[];
  documents: ThumbnailVM[];
  history: HistoryEntryVM[];
}

interface SparePartDetailViewProps {
  vm: SparePartDetailVM;
  /** Header-level actions (e.g. Set Active/Inactive, Reserve). Role-supplied. */
  headerActions?: ReactNode;
  /** Render an edit pencil on the General Info section. */
  onEditGeneral?: () => void;
  /** Render an edit pencil on the Stock Info section. */
  onEditStock?: () => void;
  /** Render an edit pencil on the Supporting Info section. */
  onEditSupporting?: () => void;
  /** History "View more" handler. Omit to hide the link. */
  onViewMoreHistory?: () => void;
}

const CARD_SX = {
  borderRadius: '16px',
  p: { xs: 2, sm: 2.5 },
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': { boxShadow: 6 },
} as const;

function Field({ label, value }: DetailFieldVM) {
  return (
    <Grid size={{ xs: 6, sm: 4 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={600}>{value ?? '—'}</Typography>
    </Grid>
  );
}

function SectionHeader({ title, onEdit }: { title: string; onEdit?: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {onEdit && (
        <IconButton size="small" onClick={onEdit} aria-label={`Edit ${title}`}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

function Thumbnails({ items, empty }: { items: ThumbnailVM[]; empty: string }) {
  if (items.length === 0) {
    return <Typography variant="body2" color="text.secondary">{empty}</Typography>;
  }
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((t, i) => (
        <Paper
          key={i}
          variant="outlined"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.5,
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption" color="text.secondary" noWrap>{t.label}</Typography>
        </Paper>
      ))}
    </Stack>
  );
}

export default function SparePartDetailView({
  vm,
  headerActions,
  onEditGeneral,
  onEditStock,
  onEditSupporting,
  onViewMoreHistory,
}: SparePartDetailViewProps) {
  const theme = useTheme();

  return (
    <Box>
      {/* (1) Header */}
      <Paper elevation={2} sx={CARD_SX}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            <Typography variant="h5" fontWeight={800}>{vm.name}</Typography>
            {vm.createdAt && (
              <Typography variant="caption" color="text.secondary">
                Created {formatDateTime(vm.createdAt)}
              </Typography>
            )}
          </Box>
          <StatusChip status={vm.status} />
          {headerActions}
        </Box>
      </Paper>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        {/* (2) Left panel */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            <Paper elevation={2} sx={CARD_SX}>
              <SectionHeader title="General Info" onEdit={onEditGeneral} />
              <Grid container spacing={2}>
                {vm.general.map((f) => <Field key={f.label} {...f} />)}
              </Grid>
            </Paper>

            <Paper elevation={2} sx={CARD_SX}>
              <SectionHeader title="Stock Info" onEdit={onEditStock} />
              <Grid container spacing={2}>
                {vm.stock.map((f) => <Field key={f.label} {...f} />)}
              </Grid>
            </Paper>

            <Paper elevation={2} sx={CARD_SX}>
              <SectionHeader title="Supporting Info" onEdit={onEditSupporting} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Specification</Typography>
                  <Typography variant="body2">{vm.specification || 'No specification.'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Photos</Typography>
                  <Thumbnails items={vm.photos} empty="No photos uploaded" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Relevant Document</Typography>
                  <Thumbnails items={vm.documents} empty="No document uploaded" />
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* (3) Right panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={2} sx={CARD_SX}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {([
                ['Total Stock', vm.totalStock, theme.palette.text.primary],
                ['Available', vm.available, theme.palette.success.main],
                ['On-Hold', vm.onHold, theme.palette.warning.main],
              ] as const).map(([k, v, color]) => (
                <Grid key={k} size={{ xs: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '16px', textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800} sx={{ color }}>{v}</Typography>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>History log</Typography>
            {vm.history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No transaction history yet.</Typography>
            ) : (
              <Box>
                {vm.history.map((h, i) => (
                  <Box key={h.id} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                      {i < vm.history.length - 1 && (
                        <Box sx={{ flex: 1, width: 2, bgcolor: alpha(theme.palette.text.primary, 0.12), minHeight: 28 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: 2, flex: 1, minWidth: 0 }}>
                      {h.timestamp && (
                        <Typography variant="caption" color="text.secondary">{formatDateTime(h.timestamp)}</Typography>
                      )}
                      <Typography variant="body2" fontWeight={600}>
                        {h.action}{h.quantity != null ? ` · ${h.quantity}` : ''}
                        {h.balance != null ? ` · Balance ${h.balance}` : ''}
                      </Typography>
                      {h.reference && (
                        <Typography variant="caption" color="text.secondary">{h.reference}</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                {onViewMoreHistory && (
                  <Button size="small" onClick={onViewMoreHistory}>View more</Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
