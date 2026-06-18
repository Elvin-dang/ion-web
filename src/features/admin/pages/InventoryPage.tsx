/**
 * 1.6 Inventory & Spare Part Management — tabbed hub:
 *  - Spare Parts (1.6.5 list, 1.6.9 deactivate, 1.6.17 low-stock banner)
 *  - Categories (1.6.1–1.6.4 CRUD)
 *  - Stock-In (1.6.10 record, 1.6.11 history)
 *  - Stock-Out (1.6.12/1.6.13 system-triggered history)
 *  - On-Hold (1.6.14 reservations + manual release)
 *  - Unavailable (1.6.15 monitoring)
 *  - Usage per WO (1.6.16)
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
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import BlockIcon from '@mui/icons-material/Block';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import ConfirmDialog from '../../../components/ConfirmDialog';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import {
  spareParts as seedParts, spareCategories as seedCats, stockInRecords, stockOutRecords, onHoldRecords,
  unavailableRecords, usageRecords, categoryName, typeName, partName, buildingName,
} from '../data/mockData';
import type { SparePart, SparePartCategory } from '../data/types';

const fmtDate = (v: unknown) => new Date(v as string).toLocaleDateString();

/* ----- Spare Parts ----- */
function PartsTab() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [list, setList] = useState<SparePart[]>(() => seedParts.map((p) => ({ ...p })));
  const [search, setSearch] = useState('');
  const [deactivate, setDeactivate] = useState<SparePart | null>(null);
  const lowStock = list.filter((p) => p.status === 'Active' && p.totalStock < p.minThreshold);

  const rows = useMemo(() =>
    list.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [list, search]);

  const cols: GridColDef<SparePart>[] = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 170, renderCell: (p) => <Link component="button" underline="hover" onClick={() => navigate(`/admin/inventory/parts/${p.row.id}`)} sx={{ fontWeight: 600 }}>{p.row.name}</Link> },
    { field: 'typeId', headerName: 'Asset Type', width: 150, valueGetter: (v) => typeName(v as string) },
    { field: 'storeRoom', headerName: 'Store Room', width: 160 },
    { field: 'available', headerName: 'Available', width: 100, valueGetter: (_v, r) => r.totalStock - r.onHold },
    { field: 'totalStock', headerName: 'Total', width: 80 },
    { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'actions', headerName: 'Actions', width: 80, sortable: false, renderCell: (p) => p.row.status === 'Active' ? <IconButton size="small" color="error" onClick={() => setDeactivate(p.row)}><BlockIcon fontSize="small" /></IconButton> : null },
  ];

  return (
    <Box>
      {lowStock.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Low stock alert: {lowStock.map((p) => `${p.name} (${p.totalStock}/${p.minThreshold})`).join(', ')}.
        </Alert>
      )}
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by ID or asset name"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/inventory/parts/new')}>Create</Button>}
      />
      <Paper elevation={2} sx={{ borderRadius: 4, height: 500 }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      <ConfirmDialog
        open={!!deactivate} title="Deactivate spare part" destructive confirmLabel="Confirm"
        description={`Deactivate ${deactivate?.name}? It will no longer be available for new Work Order requests.`}
        onConfirm={() => { setList((p) => p.map((x) => (x.id === deactivate?.id ? { ...x, status: 'Inactive' } : x))); setDeactivate(null); toast('Spare part deactivated successfully.'); }}
        onClose={() => setDeactivate(null)}
      />
      {node}
    </Box>
  );
}

