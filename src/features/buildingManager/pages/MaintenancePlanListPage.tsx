/**
 * 3.7.1 Maintenance Plan List + 3.7.3 Create Maintenance Plan.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
import { maintenancePlans as seed, buildings, ASSET_SYSTEMS, SUB_SYSTEMS, ASSET_TYPES, FREQUENCIES } from '../data/mockData';
import type { MaintenancePlan } from '../data/types';

const schema = z.object({
  name: z.string().min(1, 'Plan name is required.').max(150, 'Plan name must not exceed 150 characters.'),
  assetSystem: z.string().min(1, 'Asset System is required.'),
  subSystem: z.string().min(1, 'Asset Sub-system is required.'),
  assetType: z.string().min(1, 'Asset Type is required.'),
  buildingId: z.string().min(1, 'Building is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  timeRequired: z.string().min(1, 'Time required is required.'),
  description: z.string().max(500).optional().or(z.literal('')),
  remark: z.string().max(500).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

export default function MaintenancePlanListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<MaintenancePlan[]>(seed);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [systemFilter, setSystemFilter] = useState('All');
  const [freqFilter, setFreqFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approving, setApproving] = useState<MaintenancePlan | null>(null);
  const [toggling, setToggling] = useState<MaintenancePlan | null>(null);
  const [cancelling, setCancelling] = useState<MaintenancePlan | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPlan, setMenuPlan] = useState<MaintenancePlan | null>(null);
  const { show, node } = useToast();

  const openMenu = (e: React.MouseEvent<HTMLElement>, plan: MaintenancePlan) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuPlan(plan);
  };
  const closeMenu = () => { setMenuAnchor(null); setMenuPlan(null); };

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {} as FormValues,
  });
  const watchSystem = watch('assetSystem');
  const watchSub = watch('subSystem');

  const filtered = useMemo(
    () =>
      rows
        .filter((p) => (statusFilter === 'All' ? true : p.status === statusFilter))
        .filter((p) => (systemFilter === 'All' ? true : p.assetSystem === systemFilter))
        .filter((p) => (freqFilter === 'All' ? true : p.frequency === freqFilter))
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())),
    [rows, statusFilter, systemFilter, freqFilter, search],
  );

  const openCreate = () => {
    reset({ name: '', assetSystem: '', subSystem: '', assetType: '', buildingId: '', frequency: '', timeRequired: '', description: '', remark: '' });
    setDrawerOpen(true);
  };

  const onSubmit = (v: FormValues) => {
    const id = `MP-${300 + rows.length + 1}`;
    const next: MaintenancePlan = {
      id,
      name: v.name!,
      frequency: v.frequency as MaintenancePlan['frequency'],
      assetSystem: v.assetSystem!,
      subSystem: v.subSystem ?? '',
      assetType: v.assetType!,
      buildingId: v.buildingId!,
      timeRequired: v.timeRequired!,
      description: v.description ?? '',
      remark: v.remark ?? '',
      photos: 0,
      status: 'Active',
      createdBy: 'Building Manager',
      createdDate: new Date().toISOString().slice(0, 10),
      rounds: [],
      assets: [],
      workOrders: [],
      history: [{ timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: 'Plan created by Building Manager' }],
    };
    setRows((prev) => [next, ...prev]);
    show('Maintenance plan created successfully.');
    setDrawerOpen(false);
  };

  const columns: GridColDef<MaintenancePlan>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.4,
      minWidth: 220,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">{p.row.name}</Typography>
          <Chip size="small" label={p.row.frequency} variant="outlined" sx={{ borderRadius: 8 }} />
        </Stack>
      ),
    },
    {
      field: 'assetType',
      headerName: 'Asset Type',
      flex: 1.2,
      minWidth: 180,
      renderCell: (p) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2">{p.row.assetType}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            {p.row.subSystem} • {p.row.assetSystem}
          </Typography>
        </Box>
      ),
    },
    { field: 'buildingId', headerName: 'Building', flex: 1, minWidth: 130, valueGetter: (v) => buildingName(v as string) },
    { field: 'createdBy', headerName: 'Created By', flex: 1, minWidth: 160 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip status={p.value as string} /> },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (p) =>
        p.row.status === 'Cancelled' ? null : (
          <IconButton size="small" onClick={(e) => openMenu(e, p.row)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Maintenance Plans"
        subtitle="Plan and approve preventive maintenance for your buildings"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 8 }}>
            Create
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by plan name or ID"
        filters={
          <>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 130 }}>
              {['All', 'Pending', 'Active', 'Inactive', 'Cancelled'].map((s) => (<MenuItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="Asset System" value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="All">All Systems</MenuItem>
              {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="Frequency" value={freqFilter} onChange={(e) => setFreqFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="All">All Frequencies</MenuItem>
              {FREQUENCIES.map((f) => (<MenuItem key={f} value={f}>{f}</MenuItem>))}
            </TextField>
          </>
        }
        actions={<Typography variant="body2" color="text.secondary">{filtered.length} result(s)</Typography>}
      />

      <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(p) => navigate(`/bm/maintenance-plans/${p.row.id}`)}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ noRowsOverlay: () => <EmptyState title="No maintenance plans found." /> }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {menuPlan?.status === 'Pending' && (
          <MenuItem onClick={() => { setApproving(menuPlan); closeMenu(); }}>
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Approve Plan</ListItemText>
          </MenuItem>
        )}
        {menuPlan?.status === 'Active' && (
          <MenuItem onClick={() => { setToggling(menuPlan); closeMenu(); }}>
            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        )}
        {menuPlan?.status === 'Inactive' && (
          <MenuItem onClick={() => { setToggling(menuPlan); closeMenu(); }}>
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            <ListItemText>Set Active</ListItemText>
          </MenuItem>
        )}
        {(menuPlan?.status === 'Active' || menuPlan?.status === 'Inactive') && (
          <MenuItem onClick={() => { setCancelling(menuPlan); closeMenu(); }}>
            <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Inactivate (Cancel)</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Create Plan (3.7.3) */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: { xs: 320, sm: 440 }, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Create Maintenance Plan</Typography>
          <TextField fullWidth required label="Plan Name" sx={{ mb: 2 }} {...register('name')} error={!!formState.errors.name} helperText={formState.errors.name?.message} />
          <TextField select fullWidth required label="Asset System" sx={{ mb: 2 }} value={watchSystem ?? ''} onChange={(e) => { setValue('assetSystem', e.target.value); setValue('subSystem', ''); setValue('assetType', ''); }} error={!!formState.errors.assetSystem} helperText={formState.errors.assetSystem?.message}>
            {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Asset Sub-system" sx={{ mb: 2 }} value={watchSub ?? ''} onChange={(e) => { setValue('subSystem', e.target.value); setValue('assetType', ''); }} disabled={!watchSystem} error={!!formState.errors.subSystem} helperText={formState.errors.subSystem?.message}>
            {(SUB_SYSTEMS[watchSystem] ?? []).map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Asset Type" sx={{ mb: 2 }} value={watch('assetType') ?? ''} onChange={(e) => setValue('assetType', e.target.value)} disabled={!watchSub} error={!!formState.errors.assetType} helperText={formState.errors.assetType?.message}>
            {(ASSET_TYPES[watchSub] ?? []).map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Building" sx={{ mb: 2 }} value={watch('buildingId') ?? ''} onChange={(e) => setValue('buildingId', e.target.value)} error={!!formState.errors.buildingId} helperText={formState.errors.buildingId?.message}>
            {buildings.map((b) => (<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Frequency" sx={{ mb: 2 }} value={watch('frequency') ?? ''} onChange={(e) => setValue('frequency', e.target.value)} error={!!formState.errors.frequency} helperText={formState.errors.frequency?.message}>
            {FREQUENCIES.map((f) => (<MenuItem key={f} value={f}>{f}</MenuItem>))}
          </TextField>
          <TextField fullWidth required label="Time Required to Complete" placeholder="e.g. 3 hours" sx={{ mb: 2 }} {...register('timeRequired')} error={!!formState.errors.timeRequired} helperText={formState.errors.timeRequired?.message} />
          <TextField fullWidth multiline rows={3} label="Description" sx={{ mb: 2 }} {...register('description')} />
          <TextField fullWidth multiline rows={2} label="Remark" sx={{ mb: 2 }} {...register('remark')} />
          <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ mb: 3, borderRadius: 8 }}>
            Photos (max 5MB each)
            <input hidden type="file" multiple accept="image/*" />
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>Create</Button>
            <Button color="inherit" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          </Stack>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={!!approving}
        title="Approve Maintenance Plan"
        description="Approve this maintenance plan? Work orders will begin generating automatically on the next scheduled cycle."
        confirmLabel="Approve"
        onConfirm={() => {
          if (approving) setRows((prev) => prev.map((p) => (p.id === approving.id ? { ...p, status: 'Active' } : p)));
          show('Maintenance plan approved successfully.');
          setApproving(null);
        }}
        onClose={() => setApproving(null)}
      />

      <ConfirmDialog
        open={!!toggling}
        title={toggling?.status === 'Active' ? 'Set Plan Inactive' : 'Set Plan Active'}
        description={toggling?.status === 'Active' ? 'Set this plan inactive? No new work orders will be generated until reactivated.' : 'Set this plan active again?'}
        destructive={toggling?.status === 'Active'}
        onConfirm={() => {
          if (toggling) {
            const ns = toggling.status === 'Active' ? 'Inactive' : 'Active';
            setRows((prev) => prev.map((p) => (p.id === toggling.id ? { ...p, status: ns } : p)));
            show(`Plan set ${ns.toLowerCase()} successfully.`);
          }
          setToggling(null);
        }}
        onClose={() => setToggling(null)}
      />

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel Maintenance Plan"
        description="Cancel this plan? This is a terminal action and the plan becomes read-only."
        destructive
        confirmLabel="Set Cancelled"
        onConfirm={() => {
          if (cancelling) {
            setRows((prev) => prev.map((p) => (p.id === cancelling.id ? { ...p, status: 'Cancelled' } : p)));
            show('Maintenance plan cancelled.');
          }
          setCancelling(null);
        }}
        onClose={() => setCancelling(null)}
      />
      {node}
    </Box>
  );
}
