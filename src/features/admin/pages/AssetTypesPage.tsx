/**
 * 1.5.8 View Asset Type List + 1.5.11 Deactivate Asset Type. DataGrid with
 * System / Sub-system / Status filters, search, [+ Add] and row deactivate.
 * Row click → Asset Type form (detail/edit). Add → form (create).
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
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { assetTypes as seed, assetSystems, assetSubsystems, systemName, subsystemName } from '../data/mockData';
import type { AssetType } from '../data/types';

export default function AssetTypesPage() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [list, setList] = useState<AssetType[]>(() => seed.map((t) => ({ ...t })));
  const [search, setSearch] = useState('');
  const [sysF, setSysF] = useState('all');
  const [subF, setSubF] = useState('all');
  const [statusF, setStatusF] = useState('all');

  const subs = sysF === 'all' ? assetSubsystems : assetSubsystems.filter((s) => s.systemId === sysF);

  const rows = useMemo(() =>
    list
      .filter((t) => (sysF === 'all' ? true : t.systemId === sysF))
      .filter((t) => (subF === 'all' ? true : t.subsystemId === subF))
      .filter((t) => (statusF === 'all' ? true : t.status === statusF))
      .filter((t) => `${t.name} ${t.code}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [list, sysF, subF, statusF, search]);

  const toggle = (t: AssetType) => {
    const newStatus = t.status === 'Active' ? 'Inactive' : 'Active';
    setList((p) => p.map((x) => (x.id === t.id ? { ...x, status: newStatus } : x)));
    toast(newStatus === 'Inactive' ? 'Asset type deactivated.' : 'Asset type activated.');
  };

  const cols: GridColDef<AssetType>[] = [
    { field: 'createdAt', headerName: 'Date', width: 110, valueFormatter: (v) => new Date(v as string).toLocaleDateString() },
    { field: 'name', headerName: 'Name + Code', flex: 1, minWidth: 200, renderCell: (p) => (
      <Link component="button" underline="hover" onClick={() => navigate(`/admin/asset-types/${p.row.id}`)} sx={{ fontWeight: 600 }}>{p.row.name} · {p.row.code}</Link>
    ) },
    { field: 'subsystemId', headerName: 'Sub-system', width: 150, valueGetter: (v) => subsystemName(v as string) },
    { field: 'systemId', headerName: 'System', width: 150, valueGetter: (v) => systemName(v as string) },
    { field: 'checklist', headerName: 'Checklist', width: 100, valueGetter: (v) => (v as AssetType['checklist']).length },
    { field: 'status', headerName: 'Status', width: 110, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'actions', headerName: 'Actions', width: 90, sortable: false, renderCell: (p) => (
      <IconButton size="small" color={p.row.status === 'Active' ? 'error' : 'success'} onClick={() => toggle(p.row)}>
        {p.row.status === 'Active' ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
      </IconButton>
    ) },
  ];

  return (
    <Box>
      <PageHeader title="Asset Types" subtitle="Manage asset types and their work checklists." />
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by name or code"
        filters={
          <>
            <TextField select size="small" label="System" value={sysF} onChange={(e) => { setSysF(e.target.value); setSubF('all'); }} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Systems</MenuItem>
              {assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Sub-system" value={subF} onChange={(e) => setSubF(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Sub-systems</MenuItem>
              {subs.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={statusF} onChange={(e) => setStatusF(e.target.value)} sx={{ minWidth: 130 }}>
              {['all', 'Active', 'Inactive'].map((s) => <MenuItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</MenuItem>)}
            </TextField>
          </>
        }
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/asset-types/new')}>Add</Button>}
      />
      <Paper elevation={2} sx={{ borderRadius: '16px', height: 520 }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      {node}
    </Box>
  );
}
