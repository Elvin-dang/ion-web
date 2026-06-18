/**
 * 3.1.5 Dashboard (Building Manager).
 * KPI cards, WO status trend line chart, requests-by-status, asset health,
 * and maintenance compliance — scoped to the BM's assigned buildings.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../../components/PageHeader';
import { brandTokens } from '../../../theme/theme';
import { KpiCard, SectionCard } from '../components/shared';
import { buildings, workOrders, serviceRequests, assets, maintenancePlans } from '../data/mockData';

const trendData = [
  { week: 'W1', Todo: 8, Completed: 5, Closed: 3 },
  { week: 'W2', Todo: 6, Completed: 7, Closed: 5 },
  { week: 'W3', Todo: 9, Completed: 6, Closed: 6 },
  { week: 'W4', Todo: 5, Completed: 9, Closed: 8 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState('ALL');

  const scopedWos = useMemo(
    () => (building === 'ALL' ? workOrders : workOrders.filter((w) => w.buildingId === building)),
    [building],
  );
  const scopedReqs = useMemo(
    () => (building === 'ALL' ? serviceRequests : serviceRequests.filter((r) => r.buildingId === building)),
    [building],
  );
  const scopedAssets = useMemo(
    () => (building === 'ALL' ? assets : assets.filter((a) => a.buildingId === building)),
    [building],
  );

  const kpis = {
    total: scopedReqs.length + scopedWos.length,
    pending: scopedWos.filter((w) => w.status === 'Pending - Unassigned').length + scopedReqs.filter((r) => r.status === 'Pending').length,
    inProgress: scopedWos.filter((w) => w.status === 'Assigned' || w.status === 'Started').length,
    completed: scopedWos.filter((w) => w.status === 'Completed' || w.status === 'Verified').length,
    closed: scopedWos.filter((w) => w.status === 'Closed').length,
  };

  const requestsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    scopedReqs.forEach((r) => {
      map[r.status] = (map[r.status] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [scopedReqs]);

  const assetHealth = [
    { name: 'Healthy (80-100)', value: scopedAssets.filter((a) => a.health >= 80).length, color: brandTokens.status.completed },
    { name: 'Watch (60-79)', value: scopedAssets.filter((a) => a.health >= 60 && a.health < 80).length, color: brandTokens.status.scheduled },
    { name: 'At Risk (<60)', value: scopedAssets.filter((a) => a.health < 60).length, color: brandTokens.status.overdue },
  ];

  const compliance = maintenancePlans
    .filter((p) => building === 'ALL' || p.buildingId === building)
    .map((p) => {
      const rates = p.rounds.map((r) => r.completionRate);
      const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
      return { name: p.name, value: avg };
    });

  const PIE_COLORS = [
    brandTokens.status.open,
    brandTokens.status.scheduled,
    brandTokens.status.completed,
    brandTokens.status.overdue,
    brandTokens.status.inProgress,
  ];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of requests, work orders, assets and maintenance compliance"
        action={
          <TextField
            select
            size="small"
            label="Building"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="ALL">All Buildings</MenuItem>
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard label="Total Requests" value={kpis.total} color={brandTokens.status.open} icon={<AssignmentIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Pending Approval"
            value={kpis.pending}
            color={brandTokens.status.scheduled}
            icon={<PendingActionsIcon />}
            onClick={() => navigate('/bm/requests?status=Pending')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="In Progress WOs"
            value={kpis.inProgress}
            color={brandTokens.status.inProgress}
            icon={<AutorenewIcon />}
            onClick={() => navigate('/bm/work-orders?status=In Progress')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard label="Completed WOs" value={kpis.completed} color={brandTokens.status.completed} icon={<CheckCircleIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Closed WOs"
            value={kpis.closed}
            color={brandTokens.status.completed}
            icon={<DoneAllIcon />}
            onClick={() => navigate('/bm/work-orders?status=Closed')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Work Order Status Trend">
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="week" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Todo" stroke={brandTokens.status.open} strokeWidth={2} />
                  <Line type="monotone" dataKey="Completed" stroke={brandTokens.status.completed} strokeWidth={2} />
                  <Line type="monotone" dataKey="Closed" stroke={brandTokens.status.inProgress} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Requests by Status">
            <Box sx={{ height: 300 }}>
              {requestsByStatus.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No requests in the selected period.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={requestsByStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                      {requestsByStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Asset Health">
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetHealth} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
                    {assetHealth.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Maintenance Compliance">
            {compliance.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No maintenance plans for the selected building and period.
              </Typography>
            ) : (
              <>
                <Box sx={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compliance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" fill={brandTokens.status.completed} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {compliance.map((c) => (
                    <Box key={c.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption">{c.name}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {c.value}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={c.value} sx={{ borderRadius: 1, height: 6 }} />
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Maintenance Progress Gantt and per-section retry controls are available in the full plan view. Dashboard scoped to assigned buildings only.
        </Typography>
      </Paper>
    </Box>
  );
}
