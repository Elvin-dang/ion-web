/**
 * 1.6.7 Create Spare Part — full-page form in three sections: Part
 * Identification, Stock Info, Supporting Info. Cascading classification
 * dropdowns + validation (unique code, non-negative quantity).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { spareParts, assetSystems, assetSubsystems, assetTypes } from '../data/mockData';
import type { ActiveStatus } from '../data/types';

/** Store locations the spare part can be assigned to. */
const STORE_LOCATIONS = [
  'Landmark 81 - Basement Store',
  'Vincom Center - Store B',
  'Bitexco Tower - MEP Store',
];

export default function SparePartFormPage() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [f, setF] = useState({
    name: '', status: 'Active' as ActiveStatus, code: '', location: '', systemId: '', subsystemId: '', typeId: '',
    brand: '', model: '', serial: '', quantity: '0', department: '', storeRoom: '', origin: '',
    purchaseDate: '', yearOfManufacture: '', usageDate: '', warrantyExpiry: '', specification: '',
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const subs = useMemo(() => assetSubsystems.filter((s) => s.systemId === f.systemId), [f.systemId]);
  const types = useMemo(() => assetTypes.filter((t) => t.subsystemId === f.subsystemId), [f.subsystemId]);

  /** dd/mm/yyyy date picker helper bound to a stored 'YYYY-MM-DD' string. */
  const dateField = (k: keyof typeof f, label: string) => (
    <DatePicker
      label={label}
      format="DD/MM/YYYY"
      value={f[k] ? dayjs(f[k] as string) : null}
      onChange={(v: Dayjs | null) => set(k, v ? v.format('YYYY-MM-DD') : '')}
      slotProps={{ textField: { fullWidth: true } }}
    />
  );

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Name is required.';
    if (!f.code.trim()) e.code = 'Code is required.';
    else if (spareParts.some((p) => p.code.toLowerCase() === f.code.toLowerCase())) e.code = 'A spare part with this code already exists.';
    if (!f.systemId) e.systemId = 'Asset System is required.';
    if (!f.subsystemId) e.subsystemId = 'Asset Sub-system is required.';
    if (!f.typeId) e.typeId = 'Asset Type is required.';
    if (Number(f.quantity) < 0) e.quantity = 'Quantity cannot be negative.';
    setErr(e); if (Object.keys(e).length) return;
    toast('Spare part created successfully.');
    setTimeout(() => navigate('/admin/inventory'), 600);
  };

  return (
    <Box>
      <PageHeader title="Create Spare Part" breadcrumbs={[{ label: 'Inventory', to: '/admin/inventory' }, { label: 'New Spare Part' }]} />
      <Stack spacing={2.5}>
        <SectionCard title="General Info">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required fullWidth label="Name" value={f.name} onChange={(e) => set('name', e.target.value)} error={!!err.name} helperText={err.name} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField required fullWidth label="Code" value={f.code} onChange={(e) => set('code', e.target.value)} error={!!err.code} helperText={err.code} /></Grid>
            <Grid size={{ xs: 12, sm: 3 }}><TextField select fullWidth label="Location" value={f.location} onChange={(e) => set('location', e.target.value)}><MenuItem value="">—</MenuItem>{STORE_LOCATIONS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 2 }}><TextField select fullWidth label="Status" value={f.status} onChange={(e) => set('status', e.target.value)}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset System" value={f.systemId} onChange={(e) => { set('systemId', e.target.value); set('subsystemId', ''); set('typeId', ''); }} error={!!err.systemId} helperText={err.systemId}>{assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset Sub-system" value={f.subsystemId} onChange={(e) => { set('subsystemId', e.target.value); set('typeId', ''); }} disabled={!f.systemId} error={!!err.subsystemId} helperText={err.subsystemId}>{subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField select required fullWidth label="Asset Type" value={f.typeId} onChange={(e) => set('typeId', e.target.value)} disabled={!f.subsystemId} error={!!err.typeId} helperText={err.typeId}>{types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</TextField></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Brand" value={f.brand} onChange={(e) => set('brand', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Model" value={f.model} onChange={(e) => set('model', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Serial" value={f.serial} onChange={(e) => set('serial', e.target.value)} /></Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Stock Info">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField required type="number" fullWidth label="Quantity" value={f.quantity} onChange={(e) => set('quantity', e.target.value)} error={!!err.quantity} helperText={err.quantity} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Department" value={f.department} onChange={(e) => set('department', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Store Room Location" value={f.storeRoom} onChange={(e) => set('storeRoom', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Origin" value={f.origin} onChange={(e) => set('origin', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>{dateField('purchaseDate', 'Purchase Date')}</Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Year of Manufacture" value={f.yearOfManufacture} onChange={(e) => set('yearOfManufacture', e.target.value)} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>{dateField('usageDate', 'Usage Date')}</Grid>
            <Grid size={{ xs: 12, sm: 4 }}>{dateField('warrantyExpiry', 'Warranty Expiry Date')}</Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Supporting Info">
          <Stack spacing={2}>
            <TextField fullWidth multiline minRows={3} label="Specification" value={f.specification} onChange={(e) => set('specification', e.target.value)} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" component="label">Upload Photos<input type="file" hidden multiple accept="image/*" onChange={() => toast('Photos selected (demo).')} /></Button>
              <Button variant="outlined" component="label">Upload Documents<input type="file" hidden multiple accept="application/pdf" onChange={() => toast('Documents selected (demo).')} /></Button>
            </Stack>
          </Stack>
        </SectionCard>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate('/admin/inventory')}>Cancel</Button>
          <Button variant="contained" onClick={save}>Create</Button>
        </Stack>
      </Stack>
      {node}
    </Box>
  );
}