/* ----- Categories ----- */
function CategoriesTab() {
  const { toast, node } = useToast();
  const [list, setList] = useState<SparePartCategory[]>(() => seedCats.map((c) => ({ ...c })));
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; row?: SparePartCategory } | null>(null);
  const [form, setForm] = useState<Partial<SparePartCategory>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const [del, setDel] = useState<SparePartCategory | null>(null);
  let uid = 9000;

  const rows = list.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Category name is required.';
    if (!form.code?.trim()) e.code = 'Code is required.';
    if (!form.uom?.trim()) e.uom = 'Unit of Measure is required.';
    setErr(e); if (Object.keys(e).length) return;
    if (dialog?.mode === 'create') { setList((p) => [...p, { id: `SPC-${uid++}`, name: form.name!, code: form.code!, uom: form.uom!, description: form.description ?? '' }]); toast('Category created successfully.'); }
    else { setList((p) => p.map((c) => (c.id === dialog?.row?.id ? { ...c, ...form } as SparePartCategory : c))); toast('Category updated successfully.'); }
    setDialog(null);
  };

  const cols: GridColDef<SparePartCategory>[] = [
    { field: 'name', headerName: 'Category Name', flex: 1, minWidth: 160 },
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'uom', headerName: 'Unit of Measure', width: 150 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    { field: 'actions', headerName: 'Actions', width: 110, sortable: false, renderCell: (p) => (
      <Stack direction="row">
        <IconButton size="small" onClick={() => { setForm(p.row); setErr({}); setDialog({ mode: 'edit', row: p.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={() => setDel(p.row)}><DeleteIcon fontSize="small" /></IconButton>
      </Stack>
    ) },
  ];

  return (
    <Box>
      <DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search by name or code"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({}); setErr({}); setDialog({ mode: 'create' }); }}>New Category</Button>} />
      <Paper elevation={2} sx={{ borderRadius: 4, height: 480 }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog?.mode === 'create' ? 'New Category' : 'Edit Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Category Name" required value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={!!err.name} helperText={err.name} fullWidth />
            <TextField label="Category Code" required value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} error={!!err.code} helperText={err.code} fullWidth />
            <TextField label="Unit of Measure" required value={form.uom ?? ''} onChange={(e) => setForm((f) => ({ ...f, uom: e.target.value }))} error={!!err.uom} helperText={err.uom} fullWidth />
            <TextField label="Description" value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} multiline minRows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions><Button color="inherit" onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <ConfirmDialog open={!!del} title="Delete category" destructive confirmLabel="Delete"
        description={`Delete ${del?.name}? This cannot be undone.`}
        onConfirm={() => { setList((p) => p.filter((c) => c.id !== del?.id)); setDel(null); toast('Category deleted successfully.'); }} onClose={() => setDel(null)} />
      {node}
    </Box>
  );
}

/* ----- Stock-In ----- */
function StockInTab() {
  const { toast, node } = useToast();
  const [records, setRecords] = useState(stockInRecords.map((r) => ({ ...r })));
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<{ partId: string; quantity: string; date: string; reference: string }>({ partId: '', quantity: '', date: '2026-06-17', reference: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  let uid = 9500;

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.partId) e.partId = 'Please select a spare part.';
    if (!form.quantity) e.quantity = 'Quantity is required.';
    else if (Number(form.quantity) < 1) e.quantity = 'Quantity must be at least 1.';
    if (!form.date) e.date = 'Stock-In date is required.';
    setErr(e); if (Object.keys(e).length) return;
    setRecords((p) => [{ id: `SI-${uid++}`, date: new Date(form.date).toISOString(), partId: form.partId, quantity: Number(form.quantity), reference: form.reference, recordedBy: 'Nguyen Van An' }, ...p]);
    toast('Stock-in recorded successfully.'); setDialog(false);
  };

  const cols: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: fmtDate },
    { field: 'partId', headerName: 'Spare Part', flex: 1, minWidth: 160, valueGetter: (v) => partName(v as string) },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    { field: 'reference', headerName: 'Source Reference', flex: 1, minWidth: 160 },
    { field: 'recordedBy', headerName: 'Recorded By', width: 160 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ partId: '', quantity: '', date: '2026-06-17', reference: '' }); setErr({}); setDialog(true); }}>New Stock-In</Button>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 4, height: 480 }}>
        <DataGrid rows={records} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Stock-In</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField select label="Spare Part" required value={form.partId} onChange={(e) => setForm((f) => ({ ...f, partId: e.target.value }))} error={!!err.partId} helperText={err.partId} fullWidth>
              {seedParts.filter((p) => p.status === 'Active').map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <TextField type="number" label="Quantity" required value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} error={!!err.quantity} helperText={err.quantity} fullWidth />
            <TextField type="date" label="Stock-In Date" required InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} error={!!err.date} helperText={err.date} fullWidth />
            <TextField label="Source Reference" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions><Button color="inherit" onClick={() => setDialog(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}

function StockOutTab() {
  const navigate = useNavigate();
  const cols: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: fmtDate },
    { field: 'partId', headerName: 'Spare Part', flex: 1, minWidth: 150, valueGetter: (v) => partName(v as string) },
    { field: 'quantity', headerName: 'Quantity', width: 90 },
    { field: 'woId', headerName: 'WO ID', width: 120, renderCell: (p) => <Link component="button" underline="hover" onClick={() => navigate('/admin/maintenance-plans')}>{p.value as string}</Link> },
    { field: 'reference', headerName: 'Request Ref', flex: 1, minWidth: 150 },
    { field: 'processedBy', headerName: 'Processed By', width: 130 },
    { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
  ];
  return (
    <Paper elevation={2} sx={{ borderRadius: 4, height: 500 }}>
      <DataGrid rows={stockOutRecords} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
    </Paper>
  );
}

