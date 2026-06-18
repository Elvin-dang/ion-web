/**
 * Reporting hub consolidating:
 *  - 1.4.3 Maintenance Trend Report (Failure Trends / Planned vs Actual / WO Status Trend)
 *  - 1.4.4 Report Builder – Maintenance Progress (Gantt preview + download)
 *  - 1.4.5 Report Builder – Monthly Progress (executive summary KPIs)
 *  - 1.4.6 Report Builder – Round Completion (cascading filters + asset table)
 */
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DownloadIcon from '@mui/icons-material/Download';
import { alpha } from '@mui/material/styles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import AdminStatusChip from '../components/AdminStatusChip';
import MaintenanceGantt from '../components/MaintenanceGantt';
import type { GanttRow } from '../components/MaintenanceGantt';
import { useToast } from '../components/AdminToast';
import { brandTokens } from '../../../theme/theme';
import { formatDate } from '../../../utils/date';
import {
  assetSubsystems,
  assetSystems,
  assetTypes,
  buildings,
  maintenancePlans,
  faultyAssets,
  adHocWorkOrders,
  roundAssetResults,
  roundFaults,
  trendMonths,
  users,
  subsystemName,
  systemName,
  typeName,
  buildingName,
  assetName,
} from '../data/mockData';

/** Stable signature slot labels for the Round Completion report. */
const SIGN_OFF_ROLES = ['Technician (MSP)', 'Tenants', 'MSP Supervisor', 'Building Technician', 'Building Manager'];

/** A blank labelled signature slot. */
function SignatureSlot({ label }: { label: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ height: 48, borderBottom: '1px solid', borderColor: 'divider', mb: 0.5 }} />
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

const FAILURE = [
  { m: 'Jan', Failures: 4, Planned: 22, Actual: 20 },
  { m: 'Feb', Failures: 6, Planned: 24, Actual: 21 },
  { m: 'Mar', Failures: 3, Planned: 26, Actual: 25 },
  { m: 'Apr', Failures: 5, Planned: 28, Actual: 24 },
  { m: 'May', Failures: 2, Planned: 30, Actual: 29 },
  { m: 'Jun', Failures: 4, Planned: 27, Actual: 22 },
];

function TrendTab() {
  const [building, setBuilding] = useState('all');
  const [granularity, setGranularity] = useState('monthly');
  return (
    <Box>
      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All Buildings</MenuItem>
            {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Granularity" value={granularity} onChange={(e) => setGranularity(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="quarterly">Quarterly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
        </Box>
      </SectionCard>
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Failure Trends">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FAILURE} margin={{ left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#94A3B8', 0.3)} />
                  <XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} /><RTooltip />
                  <Bar dataKey="Failures" fill={brandTokens.status.overdue} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Planned vs Actual">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={FAILURE} margin={{ left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#94A3B8', 0.3)} />
                  <XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} /><RTooltip /><Legend />
                  <Line type="monotone" dataKey="Planned" stroke={brandTokens.status.scheduled} strokeWidth={2} />
                  <Line type="monotone" dataKey="Actual" stroke={brandTokens.status.completed} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard title="WO Status Trend">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={FAILURE} margin={{ left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#94A3B8', 0.3)} />
                  <XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} /><RTooltip /><Legend />
                  <Line type="monotone" dataKey="Planned" name="Todo" stroke={brandTokens.status.open} strokeWidth={2} />
                  <Line type="monotone" dataKey="Actual" name="Completed" stroke={brandTokens.status.completed} strokeWidth={2} />
                  <Line type="monotone" dataKey="Failures" name="Closed" stroke={brandTokens.status.inProgress} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function MaintenanceProgressTab({ onDownload }: { onDownload: () => void }) {
  const [building, setBuilding] = useState('all');
  const [fromMonth, setFromMonth] = useState('2026-01');
  const [toMonth, setToMonth] = useState('2026-06');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  const apply = () => {
    if (toMonth < fromMonth) { setError('End month must be after start month.'); setApplied(false); return; }
    setError(''); setApplied(true);
  };

  const ganttRows: GanttRow[] = maintenancePlans
    .filter((p) => (building === 'all' || p.buildingId === building) && p.rounds.length > 0)
    .map((p) => ({
      id: p.id,
      label: `${systemName(p.systemId)} › ${subsystemName(p.subsystemId)} › ${typeName(p.typeId)}`,
      rounds: p.rounds,
    }));

  return (
    <Box>
      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 200 }} required>
            <MenuItem value="all">All Buildings</MenuItem>
            {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>
          <TextField size="small" type="month" label="From Month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} InputLabelProps={{ shrink: true }} required />
          <TextField size="small" type="month" label="To Month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} InputLabelProps={{ shrink: true }} required error={!!error} helperText={error || ' '} />
          <Button variant="contained" onClick={apply}>Apply</Button>
        </Box>
      </SectionCard>
      <Box sx={{ mt: 2.5 }}>
        <SectionCard title="Preview" action={applied && <Button startIcon={<DownloadIcon />} variant="outlined" onClick={onDownload}>Download</Button>}>
          {!applied ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Select filters and click Apply to preview the report.</Typography>
          ) : (
            <MaintenanceGantt
              rows={ganttRows}
              months={trendMonths}
              emptyText="No maintenance plan data found for the selected building and period."
            />
          )}
        </SectionCard>
      </Box>
    </Box>
  );
}

