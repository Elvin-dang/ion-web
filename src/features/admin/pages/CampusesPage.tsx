/**
 * 1.2 Building & Location Management — Campus management (master/detail).
 *
 * Campus is an OPTIONAL grouping of Buildings for organization / navigation /
 * filtering / reporting only. It is NOT an operational scope and never affects
 * permissions, user groups, assets, inventory, requests, work orders,
 * maintenance plans or any other module. Buildings remain the operational entity.
 *
 * Left: searchable campus list + count. Right: campus info, the buildings that
 * belong to it (read-only — assignment happens on the Building form), and
 * create / edit / archive / restore actions.
 */
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DomainIcon from '@mui/icons-material/Domain';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { campuses as seedCampuses, buildings as seedBuildings } from '../data/mockData';
import type { Campus } from '../data/types';

let uid = 2000;
const nid = (p: string) => `${p}-${uid++}`;

export default function CampusesPage() {
  const { toast, node } = useToast();
  const [list, setList] = useState<Campus[]>(() => seedCampuses.map((c) => ({ ...c })));
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit' } | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; description: string }>({ name: '', code: '', description: '' });
  const [err, setErr] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const filtered = useMemo(() => {
    const sorted = [...list].sort((a, b) => {
      // Active first, then alphabetical — archived sink to the bottom.
      if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((c) => c.name.toLowerCase().includes(q) || (c.code ?? '').toLowerCase().includes(q));
  }, [list, search]);

  const selected = list.find((c) => c.id === selectedId) ?? null;

  /** Buildings assigned to a campus (read from the building mock — assignment is on the Building form). */
  const buildingsIn = (campusId: string) => seedBuildings.filter((b) => b.campusId === campusId);

  /* ---- CRUD ---- */
  const openCreate = () => { setForm({ name: '', code: '', description: '' }); setErr(''); setDialog({ mode: 'create' }); };
  const openEdit = () => {
    if (!selected) return;
    setForm({ name: selected.name, code: selected.code ?? '', description: selected.description ?? '' });
    setErr('');
    setDialog({ mode: 'edit' });
  };
  const save = () => {
    const name = form.name.trim();
    if (!name) { setErr('Campus name is required.'); return; }
    if (name.length > 100) { setErr('Campus name must not exceed 100 characters.'); return; }
    const dup = list.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== selectedId);
    if (dup) { setErr('A campus with this name already exists.'); return; }
    const code = form.code.trim();
    const description = form.description.trim();
    if (dialog?.mode === 'create') {
      const nc: Campus = { id: nid('CMP'), name, code: code || undefined, description: description || undefined, status: 'Active', createdAt: new Date().toISOString().slice(0, 10) };
      setList((p) => [...p, nc]);
      setSelectedId(nc.id);
      toast('Campus created successfully.');
    } else {
      setList((p) => p.map((c) => (c.id === selectedId ? { ...c, name, code: code || undefined, description: description || undefined } : c)));
      toast('Campus updated successfully.');
    }
    setDialog(null);
  };
  const setStatus = (status: Campus['status']) => {
    setList((p) => p.map((c) => (c.id === selectedId ? { ...c, status } : c)));
    setArchiveOpen(false);
    toast(status === 'Archived' ? 'Campus archived.' : 'Campus restored.');
  };

  return (
    <Box>
      <PageHeader
        title="Campuses"
        subtitle="Optional grouping of buildings for organization, navigation and reporting. Not an operational scope."
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Campus</Button>}
      />

      <Grid container spacing={2.5}>
        {/* left list */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ borderRadius: '16px', p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{filtered.length} campuses</Typography>
            <TextField
              fullWidth size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1.5 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            {filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {search ? 'No campuses match your search.' : 'No campuses. Click New Campus to start.'}
              </Typography>
            ) : (
              <List disablePadding>
                {filtered.map((c) => (
                  <ListItemButton
                    key={c.id}
                    selected={c.id === selectedId}
                    onClick={() => setSelectedId(c.id)}
                    sx={{
                      borderRadius: 2, mb: 0.5, alignItems: 'flex-start',
                      borderLeft: '3px solid',
                      borderLeftColor: c.id === selectedId ? 'primary.main' : 'transparent',
                      opacity: c.status === 'Archived' ? 0.6 : 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={700} noWrap>{c.name}</Typography>
                        <AdminStatusChip status={c.status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {c.code ? `${c.code} · ` : ''}{buildingsIn(c.id).length} buildings
                      </Typography>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* right detail */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ borderRadius: '16px', p: 2.5, minHeight: 420 }}>
            {!selected ? (
              <EmptyState icon={<DomainIcon />} title="Select a campus to view details" description="Pick a campus from the list to see its buildings and manage it." />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5">{selected.name}</Typography>
                      <AdminStatusChip status={selected.status} size="medium" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selected.code ? `${selected.code} · ` : ''}{buildingsIn(selected.id).length} buildings · Created {selected.createdAt}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={openEdit}>Edit</Button>
                    {selected.status === 'Active' ? (
                      <Button color="warning" variant="outlined" startIcon={<ArchiveIcon />} onClick={() => setArchiveOpen(true)}>Archive</Button>
                    ) : (
                      <Button color="success" variant="outlined" startIcon={<UnarchiveIcon />} onClick={() => setStatus('Active')}>Restore</Button>
                    )}
                  </Stack>
                </Box>

                {selected.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{selected.description}</Typography>
                )}

                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Buildings in this Campus</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Buildings are assigned to a campus from the Building form. Campus grouping is for organization only.
                </Typography>
                {buildingsIn(selected.id).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No buildings assigned to this campus.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {buildingsIn(selected.id).map((b) => (
                      <Paper key={b.id} variant="outlined" sx={{ borderRadius: '16px', p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <ApartmentIcon color="action" />
                        <Box sx={{ flex: 1, minWidth: 180 }}>
                          <Typography fontWeight={600}>{b.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{b.floors.length} floors · {b.address || 'No address'}</Typography>
                        </Box>
                        <AdminStatusChip status={b.status} />
                      </Paper>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* create/edit dialog */}
      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.mode === 'create' ? 'New Campus' : 'Edit Campus'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Campus Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!err} helperText={err} fullWidth />
            <TextField label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} fullWidth multiline minRows={2} />
            {dialog?.mode === 'create' && (
              <Chip icon={<DomainIcon />} label="New campuses start Active" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{dialog?.mode === 'create' ? 'Create' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={archiveOpen}
        title="Archive campus"
        description={`Archive ${selected?.name}? It will be hidden from new building assignments. Buildings already in this campus keep their grouping and remain fully operational. You can restore it later.`}
        confirmLabel="Archive"
        onConfirm={() => setStatus('Archived')}
        onClose={() => setArchiveOpen(false)}
      />
      {node}
    </Box>
  );
}
