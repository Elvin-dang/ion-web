/**
 * Admin · Request Management (overall view). Read-only, portal-wide list of
 * service / ad-hoc requests across all buildings — Super Admin oversight only;
 * approval & assignment remain Building-Manager actions. Data is sourced from
 * the operational (Building Manager) request store.
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
import { serviceRequests, buildingName, fullLocation } from '../../buildingManager/data/mockData';
import type { ServiceRequest } from '../../buildingManager/data/types';

const STATUSES = ['Tenant Request', 'Pending', 'Service Request Accepted', 'Approval Rejected', 'Ad-hoc Declined', 'Cancelled', 'Closed'];

export default function AdminRequestsPage({ embedded = false }: { embedded?: boolean }) {
  const [search, setSearch] = useState('');
  const [bF, setBF] = useState('all');
  const [sF, setSF] = useState('all');

  const buildingOptions = useMemo(
    () => [...new Map(serviceRequests.map((r) => [r.buildingId, buildingName(r.buildingId)])).entries()],
    [],
  );

  const rows = useMemo(() =>
    serviceRequests
      .filter((r) => (bF === 'all' ? true : r.buildingId === bF))
      .filter((r) => (sF === 'all' ? true : r.status === sF))
      .filter((r) => `${r.id} ${r.description} ${r.submittedBy}`.toLowerCase().includes(search.toLowerCase()))
      .slice()
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
  [search, bF, sF]);

  const cols: GridColDef<ServiceRequest>[] = [
    { field: 'createdDate', headerName: 'Date', width: 120, valueFormatter: (v) => new Date(v as string).toLocaleDateString() },
    { field: 'id', headerName: 'Request ID', width: 130 },
    { field: 'type', headerName: 'Type', width: 180 },
    { field: 'buildingId', headerName: 'Building', flex: 1, minWidth: 150, valueGetter: (v) => buildingName(v as string) },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 180, sortable: false, valueGetter: (_v, row) => fullLocation(row.buildingId, row.floor, row.area) },
    { field: 'assetSystem', headerName: 'Asset System', width: 140 },
    { field: 'submittedBy', headerName: 'Submitted By', width: 150 },
    { field: 'status', headerName: 'Status', width: 200, renderCell: (p) => <AdminStatusChip status={p.value as string} /> },
  ];

  return (
    <Box>
      {!embedded && (
        <PageHeader title="Request Management" subtitle="Portal-wide view of service and ad-hoc requests across all buildings (read-only)." />
      )}
      <DataTableToolbar
        search={search} onSearchChange={setSearch} searchPlaceholder="Search by ID, description or submitter"
        filters={
          <>
            <TextField select size="small" label="Building" value={bF} onChange={(e) => setBF(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="all">All Buildings</MenuItem>
              {buildingOptions.map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Status" value={sF} onChange={(e) => setSF(e.target.value)} sx={{ minWidth: 200 }}>
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
