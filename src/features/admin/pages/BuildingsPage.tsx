/**
 * 1.2.1–1.2.4 Building & Location Management — master/detail screen.
 * Left: searchable building list + count. Right: tabs (Floors & Areas /
 * As-Built Drawing / Info) with add/edit floors & areas, create/edit/delete
 * building dialogs, and deactivate via status.
 */
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { alpha } from '@mui/material/styles';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import {
  buildings as seedBuildings,
  users,
  userGroups,
  assets,
  systemName,
  subsystemName,
  typeName,
} from '../data/mockData';
import type { ActiveStatus, AreaUnit, Building, Floor } from '../data/types';

let uid = 1000;
const nid = (p: string) => `${p}-${uid++}`;

export default function BuildingsPage() {
  const { toast, node } = useToast();
  const [list, setList] = useState<Building[]>(() => seedBuildings.map((b) => ({ ...b })));
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  // dialogs
  const [bldDialog, setBldDialog] = useState<{ mode: 'create' | 'edit' } | null>(null);
  const [bldForm, setBldForm] = useState<{ name: string; address: string; status: ActiveStatus }>({ name: '', address: '', status: 'Active' });
  const [bldErr, setBldErr] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [floorDialog, setFloorDialog] = useState<{ mode: 'create' | 'edit'; floorId?: string } | null>(null);
  const [floorName, setFloorName] = useState('');
  const [areaDialog, setAreaDialog] = useState<{ floorId: string; areaId?: string } | null>(null);
  const [areaForm, setAreaForm] = useState<{ name: string; type: 'Area' | 'Unit' }>({ name: '', type: 'Area' });

  const filtered = useMemo(() => {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (!search.trim()) return sorted;
    return sorted.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  }, [list, search]);

  const selected = list.find((b) => b.id === selectedId) ?? null;
  const totalAreas = (b: Building) => b.floors.reduce((acc, f) => acc + f.areas.length, 0);

  /* ---- building CRUD ---- */
  const openCreate = () => { setBldForm({ name: '', address: '', status: 'Active' }); setBldErr(''); setBldDialog({ mode: 'create' }); };
  const openEdit = () => {
    if (!selected) return;
    setBldForm({ name: selected.name, address: selected.address, status: selected.status });
    setBldErr('');
    setBldDialog({ mode: 'edit' });
  };
  const saveBuilding = () => {
    const name = bldForm.name.trim();
    if (!name) { setBldErr('Building name is required.'); return; }
    if (name.length > 100) { setBldErr('Building name must not exceed 100 characters.'); return; }
    const dup = list.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== selectedId);
    if (dup) { setBldErr('A building with this name already exists.'); return; }
    if (bldDialog?.mode === 'create') {
      const nb: Building = { id: nid('BLD'), name, address: bldForm.address.trim(), status: bldForm.status, floors: [], hasDrawing: false };
      setList((p) => [...p, nb]);
      setSelectedId(nb.id);
      setTab(0);
      toast('Building created successfully.');
    } else {
      setList((p) => p.map((b) => (b.id === selectedId ? { ...b, name, address: bldForm.address.trim(), status: bldForm.status } : b)));
      toast('Building updated successfully.');
    }
    setBldDialog(null);
  };
  const deleteBuilding = () => {
    setList((p) => p.filter((b) => b.id !== selectedId));
    setSelectedId(null);
    setDelOpen(false);
    toast('Building deleted successfully.');
  };

  /* ---- floor CRUD ---- */
  const openAddFloor = () => { setFloorName(''); setFloorDialog({ mode: 'create' }); };
  const openEditFloor = (f: Floor) => { setFloorName(f.name); setFloorDialog({ mode: 'edit', floorId: f.id }); };
  const saveFloor = () => {
    if (!selected) return;
    const name = floorName.trim();
    if (!name) { toast('Floor name is required.', 'error'); return; }
    const dup = selected.floors.some((f) => f.name.toLowerCase() === name.toLowerCase() && f.id !== floorDialog?.floorId);
    if (dup) { toast('A floor with this name already exists in this building.', 'error'); return; }
    setList((p) => p.map((b) => {
      if (b.id !== selectedId) return b;
      if (floorDialog?.mode === 'create') {
        return { ...b, floors: [...b.floors, { id: nid('F'), name, areas: [], hasDrawing: false }] };
      }
      return { ...b, floors: b.floors.map((f) => (f.id === floorDialog?.floorId ? { ...f, name } : f)) };
    }));
    toast(floorDialog?.mode === 'create' ? 'Floor added.' : 'Floor updated successfully.');
    setFloorDialog(null);
  };
  const deleteFloor = (floorId: string) => {
    setList((p) => p.map((b) => (b.id === selectedId ? { ...b, floors: b.floors.filter((f) => f.id !== floorId) } : b)));
    toast('Floor removed.');
  };

  /* ---- area CRUD ---- */
  const openAddArea = (floorId: string) => { setAreaForm({ name: '', type: 'Area' }); setAreaDialog({ floorId }); };
  const openEditArea = (floorId: string, a: AreaUnit) => { setAreaForm({ name: a.name, type: a.type }); setAreaDialog({ floorId, areaId: a.id }); };
  const saveArea = () => {
    if (!selected || !areaDialog) return;
    const name = areaForm.name.trim();
    if (!name) { toast('Name is required.', 'error'); return; }
    setList((p) => p.map((b) => {
      if (b.id !== selectedId) return b;
      return {
        ...b,
        floors: b.floors.map((f) => {
          if (f.id !== areaDialog.floorId) return f;
          const dup = f.areas.some((a) => a.name.toLowerCase() === name.toLowerCase() && a.id !== areaDialog.areaId);
          if (dup) { toast('A location with this name already exists on this floor.', 'error'); return f; }
          if (areaDialog.areaId) {
            return { ...f, areas: f.areas.map((a) => (a.id === areaDialog.areaId ? { ...a, name, type: areaForm.type } : a)) };
          }
          return { ...f, areas: [...f.areas, { id: nid('A'), name, type: areaForm.type }] };
        }),
      };
    }));
    toast(areaDialog.areaId ? 'Area/Unit updated successfully.' : 'Area/Unit added.');
    setAreaDialog(null);
  };

  /* ---- per-floor as-built drawing (mock upload) ---- */
  const setFloorDrawing = (floorId: string, has: boolean) => {
    setList((p) => p.map((b) => {
      if (b.id !== selectedId) return b;
      const floors = b.floors.map((f) =>
        f.id === floorId
          ? { ...f, hasDrawing: has, drawingName: has ? `${b.id}-${f.name.replace(/\s+/g, '')}-asbuilt.pdf` : undefined }
          : f,
      );
      return { ...b, floors, hasDrawing: floors.some((f) => f.hasDrawing) };
    }));
    toast(has ? 'Drawing uploaded successfully.' : 'Drawing deleted successfully.');
  };

  /* ---- tenant sign-off configuration (building level) ---- */
  const toggleTenantSignOff = (enabled: boolean) => {
    setList((p) => p.map((b) => (b.id === selectedId ? { ...b, tenantSignOffEnabled: enabled } : b)));
    toast(enabled ? 'Tenant sign-off enabled.' : 'Tenant sign-off disabled.');
  };

  /* ---- Building Info derived data ---- */
  const managers = (b: Building) => (b.managerIds ?? []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const supervisors = (b: Building) => (b.supervisorIds ?? []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
  const supervisorGroup = (userId: string) => userGroups.find((g) => g.memberIds.includes(userId));
  const systemsInBuilding = (b: Building) => {
    const byId = new Map<string, { count: number; subsystems: Set<string>; types: Set<string> }>();
    assets.filter((a) => a.buildingId === b.id).forEach((a) => {
      const entry = byId.get(a.systemId) ?? { count: 0, subsystems: new Set<string>(), types: new Set<string>() };
      entry.count += 1;
      entry.subsystems.add(a.subsystemId);
      entry.types.add(a.typeId);
      byId.set(a.systemId, entry);
    });
    return [...byId.entries()].map(([systemId, v]) => ({ systemId, ...v }));
  };

  return (
    <Box>
      <PageHeader
        title="Buildings"
        subtitle="Manage buildings, floors and areas/units."
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Building</Button>}
      />

      <Grid container spacing={2.5}>
        {/* left list */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ borderRadius: 4, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{filtered.length} buildings</Typography>
            <TextField
              fullWidth size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1.5 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            {filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                {search ? 'No buildings match your search.' : 'No buildings. Click New Building to start.'}
              </Typography>
            ) : (
              <List disablePadding>
                {filtered.map((b) => (
                  <ListItemButton
                    key={b.id}
                    selected={b.id === selectedId}
                    onClick={() => { setSelectedId(b.id); setTab(0); }}
                    sx={{
                      borderRadius: 2, mb: 0.5, alignItems: 'flex-start',
                      borderLeft: b.id === selectedId ? '3px solid' : '3px solid transparent',
                      borderLeftColor: b.id === selectedId ? 'primary.main' : 'transparent',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={700} noWrap>{b.name}</Typography>
                        <AdminStatusChip status={b.status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {b.floors.length} floors · {b.address || 'No address'}
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
          <Paper elevation={2} sx={{ borderRadius: 4, p: 2.5, minHeight: 420 }}>
            {!selected ? (
              <EmptyState icon={<ApartmentIcon />} title="Select a building to view details" description="Pick a building from the list to manage its floors, areas and drawing." />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                  <Box>
                    <Typography variant="h5">{selected.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selected.floors.length} floors · {totalAreas(selected)} areas/units · {selected.address || 'No address'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={openEdit}>Edit</Button>
                    <IconButton color="error" onClick={() => setDelOpen(true)}><DeleteIcon /></IconButton>
                  </Stack>
                </Box>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                  <Tab label="Floors & Areas" />
                  <Tab label="As-Built Drawing" />
                  <Tab label="Info" />
                </Tabs>

                {tab === 0 && (
                  <Box>
                    <Button size="small" startIcon={<AddIcon />} onClick={openAddFloor} sx={{ mb: 1.5 }}>Add floor</Button>
                    {selected.floors.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No floors yet. Click Add floor to start.</Typography>
                    ) : (
                      selected.floors.map((f) => (
                        <Accordion key={f.id} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1, '&:before': { display: 'none' } }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                              <Typography fontWeight={600}>{f.name}</Typography>
                              <Chip size="small" label={`${f.areas.length} areas/units`} />
                              <Box sx={{ flex: 1 }} />
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditFloor(f); }}><EditIcon fontSize="small" /></IconButton>
                              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); deleteFloor(f.id); }}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {f.areas.map((a) => (
                                <Chip
                                  key={a.id}
                                  label={`${a.name} · ${a.type}`}
                                  onClick={() => openEditArea(f.id, a)}
                                  sx={{ borderRadius: 5 }}
                                />
                              ))}
                              <Chip
                                icon={<AddIcon />} label="Add" variant="outlined" onClick={() => openAddArea(f.id)}
                                sx={{ borderRadius: 5, borderStyle: 'dashed' }}
                              />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    )}
                  </Box>
                )}

                {tab === 1 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      As-built drawings are managed per floor. Each floor can have its own drawing.
                    </Typography>
                    {selected.floors.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No floors yet. Add floors first.</Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {selected.floors.map((f) => (
                          <Paper
                            key={f.id}
                            variant="outlined"
                            sx={{
                              borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
                              borderStyle: f.hasDrawing ? 'solid' : 'dashed',
                              backgroundColor: (t) => (f.hasDrawing ? alpha(t.palette.primary.main, 0.04) : 'transparent'),
                            }}
                          >
                            {f.hasDrawing ? <PictureAsPdfIcon color="primary" /> : <UploadFileIcon color="action" />}
                            <Box sx={{ flex: 1, minWidth: 160 }}>
                              <Typography fontWeight={600}>{f.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {f.hasDrawing ? f.drawingName ?? 'Drawing uploaded' : 'No drawing uploaded · PDF only · Max 50 MB'}
                              </Typography>
                            </Box>
                            {f.hasDrawing ? (
                              <Stack direction="row" spacing={1}>
                                <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setFloorDrawing(f.id, true)}>Replace</Button>
                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setFloorDrawing(f.id, false)}>Delete</Button>
                              </Stack>
                            ) : (
                              <Button size="small" variant="contained" startIcon={<UploadFileIcon />} onClick={() => setFloorDrawing(f.id, true)}>Upload Drawing</Button>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Box>
                )}

                {tab === 2 && (
                  <Box>
                    <Grid container spacing={2}>
                      {[
                        ['Building name', selected.name],
                        ['Status', selected.status],
                        ['Address', selected.address || '—'],
                        ['Total floors', String(selected.floors.length)],
                        ['Total areas/units', String(totalAreas(selected))],
                      ].map(([k, v]) => (
                        <Grid key={k} size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">{k}</Typography>
                          <Typography variant="body1" fontWeight={600}>{v}</Typography>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Tenant Sign-Off Configuration */}
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Tenant Sign-Off Configuration</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!selected.tenantSignOffEnabled}
                          onChange={(e) => toggleTenantSignOff(e.target.checked)}
                        />
                      }
                      label={selected.tenantSignOffEnabled ? 'Tenant sign-off required for completed work orders' : 'Tenant sign-off disabled'}
                    />

                    {/* Assigned Building Managers */}
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Assigned Building Managers</Typography>
                    {managers(selected).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No building managers assigned.</Typography>
                    ) : (
                      <Stack spacing={1}>
                        {managers(selected).map((u) => u && (
                          <Paper key={u.id} variant="outlined" sx={{ borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Box sx={{ flex: 1, minWidth: 180 }}>
                              <Typography fontWeight={600}>{u.fullName}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                            <AdminStatusChip status={u.status} />
                          </Paper>
                        ))}
                      </Stack>
                    )}

                    {/* Assigned MSP Supervisors */}
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Assigned MSP Supervisors</Typography>
                    {supervisors(selected).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No MSP supervisors assigned.</Typography>
                    ) : (
                      <Stack spacing={1}>
                        {supervisors(selected).map((u) => {
                          if (!u) return null;
                          const grp = supervisorGroup(u.id);
                          return (
                            <Paper key={u.id} variant="outlined" sx={{ borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              <Box sx={{ flex: 1, minWidth: 180 }}>
                                <Typography fontWeight={600}>{u.fullName}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  User Group: {grp?.name ?? '—'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                  {(grp?.systemIds ?? []).length === 0 ? (
                                    <Typography variant="caption" color="text.secondary">No systems in scope</Typography>
                                  ) : (
                                    grp!.systemIds.map((sid) => <Chip key={sid} size="small" label={systemName(sid)} />)
                                  )}
                                </Box>
                              </Box>
                              <AdminStatusChip status={u.status} />
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}

                    {/* Asset Systems under the building */}
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Asset Systems</Typography>
                    {systemsInBuilding(selected).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No assets registered in this building.</Typography>
                    ) : (
                      <Grid container spacing={1.5}>
                        {systemsInBuilding(selected).map((s) => (
                          <Grid key={s.systemId} size={{ xs: 12, sm: 6 }}>
                            <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5, height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography fontWeight={700}>{systemName(s.systemId)}</Typography>
                                <Chip size="small" label={`${s.count} asset${s.count === 1 ? '' : 's'}`} />
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">Sub-systems</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                {[...s.subsystems].map((id) => <Chip key={id} size="small" variant="outlined" label={subsystemName(id)} />)}
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">Types</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {[...s.types].map((id) => <Chip key={id} size="small" variant="outlined" label={typeName(id)} />)}
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* building create/edit dialog */}
      <Dialog open={!!bldDialog} onClose={() => setBldDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{bldDialog?.mode === 'create' ? 'New Building' : 'Edit Building'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Building Name" required value={bldForm.name} onChange={(e) => setBldForm((f) => ({ ...f, name: e.target.value }))} error={!!bldErr} helperText={bldErr} fullWidth />
            <TextField label="Address" value={bldForm.address} onChange={(e) => setBldForm((f) => ({ ...f, address: e.target.value }))} fullWidth />
            <TextField select label="Status" required value={bldForm.status} onChange={(e) => setBldForm((f) => ({ ...f, status: e.target.value as ActiveStatus }))} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setBldDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveBuilding}>{bldDialog?.mode === 'create' ? 'Create' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* floor dialog */}
      <Dialog open={!!floorDialog} onClose={() => setFloorDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{floorDialog?.mode === 'create' ? 'Add Floor' : 'Edit Floor'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Floor Name" required value={floorName} onChange={(e) => setFloorName(e.target.value)} fullWidth sx={{ mt: 0.5 }} />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setFloorDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveFloor}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* area dialog */}
      <Dialog open={!!areaDialog} onClose={() => setAreaDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{areaDialog?.areaId ? 'Edit Area/Unit' : 'Add Area/Unit'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <RadioGroup row value={areaForm.type} onChange={(e) => setAreaForm((f) => ({ ...f, type: e.target.value as 'Area' | 'Unit' }))}>
              <FormControlLabel value="Area" control={<Radio />} label="Area" />
              <FormControlLabel value="Unit" control={<Radio />} label="Unit" />
            </RadioGroup>
            <TextField label="Name" required value={areaForm.name} onChange={(e) => setAreaForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setAreaDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveArea}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={delOpen}
        title="Delete building"
        description={`Delete ${selected?.name}? All floors and areas/units will also be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={deleteBuilding}
        onClose={() => setDelOpen(false)}
      />
      {node}
    </Box>
  );
}
