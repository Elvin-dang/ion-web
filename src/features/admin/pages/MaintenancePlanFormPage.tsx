/**
 * 1.7.3 Create Maintenance Plan / 1.7.4 Edit Maintenance Plan — full-page form
 * with classification + building + frequency + time required + description /
 * remark / photos. Cascading dropdowns + validation.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { maintenancePlans, assetSystems, assetSubsystems, assetTypes, buildings } from '../data/mockData';
import type { Frequency } from '../data/types';

export default function MaintenancePlanFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const editing = Boolean(id);
  const existing = maintenancePlans.find((p) => p.id === id);

  const [f, setF] = useState({
    name: existing?.name ?? '', systemId: existing?.systemId ?? '', subsystemId: existing?.subsystemId ?? '', typeId: existing?.typeId ?? '',
    buildingId: existing?.buildingId ?? '', frequency: (existing?.frequency ?? '') as Frequency | '', timeRequired: existing?.timeRequired ?? '',
    description: existing?.description ?? '', remark: existing?.remark ?? '',
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const subs = useMemo(() => assetSubsystems.filter((s) => s.systemId === f.systemId), [f.systemId]);
  const types = useMemo(() => assetTypes.filter((t) => t.subsystemId === f.subsystemId), [f.subsystemId]);
  // Checklist is inherited from the selected Asset Type and becomes part of the plan definition.
  const selectedType = useMemo(() => assetTypes.find((t) => t.id === f.typeId), [f.typeId]);

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Plan name is required.';
    else if (f.name.length > 150) e.name = 'Plan name must not exceed 150 characters.';
    if (!f.systemId) e.systemId = 'Asset System is required.';
    if (!f.subsystemId) e.subsystemId = 'Asset Sub-system is required.';
    if (!f.typeId) e.typeId = 'Asset Type is required.';
    if (!f.buildingId) e.buildingId = 'Building is required.';
    if (!f.frequency) e.frequency = 'Frequency is required.';
    if (!f.timeRequired.trim()) e.timeRequired = 'Time required to complete is required.';
    setErr(e); if (Object.keys(e).length) return;
    toast(editing ? 'Plan updated successfully.' : 'Maintenance plan created successfully.');
    setTimeout(() => navigate('/admin/maintenance-plans'), 600);
  };

  return (
    <Box>
      <PageHeader title={editing ? 'Edit Maintenance Plan' : 'Create Maintenance Plan'} breadcrumbs={[{ label: 'Maintenance Plans', to: '/admin/maintenance-plans' }, { label: editing ? f.name || 'Edit' : 'New' }]} />
      <Stack spacing={2.5}>
        <SectionCard title="Plan Details">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField required fullWidth label="Plan Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={!!err.name} helperText={err.name} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset System" value={f.systemId} onChange={(e) => { set('systemId', e.target.value); set('subsystemId', ''); set('typeId', ''); }} error={!!err.systemId} helperText={err.systemId}>{assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset Sub-system" value={f.subsystemId} onChange={(e) => { set('subsystemId', e.target.value); set('typeId', ''); }} disabled={!f.systemId} error={!!err.subsystemId} helperText={err.subsystemId}>{subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset Type" value={f.typeId} onChange={(e) => set('typeId', e.target.value)} disabled={!f.subsystemId} error={!!err.typeId} helperText={err.typeId}>{types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Building" value={f.buildingId} onChange={(e) => set('buildingId', e.target.value)} error={!!err.buildingId} helperText={err.buildingId}>{buildings.filter((b) => b.status === 'Active').map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Frequency" value={f.frequency} onChange={(e) => set('frequency', e.target.value)} error={!!err.frequency} helperText={err.frequency}>{['Monthly', 'Quarterly', 'Yearly'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required fullWidth label="Time Required to Complete" placeholder="e.g. 4 hours" value={f.timeRequired} onChange={(e) => set('timeRequired', e.target.value)} error={!!err.timeRequired} helperText={err.timeRequired} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline minRows={2} label="Description" value={f.description} onChange={(e) => set('description', e.target.value)} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth multiline minRows={2} label="Remark" value={f.remark} onChange={(e) => set('remark', e.target.value)} /></Grid>
            <Grid size={{ xs: 12 }}><Button variant="outlined" component="label">Upload Photos<input type="file" hidden multiple accept="image/*" onChange={() => toast('Photos selected (demo).')} /></Button></Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Checklist">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Inherited from the selected Asset Type. Generated Work Orders will use this checklist.
          </Typography>
          {!f.typeId ? (
            <Typography variant="body2" color="text.secondary">Select an Asset Type to load its checklist.</Typography>
          ) : (selectedType?.checklist.length ?? 0) === 0 ? (
            <Typography variant="body2" color="text.secondary">The selected Asset Type has no checklist items.</Typography>
          ) : (
            <Stack spacing={1}>
              {selectedType!.checklist.map((c, i) => (
                <Paper key={c.id} variant="outlined" sx={{ borderRadius: '16px', p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography fontWeight={700} color="text.secondary">{i + 1}.</Typography>
                  <Typography sx={{ flex: 1, minWidth: 160 }}>{c.name}</Typography>
                  <Chip size="small" label={`Description: ${c.description}`} variant="outlined" />
                  <Chip size="small" label={`Photos: ${c.photos}`} variant="outlined" />
                </Paper>
              ))}
            </Stack>
          )}
        </SectionCard>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate('/admin/maintenance-plans')}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </Stack>
      </Stack>
      {node}
    </Box>
  );
}
