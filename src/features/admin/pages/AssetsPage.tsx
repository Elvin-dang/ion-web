/**
 * 1.5.12 Asset List + 1.5.16 Deactivate + 1.5.17 Download QR + 1.5.18 Bulk
 * Upload. DataGrid with Building / System / Status filters, search, [+ New
 * Asset], row actions (edit / deactivate / download QR), and a CSV bulk-upload
 * dialog (download template / upload / import summary).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import AdminStatusChip from '../components/AdminStatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useToast } from '../components/AdminToast';
import { assets as seed, assetSystems, buildings, systemName, typeName, buildingName, floorName, areaName } from '../data/mockData';
import type { Asset } from '../data/types';

export default function AssetsPage() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [list, setList] = useState<Asset[]>(() => seed.map((a) => ({ ...a })));
  const [search, setSearch] = useState('');
  const [bF, setBF] = useState('all');
  const [sF, setSF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [deactivate, setDeactivate] = useState<Asset | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<string>('');
  const [bulkResult, setBulkResult] = useState<{ imported: number; rejected: number } | null>(null);

  const rows = useMemo(() =>
    list
      .filter((a) => (bF === 'all' ? true : a.buildingId === bF))
      .filter((a) => (sF === 'all' ? true : a.systemId === sF))
      .filter((a) => (statusF === 'all' ? true : a.status === statusF))
      .filter((a) => `${a.name} ${a.code}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [list, bF, sF, statusF, search]);

  const cols: GridColDef<Asset>[] = [
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 170, renderCell: (p) => (
      <Link component="button" underline="hover" onClick={() => navigate(`/admin/assets/${p.row.id}`)} sx={{ fontWeight: 600 }}>{p.row.name}</Link>
    ) },
    { field: 'systemId', headerName: 'System', width: 130, valueGetter: (v) => systemName(v as string) },
    { field: 'typeId', headerName: 'Type', width: 140, valueGetter: (v) => typeName(v as string) },
    { field: 'buildingId', headerName: 'Building', width: 160, valueGetter: (v) => buildingName(v as string) },
    { field: 'floorId', headerName: 'Location', width: 150, renderCell: (p) => `${floorName(p.row.buildingId, p.row.floorId)} / ${areaName(p.row.buildingId, p.row.floorId, p.row.areaId)}` },
    { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'actions', headerName: 'Actions', width: 140, sortable: false, renderCell: (p) => (
      <Stack direction="row">
        <IconButton size="small" onClick={() => navigate(`/admin/assets/${p.row.id}/edit`)}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={() => toast(`${p.row.code}_QR.png downloaded.`)}><QrCode2Icon fontSize="small" /></IconButton>
        {p.row.status === 'Active' && <IconButton size="small" color="error" onClick={() => setDeactivate(p.row)}><BlockIcon fontSize="small" /></IconButton>}
      </Stack>
    ) },
  ];

  const runImport = () => {
    if (!bulkFile) { toast('Only CSV files are accepted.', 'error'); return; }
    setBulkResult({ imported: 8, rejected: 2 });
    toast('8 assets imported successfully.');
  };

  return (
    <Box>
      <PageHeader title="Assets" subtitle="Manage assets across all buildings." />
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by name or code"
        filters={
          <>
            <TextField select size="small" label="Building" value={bF} onChange={(e) => setBF(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Buildings</MenuItem>
              {buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Asset System" value={sF} onChange={(e) => setSF(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Systems</MenuItem>
              {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={statusF} onChange={(e) => setStatusF(e.target.value)} sx={{ minWidth: 130 }}>
              {['all', 'Active', 'Inactive'].map((s) => <MenuItem key={s} value={s}>{s === 'all' ? 'All' : s}</MenuItem>)}
            </TextField>
          </>
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => { setBulkResult(null); setBulkFile(''); setBulkOpen(true); }}>Bulk Upload</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/assets/new')}>New Asset</Button>
          </Stack>
        }
      />
      <Paper elevation={2} sx={{ borderRadius: '16px', height: 520 }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>

      <ConfirmDialog
        open={!!deactivate} title="Deactivate asset" destructive confirmLabel="Confirm"
        description={`Deactivate ${deactivate?.name}? The asset record and all history will be preserved.`}
        onConfirm={() => { setList((p) => p.map((a) => (a.id === deactivate?.id ? { ...a, status: 'Inactive' } : a))); setDeactivate(null); toast('Asset deactivated successfully.'); }}
        onClose={() => setDeactivate(null)}
      />

      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Asset (CSV Import)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Download the template, fill it in, then upload. Accepts CSV only · Max 10 MB.</Typography>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => toast('Template downloaded.')} sx={{ mb: 2 }}>Download Template</Button>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
              Choose CSV
              <input type="file" hidden accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0]?.name ?? '')} />
            </Button>
            <Typography variant="body2" color="text.secondary">{bulkFile || 'No file selected'}</Typography>
          </Box>
          {bulkResult && (
            <Alert severity={bulkResult.rejected ? 'warning' : 'success'} sx={{ mt: 2 }}>
              {bulkResult.imported} assets imported. {bulkResult.rejected} rows rejected.
              {bulkResult.rejected > 0 && <Button size="small" onClick={() => toast('Error report downloaded.')} sx={{ ml: 1 }}>Download Error Report</Button>}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setBulkOpen(false)}>Close</Button>
          <Button variant="contained" onClick={runImport} disabled={!bulkFile}>Upload</Button>
        </DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}
