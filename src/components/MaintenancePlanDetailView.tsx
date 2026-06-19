/**
 * MaintenancePlanDetailView — the single shared presentational layout for the
 * Maintenance Plan Detail screen, used by all three roles (Super Admin,
 * Building Manager, MSP Supervisor).
 *
 * It renders a fixed standard layout from a typed view-model:
 *   (1) Header — name, id + creation timestamp, status badge, Print Report,
 *       plus a caller-supplied `actions` slot for role-specific buttons.
 *   (2) Details — Asset Type / Sub-system / System / Frequency / Time Required /
 *       Building / Description / Remark / Photos. The Details edit pencil shows
 *       ONLY when the caller passes `onEditDetails`.
 *   (3) Tabs — Round / Assets / Work Orders.
 *   (4) Right panel — History log with a "View more" link.
 *
 * NO role logic lives here: the caller decides which actions / edit pencil to
 * pass, and may inject extra tab content (e.g. the BM asset-search +
 * technician-assignment toolbar) via `assetsTabExtra`.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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
import LinearProgress from '@mui/material/LinearProgress';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StatusChip from './StatusChip';

/** A single label/value pair in the Details section. */
export interface PlanDetailField {
  label: string;
  value: ReactNode;
}

export interface PlanRoundRow {
  roundNo: string | number;
  startDate: string;
  endDate: string;
  status: string;
  /** 0-100 completion percentage. */
  completionRate: number;
}

export interface PlanAssetRow {
  key: string;
  assetCode: ReactNode;
  assetName: ReactNode;
  location: string;
  mainTechnician: string;
}

export interface PlanWorkOrderRow {
  key: string;
  woId: ReactNode;
  asset: string;
  round: string | number;
  technician: string;
  status: string;
  completionDate: string;
}

export interface PlanHistoryRow {
  timestamp: string;
  label: string;
}

/** The normalized view-model each role maps its own plan data into. */
export interface MaintenancePlanDetailViewModel {
  name: string;
  /** Plan ID + creation timestamp line, e.g. "MP-001 · Created 18:00 20/03/2025 by Alex". */
  metaLine: string;
  status: string;
  details: PlanDetailField[];
  /** Number of photo placeholders to render in the Details section. */
  photoCount: number;
  rounds: PlanRoundRow[];
  assets: PlanAssetRow[];
  workOrders: PlanWorkOrderRow[];
  history: PlanHistoryRow[];
  /** Checklist inherited from the plan's Asset Type (optional). */
  checklist?: { key: string; name: string; description: string; photos: string }[];
}

interface MaintenancePlanDetailViewProps {
  vm: MaintenancePlanDetailViewModel;
  /** Role-specific action buttons rendered in the header (alongside Print Report). */
  actions?: ReactNode;
  /** When provided, shows the Details edit pencil wired to this handler. */
  onEditDetails?: () => void;
  /** Print Report click handler. */
  onPrint: () => void;
  /** "View more" history link handler. */
  onViewMoreHistory?: () => void;
  /** Optional banner shown above the content grid (e.g. rejection reason). */
  banner?: ReactNode;
  /** Optional extra content rendered at the top of the Assets tab (e.g. BM search + assign). */
  assetsTabExtra?: ReactNode;
}

/** Soft-shadow card matching the recent '16px' radius convention. */
function Card({ title, action, children, noPad }: { title?: string; action?: ReactNode; children: ReactNode; noPad?: boolean }) {
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: '16px',
        p: noPad ? 0 : { xs: 2, sm: 2.5 },
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': { boxShadow: 6 },
      }}
    >
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, px: noPad ? 2.5 : 0, pt: noPad ? 2.5 : 0 }}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Paper>
  );
}

const HEAD_SX = { fontWeight: 700 } as const;

