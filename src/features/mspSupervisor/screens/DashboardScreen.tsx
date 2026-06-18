/**
 * 5.1.6 MSP Supervisor Dashboard — five operational KPI cards, a Maintenance
 * Progress Gantt (per asset type, rounds × months with completion %), and a
 * "Work Orders Needing Attention" table. Scoped to the Supervisor's User Group.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import { alpha } from '@mui/material/styles';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EngineeringIcon from '@mui/icons-material/Engineering';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { brandTokens } from '../../../theme/theme';
import { formatDate, formatDateTime } from '../../../utils/date';
import {
  dashboardKpis,
  kpiTrends,
  maintenanceGantt,
  GANTT_MONTHS,
  statusGroupInfo,
  SUB_SYSTEMS,
  USER_GROUP_SYSTEMS,
  workOrdersNeedingAttention,
} from '../data/mockData';
import type { WorkOrder } from '../data/types';

interface KpiCardProps {
  label: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function KpiCard({ label, value, trend, icon, color, onClick }: KpiCardProps) {
  const TrendIcon = trend > 0 ? TrendingUpIcon : trend < 0 ? TrendingDownIcon : TrendingFlatIcon;
  const trendColor = trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  const content = (
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          backgroundColor: alpha(color, 0.12),
          '& svg': { fontSize: 28 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="baseline">
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: trendColor }}>
            <TrendIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: trendColor }}>
              {trend > 0 ? `+${trend}` : trend}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </CardContent>
  );
  return (
    <Card sx={{ transition: 'box-shadow .2s, transform .2s', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
      {onClick ? <CardActionArea onClick={onClick}>{content}</CardActionArea> : content}
    </Card>
  );
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [systemFilter, setSystemFilter] = useState('All');
  const [subSystemFilter, setSubSystemFilter] = useState('All');

  // Per-row action menu for the attention table.
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<WorkOrder | null>(null);

  const subSystemOptions = systemFilter === 'All' ? [] : SUB_SYSTEMS[systemFilter] ?? [];

  const ganttRows = useMemo(
    () =>
      maintenanceGantt.filter(
        (r) =>
          (systemFilter === 'All' || r.assetSystem === systemFilter) &&
          (subSystemFilter === 'All' || r.subSystem === subSystemFilter),
      ),
    [systemFilter, subSystemFilter],
  );

  const go = (params: string) => navigate(`/msp/work-orders/open${params}`);

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: WorkOrder) => {
    e.stopPropagation();
    setMenuRow(row);
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };
  const rowActions = (wo: WorkOrder): string[] => {
    const acts = ['View Detail'];
    if (wo.status === 'Pending - Unassigned') acts.push('Assign');
    if (wo.status === 'Completed') acts.push('Sign Off', 'Reject');
    return acts;
  };

  return (
    <Box>
      <PageHeader
        title="Welcome back, Marcus"
        subtitle="North Tower MEP Team · Operations overview"
      />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Pending Tech Requests"
            value={dashboardKpis.technicianRequests}
            trend={kpiTrends.technicianRequests}
            icon={<EngineeringIcon />}
            color={brandTokens.status.scheduled}
            onClick={() => go('?status=Technician Request')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Awaiting Assignment"
            value={dashboardKpis.awaitingAssignment}
            trend={kpiTrends.awaitingAssignment}
            icon={<AssignmentLateIcon />}
            color={brandTokens.status.open}
            onClick={() => go('?status=Pending - Unassigned')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="In Execution"
            value={dashboardKpis.inExecution}
            trend={kpiTrends.inExecution}
            icon={<BuildCircleIcon />}
            color={brandTokens.status.inProgress}
            onClick={() => go('?status=Assigned')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Awaiting Sign-off"
            value={dashboardKpis.awaitingSignoff}
            trend={kpiTrends.awaitingSignoff}
            icon={<FactCheckIcon />}
            color={brandTokens.status.completed}
            onClick={() => go('?status=Completed')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            label="Total Active WOs"
            value={dashboardKpis.totalActive}
            trend={kpiTrends.totalActive}
            icon={<TaskAltIcon />}
            color={brandTokens.brand.primary.main}
            onClick={() => go('')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Maintenance Progress"
            action={
              <Stack direction="row" spacing={1.5}>
                <TextField
                  select
                  size="small"
                  label="Asset System"
                  value={systemFilter}
                  onChange={(e) => {
                    setSystemFilter(e.target.value);
                    setSubSystemFilter('All');
                  }}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="All">All Systems</MenuItem>
                  {USER_GROUP_SYSTEMS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Sub-system"
                  value={subSystemFilter}
                  onChange={(e) => setSubSystemFilter(e.target.value)}
                  sx={{ minWidth: 160 }}
                  disabled={systemFilter === 'All'}
                >
                  <MenuItem value="All">All Sub-systems</MenuItem>
                  {subSystemOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            }
          >
            {ganttRows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No maintenance plans for the selected filters.
              </Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 760 }}>
                  {/* Month header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 200, flexShrink: 0 }} />
                    <Box sx={{ display: 'flex', flex: 1 }}>
                      {GANTT_MONTHS.map((m) => (
                        <Box key={m} sx={{ flex: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {m}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {ganttRows.map((row) => (
                    <Box
                      key={row.assetType}
                      sx={{ display: 'flex', alignItems: 'center', py: 1, borderTop: 1, borderColor: 'divider' }}
                    >
                      <Box sx={{ width: 200, flexShrink: 0, pr: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.assetType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.subSystem} · {row.building}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', flex: 1, height: 28 }}>
                        {/* month grid lines */}
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex' }}>
                          {GANTT_MONTHS.map((m) => (
                            <Box key={m} sx={{ flex: 1, borderLeft: 1, borderColor: 'divider', opacity: 0.5 }} />
                          ))}
                        </Box>
                        {row.rounds.map((rd, i) => {
                          const span = rd.endMonth - rd.startMonth + 1;
                          const done = rd.completion >= 100;
                          const color = done
                            ? brandTokens.status.completed
                            : rd.completion > 0
                              ? brandTokens.status.inProgress
                              : brandTokens.status.scheduled;
                          return (
                            <Box
                              key={i}
                              sx={{
                                position: 'absolute',
                                top: 2,
                                bottom: 2,
                                left: `${(rd.startMonth / 12) * 100}%`,
                                width: `${(span / 12) * 100}%`,
                                px: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  borderRadius: 1,
                                  backgroundColor: alpha(color, 0.25),
                                  border: `1px solid ${color}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden',
                                }}
                              >
                                <Typography variant="caption" sx={{ color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                  {rd.label} {rd.completion}%
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Work Orders Needing Attention">
            {workOrdersNeedingAttention.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing needs your attention right now.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workOrdersNeedingAttention.map((w) => {
                    const info = statusGroupInfo(w.status);
                    return (
                      <TableRow key={w.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/msp/work-orders/${w.id}`)}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            #{w.id.replace('-', '')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(w.createdDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{w.type}</Typography>
                          {w.maintenancePlanId && (
                            <Link
                              component="button"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/msp/maintenance-plans/${w.maintenancePlanId}`);
                              }}
                              sx={{ fontSize: '0.72rem', color: 'primary.main' }}
                            >
                              #{w.maintenancePlanId.replace('-', '')}
                            </Link>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {w.assetCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {w.assetName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {w.area} / {w.floor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {w.building}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {w.dueDate ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {w.overdue && <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                              <Typography
                                variant="body2"
                                color={w.overdue ? 'error.main' : 'text.primary'}
                                sx={{ fontWeight: w.overdue ? 700 : 400 }}
                              >
                                {formatDate(w.dueDate)}
                              </Typography>
                            </Stack>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: info.color }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {info.group}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {info.subStatus}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => openMenu(e, w)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {menuRow &&
          rowActions(menuRow).map((label) => (
            <MenuItem
              key={label}
              onClick={() => {
                if (menuRow) navigate(`/msp/work-orders/${menuRow.id}`);
                closeMenu();
              }}
            >
              {label}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}
