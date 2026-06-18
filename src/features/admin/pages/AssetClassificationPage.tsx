/**
 * 1.5.1–1.5.7 Asset Classification — 2-panel System / Sub-system manager.
 * Left: searchable systems with create/edit/delete. Right: sub-systems of the
 * selected system with create/edit/delete (parent system read-only on edit).
 */
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../../../components/PageHeader';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { assetSystems as seedSys, assetSubsystems as seedSub, systemName } from '../data/mockData';
import type { ActiveStatus, AssetSubsystem, AssetSystem } from '../data/types';

let uid = 7000;

export default function AssetClassificationPage() {
  const { toast, node } = useToast();
  const [systems, setSystems] = useState<AssetSystem[]>(() => seedSys.map((s) => ({ ...s })));
  const [subs, setSubs] = useState<AssetSubsystem[]>(() => seedSub.map((s) => ({ ...s })));
  const [selSys, setSelSys] = useState<string | null>(null);
  const [sysSearch, setSysSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  const [sysDialog, setSysDialog] = useState<{ mode: 'create' | 'edit'; row?: AssetSystem } | null>(null);
  const [subDialog, setSubDialog] = useState<{ mode: 'create' | 'edit'; row?: AssetSubsystem } | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; status: ActiveStatus }>({ name: '', code: '', status: 'Active' });
  const [err, setErr] = useState('');
  const [del, setDel] = useState<{ kind: 'sys' | 'sub'; id: string; name: string } | null>(null);

  const sysList = useMemo(() =>
    [...systems].sort((a, b) => a.name.localeCompare(b.name)).filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(sysSearch.toLowerCase())),
  [systems, sysSearch]);

  const subList = useMemo(() => {
    if (!selSys) return [];
    return subs.filter((s) => s.systemId === selSys).filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(subSearch.toLowerCase()));
  }, [subs, selSys, subSearch]);

  const openSys = (mode: 'create' | 'edit', row?: AssetSystem) => {
    setForm(row ? { name: row.name, code: row.code, status: row.status } : { name: '', code: '', status: 'Active' });
    setErr(''); setSysDialog({ mode, row });
  };
  const saveSys = () => {
    if (!form.name.trim()) { setErr('System name is required.'); return; }
    if (form.name.length > 100) { setErr('System name must not exceed 100 characters.'); return; }
    if (!form.code.trim()) { setErr('Code is required.'); return; }
    if (systems.some((s) => s.name.toLowerCase() === form.name.toLowerCase() && s.id !== sysDialog?.row?.id)) { setErr('A system with this name already exists.'); return; }
    if (systems.some((s) => s.code.toLowerCase() === form.code.toLowerCase() && s.id !== sysDialog?.row?.id)) { setErr('A system with this code already exists.'); return; }
    if (sysDialog?.mode === 'create') {
      const ns: AssetSystem = { id: `SYS-${uid++}`, name: form.name.trim(), code: form.code.trim(), status: form.status, createdAt: new Date().toISOString() };
      setSystems((p) => [...p, ns]); setSelSys(ns.id); toast('Asset system created successfully.');
    } else {
      setSystems((p) => p.map((s) => (s.id === sysDialog?.row?.id ? { ...s, ...form } : s))); toast('Asset system updated successfully.');
    }
    setSysDialog(null);
  };

  const openSub = (mode: 'create' | 'edit', row?: AssetSubsystem) => {
    if (mode === 'create' && !selSys) { toast('Please select a parent system first.', 'error'); return; }
    setForm(row ? { name: row.name, code: row.code, status: row.status } : { name: '', code: '', status: 'Active' });
    setErr(''); setSubDialog({ mode, row });
  };
  const saveSub = () => {
    if (!form.name.trim()) { setErr('Sub-system name is required.'); return; }
    if (!form.code.trim()) { setErr('Code is required.'); return; }
    if (subs.some((s) => s.systemId === selSys && s.name.toLowerCase() === form.name.toLowerCase() && s.id !== subDialog?.row?.id)) { setErr('A sub-system with this name already exists in this system.'); return; }
    if (subs.some((s) => s.code.toLowerCase() === form.code.toLowerCase() && s.id !== subDialog?.row?.id)) { setErr('A sub-system with this code already exists.'); return; }
    if (subDialog?.mode === 'create') {
      const ns: AssetSubsystem = { id: `SUB-${uid++}`, name: form.name.trim(), code: form.code.trim(), status: form.status, systemId: selSys!, createdAt: new Date().toISOString() };
      setSubs((p) => [...p, ns]); toast('Asset sub-system created successfully.');
    } else {
      setSubs((p) => p.map((s) => (s.id === subDialog?.row?.id ? { ...s, ...form } : s))); toast('Asset sub-system updated successfully.');
    }
    setSubDialog(null);
  };

  const doDelete = () => {
    if (!del) return;
    if (del.kind === 'sys') { setSystems((p) => p.filter((s) => s.id !== del.id)); setSubs((p) => p.filter((s) => s.systemId !== del.id)); if (selSys === del.id) setSelSys(null); toast('Asset system deleted successfully.'); }
    else { setSubs((p) => p.filter((s) => s.id !== del.id)); toast('Asset sub-system deleted successfully.'); }
    setDel(null);
  };

  return (
    <Box>
      <PageHeader title="Asset Systems" subtitle="Organize asset systems and sub-systems." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ borderRadius: '16px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>System</Typography>
              <IconButton color="primary" onClick={() => openSys('create')}><AddIcon /></IconButton>
            </Box>
            <TextField fullWidth size="small" placeholder="Search systems..." value={sysSearch} onChange={(e) => setSysSearch(e.target.value)} sx={{ mb: 1.5 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            {sysList.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>{sysSearch ? 'No systems match your search.' : 'No asset systems. Click + to add one.'}</Typography>
            ) : (
              <List disablePadding>
                {sysList.map((s) => (
                  <ListItemButton key={s.id} selected={s.id === selSys} onClick={() => setSelSys(s.id)} sx={{ borderRadius: 2, mb: 0.5, borderLeft: '3px solid', borderLeftColor: s.id === selSys ? 'secondary.main' : 'transparent' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.code}</Typography>
                    </Box>
                    <AdminStatusChip status={s.status} />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); openSys('edit', s); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDel({ kind: 'sys', id: s.id, name: s.name }); }}><DeleteIcon fontSize="small" /></IconButton>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ borderRadius: '16px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>Sub-system</Typography>
              <IconButton color="primary" onClick={() => openSub('create')}><AddIcon /></IconButton>
            </Box>
            {!selSys ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Select a system to view its sub-systems.</Typography>
            ) : (
              <>
                <TextField fullWidth size="small" placeholder="Search sub-systems..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)} sx={{ mb: 1.5 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
                {subList.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No sub-systems. Click + to add one.</Typography>
                ) : (
                  <List disablePadding>
                    {subList.map((s) => (
                      <ListItemButton key={s.id} sx={{ borderRadius: 2, mb: 0.5 }} disableRipple>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{s.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.code} · {systemName(s.systemId)}</Typography>
                        </Box>
                        <AdminStatusChip status={s.status} />
                        <IconButton size="small" onClick={() => openSub('edit', s)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDel({ kind: 'sub', id: s.id, name: s.name })}><DeleteIcon fontSize="small" /></IconButton>
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* shared form dialog (system) */}
      <Dialog open={!!sysDialog} onClose={() => setSysDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{sysDialog?.mode === 'create' ? 'Create Asset System' : 'Edit Asset System'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="System Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!err} helperText={err} fullWidth />
            <TextField label="Code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ActiveStatus }))} fullWidth>
              <MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setSysDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveSys}>{sysDialog?.mode === 'create' ? 'Add' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* sub dialog */}
      <Dialog open={!!subDialog} onClose={() => setSubDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{subDialog?.mode === 'create' ? 'Create Asset Sub-system' : 'Edit Asset Sub-system'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="System" value={systemName(selSys ?? '')} disabled fullWidth />
            <TextField label="Sub-system Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!err} helperText={err} fullWidth />
            <TextField label="Code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ActiveStatus }))} fullWidth>
              <MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setSubDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveSub}>{subDialog?.mode === 'create' ? 'Add' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!del} title="Delete" destructive confirmLabel="Delete"
        description={`Delete ${del?.name}? This cannot be undone.`}
        onConfirm={doDelete} onClose={() => setDel(null)}
      />
      {node}
    </Box>
  );
}
