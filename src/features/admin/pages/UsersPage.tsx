/**
 * 1.3 User Management — three tabs:
 *  - Users (1.3.2–1.3.5): DataGrid + filters + create/edit dialog + deactivate
 *  - Roles (1.3.1): read-only predefined roles with expandable permissions
 *  - User Groups (1.3.6, 1.3.9): DataGrid + inline drawer + deactivate; create/
 *    edit handled by the dedicated UserGroupForm route (1.3.7, 1.3.8).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import DataTableToolbar from '../../../components/DataTableToolbar';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import {
  buildings,
  roles,
  userGroups as seedGroups,
  users as seedUsers,
  buildingName,
  systemName,
  userName,
} from '../data/mockData';
import type { AppUser, RoleName, UserGroup, UserStatus } from '../data/types';

const ROLE_OPTIONS: RoleName[] = ['Super Admin', 'Building Manager', 'MSP Supervisor', 'MSP Technician'];
const WORK_SHIFT_OPTIONS = ['Day (08:00-17:00)', 'Night (20:00-05:00)', 'Rotating'];
let uid = 5000;

/** Initials fallback for an avatar (first letters of first two words). */
function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
}

/* =========================== USERS TAB =========================== */
function UsersTab() {
  const { toast, node } = useToast();
  const [list, setList] = useState<AppUser[]>(() => seedUsers.map((u) => ({ ...u })));
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; user?: AppUser } | null>(null);
  const [form, setForm] = useState<Partial<AppUser>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [deactivate, setDeactivate] = useState<AppUser | null>(null);

  const rows = useMemo(() => {
    return list
      .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
      .filter((u) => (statusFilter === 'all' ? true : u.status === statusFilter))
      .filter((u) => `${u.fullName} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [list, roleFilter, statusFilter, search]);

  /** Resolve a building team's display name (for storing on the user profile). */
  const teamName = (bid?: string, tid?: string) =>
    buildings.find((b) => b.id === bid)?.teams?.find((t) => t.id === tid)?.name;
  /** Teams available under the currently-selected team building. */
  const teamOptions = buildings.find((b) => b.id === form.teamBuildingId)?.teams ?? [];

  const openCreate = () => { setForm({ role: 'Building Manager', status: 'Pending', buildingIds: [] }); setErr({}); setDialog({ mode: 'create' }); };
  const openEdit = (u: AppUser) => {
    setForm({ ...u, groupIds: u.groupIds ?? (u.groupId ? [u.groupId] : []) });
    setErr({});
    setDialog({ mode: 'edit', user: u });
  };

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.email?.trim()) e.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    else if (dialog?.mode === 'create' && list.some((u) => u.email.toLowerCase() === form.email!.toLowerCase())) e.email = 'An account with this email already exists.';
    if (!form.fullName?.trim()) e.fullName = 'Full name is required.';
    if (!form.role) e.role = 'Please select a role.';
    // Operational scope for ALL non-admin roles (incl. Building Manager) comes from User Groups.
    if (form.role !== 'Super Admin' && (!form.groupIds || form.groupIds.length === 0)) e.groupIds = 'Please assign at least one User Group.';
    setErr(e);
    if (Object.keys(e).length) return;

    if (dialog?.mode === 'create') {
      const nu: AppUser = {
        id: `USR-${uid++}`, fullName: form.fullName!.trim(), email: form.email!.trim(), role: form.role!, status: 'Pending',
        phone: form.phone, level: form.level, createdAt: new Date().toISOString(), buildingIds: form.buildingIds ?? [],
        groupIds: form.groupIds ?? [], groupId: form.groupIds?.[0],
        company: form.company, workShift: form.workShift,
        teamBuildingId: form.teamBuildingId, teamId: form.teamId, team: teamName(form.teamBuildingId, form.teamId),
        avatarUrl: form.avatarUrl,
      };
      setList((p) => [nu, ...p]);
      toast(`Account created. Invitation sent to ${nu.email}.`);
    } else {
      setList((p) => p.map((u) => (u.id === dialog?.user?.id ? { ...u, ...form, groupId: form.groupIds?.[0], team: teamName(form.teamBuildingId, form.teamId) } as AppUser : u)));
      toast('User account updated successfully.');
    }
    setDialog(null);
  };

  const cols: GridColDef<AppUser>[] = [
    { field: 'createdAt', headerName: 'Date', width: 120, valueFormatter: (v) => new Date(v as string).toLocaleDateString() },
    { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'role', headerName: 'Role', width: 150, renderCell: (p) => <Chip size="small" label={p.value} /> },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    {
      field: 'actions', headerName: 'Actions', width: 150, sortable: false, filterable: false,
      renderCell: (p) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => openEdit(p.row)}><EditIcon fontSize="small" /></IconButton>
          {p.row.status === 'Pending' && <IconButton size="small" onClick={() => toast(`Invitation resent to ${p.row.email}.`)}><SendIcon fontSize="small" /></IconButton>}
          {p.row.status === 'Active' && <IconButton size="small" color="error" onClick={() => setDeactivate(p.row)}><BlockIcon fontSize="small" /></IconButton>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by name or email"
        filters={
          <>
            <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All Roles</MenuItem>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              {['all', 'Active', 'Inactive', 'Suspended', 'Pending'].map((s) => <MenuItem key={s} value={s}>{s === 'all' ? 'All' : s}</MenuItem>)}
            </TextField>
          </>
        }
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New User</Button>}
      />
      <Typography variant="caption" color="text.secondary">{rows.length} results</Typography>
      <Paper elevation={2} sx={{ borderRadius: '16px', mt: 1, height: 520 }}>
        <DataGrid
          rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick
          pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { fontWeight: 700 } }}
        />
      </Paper>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog?.mode === 'create' ? 'Create User Account' : 'Edit User Account'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Email" required value={form.email ?? ''} disabled={dialog?.mode === 'edit'} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={!!err.email} helperText={err.email} fullWidth />
            <TextField label="Full Name" required value={form.fullName ?? ''} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} error={!!err.fullName} helperText={err.fullName} fullWidth />
            <TextField select label="Role" required value={form.role ?? ''} disabled={dialog?.mode === 'edit'} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleName }))} error={!!err.role} helperText={err.role} fullWidth>
              {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {form.role !== 'Super Admin' && (
              <TextField
                select label="User Groups" required fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (selected as string[]).map((gid) => seedGroups.find((g) => g.id === gid)?.name ?? gid).join(', '),
                }}
                value={form.groupIds ?? []}
                onChange={(e) => setForm((f) => ({ ...f, groupIds: e.target.value as unknown as string[] }))}
                error={!!err.groupIds}
                helperText={err.groupIds || 'Assign one or more groups. Operational scope (buildings & asset systems) is granted through the User Group(s).'}
              >
                {seedGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    <Checkbox checked={(form.groupIds ?? []).includes(g.id)} size="small" sx={{ py: 0 }} />
                    <ListItemText primary={g.name} />
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField label="Company Name" value={form.company ?? ''} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} fullWidth />
            <TextField label="Phone Number" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} fullWidth />
            <TextField label="Level" value={form.level ?? ''} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} fullWidth />
            <TextField select label="Work Shift" value={form.workShift ?? ''} onChange={(e) => setForm((f) => ({ ...f, workShift: e.target.value }))} fullWidth>
              <MenuItem value="">—</MenuItem>
              {WORK_SHIFT_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            {/* Team assignment: pick a Building, then one of its predefined Teams (no free-text). */}
            <Stack direction="row" spacing={2}>
              <TextField select label="Team Building" value={form.teamBuildingId ?? ''} onChange={(e) => setForm((f) => ({ ...f, teamBuildingId: e.target.value, teamId: undefined }))} fullWidth helperText="Select a building to list its teams.">
                <MenuItem value="">—</MenuItem>
                {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </TextField>
              <TextField select label="Team" value={form.teamId ?? ''} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))} fullWidth disabled={!form.teamBuildingId} helperText={form.teamBuildingId && teamOptions.length === 0 ? 'No teams defined for this building.' : ' '}>
                <MenuItem value="">—</MenuItem>
                {teamOptions.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={form.avatarUrl || undefined} sx={{ width: 56, height: 56 }}>{initials(form.fullName)}</Avatar>
              <TextField label="Avatar URL" value={form.avatarUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} fullWidth helperText="Paste an image URL, or leave blank to use initials." />
            </Stack>
            {dialog?.mode === 'edit' && (
              <TextField select label="Status" value={form.status ?? 'Active'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserStatus }))} fullWidth>
                {['Active', 'Inactive', 'Suspended', 'Pending'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{dialog?.mode === 'create' ? 'Create & Send Invitation' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deactivate} title="Deactivate user"
        description={`Are you sure you want to deactivate ${deactivate?.fullName}? They will no longer be able to log in.`}
        confirmLabel="Confirm" destructive
        onConfirm={() => { setList((p) => p.map((u) => (u.id === deactivate?.id ? { ...u, status: 'Inactive' } : u))); setDeactivate(null); toast('User account deactivated successfully.'); }}
        onClose={() => setDeactivate(null)}
      />
      {node}
    </Box>
  );
}

/* =========================== ROLES TAB =========================== */
function RolesTab() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Predefined system roles are read-only and cannot be edited.</Typography>
      {roles.map((r) => (
        <Accordion key={r.id} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography fontWeight={700}>{r.name}</Typography>
              <Typography variant="caption" color="text.secondary">{r.description}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2">Scope</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{r.scope}</Typography>
            <Typography variant="subtitle2">Permissions</Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
              {r.permissions.map((p) => <Typography key={p} variant="body2" color="text.secondary">• {p}</Typography>)}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

/* =========================== GROUPS TAB =========================== */
function GroupsTab() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [list, setList] = useState<UserGroup[]>(() => seedGroups.map((g) => ({ ...g })));
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [deactivate, setDeactivate] = useState<UserGroup | null>(null);

  const rows = list.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box>
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search group name..."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/user-groups/new')}>New Group</Button>}
      />
      <Typography variant="caption" color="text.secondary">{rows.length} results</Typography>
      {rows.length === 0 ? (
        <Typography color="text.secondary" sx={{ p: 3 }}>No user groups found. Click New Group to create one.</Typography>
      ) : (
        rows.map((g) => (
          <Paper key={g.id} elevation={2} sx={{ borderRadius: '16px', mb: 1.5, overflow: 'hidden' }}>
            <Box
              onClick={() => setOpenId(openId === g.id ? null : g.id)}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer', flexWrap: 'wrap' }}
            >
              <Typography fontWeight={700} sx={{ minWidth: 180 }}>{g.name}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
                {g.buildingIds.slice(0, 2).map((b) => <Chip key={b} size="small" label={buildingName(b)} />)}
                {g.buildingIds.length > 2 && <Chip size="small" label={`+${g.buildingIds.length - 2} more`} />}
              </Box>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
                {g.memberIds.map((m) => <Avatar key={m}>{userName(m).charAt(0)}</Avatar>)}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">{g.memberIds.length} members</Typography>
              <AdminStatusChip status={g.status} />
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/admin/user-groups/${g.id}`); }}><EditIcon fontSize="small" /></IconButton>
            </Box>
            <Collapse in={openId === g.id}>
              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2">{g.memberIds.length} members · {g.buildingIds.length} buildings · {g.systemIds.length} systems</Typography>
                  <IconButton size="small" onClick={() => setOpenId(null)}><CloseIcon fontSize="small" /></IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">Buildings in scope</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5, mt: 0.5 }}>
                  {g.buildingIds.length ? g.buildingIds.map((b) => <Chip key={b} size="small" label={buildingName(b)} />) : <Typography variant="body2" color="text.secondary">None</Typography>}
                </Box>
                <Typography variant="caption" color="text.secondary">Asset systems in scope</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5, mt: 0.5 }}>
                  {g.systemIds.length ? g.systemIds.map((s) => <Chip key={s} size="small" label={systemName(s)} />) : <Typography variant="body2" color="text.secondary">None</Typography>}
                </Box>
                <Typography variant="caption" color="text.secondary">Members</Typography>
                <Box sx={{ mt: 0.5, mb: 2 }}>
                  {g.memberIds.length ? g.memberIds.map((m) => (
                    <Box key={m} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{userName(m).charAt(0)}</Avatar>
                      <Typography variant="body2">{userName(m)}</Typography>
                    </Box>
                  )) : <Typography variant="body2" color="text.secondary">No members yet. Click Add member to add.</Typography>}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={() => navigate(`/admin/user-groups/${g.id}`)}>Edit group</Button>
                  {g.status === 'Active' && <Button size="small" color="error" onClick={() => setDeactivate(g)}>Deactivate</Button>}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        ))
      )}
      <ConfirmDialog
        open={!!deactivate} title="Deactivate user group"
        description={`Deactivate ${deactivate?.name}? Members will immediately lose access to this group's scope.`}
        confirmLabel="Confirm" destructive
        onConfirm={() => { setList((p) => p.map((g) => (g.id === deactivate?.id ? { ...g, status: 'Inactive' } : g))); setDeactivate(null); toast('User group deactivated.'); }}
        onClose={() => setDeactivate(null)}
      />
      {node}
    </Box>
  );
}

export default function UsersPage() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <PageHeader title="User Management" subtitle="Users, predefined roles and user groups." />
      <Paper elevation={2} sx={{ borderRadius: '16px', mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1 }}>
          <Tab label="Users" />
          <Tab label="Roles" />
          <Tab label="User Groups" />
        </Tabs>
      </Paper>
      {tab === 0 && <UsersTab />}
      {tab === 1 && <RolesTab />}
      {tab === 2 && <GroupsTab />}
    </Box>
  );
}
