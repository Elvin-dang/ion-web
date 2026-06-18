/**
 * 5.4.4 View Spare Part List (MSP Supervisor — Read-only). Search + Status
 * filter, scoped to User Group. Rows open Spare Part Detail (5.4.5). No actions.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { spareParts } from '../data/mockData';
import type { SparePart } from '../data/types';

export default function SparePartListScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(
    () =>
      spareParts.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
        const matchStatus = status === 'All' || p.status === status;
        return matchSearch && matchStatus;
      }),
    [search, status],
  );

  const columns: GridColDef<SparePart>[] = [
    { field: 'code', headerName: 'Code', width: 140 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'assetSystem', headerName: 'Asset System', width: 140 },
    { field: 'storeRoom', headerName: 'Store Room', width: 150 },
    { field: 'available', headerName: 'Available', width: 110, type: 'number' },
    { field: 'totalStock', headerName: 'Total Stock', width: 110, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => <StatusChip status={p.value as string} />,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Spare Parts (Inventory)"
        subtitle="Read-only — check availability before requesting parts"
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Inventory' }]}
      />

      <Tabs value={2} sx={{ mb: 3 }}>
        <Tab label="Asset List" onClick={() => navigate('/msp/assets')} />
        <Tab label="Drawing" onClick={() => navigate('/msp/assets/drawing')} />
        <Tab label="Inventory" />
      </Tabs>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or code"
        filters={
          <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        }
        actions={
          <Typography variant="body2" color="text.secondary">
            {filtered.length} result(s)
          </Typography>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No spare parts found" description="No spare parts found within your scope." />
      ) : (
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            onRowClick={(p) => navigate(`/msp/inventory/${p.id}`)}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          />
        </Box>
      )}
    </Box>
  );
}
