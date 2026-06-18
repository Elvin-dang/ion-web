/**
 * 5.2 User Management — View MSP Technician List (5.2.1), Create (5.2.2),
 * Edit (5.2.3), Deactivate (5.2.4) and Resend Invitation. List scoped to the
 * Supervisor's own User Group. Create/Edit use a Drawer + RHF + Zod form.
 */
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import SendIcon from '@mui/icons-material/Send';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../components/useToast';
import { SUPERVISOR_PROFILE, technicians as seedTechnicians } from '../data/mockData';
import type { AccountStatus, Technician } from '../data/types';

const techSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.').max(100),
  fullName: z.string().min(1, 'Full name is required.').max(100),
  phone: z.string().optional(),
  level: z.string().max(50).optional(),
  workShift: z.string().optional(),
  team: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Pending']),
});
type TechForm = z.infer<typeof techSchema>;

export default function TechnicianListScreen() {
  const { toast, toastElement } = useToast();
  const [rows, setRows] = useState<Technician[]>(seedTechnicians);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AccountStatus>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Technician | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Technician | null>(null);
  const [resendTarget, setResendTarget] = useState<Technician | null>(null);

  const form = useForm<TechForm>({
    resolver: zodResolver(techSchema),
    defaultValues: { email: '', fullName: '', phone: '', level: '', workShift: '', team: '', status: 'Pending' },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ email: '', fullName: '', phone: '', level: '', workShift: '', team: '', status: 'Pending' });
    setDrawerOpen(true);
  };

  const openEdit = (t: Technician) => {
    setEditing(t);
    form.reset({
      email: t.email,
      fullName: t.name,
      phone: t.phone,
      level: t.level,
      workShift: t.workShift,
      team: t.team,
      status: t.status,
    });
    setDrawerOpen(true);
  };

  const onSubmit = (data: TechForm) => {
    if (editing) {
      setRows((prev) =>
        prev.map((t) =>
          t.id === editing.id
            ? { ...t, name: data.fullName, phone: data.phone ?? '', level: data.level ?? '', workShift: data.workShift ?? '', team: data.team ?? '', status: data.status }
            : t,
        ),
      );
      toast('MSP Technician account updated successfully.');
    } else {
      // Derive a unique id from existing rows inside the state updater so render
      // stays pure (no Date.now / module var / ref access).
      setRows((prev) => {
        const nextNum =
          prev.reduce((max, t) => Math.max(max, Number(/\d+$/.exec(t.id)?.[0] ?? 0)), 0) + 1;
        const newTech: Technician = {
          id: `tech-new-${nextNum}`,
          name: data.fullName,
          email: data.email,
          phone: data.phone ?? '',
          level: data.level ?? '',
          workShift: data.workShift ?? '',
          team: data.team ?? '',
          status: 'Pending',
          userGroup: SUPERVISOR_PROFILE.userGroup,
          createdDate: new Date().toISOString().slice(0, 10),
          avatar: '',
          activeWoCount: 0,
        };
        return [newTech, ...prev];
      });
      toast(`Account created. Invitation sent to ${data.email}.`);
    }
    setDrawerOpen(false);
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    setRows((prev) => prev.map((t) => (t.id === deactivateTarget.id ? { ...t, status: 'Inactive' as AccountStatus } : t)));
    toast('MSP Technician account deactivated successfully.');
    setDeactivateTarget(null);
  };

  const confirmResend = () => {
    if (!resendTarget) return;
    toast(`Invitation resent to ${resendTarget.email}.`);
    setResendTarget(null);
  };

  const filtered = useMemo(
    () =>
      rows.filter((t) => {
        const q = search.toLowerCase();
        const matchSearch = !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || t.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [rows, search, statusFilter],
  );

  const columns: GridColDef<Technician>[] = [
    { field: 'createdDate', headerName: 'Date', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'level', headerName: 'Level', width: 130 },
    { field: 'workShift', headerName: 'Work Shift', width: 160 },
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
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {p.row.status === 'Pending' && (
            <Tooltip title="Resend Invitation">
              <IconButton size="small" color="primary" onClick={() => setResendTarget(p.row)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {p.row.status === 'Active' && (
            <Tooltip title="Deactivate">
              <IconButton size="small" color="error" onClick={() => setDeactivateTarget(p.row)}>
                <BlockIcon fontSize="small" />
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
        title="MSP Technicians"
        subtitle={`Team members in ${SUPERVISOR_PROFILE.userGroup}`}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Technicians' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Technician
          </Button>
        }
      />

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
            onChange={(e) => setStatusFilter(e.target.value as 'All' | AccountStatus)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No Technicians in your group"
          description="Click [New Technician] to add one."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New Technician
            </Button>
          }
        />
      ) : (
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </Box>
      )}

      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTitle>{editing ? 'Edit MSP Technician' : 'Create MSP Technician'}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
              New Technician will be automatically assigned to your User Group: {SUPERVISOR_PROFILE.userGroup}
            </Alert>
            <Stack spacing={2}>
              <TextField
                label="Email"
                required
                fullWidth
                disabled={!!editing}
                {...form.register('email')}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
              />
              <TextField
                label="Full Name"
                required
                fullWidth
                {...form.register('fullName')}
                error={!!form.formState.errors.fullName}
                helperText={form.formState.errors.fullName?.message}
              />
              <TextField label="Phone Number" fullWidth {...form.register('phone')} />
              <TextField label="Level" fullWidth {...form.register('level')} />
              <TextField label="Work Shift" fullWidth {...form.register('workShift')} />
              <TextField label="Team" fullWidth {...form.register('team')} />
              <TextField label="User Group" fullWidth value={SUPERVISOR_PROFILE.userGroup} disabled />
              {editing && (
                <TextField select label="Status" required fullWidth defaultValue={editing.status} {...form.register('status')}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </TextField>
              )}
              <Button component="label" variant="outlined">
                Upload Avatar (max 2 MB)
                <input hidden type="file" accept="image/png,image/jpeg" />
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {editing && editing.status === 'Pending' && (
              <Button color="primary" startIcon={<SendIcon />} onClick={() => setResendTarget(editing)}>
                Resend Invitation
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editing ? 'Save' : 'Create & Send Invitation'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate Technician"
        description={`Are you sure you want to deactivate ${deactivateTarget?.name}? They will no longer be able to log in.`}
        confirmLabel="Confirm"
        destructive
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={!!resendTarget}
        title="Resend Invitation"
        description={`Resend the invitation email to ${resendTarget?.email}? The previous invitation link will be invalidated.`}
        confirmLabel="Resend"
        onConfirm={confirmResend}
        onClose={() => setResendTarget(null)}
      />
      {toastElement}
    </Box>
  );
}
