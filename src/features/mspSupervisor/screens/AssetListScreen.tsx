/**
 * 5.4.1 View Asset List (MSP Supervisor — Read-only). Building + Asset System +
 * Status filters and search. No create/edit/delete. Rows open Asset Detail.
 * Includes a tab to jump to the read-only Drawing view (5.4.3).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { assets, USER_GROUP_BUILDINGS, USER_GROUP_SYSTEMS } from '../data/mockData';
import type { Asset } from '../data/types';

export default function AssetListScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('All');
  const [system, setSystem] = useState('All');
  const [status, setStatus] = useState('All');

  const filtered = useMemo(
    () =>
      assets.filter((a) => {
        const q = search.toLowerCase();
        const matchSearch = !q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
        const matchBuilding = building === 'All' || a.building === building;
        const matchSystem = system === 'All' || a.assetSystem === system;
        const matchStatus = status === 'All' || a.status === status;
        return matchSearch && matchBuilding && matchSystem && matchStatus;
      }),
    [search, building, system, status],
  );

  const columns: GridColDef<Asset>[] = [
    { field: 'code', headerName: 'Asset Code', width: 150 },
    { field: 'name', headerName: 'Asset Name', flex: 1, minWidth: 180 },
    { field: 'assetSystem', headerName: 'Asset System', width: 140 },
    { field: 'assetType', headerName: 'Asset Type', width: 170 },
    { field: 'building', headerName: 'Building', width: 150 },
    {
      field: 'location',
      headerName: 'Location',
      width: 160,
      valueGetter: (_v, row) => `${row.floor} · ${row.area}`,
    },
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
        title="Assets"
        subtitle="Read-only view scoped to your User Group"
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Assets' }]}
        action={
          <Button variant="outlined" startIcon={<MapIcon />} onClick={() => navigate('/msp/assets/drawing')}>
            View Drawing
          </Button>
        }
      />

      <Tabs value={0} sx={{ mb: 3 }}>
        <Tab label="Asset List" />
        <Tab label="Drawing" onClick={() => navigate('/msp/assets/drawing')} />
        <Tab label="Inventory" onClick={() => navigate('/msp/inventory')} />
      </Tabs>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or code"
        filters={
          <>
            <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Buildings</MenuItem>
              {USER_GROUP_BUILDINGS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Asset System" value={system} onChange={(e) => setSystem(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Systems</MenuItem>
              {USER_GROUP_SYSTEMS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No assets found" description="No assets found within your scope." />
      ) : (
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            onRowClick={(p) => navigate(`/msp/assets/${p.id}`)}
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
