/**
 * 5.5.1 View Maintenance Plan List (MSP Supervisor). Search + Status / Asset
 * System / Frequency filters. Own Pending/Approval Rejected plans show an Edit
 * icon. Rows open Plan Detail (5.5.2). [+ Create Plan] → Create (5.5.3).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { maintenancePlans, SUPERVISOR_PROFILE, USER_GROUP_SYSTEMS } from '../data/mockData';
import type { MaintenancePlan } from '../data/types';

const FREQUENCIES = ['Monthly', 'Quarterly', 'Yearly'];

export default function MaintenancePlanListScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [system, setSystem] = useState('All');
  const [frequency, setFrequency] = useState('All');

  const filtered = useMemo(
    () =>
      maintenancePlans.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
        const matchStatus = status === 'All' || p.status === status;
        const matchSystem = system === 'All' || p.assetSystem === system;
        const matchFreq = frequency === 'All' || p.frequency === frequency;
        return matchSearch && matchStatus && matchSystem && matchFreq;
      }),
    [search, status, system, frequency],
  );

  const canEdit = (p: MaintenancePlan) =>
    p.createdBy === SUPERVISOR_PROFILE.name && (p.status === 'Pending' || p.status === 'Approval Rejected');

  const columns: GridColDef<MaintenancePlan>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'name',
      headerName: 'Name + Frequency',
      flex: 1,
      minWidth: 220,
      valueGetter: (_v, row) => `${row.name} (${row.frequency})`,
    },
    { field: 'assetType', headerName: 'Asset Type', width: 160 },
    { field: 'building', headerName: 'Building', width: 150 },
    { field: 'createdBy', headerName: 'Created By', width: 170 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (p) => <StatusChip status={p.value as string} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (p) =>
        canEdit(p.row) ? (
          <Tooltip title="Edit Plan">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/msp/maintenance-plans/${p.row.id}?edit=1`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Maintenance Plans"
        subtitle="Your plans and active plans affecting your scope"
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Maintenance Plans' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/msp/maintenance-plans/new')}>
            Create Plan
          </Button>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by plan name or ID"
        filters={
          <>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="All">All Statuses</MenuItem>
              {['Pending', 'Approval Rejected', 'Active', 'Inactive', 'Cancelled'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
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
            <TextField select size="small" label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="All">All</MenuItem>
              {FREQUENCIES.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
        actions={
          <Typography variant="body2" color="text.secondary">
            {filtered.length} plan(s)
          </Typography>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No maintenance plans found" description="No maintenance plans found within your scope." />
      ) : (
        <Box sx={{ height: 560, width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            onRowClick={(p) => navigate(`/msp/maintenance-plans/${p.id}`)}
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
