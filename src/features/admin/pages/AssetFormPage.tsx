/**
 * 1.5.14 Create Asset / 1.5.15 Edit Asset — full-page form in three sections:
 * Asset Classification (System / Sub-system / Type), Location (Building /
 * Floor / Area), Asset Details (Name / Code / Model / Serial / Brand / dates /
 * Status). Cascading dropdowns + validation.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { assets, assetSystems, assetSubsystems, assetTypes, buildings } from '../data/mockData';
import type { ActiveStatus } from '../data/types';

export default function AssetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const editing = Boolean(id);
  const existing = assets.find((a) => a.id === id);

  const [f, setF] = useState({
    systemId: existing?.systemId ?? '', subsystemId: existing?.subsystemId ?? '', typeId: existing?.typeId ?? '',
    buildingId: existing?.buildingId ?? '', floorId: existing?.floorId ?? '', areaId: existing?.areaId ?? '',
    name: existing?.name ?? '', code: existing?.code ?? '', model: existing?.model ?? '', serial: existing?.serial ?? '',
    brand: existing?.brand ?? '', purchaseDate: existing?.purchaseDate ?? '', manufacturedDate: existing?.manufacturedDate ?? '',
    status: (existing?.status ?? 'Active') as ActiveStatus,
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const subs = useMemo(() => assetSubsystems.filter((s) => s.systemId === f.systemId), [f.systemId]);
  const types = useMemo(() => assetTypes.filter((t) => t.systemId === f.systemId && (f.subsystemId ? t.subsystemId === f.subsystemId : true) && t.status === 'Active'), [f.systemId, f.subsystemId]);
  const floors = buildings.find((b) => b.id === f.buildingId)?.floors ?? [];
  const areas = floors.find((fl) => fl.id === f.floorId)?.areas ?? [];

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.systemId) e.systemId = 'Asset System is required.';
    if (!f.subsystemId) e.subsystemId = 'Asset Sub-system is required.';
    if (!f.typeId) e.typeId = 'Asset Type is required.';
    if (!f.buildingId) e.buildingId = 'Building is required.';
    if (!f.floorId) e.floorId = 'Floor is required.';
    if (!f.name.trim()) e.name = 'Asset name is required.';
    if (!f.code.trim()) e.code = 'Asset code is required.';
    else if (f.code.length > 50) e.code = 'Asset code must not exceed 50 characters.';
    setErr(e);
    if (Object.keys(e).length) return;
    toast(editing ? 'Asset updated successfully.' : 'Asset created successfully.');
    setTimeout(() => navigate('/admin/assets'), 600);
  };

  return (
    <Box>
      <PageHeader title={editing ? 'Edit Asset' : 'New Asset'} breadcrumbs={[{ label: 'Assets', to: '/admin/assets' }, { label: editing ? f.name || 'Edit' : 'New' }]} />
      <Stack spacing={2.5}>
        <SectionCard title="Asset Classification">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select required fullWidth label="Asset System" value={f.systemId} onChange={(e) => { set('systemId', e.target.value); set('subsystemId', ''); set('typeId', ''); }} error={!!err.systemId} helperText={err.systemId}>
                {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select required fullWidth label="Asset Sub-system" value={f.subsystemId} onChange={(e) => { set('subsystemId', e.target.value); set('typeId', ''); }} disabled={!f.systemId} error={!!err.subsystemId} helperText={err.subsystemId}>
                {subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select required fullWidth label="Asset Type" value={f.typeId} onChange={(e) => set('typeId', e.target.value)} disabled={!f.systemId} error={!!err.typeId} helperText={err.typeId}>
                {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Location">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select required fullWidth label="Building" value={f.buildingId} onChange={(e) => { set('buildingId', e.target.value); set('floorId', ''); set('areaId', ''); }} error={!!err.buildingId} helperText={err.buildingId}>
                {buildings.filter((b) => b.status === 'Active').map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select required fullWidth label="Floor" value={f.floorId} onChange={(e) => { set('floorId', e.target.value); set('areaId', ''); }} disabled={!f.buildingId} error={!!err.floorId} helperText={err.floorId || (f.buildingId && floors.length === 0 ? 'No floors available. Please add floors to this building first.' : '')}>
                {floors.map((fl) => <MenuItem key={fl.id} value={fl.id}>{fl.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth label="Area/Unit" value={f.areaId} onChange={(e) => set('areaId', e.target.value)} disabled={!f.floorId}>
                {areas.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Asset Details">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth label="Asset Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={!!err.name} helperText={err.name} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth label="Asset Code" value={f.code} onChange={(e) => set('code', e.target.value)} error={!!err.code} helperText={err.code} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Model" value={f.model} onChange={(e) => set('model', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Serial Number" value={f.serial} onChange={(e) => set('serial', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Brand" value={f.brand} onChange={(e) => set('brand', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Purchase Date"
                format="DD/MM/YYYY"
                value={f.purchaseDate ? dayjs(f.purchaseDate) : null}
                onChange={(v) => set('purchaseDate', v ? v.format('YYYY-MM-DD') : '')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DatePicker
                label="Manufactured Date"
                format="DD/MM/YYYY"
                value={f.manufacturedDate ? dayjs(f.manufacturedDate) : null}
                onChange={(v) => set('manufacturedDate', v ? v.format('YYYY-MM-DD') : '')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth label="Status" value={f.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}><Button variant="outlined" component="label">Upload Photos<input type="file" hidden multiple accept="image/*" onChange={() => toast('Photos selected (demo).')} /></Button></Grid>
          </Grid>
        </SectionCard>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate('/admin/assets')}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </Stack>
      </Stack>
      {node}
    </Box>
  );
}