export default function MaintenancePlanDetailView({
  vm,
  actions,
  onEditDetails,
  onPrint,
  onViewMoreHistory,
  banner,
  assetsTabExtra,
}: MaintenancePlanDetailViewProps) {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      {/* (1) Header */}
      <Card>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{vm.name}</Typography>
            <Typography variant="body2" color="text.secondary">{vm.metaLine}</Typography>
            <Box sx={{ mt: 1 }}><StatusChip status={vm.status} /></Box>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={onPrint}>Print Report</Button>
            {actions}
          </Stack>
        </Box>
      </Card>

      {banner && <Box sx={{ mt: 2.5 }}>{banner}</Box>}

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* (2) Details */}
          <Card
            title="Details"
            action={onEditDetails && <IconButton size="small" onClick={onEditDetails}><EditIcon fontSize="small" /></IconButton>}
          >
            <Grid container spacing={2}>
              {vm.details.map((d) => (
                <Grid key={d.label} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">{d.label}</Typography>
                  <Typography fontWeight={600} component="div">{d.value || '—'}</Typography>
                </Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">Photos</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {Array.from({ length: Math.max(vm.photoCount, 1) }).map((_, i) => (
                    <Box key={i} sx={{ width: 72, height: 72, borderRadius: 2, border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PhotoCameraIcon color="disabled" />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* (3) Tabs: Round / Assets / Work Orders */}
          <Box sx={{ mt: 2.5 }}>
            <Card noPad>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, pt: 1 }} variant="scrollable" scrollButtons="auto">
                <Tab label="Round" /><Tab label="Assets" /><Tab label="Work Orders" /><Tab label="Checklist" />
              </Tabs>
              <Box sx={{ p: 2.5 }}>
                {tab === 0 && (vm.rounds.length === 0 ? (
                  <Typography color="text.secondary">No rounds yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead><TableRow>{['Round No', 'Start Date', 'End Date', 'Status', 'Completion Rate'].map((h) => <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>)}</TableRow></TableHead>
                    <TableBody>
                      {vm.rounds.map((r) => (
                        <TableRow key={r.roundNo} hover>
                          <TableCell>{r.roundNo}</TableCell>
                          <TableCell>{r.startDate}</TableCell>
                          <TableCell>{r.endDate}</TableCell>
                          <TableCell><StatusChip status={r.status} /></TableCell>
                          <TableCell sx={{ width: 180 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LinearProgress variant="determinate" value={r.completionRate} sx={{ flexGrow: 1, borderRadius: 1, height: 6 }} />
                              <Typography variant="caption">{r.completionRate}%</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ))}

                {tab === 1 && (
                  <Box>
                    {assetsTabExtra}
                    {vm.assets.length === 0 ? (
                      <Typography color="text.secondary">No assets added to this plan.</Typography>
                    ) : (
                      <Table size="small">
                        <TableHead><TableRow>{['Asset Code', 'Asset Name', 'Location', 'Main Technician'].map((h) => <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>)}</TableRow></TableHead>
                        <TableBody>
                          {vm.assets.map((a) => (
                            <TableRow key={a.key} hover>
                              <TableCell>{a.assetCode}</TableCell>
                              <TableCell>{a.assetName}</TableCell>
                              <TableCell>{a.location}</TableCell>
                              <TableCell>{a.mainTechnician}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                )}

                {tab === 2 && (vm.workOrders.length === 0 ? (
                  <Typography color="text.secondary">No work orders generated yet.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead><TableRow>{['WO ID', 'Asset', 'Round', 'Technician', 'Status', 'Completion Date'].map((h) => <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>)}</TableRow></TableHead>
                    <TableBody>
                      {vm.workOrders.map((w) => (
                        <TableRow key={w.key} hover>
                          <TableCell>{w.woId}</TableCell>
                          <TableCell>{w.asset}</TableCell>
                          <TableCell>{w.round}</TableCell>
                          <TableCell>{w.technician}</TableCell>
                          <TableCell><StatusChip status={w.status} /></TableCell>
                          <TableCell>{w.completionDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ))}

                {tab === 3 && ((vm.checklist?.length ?? 0) === 0 ? (
                  <Typography color="text.secondary">No checklist defined for this plan's asset type.</Typography>
                ) : (
                  <Table size="small">
                    <TableHead><TableRow>{['#', 'Checklist Item', 'Description', 'Photos'].map((h) => <TableCell key={h} sx={HEAD_SX}>{h}</TableCell>)}</TableRow></TableHead>
                    <TableBody>
                      {vm.checklist!.map((c, i) => (
                        <TableRow key={c.key} hover>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{c.name}</TableCell>
                          <TableCell>{c.description}</TableCell>
                          <TableCell>{c.photos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ))}
              </Box>
            </Card>
          </Box>
        </Grid>

        {/* (6) History panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card title="History">
            <Stack spacing={1.5}>
              {vm.history.map((h, i) => (
                <Box key={i}>
                  <Typography variant="body2" fontWeight={600}>{h.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{h.timestamp}</Typography>
                </Box>
              ))}
              {vm.history.length === 0 && <Typography variant="body2" color="text.secondary">No history yet.</Typography>}
            </Stack>
            {vm.history.length > 0 && onViewMoreHistory && (
              <Box sx={{ mt: 1.5 }}>
                <Link component="button" type="button" underline="hover" onClick={onViewMoreHistory}>View more</Link>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
