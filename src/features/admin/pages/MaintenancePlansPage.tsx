/**
 * 1.7.1 View Maintenance Plan List. DataGrid with Building / Status / System /
 * Frequency filters, search, [+ Create], and approve indicator for Pending
 * plans. Plan name → Plan Detail.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { maintenancePlans as seed, assetSystems, buildings, systemName, typeName, buildingName } from '../data/mockData';
import type { MaintenancePlan } from '../data/types';

export default function MaintenancePlansPage() {
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const [list, setList] = useState<MaintenancePlan[]>(() => seed.map((p) => ({ ...p })));
  const [search, setSearch] = useState('');
  const [bF, setBF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [sF, setSF] = useState('all');
  const [freqF, setFreqF] = useState('all');

  const rows = useMemo(() =>
    list
      .filter((p) => (bF === 'all' ? true : p.buildingId === bF))
      .filter((p) => (statusF === 'all' ? true : p.status === statusF))
      .filter((p) => (sF === 'all' ? true : p.systemId === sF))
      .filter((p) => (freqF === 'all' ? true : p.frequency === freqF))
      .filter((p) => `${p.name} ${p.id}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [list, bF, statusF, sF, freqF, search]);

  const cols: GridColDef<MaintenancePlan>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 220, renderCell: (p) => (
      <Box>
        <Link component="button" underline="hover" onClick={() => navigate(`/admin/maintenance-plans/${p.row.id}`)} sx={{ fontWeight: 600 }}>{p.row.name}</Link>
        <Chip size="small" label={p.row.frequency} sx={{ ml: 1 }} />
      </Box>
    ) },
    { field: 'typeId', headerName: 'Asset Type', width: 150, valueGetter: (v) => typeName(v as string) },
    { field: 'systemId', headerName: 'System', width: 150, valueGetter: (v) => systemName(v as string) },
    { field: 'buildingId', headerName: 'Building', width: 170, valueGetter: (v) => buildingName(v as string) },
    { field: 'createdBy', headerName: 'Created By', width: 150 },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
    { field: 'actions', headerName: 'Actions', width: 90, sortable: false, renderCell: (p) => p.row.status === 'Pending' ? (
      <IconButton size="small" color="success" onClick={() => { setList((prev) => prev.map((x) => (x.id === p.row.id ? { ...x, status: 'Active' } : x))); toast('Maintenance plan approved.'); }}><CheckCircleOutlineIcon fontSize="small" /></IconButton>
    ) : null },
  ];

  return (
    <Box>
      <PageHeader title="Maintenance Plans" subtitle="Preventive maintenance plans across all buildings." />
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by plan name or ID"
        filters={
          <>
            <TextField select size="small" label="Building" value={bF} onChange={(e) => setBF(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All Buildings</MenuItem>{buildings.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={statusF} onChange={(e) => setStatusF(e.target.value)} sx={{ minWidth: 130 }}>
              {['all', 'Active', 'Inactive', 'Pending', 'Cancelled', 'Approval Rejected'].map((s) => <MenuItem key={s} value={s}>{s === 'all' ? 'All' : s}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="System" value={sF} onChange={(e) => setSF(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="all">All Systems</MenuItem>{assetSystems.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Frequency" value={freqF} onChange={(e) => setFreqF(e.target.value)} sx={{ minWidth: 130 }}>
              {['all', 'Monthly', 'Quarterly', 'Yearly'].map((f) => <MenuItem key={f} value={f}>{f === 'all' ? 'All' : f}</MenuItem>)}
            </TextField>
          </>
        }
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/maintenance-plans/new')}>Create</Button>}
      />
      <Paper elevation={2} sx={{ borderRadius: '16px', height: 520 }}>
        <DataGrid rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }} sx={{ border: 0 }} />
      </Paper>
      {node}
    </Box>
  );
}
