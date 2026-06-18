/**
 * 3.3.1 View Request List (Building Manager) — Table / Kanban toggle, filters.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import KanbanBoard from '../components/KanbanBoard';
import type { KanbanCard, KanbanGroup } from '../components/KanbanBoard';
import { serviceRequests, buildings } from '../data/mockData';
import type { ServiceRequest, RequestStatus } from '../data/types';

const REQ_TYPES = ['All', 'Tenant Request', 'Technician Ad-hoc', 'Supervisor Ad-hoc', 'Service Request Accepted'];
const REQ_STATUSES = ['All', 'Tenant Request', 'Pending', 'Service Request Accepted', 'Cancelled', 'Approval Rejected'];

function reqGroup(status: RequestStatus): KanbanGroup {
  switch (status) {
    case 'Tenant Request':
    case 'Service Request Accepted':
      return 'New';
    case 'Pending':
      return 'Pending';
    case 'Cancelled':
    case 'Closed':
      return 'Finalized';
    case 'Approval Rejected':
    case 'Ad-hoc Declined':
      return 'Rejected';
    default:
      return 'New';
  }
}

const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;

export default function RequestListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('All');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState(params.get('status') ?? 'All');

  const filtered = useMemo(
    () =>
      serviceRequests
        .filter((r) => (building === 'All' ? true : r.buildingId === building))
        .filter((r) => (type === 'All' ? true : r.type === type))
        .filter((r) => (status === 'All' ? true : r.status === status))
        .filter(
          (r) =>
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase()),
        ),
    [building, type, status, search],
  );

  const columns: GridColDef<ServiceRequest>[] = [
    { field: 'createdDate', headerName: 'Date', width: 110 },
    { field: 'id', headerName: 'Request ID', width: 120 },
    { field: 'type', headerName: 'Type', width: 170 },
    { field: 'buildingId', headerName: 'Building', flex: 1, minWidth: 140, valueGetter: (v) => buildingName(v as string) },
    { field: 'description', headerName: 'Description', flex: 1.5, minWidth: 220 },
    { field: 'submittedBy', headerName: 'Submitted By', flex: 1, minWidth: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (p) => <StatusChip status={p.value as string} />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Tooltip title="View">
          <IconButton size="small" onClick={() => navigate(`/bm/requests/${p.row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const cards: KanbanCard[] = filtered.map((r) => ({
    id: r.id,
    title: r.description.slice(0, 60),
    subtitle: `${r.type} · ${buildingName(r.buildingId)}`,
    meta: r.createdDate,
    group: reqGroup(r.status),
  }));

  return (
    <Box>
      <PageHeader
        title="Requests"
        subtitle="Tenant and ad-hoc work order requests for your buildings"
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            onChange={(_, v) => v && setView(v)}
            sx={{ '& .MuiToggleButton-root': { borderRadius: 8, px: 2 } }}
          >
            <ToggleButton value="table">
              <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} /> Table
            </ToggleButton>
            <ToggleButton value="kanban">
              <ViewKanbanIcon fontSize="small" sx={{ mr: 0.5 }} /> Kanban
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID or description"
        filters={
          <>
            <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="All">All Buildings</MenuItem>
              {buildings.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 150 }}>
              {REQ_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
              {REQ_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
      />

      {view === 'table' ? (
        <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            disableRowSelectionOnClick
            onRowClick={(p) => navigate(`/bm/requests/${p.row.id}`)}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            slots={{ noRowsOverlay: () => <EmptyState title="No requests found for the selected filters." /> }}
            sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          />
        </Box>
      ) : (
        <KanbanBoard cards={cards} onCardClick={(id) => navigate(`/bm/requests/${id}`)} />
      )}
    </Box>
  );
}
