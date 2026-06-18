/**
 * 3.2.1 - 3.2.8 User Management (Building Manager).
 * Tabs for MSP Supervisors and MSP Technicians, each with list (DataGrid),
 * create/edit drawer (RHF + Zod), deactivate/reactivate confirm, and resend invitation.
 */
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/shared';
import { staffAccounts, userGroups } from '../data/mockData';
import type { StaffAccount } from '../data/types';

const schema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.').max(100),
  fullName: z.string().min(1, 'Full name is required.').max(100),
  userGroup: z.string().min(1, 'Please assign a User Group.'),
  phone: z.string().max(20).optional().or(z.literal('')),
  level: z.string().max(50).optional().or(z.literal('')),
  workShift: z.string().max(50).optional().or(z.literal('')),
  team: z.string().max(50).optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive', 'Pending']),
});
type FormValues = z.infer<typeof schema>;

export default function UsersPage() {
  const [tab, setTab] = useState<'MSP Supervisor' | 'MSP Technician'>('MSP Supervisor');
  const [rows, setRows] = useState<StaffAccount[]>(staffAccounts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [deactivating, setDeactivating] = useState<StaffAccount | null>(null);
  const { show, node } = useToast();

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', fullName: '', userGroup: '', phone: '', level: '', workShift: '', team: '', status: 'Pending' },
  });

  const roleLabel = tab === 'MSP Supervisor' ? 'Supervisor' : 'Technician';

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => r.role === tab)
        .filter((r) => (statusFilter === 'All' ? true : r.status === statusFilter))
        .filter(
          (r) =>
            r.fullName.toLowerCase().includes(search.toLowerCase()) ||
            r.email.toLowerCase().includes(search.toLowerCase()),
        ),
    [rows, tab, statusFilter, search],
  );

  const openCreate = () => {
    setEditing(null);
    reset({ email: '', fullName: '', userGroup: '', phone: '', level: '', workShift: '', team: '', status: 'Pending' });
    setDrawerOpen(true);
  };

  const openEdit = (row: StaffAccount) => {
    setEditing(row);
    reset({
      email: row.email,
      fullName: row.fullName,
      userGroup: row.userGroup,
      phone: row.phone,
      level: row.level,
      workShift: row.workShift,
      team: row.team,
      status: row.status,
    });
    setDrawerOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...values } : r)));
      show(`MSP ${roleLabel} account updated successfully.`);
    } else {
      const id = `${tab === 'MSP Supervisor' ? 'SUP' : 'TEC'}-${String(rows.length + 1).padStart(3, '0')}`;
      const next: StaffAccount = {
        id,
        date: new Date().toISOString().slice(0, 10),
        fullName: values.fullName!,
        email: values.email!,
        phone: values.phone ?? '',
        userGroup: values.userGroup!,
        level: values.level ?? '',
        workShift: values.workShift ?? '',
        team: values.team ?? '',
        status: values.status!,
        role: tab,
        buildingId: 'B-01',
      };
      setRows((prev) => [next, ...prev]);
      show(`Account created. Invitation sent to ${values.email}.`);
    }
    setDrawerOpen(false);
  };

  const confirmDeactivate = () => {
    if (!deactivating) return;
    const newStatus = deactivating.status === 'Active' ? 'Inactive' : 'Active';
    setRows((prev) => prev.map((r) => (r.id === deactivating.id ? { ...r, status: newStatus } : r)));
    show(`MSP ${roleLabel} account ${newStatus === 'Inactive' ? 'deactivated' : 'updated'} successfully.`);
    setDeactivating(null);
  };

  const columns: GridColDef<StaffAccount>[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    { field: 'userGroup', headerName: 'User Group', flex: 1, minWidth: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => <StatusChip status={p.value as string} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={p.row.status === 'Active' ? 'Deactivate' : 'Reactivate'}>
            <IconButton size="small" onClick={() => setDeactivating(p.row)}>
              {p.row.status === 'Active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" color="success" />}
            </IconButton>
          </Tooltip>
          {p.row.status === 'Pending' && (
            <Tooltip title="Resend Invitation">
              <IconButton size="small" onClick={() => show(`Invitation resent to ${p.row.email}.`)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage MSP Supervisor and Technician accounts for your buildings"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 8 }}>
            New {roleLabel}
          </Button>
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="MSP Supervisors" value="MSP Supervisor" />
        <Tab label="MSP Technicians" value="MSP Technician" />
      </Tabs>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email"
        filters={
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {['All', 'Active', 'Inactive', 'Pending'].map((s) => (
              <MenuItem key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </MenuItem>
            ))}
          </TextField>
        }
        actions={<Typography variant="body2" color="text.secondary">{filtered.length} result(s)</Typography>}
      />

      <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{
            noRowsOverlay: () => (
              <EmptyState title={`No MSP ${roleLabel}s found for your buildings.`} description="Create a User Group first to assign accounts." />
            ),
          }}
        />
      </Box>

      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Edit MSP ${roleLabel}` : `Create MSP ${roleLabel}`}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56 }}>{watch('fullName')?.[0] ?? '?'}</Avatar>
            <Button variant="outlined" component="label" size="small" startIcon={<PhotoCameraIcon />} sx={{ borderRadius: 8 }}>
              Avatar (max 2MB)
              <input hidden type="file" accept="image/png,image/jpeg" />
            </Button>
          </Stack>

          <TextField
            fullWidth
            label="Email"
            required
            disabled={!!editing}
            sx={{ mb: 2 }}
            {...register('email')}
            error={!!formState.errors.email}
            helperText={editing ? 'Email cannot be changed' : formState.errors.email?.message}
          />
          <TextField
            fullWidth
            label="Full Name"
            required
            sx={{ mb: 2 }}
            {...register('fullName')}
            error={!!formState.errors.fullName}
            helperText={formState.errors.fullName?.message}
          />
          <TextField
            select
            fullWidth
            label="User Group"
            required
            sx={{ mb: 2 }}
            value={watch('userGroup')}
            onChange={(e) => setValue('userGroup', e.target.value, { shouldValidate: true })}
            error={!!formState.errors.userGroup}
            helperText={formState.errors.userGroup?.message}
          >
            {userGroups.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Phone Number" sx={{ mb: 2 }} {...register('phone')} />
          <TextField fullWidth label="Level" sx={{ mb: 2 }} {...register('level')} />
          <TextField fullWidth label="Work Shift" sx={{ mb: 2 }} {...register('workShift')} />
          <TextField fullWidth label="Team" sx={{ mb: 2 }} {...register('team')} />
          {editing && (
            <TextField
              select
              fullWidth
              label="Status"
              required
              sx={{ mb: 2 }}
              value={watch('status')}
              onChange={(e) => setValue('status', e.target.value as FormValues['status'])}
            >
              {['Active', 'Inactive', 'Pending'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          )}
          {editing?.status === 'Pending' && (
            <Button
              startIcon={<SendIcon />}
              onClick={() => show(`Invitation resent to ${editing.email}.`)}
              sx={{ mb: 2, borderRadius: 8 }}
            >
              Resend Invitation
            </Button>
          )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button color="inherit" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>
              {editing ? 'Save' : 'Create & Send Invitation'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deactivating}
        title={deactivating?.status === 'Active' ? `Deactivate ${roleLabel}` : `Reactivate ${roleLabel}`}
        description={
          deactivating?.status === 'Active'
            ? `Are you sure you want to deactivate ${deactivating?.fullName}? They will no longer be able to log in.`
            : `Reactivate ${deactivating?.fullName}? They will be able to log in again immediately.`
        }
        destructive={deactivating?.status === 'Active'}
        confirmLabel="Confirm"
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />
      {node}
    </Box>
  );
}
