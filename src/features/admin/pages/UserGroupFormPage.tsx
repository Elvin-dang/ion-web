/**
 * 1.3.7 Create User Group / 1.3.8 Edit User Group — full-page form with group
 * info, buildings & asset systems in scope (multi-select pill tags) and member
 * management (add/remove). Reachable from the User Groups tab.
 */
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { buildings, assetSystems, assetSubsystems, assetTypes, userGroups, users, userName } from '../data/mockData';
import type { ActiveStatus, AssetScopeEntry, LocationScopeEntry } from '../data/types';

/** Initials fallback for an avatar (first + last word initial). */
function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}

export default function UserGroupFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const editing = Boolean(id);
  const existing = userGroups.find((g) => g.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [status, setStatus] = useState<ActiveStatus>(existing?.status ?? 'Active');
  const [memberIds, setMemberIds] = useState<string[]>(existing?.memberIds ?? []);
  const [assetScopes, setAssetScopes] = useState<AssetScopeEntry[]>(existing?.assetScopes ?? []);
  const [locationScopes, setLocationScopes] = useState<LocationScopeEntry[]>(existing?.locationScopes ?? []);
  const [err, setErr] = useState('');

  // Stable incrementing counter for new scope-entry ids (no Date.now/Math.random).
  const scopeSeq = useRef(0);
  const nextId = (prefix: string) => `${prefix}-NEW-${scopeSeq.current++}`;

  const addAssetScope = () => setAssetScopes((p) => [...p, { id: nextId('ASC'), systemId: '', subsystemId: 'All', typeId: 'All' }]);
  const updateAssetScope = (id: string, patch: Partial<AssetScopeEntry>) =>
    setAssetScopes((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeAssetScope = (id: string) => setAssetScopes((p) => p.filter((e) => e.id !== id));

  const addLocationScope = () => setLocationScopes((p) => [...p, { id: nextId('LSC'), buildingId: '', floorId: 'All', areaId: 'All' }]);
  const updateLocationScope = (id: string, patch: Partial<LocationScopeEntry>) =>
    setLocationScopes((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeLocationScope = (id: string) => setLocationScopes((p) => p.filter((e) => e.id !== id));

  // members available = users not yet in any group (or already in this group)
  const available = users.filter((u) => (!u.groupId || u.groupId === id) && !memberIds.includes(u.id));

  const save = () => {
    if (!name.trim()) { setErr('Group name is required.'); return; }
    if (name.length > 100) { setErr('Group name must not exceed 100 characters.'); return; }
    setErr('');
    toast(editing ? 'User group updated successfully.' : 'User group created successfully.');
    setTimeout(() => navigate('/admin/users'), 600);
  };

  return (
    <Box>
      <PageHeader
        title={editing ? 'Edit User Group' : 'New User Group'}
        breadcrumbs={[{ label: 'User Management', to: '/admin/users' }, { label: editing ? 'Edit Group' : 'New Group' }]}
      />

      <Stack spacing={2.5}>
        <SectionCard title="Group Info">
          <Stack spacing={2}>
            <TextField label="Group Name" required value={name} onChange={(e) => setName(e.target.value)} error={!!err} helperText={err} fullWidth />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} fullWidth />
            <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ActiveStatus)} sx={{ maxWidth: 240 }}>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </SectionCard>

        <SectionCard title="Location Config" action={<Button size="small" startIcon={<AddIcon />} onClick={addLocationScope}>Add</Button>}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Members only see assets and WOs in these locations. Each entry is Building / Floor / Area (Unit); use “All” to cover everything below a level.
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {locationScopes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No location scope yet. Click Add to create one.</Typography>
            ) : locationScopes.map((entry) => {
              const bld = buildings.find((b) => b.id === entry.buildingId);
              const floors = bld?.floors ?? [];
              const areas = entry.floorId && entry.floorId !== 'All' ? (floors.find((f) => f.id === entry.floorId)?.areas ?? []) : [];
              return (
                <Paper key={entry.id} variant="outlined" sx={{ p: 1.5, borderRadius: '16px' }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField select size="small" label="Building" fullWidth value={entry.buildingId}
                        onChange={(e) => updateLocationScope(entry.id, { buildingId: e.target.value, floorId: 'All', areaId: 'All' })}>
                        {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3.5 }}>
                      <TextField select size="small" label="Floor" fullWidth value={entry.floorId} disabled={!entry.buildingId}
                        onChange={(e) => updateLocationScope(entry.id, { floorId: e.target.value, areaId: 'All' })}>
                        <MenuItem value="All">All Floors</MenuItem>
                        {floors.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3.5 }}>
                      <TextField select size="small" label="Area / Unit" fullWidth value={entry.areaId} disabled={!entry.floorId || entry.floorId === 'All'}
                        onChange={(e) => updateLocationScope(entry.id, { areaId: e.target.value })}>
                        <MenuItem value="All">All Areas</MenuItem>
                        {areas.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }} sx={{ textAlign: 'right' }}>
                      <Tooltip title="Remove entry">
                        <IconButton size="small" color="error" onClick={() => removeLocationScope(entry.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </SectionCard>

        <SectionCard title="Asset Config" action={<Button size="small" startIcon={<AddIcon />} onClick={addAssetScope}>Add</Button>}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Members only see assets and WOs in scope. Each entry is System / Sub-system / Type; use “All” to cover everything below a level.
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {assetScopes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No asset scope yet. Click Add to create one.</Typography>
            ) : assetScopes.map((entry) => {
              const subs = entry.systemId ? assetSubsystems.filter((s) => s.systemId === entry.systemId) : [];
              const types = entry.subsystemId && entry.subsystemId !== 'All' ? assetTypes.filter((t) => t.subsystemId === entry.subsystemId) : [];
              return (
                <Paper key={entry.id} variant="outlined" sx={{ p: 1.5, borderRadius: '16px' }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField select size="small" label="System" fullWidth value={entry.systemId}
                        onChange={(e) => updateAssetScope(entry.id, { systemId: e.target.value, subsystemId: 'All', typeId: 'All' })}>
                        {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3.5 }}>
                      <TextField select size="small" label="Sub-system" fullWidth value={entry.subsystemId} disabled={!entry.systemId}
                        onChange={(e) => updateAssetScope(entry.id, { subsystemId: e.target.value, typeId: 'All' })}>
                        <MenuItem value="All">All Sub-systems</MenuItem>
                        {subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3.5 }}>
                      <TextField select size="small" label="Type" fullWidth value={entry.typeId} disabled={!entry.subsystemId || entry.subsystemId === 'All'}
                        onChange={(e) => updateAssetScope(entry.id, { typeId: e.target.value })}>
                        <MenuItem value="All">All Types</MenuItem>
                        {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }} sx={{ textAlign: 'right' }}>
                      <Tooltip title="Remove entry">
                        <IconButton size="small" color="error" onClick={() => removeAssetScope(entry.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </SectionCard>

        <SectionCard title="Members">
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Each user can only belong to 1 group.</Typography>
          <TextField
            select label="Add member" value="" onChange={(e) => { if (e.target.value) setMemberIds((p) => [...p, e.target.value]); }}
            fullWidth sx={{ mt: 1.5, maxWidth: 320 }} disabled={available.length === 0}
            helperText={available.length === 0 ? 'No more available users' : ' '}
          >
            {available.map((u) => <MenuItem key={u.id} value={u.id}>{u.fullName} · {u.role}</MenuItem>)}
          </TextField>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            {memberIds.length === 0 ? (
              <Grid size={{ xs: 12 }}><Typography variant="body2" color="text.secondary">No members yet.</Typography></Grid>
            ) : memberIds.map((m) => {
              const u = users.find((x) => x.id === m);
              return (
                <Grid key={m} size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar src={u?.avatarUrl || undefined} sx={{ width: 44, height: 44, fontSize: 16 }}>{initials(u?.fullName ?? userName(m))}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" noWrap>{u?.fullName ?? userName(m)}</Typography>
                        {u?.role && <Chip size="small" label={u.role} color="primary" variant="outlined" />}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>{u?.email ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>{u?.phone || '—'}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setMemberIds((p) => p.filter((x) => x !== m))}><CloseIcon fontSize="small" /></IconButton>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </SectionCard>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate('/admin/users')}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </Stack>
      </Stack>
      {node}
    </Box>
  );
}
