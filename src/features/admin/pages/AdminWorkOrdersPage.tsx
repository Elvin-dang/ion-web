/**
 * Admin · Work Order Management (overall view). Read-only, portal-wide list of
 * work orders across all buildings — Super Admin oversight only; assignment &
 * execution stay with Building Managers / MSP Supervisors. Data is sourced from
 * the operational (Building Manager) work-order store.
 */
import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import AdminStatusChip from '../components/AdminStatusChip';
import { workOrders, buildingName } from '../../buildingManager/data/mockData';
import type { WorkOrder } from '../../buildingManager/data/types';

const STATUSES = ['Pending - Unassigned', 'Assigned', 'Started', 'Completed', 'Verified', 'Closed', 'Cancelled', 'Completion Rejected', 'Verification Rejected'];
const TYPES = ['Maintenance Scheduling', 'Ad-hoc Work', 'Service Request'];

export default function AdminWorkOrdersPage({ embedded = false }: { embedded?: boolean }) {
  const [search, setSearch] = useState('');
  const [bF, setBF] = useState('all');
  const [sF, setSF] = useState('all');
  const [tF, setTF] = useState('all');

  const buildingOptions = useMemo(
    () => [...new Map(workOrders.map((w) => [w.buildingId, buildingName(w.buildingId)])).entries()],
    [],
  );

  const rows = useMemo(() =>
    workOrders
      .filter((w) => (bF === 'all' ? true : w.buildingId === bF))
      .filter((w) => (sF === 'all' ? true : w.status === sF))
      .filter((w) => (tF === 'all' ? true : w.type === tF))
      .filter((w) => `${w.id} ${w.assetCode} ${w.description}`.toLowerCase().includes(search.toLowerCase()))
      .slice()
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
  [search, bF, sF, tF]);

  const cols: GridColDef<WorkOrder>[] = [
    { field: 'createdDate', headerName: 'Date', width: 120, valueFormatter: (v) => new Date(v as string).toLocaleDateString() },
    { field: 'id', headerName: 'WO ID', width: 110 },
    { field: 'type', headerName: 'Type', width: 170 },
    { field: 'buildingId', headerName: 'Building', flex: 1, minWidth: 140, valueGetter: (v) => buildingName(v as string) },
    { field: 'assetCode', headerName: 'Asset', width: 150 },
    { field: 'assetSystem', headerName: 'Asset System', width: 130 },
    { field: 'mainTechnician', headerName: 'Technician', width: 150, valueGetter: (_v, row) => row.mainTechnician?.name ?? 'Unassigned' },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
    { field: 'status', headerName: 'Status', width: 180, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
  ];

  return (
    <Box>
      {!embedded && (
        <PageHeader title="Work Order Management" subtitle="Portal-wide view of work orders across all buildings (read-only)." />
      )}
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by WO ID, asset or description"
        filters={
          <>
            <TextField select size="small" label="Building" value={bF} onChange={(e) => setBF(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="all">All Buildings</MenuItem>
              {buildingOptions.map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Type" value={tF} onChange={(e) => setTF(e.target.value)} sx={{ minWidth: 170 }}>
              <MenuItem value="all">All Types</MenuItem>
              {TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={sF} onChange={(e) => setSF(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="all">All Statuses</MenuItem>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </>
        }
      />
      <Typography variant="caption" color="text.secondary">{rows.length} results</Typography>
      <Paper elevation={2} sx={{ borderRadius: '16px', mt: 1, height: 560 }}>
        <DataGrid
          rows={rows} columns={cols} getRowId={(r) => r.id} disableRowSelectionOnClick
          pageSizeOptions={[20]} initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { fontWeight: 700 } }}
        />
      </Paper>
    </Box>
  );
}