/** Format a "2026-06" month input as "June 2026". */
function monthLabel(month: string): string {
  const d = dayjs(`${month}-01`);
  return d.isValid() ? d.format('MMMM YYYY') : month;
}

function MonthlyProgressTab({ onDownload }: { onDownload: () => void }) {
  const [building, setBuilding] = useState('');
  const [month, setMonth] = useState('2026-06');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  const apply = () => {
    if (!building) { setError('Please select a building.'); return; }
    setError(''); setApplied(true);
  };

  const activePlans = useMemo(
    () => maintenancePlans.filter((p) => p.status === 'Active' && (building ? p.buildingId === building : true)),
    [building],
  );

  // Recipient = a Building Manager if any, else the Super Admin.
  const recipient = users.find((u) => u.role === 'Building Manager')?.fullName ?? users[0].fullName;
  const superAdminName = users.find((u) => u.role === 'Super Admin')?.fullName ?? users[0].fullName;

  const completedAdHoc = adHocWorkOrders.filter((w) => w.completionDate);
  const pendingAdHoc = adHocWorkOrders.filter((w) => !w.completionDate);
  const faultsFlagged = faultyAssets.reduce((sum, f) => sum + f.quantityFlagged, 0);
  const completionRate = 82;

  const summaryBullets = [
    `Total maintenance plans active: ${activePlans.length}`,
    `Ad-hoc work orders completed: ${completedAdHoc.length}`,
    `Ad-hoc work orders pending: ${pendingAdHoc.length}`,
    `Assets flagged as faulty: ${faultsFlagged}`,
    `Overall maintenance completion rate: ${completionRate}%`,
  ];

  const keyMetrics = [
    { label: 'Maintenance Completion Rate', value: `${completionRate}% vs target 90%` },
    { label: 'Average Work Order Closure Time', value: '2.4 days' },
  ];
  const recurringFaults = faultyAssets.slice(0, 3).map((f) => f.cause);

  return (
    <Box>
      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 220 }} required error={!!error} helperText={error || ' '}>
            {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>
          <TextField size="small" type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} InputLabelProps={{ shrink: true }} required />
          <Button variant="contained" onClick={apply}>Apply</Button>
        </Box>
      </SectionCard>
      <Box sx={{ mt: 2.5 }}>
        {!applied ? (
          <SectionCard><Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Select a building and month, then click Apply.</Typography></SectionCard>
        ) : (
          <SectionCard
            title={`${buildingName(building)} — Monthly Maintenance Progress`}
            action={<Button startIcon={<DownloadIcon />} variant="outlined" onClick={onDownload}>Download</Button>}
          >
            {/* Executive Summary — letter format (task 8) */}
            <Typography variant="h6" sx={{ mb: 1.5 }}>Executive Summary</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>Dear {recipient},</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Please refer to the Monthly Maintenance Progress Report for {monthLabel(month)}.
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 0, '& li': { mb: 0.5 } }}>
              {summaryBullets.map((b) => (
                <Typography key={b} component="li" variant="body2">{b}</Typography>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Scheduled Maintenance Overview (task 9) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Scheduled Maintenance Overview</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['System', 'Sub-System', 'Asset Type', 'Frequency', 'Current Round', 'Progress', 'Completion %', 'Remarks'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {activePlans.map((p) => {
                  const last = p.rounds[p.rounds.length - 1];
                  const completed = p.rounds.filter((r) => r.status === 'Completed').length;
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell>{systemName(p.systemId)}</TableCell>
                      <TableCell>{subsystemName(p.subsystemId)}</TableCell>
                      <TableCell>{typeName(p.typeId)}</TableCell>
                      <TableCell>{p.frequency}</TableCell>
                      <TableCell>{last ? last.roundNo : '—'}</TableCell>
                      <TableCell>{p.rounds.length ? `${completed}/${p.rounds.length} rounds` : '—'}</TableCell>
                      <TableCell>{last ? `${last.completionRate}%` : '—'}</TableCell>
                      <TableCell>{p.remark || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Divider sx={{ my: 3 }} />

            {/* Faulty Assets (task 10) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Faulty Assets</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Asset Type', 'Quantity Flagged', 'Date Identified', 'Cause'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {faultyAssets.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>{typeName(f.assetTypeId)}</TableCell>
                    <TableCell>{f.quantityFlagged}</TableCell>
                    <TableCell>{formatDate(f.dateIdentified)}</TableCell>
                    <TableCell>{f.cause}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 3 }} />

            {/* Ad-Hoc Work Orders — Completed + Pending (task 11) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Ad-Hoc Work Orders</Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed</Typography>
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  {['Work Order ID', 'Asset', 'Description', 'Completion Date', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {completedAdHoc.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>{assetName(w.assetId)}</TableCell>
                    <TableCell>{w.description}</TableCell>
                    <TableCell>{formatDate(w.completionDate)}</TableCell>
                    <TableCell><AdminStatusChip status={w.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Pending</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Work Order ID', 'Asset', 'Description', 'Target Completion Date', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingAdHoc.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>{assetName(w.assetId)}</TableCell>
                    <TableCell>{w.description}</TableCell>
                    <TableCell>{formatDate(w.targetCompletionDate)}</TableCell>
                    <TableCell><AdminStatusChip status={w.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider sx={{ my: 3 }} />

            {/* Key Metrics & Analytics (task 12) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Key Metrics &amp; Analytics</Typography>
            <Grid container spacing={2}>
              {keyMetrics.map((m) => (
                <Grid key={m.label} size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                    <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{m.value}</Typography>
                  </Paper>
                </Grid>
              ))}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">Recurring Fault Trends (Top 3)</Typography>
                  <Box component="ol" sx={{ pl: 2.5, mt: 0.5, mb: 0, '& li': { mb: 0.25 } }}>
                    {recurringFaults.map((c) => (
                      <Typography key={c} component="li" variant="body2">{c}</Typography>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary">
              Report generated automatically by {superAdminName}.
            </Typography>
          </SectionCard>
        )}
      </Box>
    </Box>
  );
}

function RoundCompletionTab({ onDownload }: { onDownload: () => void }) {
  const [building, setBuilding] = useState('');
  const [sys, setSys] = useState('');
  const [sub, setSub] = useState('');
  const [type, setType] = useState('');
  const [freq, setFreq] = useState('');
  const [round, setRound] = useState('');
  const [applied, setApplied] = useState(false);

  const subs = useMemo(() => assetSubsystems.filter((s) => s.systemId === sys), [sys]);
  const types = useMemo(
    () => assetTypes.filter((t) => (sys ? t.systemId === sys : true) && (sub ? t.subsystemId === sub : true)),
    [sys, sub],
  );
  const apply = () => setApplied(Boolean(building && sys && round));

  // Generated-on timestamp computed once (stable across renders).
  const generatedOn = useMemo(() => formatDate(dayjs()), []);
  const superAdminName = users.find((u) => u.role === 'Super Admin')?.fullName ?? users[0].fullName;

  const completedCount = roundAssetResults.filter((r) => r.completionRate >= 100).length;
  const summary = [
    { label: 'Total Scheduled', value: roundAssetResults.length },
    { label: 'Completed', value: completedCount },
    { label: 'Faulty', value: roundFaults.length },
    {
      label: 'Completion Rate',
      value: roundAssetResults.length ? `${Math.round((completedCount / roundAssetResults.length) * 100)}%` : '0%',
    },
  ];

  // Header block field values.
  const headerFields = [
    { label: 'Building Name', value: building ? buildingName(building) : '—' },
    { label: 'Asset Type', value: type ? typeName(type) : 'All' },
    { label: 'System', value: sys ? systemName(sys) : '—' },
    { label: 'Frequency', value: freq || '—' },
    { label: 'Round', value: round || '—' },
    { label: 'Generated On', value: generatedOn },
  ];

  return (
    <Box>
      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => { setBuilding(e.target.value); setSys(''); setSub(''); setType(''); setRound(''); }} sx={{ minWidth: 170 }} required>
            {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="System" value={sys} onChange={(e) => { setSys(e.target.value); setSub(''); setType(''); setRound(''); }} sx={{ minWidth: 150 }} disabled={!building} required>
            {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Sub System" value={sub} onChange={(e) => { setSub(e.target.value); setType(''); }} sx={{ minWidth: 150 }} disabled={!sys} required>
            {subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 150 }} disabled={!sub}>
            {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Frequency" value={freq} onChange={(e) => setFreq(e.target.value)} sx={{ minWidth: 130 }} disabled={!sub} required>
            {['Monthly', 'Quarterly', 'Yearly'].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Round" value={round} onChange={(e) => setRound(e.target.value)} sx={{ minWidth: 120 }} disabled={!freq} required>
            {['R1', 'R2', 'R3'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <Button variant="contained" onClick={apply} disabled={!round}>Apply</Button>
        </Box>
      </SectionCard>
      <Box sx={{ mt: 2.5 }}>
        {!applied ? (
          <SectionCard><Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Complete the cascading filters and click Apply.</Typography></SectionCard>
        ) : (
          <SectionCard title="Round Completion" action={<Button startIcon={<DownloadIcon />} variant="outlined" onClick={onDownload}>Download</Button>}>
            {/* Header block with labelled fields (task 14) */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', mb: 3 }}>
              <Grid container spacing={2}>
                {headerFields.map((f) => (
                  <Grid key={f.label} size={{ xs: 6, md: 4 }}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* KPI summary */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {summary.map((k) => (
                <Grid key={k.label} size={{ xs: 6, md: 3 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{k.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Per-asset detail cards with signature rows (task 15) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Assets</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {roundAssetResults.map((r) => (
                <Grid key={r.assetId} size={{ xs: 12 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '16px' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 2.4 }}>
                        <Typography variant="caption" color="text.secondary">Asset ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.assetId}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 2.4 }}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Box sx={{ mt: 0.5 }}><AdminStatusChip status={r.status} /></Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3.6 }}>
                        <Typography variant="caption" color="text.secondary">Location</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.location}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 1.8 }}>
                        <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.completionRate}%</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 1.8 }}>
                        <Typography variant="caption" color="text.secondary">Remark</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.remark}</Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      {SIGN_OFF_ROLES.map((role) => (
                        <Grid key={role} size={{ xs: 6, md: 2.4 }}>
                          <SignatureSlot label={role} />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Faults Identified table (task 16) */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Faults Identified</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Asset ID', 'Location', 'Fault Description', 'Date Found', 'Action Taken', 'Work Order ID'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {roundFaults.map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>{f.assetId}</TableCell>
                    <TableCell>{f.location}</TableCell>
                    <TableCell>{f.description}</TableCell>
                    <TableCell>{formatDate(f.dateFound)}</TableCell>
                    <TableCell>{f.actionTaken}</TableCell>
                    <TableCell>{f.woId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Footer (task 17) */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Report generated automatically by {superAdminName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (No manual intervention required. Data compiled from closed work orders and asset records.)
            </Typography>
          </SectionCard>
        )}
      </Box>
    </Box>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState(0);
  const { toast, node } = useToast();
  const download = () => toast('Report downloaded successfully.');

  return (
    <Box>
      <PageHeader title="Reports & Report Builder" subtitle="Maintenance trends and downloadable progress reports." />
      <Paper elevation={2} sx={{ borderRadius: '16px', mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
          <Tab label="Maintenance Trend" />
          <Tab label="Maintenance Progress" />
          <Tab label="Monthly Progress" />
          <Tab label="Round Completion" />
        </Tabs>
      </Paper>
      {tab === 0 && <TrendTab />}
      {tab === 1 && <MaintenanceProgressTab onDownload={download} />}
      {tab === 2 && <MonthlyProgressTab onDownload={download} />}
      {tab === 3 && <RoundCompletionTab onDownload={download} />}
      {node}
    </Box>
  );
}
