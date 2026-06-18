/**
 * 1.4.2 Asset Utilization Dashboard — Building / Category filters with
 * domain-appropriate charts (asset counts by system, WO load per asset type).
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { alpha } from '@mui/material/styles';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { brandTokens } from '../../../theme/theme';
import { assets, assetSystems, buildings } from '../data/mockData';

const PALETTE = [
  brandTokens.status.open,
  brandTokens.status.inProgress,
  brandTokens.status.completed,
  brandTokens.status.scheduled,
  brandTokens.status.overdue,
];

export default function AssetUtilizationPage() {
  const [building, setBuilding] = useState('all');
  const [category, setCategory] = useState('all');

  const filtered = assets.filter((a) => building === 'all' || a.buildingId === building);

  const bySystem = assetSystems
    .map((s) => ({ name: s.name, value: filtered.filter((a) => a.systemId === s.id).length }))
    .filter((x) => x.value > 0);

  const woLoad = assetSystems
    .map((s, i) => ({ name: s.name, 'WO Count': (i + 2) * 7 - 3 }))
    .slice(0, 4);

  return (
    <Box>
      <PageHeader title="Asset Utilization Dashboard" subtitle="Asset distribution and work-order load across systems." />

      <SectionCard>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All Buildings</MenuItem>
            {buildings.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All Categories</MenuItem>
            {assetSystems.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </TextField>
        </Box>
      </SectionCard>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Assets by System">
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySystem} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {bySystem.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <RTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Work Order Load per System">
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={woLoad} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#94A3B8', 0.3)} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RTooltip />
                  <Bar dataKey="WO Count" fill={brandTokens.status.inProgress} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
