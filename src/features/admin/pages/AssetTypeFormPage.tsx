/**
 * 1.5.9 Create Asset Type / 1.5.10 Edit Asset Type — full-page form with
 * header fields (Name / Code / System / Sub-system / Status) and a repeatable
 * Work Checklist (item name + Description Off/Optional/Required + Photos
 * Off/Optional/Required, removable).
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { assetTypes, assetSystems, assetSubsystems } from '../data/mockData';
import type { ActiveStatus, ChecklistItem } from '../data/types';

let uid = 8000;

export default function AssetTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const editing = Boolean(id);
  const existing = assetTypes.find((t) => t.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
  const [sys, setSys] = useState(existing?.systemId ?? '');
  const [sub, setSub] = useState(existing?.subsystemId ?? '');
  const [status, setStatus] = useState<ActiveStatus>(existing?.status ?? 'Active');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existing?.checklist.map((c) => ({ ...c })) ?? []);
  const [newItem, setNewItem] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});

  const subs = useMemo(() => assetSubsystems.filter((s) => s.systemId === sys), [sys]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setChecklist((p) => [...p, { id: `CL-${uid++}`, name: newItem.trim(), description: 'Optional', photos: 'Off' }]);
    setNewItem('');
  };
  const updateItem = (iid: string, key: 'description' | 'photos', val: string) =>
    setChecklist((p) => p.map((c) => (c.id === iid ? { ...c, [key]: val } : c)));
  const updateName = (iid: string, val: string) =>
    setChecklist((p) => p.map((c) => (c.id === iid ? { ...c, name: val } : c)));

  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Asset type name is required.';
    if (!code.trim()) e.code = 'Code is required.';
    if (!sys) e.sys = 'Asset System is required.';
    if (!sub) e.sub = 'Asset Sub-system is required.';
    checklist.forEach((c) => {
      if (!c.name.trim()) e[`cl-${c.id}`] = 'Checklist item name is required.';
    });
    setErr(e);
    if (Object.keys(e).length) return;
    toast(editing ? 'Asset type updated successfully.' : 'Asset type created successfully.');
    setTimeout(() => navigate('/admin/asset-types'), 600);
  };

  return (
    <Box>
      <PageHeader
        title={editing ? 'Edit Asset Type' : 'Add Asset Type'}
        breadcrumbs={[{ label: 'Asset Types', to: '/admin/asset-types' }, { label: editing ? name || 'Edit' : 'New' }]}
      />
      <Stack spacing={2.5}>
        <SectionCard title="Details">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Name" required fullWidth value={name} onChange={(e) => setName(e.target.value)} error={!!err.name} helperText={err.name} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Code" required fullWidth value={code} onChange={(e) => setCode(e.target.value)} error={!!err.code} helperText={err.code} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="System" required fullWidth value={sys} onChange={(e) => { setSys(e.target.value); setSub(''); }} error={!!err.sys} helperText={err.sys}>
                {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Sub-system" required fullWidth value={sub} onChange={(e) => setSub(e.target.value)} disabled={!sys} error={!!err.sub} helperText={err.sub}>
                {subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Status" fullWidth value={status} onChange={(e) => setStatus(e.target.value as ActiveStatus)}>
                <MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Work Checklist">
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField size="small" placeholder="Enter checklist item" fullWidth value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>Add</Button>
          </Box>
          {checklist.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No checklist items. This asset type can be created without a checklist.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {checklist.map((c, i) => (
                <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <Typography fontWeight={600} sx={{ pt: 2 }}>{i + 1}.</Typography>
                    <TextField
                      size="small"
                      required
                      fullWidth
                      label="Item Name"
                      value={c.name}
                      onChange={(e) => updateName(c.id, e.target.value)}
                      error={!!err[`cl-${c.id}`]}
                      helperText={err[`cl-${c.id}`]}
                    />
                    <IconButton size="small" sx={{ mt: 0.5 }} onClick={() => setChecklist((p) => p.filter((x) => x.id !== c.id))}><CloseIcon fontSize="small" /></IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField select size="small" label="Description" fullWidth value={c.description} onChange={(e) => updateItem(c.id, 'description', e.target.value)}>
                        {['Off', 'Optional', 'Required'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField select size="small" label="Photos" fullWidth value={c.photos} onChange={(e) => updateItem(c.id, 'photos', e.target.value)}>
                        {['Off', 'Optional', 'Required'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </SectionCard>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate('/admin/asset-types')}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </Stack>
      </Stack>
      {node}
    </Box>
  );
}
