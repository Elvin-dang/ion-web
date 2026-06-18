/**
 * 3.6.1 Spare Part List + 3.6.3 Create + 3.6.5 Deactivate/Reactivate.
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/shared';
import { spareParts as seed, ASSET_SYSTEMS, SUB_SYSTEMS, ASSET_TYPES } from '../data/mockData';
import type { SparePart } from '../data/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  code: z.string().min(1, 'Code is required.').max(50),
  assetSystem: z.string().min(1, 'Asset System is required.'),
  subSystem: z.string().min(1, 'Asset Sub-system is required.'),
  assetType: z.string().min(1, 'Asset Type is required.'),
  brand: z.string().max(100).optional().or(z.literal('')),
  model: z.string().max(100).optional().or(z.literal('')),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative.'),
  department: z.string().max(100).optional().or(z.literal('')),
  storeRoom: z.string().max(255).optional().or(z.literal('')),
  origin: z.string().max(100).optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  yearOfManufacture: z.string().optional().or(z.literal('')),
  usageDate: z.string().optional().or(z.literal('')),
  warrantyExpiry: z.string().optional().or(z.literal('')),
  specification: z.string().max(1000).optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']),
});
type FormValues = z.infer<typeof schema>;

export default function SparePartListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SparePart[]>(seed);
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<SparePart | null>(null);
  const { show, node } = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active', quantity: 0 } as FormValues,
  });
  const watchSystem = watch('assetSystem');
  const watchSub = watch('subSystem');

  const filtered = useMemo(
    () =>
      rows
        .filter((s) => (systemFilter === 'All' ? true : s.assetSystem === systemFilter))
        .filter((s) => (statusFilter === 'All' ? true : s.status === statusFilter))
        .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())),
    [rows, systemFilter, statusFilter, search],
  );

  const openCreate = () => {
    reset({ name: '', code: '', assetSystem: '', subSystem: '', assetType: '', brand: '', model: '', serialNumber: '', quantity: 0, department: '', storeRoom: '', origin: '', purchaseDate: '', yearOfManufacture: '', usageDate: '', warrantyExpiry: '', specification: '', status: 'Active' });
    setDrawerOpen(true);
  };

  const onSubmit = (v: FormValues) => {
    if (rows.some((s) => s.code === v.code)) {
      show('A spare part with this code already exists.', 'error');
      return;
    }
    const next: SparePart = {
      id: v.code!,
      code: v.code!,
      name: v.name!,
      assetSystem: v.assetSystem!,
      subSystem: v.subSystem!,
      assetType: v.assetType!,
      brand: v.brand ?? '',
      model: v.model ?? '',
      serialNumber: v.serialNumber ?? '',
      quantity: v.quantity!,
      totalStock: v.quantity!,
      available: v.quantity!,
      onHold: 0,
      department: v.department ?? '',
      storeRoom: v.storeRoom ?? '',
      origin: v.origin ?? '',
      purchaseDate: v.purchaseDate ?? '',
      yearOfManufacture: v.yearOfManufacture ?? '',
      usageDate: v.usageDate ?? '',
      warrantyExpiry: v.warrantyExpiry ?? '',
      specification: v.specification ?? '',
      status: v.status!,
      buildingId: 'B-01',
      history: [{ timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), label: `Initial stock-in: ${v.quantity} units` }],
    };
    setRows((prev) => [next, ...prev]);
    show('Spare part created successfully.');
    setDrawerOpen(false);
  };

  const confirmDeactivate = () => {
    if (!deactivating) return;
    if (deactivating.status === 'Active' && deactivating.onHold > 0) {
      show('Cannot deactivate - active reservations exist. Resolve them first.', 'error');
      setDeactivating(null);
      return;
    }
    const ns = deactivating.status === 'Inactive' ? 'Active' : 'Inactive';
    setRows((prev) => prev.map((s) => (s.id === deactivating.id ? { ...s, status: ns } : s)));
    show(`Spare part ${ns === 'Inactive' ? 'deactivated' : 'activated'} successfully.`);
    setDeactivating(null);
  };

  const columns: GridColDef<SparePart>[] = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'assetType', headerName: 'Asset Type', flex: 1, minWidth: 160, valueGetter: (_, row) => `${row.assetType} (${row.subSystem} · ${row.assetSystem})` },
    { field: 'storeRoom', headerName: 'Store Room', width: 130 },
    { field: 'available', headerName: 'Available', width: 100, type: 'number' },
    { field: 'totalStock', headerName: 'Total', width: 90, type: 'number' },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip status={p.value as string} /> },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Tooltip title={p.row.status === 'Inactive' ? 'Reactivate' : 'Deactivate'}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeactivating(p.row); }}>
            {p.row.status === 'Inactive' ? <CheckCircleIcon fontSize="small" color="success" /> : <BlockIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Spare Parts"
        subtitle="Inventory of spare parts for your buildings"
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<SwapVertIcon />} onClick={() => navigate('/bm/stock-transactions')} sx={{ borderRadius: 8 }}>
              Stock Transactions
            </Button>
            <Button variant="outlined" startIcon={<ReportProblemIcon />} onClick={() => navigate('/bm/unavailable-requests')} sx={{ borderRadius: 8 }}>
              Unavailable Requests
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 8 }}>
              Create
            </Button>
          </Stack>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID or name"
        filters={
          <>
            <TextField select size="small" label="Asset System" value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Systems</MenuItem>
              {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              {['All', 'Active', 'Inactive'].map((s) => (<MenuItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</MenuItem>))}
            </TextField>
          </>
        }
        actions={<Typography variant="body2" color="text.secondary">{filtered.length} result(s)</Typography>}
      />

      <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: 4, p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(p) => navigate(`/bm/spare-parts/${p.row.id}`)}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ noRowsOverlay: () => <EmptyState title="No spare parts found." /> }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: { xs: 320, sm: 440 }, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Create Spare Part</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Part Identification</Typography>
          <TextField fullWidth required label="Name" sx={{ mb: 2 }} {...register('name')} error={!!formState.errors.name} helperText={formState.errors.name?.message} />
          <TextField fullWidth required label="Code" sx={{ mb: 2 }} {...register('code')} error={!!formState.errors.code} helperText={formState.errors.code?.message} />
          <TextField select fullWidth required label="Asset System" sx={{ mb: 2 }} value={watchSystem ?? ''} onChange={(e) => { setValue('assetSystem', e.target.value); setValue('subSystem', ''); setValue('assetType', ''); }} error={!!formState.errors.assetSystem} helperText={formState.errors.assetSystem?.message}>
            {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Asset Sub-system" sx={{ mb: 2 }} value={watchSub ?? ''} onChange={(e) => { setValue('subSystem', e.target.value); setValue('assetType', ''); }} disabled={!watchSystem} error={!!formState.errors.subSystem} helperText={formState.errors.subSystem?.message}>
            {(SUB_SYSTEMS[watchSystem] ?? []).map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Asset Type" sx={{ mb: 2 }} value={watch('assetType') ?? ''} onChange={(e) => setValue('assetType', e.target.value)} disabled={!watchSub} error={!!formState.errors.assetType} helperText={formState.errors.assetType?.message}>
            {(ASSET_TYPES[watchSub] ?? []).map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </TextField>
          <TextField fullWidth label="Brand" sx={{ mb: 2 }} {...register('brand')} />
          <TextField fullWidth label="Model" sx={{ mb: 2 }} {...register('model')} />
          <TextField fullWidth label="Serial Number" sx={{ mb: 2 }} {...register('serialNumber')} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Stock Info</Typography>
          <TextField fullWidth required type="number" label="Quantity" sx={{ mb: 2 }} {...register('quantity')} error={!!formState.errors.quantity} helperText={formState.errors.quantity?.message} />
          <TextField fullWidth label="Department" sx={{ mb: 2 }} {...register('department')} />
          <TextField fullWidth label="Store Room Location" sx={{ mb: 2 }} {...register('storeRoom')} />
          <TextField fullWidth label="Origin" sx={{ mb: 2 }} {...register('origin')} />
          <DatePicker
            label="Purchase Date"
            format="DD/MM/YYYY"
            value={watch('purchaseDate') ? dayjs(watch('purchaseDate')) : null}
            onChange={(d) => setValue('purchaseDate', d ? d.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <TextField fullWidth label="Year of Manufacture" sx={{ mb: 2 }} {...register('yearOfManufacture')} />
          <DatePicker
            label="Usage Date"
            format="DD/MM/YYYY"
            value={watch('usageDate') ? dayjs(watch('usageDate')) : null}
            onChange={(d) => setValue('usageDate', d ? d.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <DatePicker
            label="Warranty Expiry Date"
            format="DD/MM/YYYY"
            value={watch('warrantyExpiry') ? dayjs(watch('warrantyExpiry')) : null}
            onChange={(d) => setValue('warrantyExpiry', d ? d.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <TextField select fullWidth required label="Status" sx={{ mb: 2 }} value={watch('status') ?? 'Active'} onChange={(e) => setValue('status', e.target.value as FormValues['status'])}>
            {['Active', 'Inactive'].map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Supporting Info</Typography>
          <TextField fullWidth multiline rows={3} label="Specification" sx={{ mb: 2 }} {...register('specification')} />
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
              Photos
              <input hidden type="file" multiple accept="image/*" />
            </Button>
            <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
              Documents
              <input hidden type="file" multiple />
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>Create</Button>
            <Button color="inherit" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          </Stack>
        </Box>
      </Drawer>

      <ConfirmDialog
        open={!!deactivating}
        title={deactivating?.status === 'Inactive' ? 'Reactivate Spare Part' : 'Deactivate Spare Part'}
        description={deactivating?.status === 'Inactive' ? `Activate ${deactivating?.name}?` : `Deactivate ${deactivating?.name}? It will no longer be available for new Work Order requests.`}
        destructive={deactivating?.status !== 'Inactive'}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />
      {node}
    </Box>
  );
}