function OnHoldTab() {
  const { toast, node } = useToast();
  const [records, setRecords] = useState(onHoldRecords.map((r) => ({ ...r })));
  const [release, setRelease] = useState<string | null>(null);
  const cols: GridColDef[] = [
    { field: 'partId', headerName: 'Spare Part', flex: 1, minWidth: 160, valueGetter: (v) => partName(v as string) },
    { field: 'quantity', headerName: 'Reserved Qty', width: 120 },
    { field: 'woId', headerName: 'WO ID', width: 120 },
    { field: 'reservedDate', headerName: 'Reserved Date', width: 140, valueFormatter: fmtDate },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'actions', headerName: 'Actions', width: 110, sortable: false, renderCell: (p) => p.row.status === 'Active' ? <Button size="small" onClick={() => setRelease(p.row.id)}>Release</Button> : null },
  ];
  return (
    <Box>
      <Paper elevation={2} sx={{ borderRadius: 4, height: 500 }}>
        <DataGrid rows={records} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      <ConfirmDialog open={!!release} title="Release reservation" confirmLabel="Confirm"
        description="Manually release this On-Hold reservation? This cannot be undone."
        onConfirm={() => { setRecords((p) => p.map((r) => (r.id === release ? { ...r, status: 'Released' } : r))); setRelease(null); toast('On-Hold released.'); }} onClose={() => setRelease(null)} />
      {node}
    </Box>
  );
}

function UnavailableTab() {
  const cols: GridColDef[] = [
    { field: 'woId', headerName: 'WO ID', width: 120 },
    { field: 'partId', headerName: 'Spare Part', flex: 1, minWidth: 150, valueGetter: (v) => partName(v as string) },
    { field: 'requestedQty', headerName: 'Requested', width: 110 },
    { field: 'availableQty', headerName: 'Available', width: 110 },
    { field: 'shortage', headerName: 'Shortage', width: 100, valueGetter: (_v, r) => r.requestedQty - r.availableQty },
    { field: 'buildingId', headerName: 'Building', width: 170, valueGetter: (v) => buildingName(v as string) },
    { field: 'status', headerName: 'Status', width: 180, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'dateFlagged', headerName: 'Date Flagged', width: 140, valueFormatter: fmtDate },
  ];
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>Read-only monitoring view. BM actions (Approve Continuation / Wait for Restock) are taken in the BM portal.</Alert>
      <Paper elevation={2} sx={{ borderRadius: 4, height: 460 }}>
        <DataGrid rows={unavailableRecords} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
    </Box>
  );
}

function UsageTab() {
  const cols: GridColDef[] = [
    { field: 'woId', headerName: 'WO ID', width: 110 },
    { field: 'partId', headerName: 'Spare Part', flex: 1, minWidth: 140, valueGetter: (v) => partName(v as string) },
    { field: 'category', headerName: 'Category', width: 130, valueGetter: (_v, r) => categoryName(seedParts.find((p) => p.id === r.partId)?.categoryId ?? '') },
    { field: 'plannedQty', headerName: 'Planned', width: 90 },
    { field: 'actualQty', headerName: 'Actual', width: 90 },
    { field: 'variance', headerName: 'Variance', width: 100, valueGetter: (_v, r) => r.actualQty - r.plannedQty },
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: fmtDate },
    { field: 'technician', headerName: 'Technician', width: 150 },
  ];
  return (
    <Paper elevation={2} sx={{ borderRadius: 4, height: 500 }}>
      <DataGrid rows={usageRecords} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
    </Paper>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <PageHeader title="Inventory" subtitle="Spare parts, categories and stock transactions." />
      <Paper elevation={2} sx={{ borderRadius: 4, mb: 2.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
          <Tab label="Spare Parts" /><Tab label="Categories" /><Tab label="Stock-In" /><Tab label="Stock-Out" /><Tab label="On-Hold" /><Tab label="Unavailable" /><Tab label="Usage per WO" />
        </Tabs>
      </Paper>
      {tab === 0 && <PartsTab />}
      {tab === 1 && <CategoriesTab />}
      {tab === 2 && <StockInTab />}
      {tab === 3 && <StockOutTab />}
      {tab === 4 && <OnHoldTab />}
      {tab === 5 && <UnavailableTab />}
      {tab === 6 && <UsageTab />}
    </Box>
  );
}
