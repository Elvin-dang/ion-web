/**
 * 3.5.1 Asset List + 3.5.3 Create Asset + 3.5.4 Edit Asset + 3.5.5 Deactivate
 * + 3.5.6 Bulk Upload Asset (Building Manager).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
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
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
import { assets as seedAssets, buildings, ASSET_SYSTEMS, SUB_SYSTEMS, ASSET_TYPES, fullLocation } from '../data/mockData';
import type { Asset } from '../data/types';

const schema = z.object({
  assetSystem: z.string().min(1, 'Asset System is required.'),
  subSystem: z.string().optional().or(z.literal('')),
  assetType: z.string().min(1, 'Asset Type is required.'),
  buildingId: z.string().min(1, 'Building is required.'),
  floor: z.string().min(1, 'Floor is required.'),
  area: z.string().optional().or(z.literal('')),
  name: z.string().min(1, 'Asset name is required.').max(100),
  code: z.string().min(1, 'Asset code is required.').max(50),
  model: z.string().max(100).optional().or(z.literal('')),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
  brand: z.string().max(100).optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  manufacturedDate: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive', 'Under Maintenance']),
});
type FormValues = z.infer<typeof schema>;

export default function AssetListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Asset[]>(seedAssets);
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('All');
  const [systemFilter, setSystemFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [deactivating, setDeactivating] = useState<Asset | null>(null);
  const [locationMode, setLocationMode] = useState<'area' | 'unit'>('area');
  const { show, node } = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Active' } as FormValues,
  });

  const watchSystem = watch('assetSystem');
  const watchSub = watch('subSystem');
  const watchBuilding = watch('buildingId');

  const filtered = useMemo(
    () =>
      rows
        .filter((a) => (building === 'All' ? true : a.buildingId === building))
        .filter((a) => (systemFilter === 'All' ? true : a.assetSystem === systemFilter))
        .filter((a) => (statusFilter === 'All' ? true : a.status === statusFilter))
        .filter(
          (a) =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.code.toLowerCase().includes(search.toLowerCase()),
        ),
    [rows, building, systemFilter, statusFilter, search],
  );

  const openCreate = () => {
    setEditing(null);
    setLocationMode('area');
    reset({ assetSystem: '', subSystem: '', assetType: '', buildingId: '', floor: '', area: '', name: '', code: '', model: '', serialNumber: '', brand: '', purchaseDate: '', manufacturedDate: '', status: 'Active' });
    setDrawerOpen(true);
  };

  const openEdit = (a: Asset) => {
    setEditing(a);
    setLocationMode(/unit/i.test(a.area) ? 'unit' : 'area');
    reset({ ...a });
    setDrawerOpen(true);
  };

  const onSubmit = (v: FormValues) => {
    if (rows.some((a) => a.code === v.code && a.id !== editing?.id)) {
      show('This asset code already exists.', 'error');
      return;
    }
    if (editing) {
      setRows((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...v } : a)));
      show('Asset updated successfully.');
    } else {
      const next: Asset = {
        id: v.code!,
        name: v.name!,
        code: v.code!,
        assetSystem: v.assetSystem!,
        subSystem: v.subSystem ?? '',
        assetType: v.assetType!,
        buildingId: v.buildingId!,
        floor: v.floor!,
        area: v.area ?? '',
        model: v.model ?? '',
        serialNumber: v.serialNumber ?? '',
        brand: v.brand ?? '',
        purchaseDate: v.purchaseDate ?? '',
        manufacturedDate: v.manufacturedDate ?? '',
        status: v.status!,
        photos: 0,
        health: 90,
      };
      setRows((prev) => [next, ...prev]);
      show('Asset created successfully.');
    }
    setDrawerOpen(false);
  };

  const confirmDeactivate = () => {
    if (!deactivating) return;
    const ns = deactivating.status === 'Inactive' ? 'Active' : 'Inactive';
    setRows((prev) => prev.map((a) => (a.id === deactivating.id ? { ...a, status: ns } : a)));
    show(`Asset ${ns === 'Inactive' ? 'deactivated' : 'activated'} successfully.`);
    setDeactivating(null);
  };

  const columns: GridColDef<Asset>[] = [
    { field: 'code', headerName: 'Code', width: 140 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    {
      field: 'assetType',
      headerName: 'Type',
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
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      valueGetter: (_, row) => fullLocation(row.buildingId, row.floor, row.area),
    },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p) => <StatusChip status={p.value as string} /> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={p.row.status === 'Inactive' ? 'Reactivate' : 'Deactivate'}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeactivating(p.row); }}>
              {p.row.status === 'Inactive' ? <CheckCircleIcon fontSize="small" color="success" /> : <BlockIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const buildingFloors = buildings.find((b) => b.id === watchBuilding)?.floors ?? [];
  const allAreas = buildings.find((b) => b.id === watchBuilding)?.areas ?? [];
  // The Area/Unit toggle swaps the selector source: common areas vs. tenant units.
  const locationOptions = allAreas.filter((a) => (locationMode === 'unit' ? /unit/i.test(a) : !/unit/i.test(a)));

  return (
    <Box>
      <PageHeader
        title="Assets"
        subtitle="Manage assets across your assigned buildings"
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setBulkOpen(true)} sx={{ borderRadius: 8 }}>
              Bulk Upload
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 8 }}>
              New Asset
            </Button>
          </Stack>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or code"
        filters={
          <>
            <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Buildings</MenuItem>
              {buildings.map((b) => (<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="Asset System" value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Systems</MenuItem>
              {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </TextField>
            <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
              {['All', 'Active', 'Inactive', 'Under Maintenance'].map((s) => (<MenuItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</MenuItem>))}
            </TextField>
          </>
        }
      />

      <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          onRowClick={(p) => navigate(`/bm/assets/${p.row.id}`)}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ noRowsOverlay: () => <EmptyState title="No assets found." /> }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>

      {/* Create / Edit Asset */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: { xs: 320, sm: 440 }, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>{editing ? 'Edit Asset' : 'New Asset'}</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Classification</Typography>
          <TextField select fullWidth required label="Asset System" sx={{ mb: 2 }} value={watchSystem ?? ''} onChange={(e) => { setValue('assetSystem', e.target.value); setValue('subSystem', ''); setValue('assetType', ''); }} error={!!formState.errors.assetSystem} helperText={formState.errors.assetSystem?.message}>
            {ASSET_SYSTEMS.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth label="Asset Sub-system" sx={{ mb: 2 }} value={watchSub ?? ''} onChange={(e) => { setValue('subSystem', e.target.value); setValue('assetType', ''); }} disabled={!watchSystem}>
            {(SUB_SYSTEMS[watchSystem] ?? []).map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Asset Type" sx={{ mb: 2 }} value={watch('assetType') ?? ''} onChange={(e) => setValue('assetType', e.target.value)} disabled={!watchSub} error={!!formState.errors.assetType} helperText={formState.errors.assetType?.message}>
            {(ASSET_TYPES[watchSub] ?? []).map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
          </TextField>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Location</Typography>
          <TextField select fullWidth required label="Building" sx={{ mb: 2 }} value={watchBuilding ?? ''} onChange={(e) => { setValue('buildingId', e.target.value); setValue('floor', ''); }} error={!!formState.errors.buildingId} helperText={formState.errors.buildingId?.message}>
            {buildings.map((b) => (<MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>))}
          </TextField>
          <TextField select fullWidth required label="Floor" sx={{ mb: 2 }} value={watch('floor') ?? ''} onChange={(e) => setValue('floor', e.target.value)} disabled={!watchBuilding} error={!!formState.errors.floor} helperText={formState.errors.floor?.message}>
            {buildingFloors.map((f) => (<MenuItem key={f} value={f}>{f}</MenuItem>))}
          </TextField>
          <RadioGroup
            row
            value={locationMode}
            onChange={(e) => { setLocationMode(e.target.value as 'area' | 'unit'); setValue('area', ''); }}
            sx={{ mb: 1 }}
          >
            <FormControlLabel value="area" control={<Radio size="small" />} label="Common Area" />
            <FormControlLabel value="unit" control={<Radio size="small" />} label="Unit" />
          </RadioGroup>
          <TextField select fullWidth label={locationMode === 'unit' ? 'Unit' : 'Area'} sx={{ mb: 2 }} value={watch('area') ?? ''} onChange={(e) => setValue('area', e.target.value)} disabled={!watchBuilding}>
            {locationOptions.map((a) => (<MenuItem key={a} value={a}>{a}</MenuItem>))}
          </TextField>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Details</Typography>
          <TextField fullWidth required label="Asset Name" sx={{ mb: 2 }} {...register('name')} error={!!formState.errors.name} helperText={formState.errors.name?.message} />
          <TextField fullWidth required label="Asset Code" sx={{ mb: 2 }} {...register('code')} error={!!formState.errors.code} helperText={formState.errors.code?.message} />
          <TextField fullWidth label="Model" sx={{ mb: 2 }} {...register('model')} />
          <TextField fullWidth label="Serial Number" sx={{ mb: 2 }} {...register('serialNumber')} />
          <TextField fullWidth label="Brand" sx={{ mb: 2 }} {...register('brand')} />
          <DatePicker
            label="Purchase Date"
            format="DD/MM/YYYY"
            value={watch('purchaseDate') ? dayjs(watch('purchaseDate')) : null}
            onChange={(d) => setValue('purchaseDate', d ? d.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <DatePicker
            label="Manufactured Date"
            format="DD/MM/YYYY"
            value={watch('manufacturedDate') ? dayjs(watch('manufacturedDate')) : null}
            onChange={(d) => setValue('manufacturedDate', d ? d.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
          <TextField select fullWidth required label="Status" sx={{ mb: 2 }} value={watch('status') ?? 'Active'} onChange={(e) => setValue('status', e.target.value as FormValues['status'])}>
            {['Active', 'Inactive', 'Under Maintenance'].map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
          </TextField>
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
              Photos (max 5MB each)
              <input hidden type="file" multiple accept="image/*" />
            </Button>
            <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
              Relevant Documents
              <input hidden type="file" multiple accept=".pdf,.doc,.docx" />
            </Button>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>Save</Button>
            <Button color="inherit" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 8 }}>Cancel</Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Bulk Upload (3.5.6) */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Assets</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Download the template, fill in asset rows, then upload the completed CSV/XLSX file. Rows are validated before import.
          </Typography>
          <Button variant="text" sx={{ mb: 2 }} onClick={() => show('Template download started.')}>
            Download Template
          </Button>
          <Button fullWidth variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
            Choose File
            <input hidden type="file" accept=".csv,.xlsx" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { show('Assets imported successfully.'); setBulkOpen(false); }}>Upload</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deactivating}
        title={deactivating?.status === 'Inactive' ? 'Reactivate Asset' : 'Deactivate Asset'}
        description={deactivating?.status === 'Inactive' ? `Reactivate ${deactivating?.name}?` : `Deactivate ${deactivating?.name}? It will no longer be available for new work orders.`}
        destructive={deactivating?.status !== 'Inactive'}
        onConfirm={confirmDeactivate}
        onClose={() => setDeactivating(null)}
      />
      {node}
    </Box>
  );
}
