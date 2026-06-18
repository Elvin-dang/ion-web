/**
 * 3.4.1 View Work Order List (Building Manager) — Table / Kanban toggle, filters,
 * overdue indicators.
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
import Typography from '@mui/material/Typography';
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
import { workOrders, buildings, buildingName, fullLocation } from '../data/mockData';
import type { WorkOrder, WorkOrderStatus } from '../data/types';

const WO_TYPES = ['All', 'Maintenance Scheduling', 'Ad-hoc Work', 'Service Request'];
const WO_STATUSES = [
  'All', 'Pending - Unassigned', 'Assigned', 'Started', 'Completed', 'Verified', 'Closed',
  'Cancelled', 'Completion Rejected', 'Verification Rejected',
];

function woGroup(status: WorkOrderStatus): KanbanGroup {
  switch (status) {
    case 'Pending - Unassigned':
      return 'Pending';
    case 'Assigned':
    case 'Started':
      return 'In Progress';
    case 'Completed':
      return 'Review';
    case 'Verified':
      return 'Approval';
    case 'Closed':
    case 'Cancelled':
      return 'Finalized';
    case 'Completion Rejected':
    case 'Verification Rejected':
      return 'Rejected';
    default:
      return 'New';
  }
}

export default function WorkOrderListPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initStatus = params.get('status');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('All');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');

  // map dashboard group filter to highlight
  const highlightGroup: KanbanGroup | undefined =
    initStatus === 'In Progress' ? 'In Progress' : initStatus === 'Closed' ? 'Finalized' : undefined;

  const filtered = useMemo(
    () =>
      workOrders
        .filter((w) => (building === 'All' ? true : w.buildingId === building))
        .filter((w) => (type === 'All' ? true : w.type === type))
        .filter((w) => {
          if (status !== 'All') return w.status === status;
          if (initStatus === 'In Progress') return w.status === 'Assigned' || w.status === 'Started';
          if (initStatus === 'Closed') return w.status === 'Closed';
          return true;
        })
        .filter(
          (w) =>
            w.id.toLowerCase().includes(search.toLowerCase()) ||
            w.assetCode.toLowerCase().includes(search.toLowerCase()),
        ),
    [building, type, status, search, initStatus],
  );

  const columns: GridColDef<WorkOrder>[] = [
    { field: 'id', headerName: 'WO ID', width: 110 },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      minWidth: 190,
      renderCell: (p) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2">{p.row.type}</Typography>
          {p.row.type === 'Maintenance Scheduling' && p.row.planRef && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              #{p.row.planRef.planId} (R{p.row.planRef.round}-{p.row.planRef.frequency})
            </Typography>
          )}
        </Box>
      ),
    },
    { field: 'assetCode', headerName: 'Asset', width: 140 },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.4,
      minWidth: 220,
      sortable: false,
      valueGetter: (_, row) => fullLocation(row.buildingId, row.floor, row.area),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 130,
      renderCell: (p) => (
        <Typography variant="body2" color={p.row.overdue ? 'error.main' : 'text.primary'} sx={{ fontWeight: p.row.overdue ? 700 : 400 }}>
          {p.row.dueDate}
          {p.row.overdue ? ' (overdue)' : ''}
        </Typography>
      ),
    },
    { field: 'mainTechnician', headerName: 'Technician', flex: 1, minWidth: 150, valueGetter: (_, row) => row.mainTechnician?.name ?? 'Unassigned' },
    {
      field: 'status',
      headerName: 'Status',
      width: 170,
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
          <IconButton size="small" onClick={() => navigate(`/bm/work-orders/${p.row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const cards: KanbanCard[] = filtered.map((w) => ({
    id: w.id,
    title: `${w.assetCode} — ${w.assetType}`,
    subtitle: `${w.type} · ${buildingName(w.buildingId)}`,
    meta: `Due ${w.dueDate}`,
    group: woGroup(w.status),
    overdue: w.overdue,
  }));

  return (
    <Box>
      <PageHeader
        title="Work Orders"
        subtitle="Track and sign off work orders across your buildings"
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
        searchPlaceholder="Search by WO ID or Asset Code"
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
            <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}>
              {WO_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
              {WO_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </>
        }
      />

      {view === 'table' ? (
        <Box sx={{ height: 520, bgcolor: 'background.paper', borderRadius: 4, p: 1 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            disableRowSelectionOnClick
            onRowClick={(p) => navigate(`/bm/work-orders/${p.row.id}`)}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            slots={{ noRowsOverlay: () => <EmptyState title="No work orders found for the selected filters." /> }}
            sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          />
        </Box>
      ) : (
        <KanbanBoard cards={cards} onCardClick={(id) => navigate(`/bm/work-orders/${id}`)} highlightGroup={highlightGroup} />
      )}
    </Box>
  );
}
