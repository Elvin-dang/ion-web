/**
 * 1.4.1 Performance Dashboard — KPI cards (with trend indicators), a monthly WO
 * Status Trend line chart (with its own WO Type filter), and a Maintenance
 * Progress Gantt chart. Building / Date Range filters at the top; Asset System
 * + Sub-system filters on the Maintenance Progress section. Default landing
 * screen for Super Admin.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { alpha } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
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
import MaintenanceGantt, { type GanttRow } from '../components/MaintenanceGantt';
import { brandTokens } from '../../../theme/theme';
import {
  assetSubsystems,
  assetSystems,
  buildings,
  maintenancePlans,
  subsystemName,
  systemName,
  trendMonths,
  typeName,
} from '../data/mockData';

// Monthly WO status trend — 12 buckets (APR-25 … MAR-26).
const TREND_VALUES: Array<[number, number, number]> = [
  [18, 9, 6],
  [22, 14, 10],
  [15, 19, 16],
  [20, 17, 13],
  [25, 21, 18],
  [19, 23, 20],
  [17, 18, 17],
  [21, 20, 19],
  [24, 22, 21],
  [16, 19, 18],
  [23, 25, 22],
  [20, 24, 23],
];
const TREND = trendMonths.map((m, i) => ({
  date: m,
  Todo: TREND_VALUES[i][0],
  Completed: TREND_VALUES[i][1],
  Closed: TREND_VALUES[i][2],
}));

const KPIS = [
  { key: 'total', label: 'Total Work Order', value: 142, icon: <AssignmentIcon />, color: brandTokens.status.open, trend: 5 },
  { key: 'inprogress', label: 'In Progress', value: 34, icon: <BuildCircleIcon />, color: brandTokens.status.inProgress, trend: -3 },
  { key: 'completed', label: 'Completed', value: 27, icon: <CheckCircleIcon />, color: brandTokens.status.completed, trend: 12 },
  { key: 'closed', label: 'Closed', value: 63, icon: <DoneAllIcon />, color: brandTokens.status.completed, trend: 8 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState('all');
  const [from, setFrom] = useState<dayjs.Dayjs | null>(dayjs('2026-05-18'));
  const [to, setTo] = useState<dayjs.Dayjs | null>(dayjs('2026-06-17'));
  const [trendType, setTrendType] = useState('all');
  const [ganttSystem, setGanttSystem] = useState('all');
  const [ganttSubsystem, setGanttSubsystem] = useState('all');

  const ganttSubOptions = useMemo(
    () =>
      assetSubsystems.filter((s) => ganttSystem === 'all' || s.systemId === ganttSystem),
    [ganttSystem],
  );

  const ganttRows = useMemo<GanttRow[]>(() => {
    const plans = maintenancePlans.filter(
      (p) =>
        p.rounds.length > 0 &&
        (ganttSystem === 'all' || p.systemId === ganttSystem) &&
        (ganttSubsystem === 'all' || p.subsystemId === ganttSubsystem),
    );
    return plans.map((p) => ({
      id: p.id,
      label: `${systemName(p.systemId)} › ${subsystemName(p.subsystemId)} › ${typeName(p.typeId)}`,
      rounds: p.rounds,
    }));
  }, [ganttSystem, ganttSubsystem]);

  const dateError = !!(from && to && to.isBefore(from));

  return (
    <Box>
      <PageHeader title="Performance Dashboard" subtitle="Work order KPIs, status trends and maintenance progress." />

      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All Buildings</MenuItem>
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="From"
            value={from}
            onChange={(v) => setFrom(v)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To"
            value={to}
            onChange={(v) => setTo(v)}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                size: 'small',
                error: dateError,
                helperText: dateError ? 'End date must be after start date.' : ' ',
              },
            }}
          />
        </Box>
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        {KPIS.map((k) => {
          const up = k.trend >= 0;
          const trendColor = up ? brandTokens.status.completed : brandTokens.status.overdue;
          return (
            <Grid key={k.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={2}
                onClick={() => navigate('/admin/maintenance-plans')}
                sx={{
                  borderRadius: 4,
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                }}
              >
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 1.5, color: k.color, backgroundColor: alpha(k.color, 0.14),
                  }}
                >
                  {k.icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{k.value}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor, fontWeight: 700 }}>
                    {up ? <ArrowUpwardIcon sx={{ fontSize: 16 }} /> : <ArrowDownwardIcon sx={{ fontSize: 16 }} />}
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {Math.abs(k.trend)}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">{k.label}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 2.5 }}>
        <SectionCard
          title="WO Status Trend"
          action={
            <TextField
              select
              size="small"
              label="WO Type"
              value={trendType}
              onChange={(e) => setTrendType(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All types</MenuItem>
              <MenuItem value="maintenance">Maintenance Scheduling</MenuItem>
              <MenuItem value="adhoc">Ad-hoc Work</MenuItem>
              <MenuItem value="request">Service Request</MenuItem>
            </TextField>
          }
        >
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#94A3B8', 0.3)} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="Todo" stroke={brandTokens.status.open} strokeWidth={2} />
                <Line type="monotone" dataKey="Completed" stroke={brandTokens.status.completed} strokeWidth={2} />
                <Line type="monotone" dataKey="Closed" stroke={brandTokens.status.inProgress} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <SectionCard
          title="Maintenance Progress"
          action={
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <TextField
                select
                size="small"
                label="Asset System"
                value={ganttSystem}
                onChange={(e) => {
                  setGanttSystem(e.target.value);
                  setGanttSubsystem('all');
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All Systems</MenuItem>
                {assetSystems.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Sub-system"
                value={ganttSubsystem}
                onChange={(e) => setGanttSubsystem(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="all">All Sub-systems</MenuItem>
                {ganttSubOptions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Box>
          }
        >
          <MaintenanceGantt
            rows={ganttRows}
            months={trendMonths}
            emptyText="No maintenance plans for the selected Asset System and Sub-system."
          />
        </SectionCard>
      </Box>
    </Box>
  );
}
