/**
 * 5.3.2 View Work Order List (MSP Supervisor). Open / Closed scoped routes,
 * single Filter panel + Clear All + result count, status-group rows with dot
 * indicators, location & plan-reference sub-lines, and a per-row action menu.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import { formatDate, formatDateTime } from '../../../utils/date';
import {
  CLOSED_STATUSES,
  statusGroupInfo,
  USER_GROUP_BUILDINGS,
  technicians,
  workOrders,
} from '../data/mockData';
import type { WorkOrder } from '../data/types';

const WO_TYPES = ['Ad-hoc Work', 'Maintenance Scheduling', 'Service Request', 'Technician Request'];

interface WorkOrderListScreenProps {
  scope?: 'open' | 'closed';
}

/** Format a WO id "WO-1031" as "#WO1031". */
function woNumber(id: string): string {
  return `#${id.replace('-', '')}`;
}

/** Format a plan reference like "#MP3456 (R1-Sep-2025)". */
function planRef(wo: WorkOrder): string | null {
  if (!wo.maintenancePlanId) return null;
  const id = `#${wo.maintenancePlanId.replace('-', '')}`;
  const round = wo.maintenanceRound ? wo.maintenanceRound.replace('Round ', 'R') : '';
  return round ? `${id} (${round})` : id;
}

export default function WorkOrderListScreen({ scope = 'open' }: WorkOrderListScreenProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('All');
  const [statusFilter, setStatusFilter] = useState(params.get('status') ?? 'All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [technicianFilter, setTechnicianFilter] = useState(params.get('technician') ?? 'All');

  // Single Filter button -> popover panel.
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);

  // Per-row action menu.
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<WorkOrder | null>(null);

  const scopeName = scope === 'closed' ? 'Closed' : 'Open';

  const scoped = useMemo(
    () =>
      workOrders.filter((w) =>
        scope === 'closed' ? CLOSED_STATUSES.includes(w.status) : !CLOSED_STATUSES.includes(w.status),
      ),
    [scope],
  );

  const filtered = useMemo(
    () =>
      scoped.filter((w) => {
        const q = search.toLowerCase();
        const matchSearch = !q || w.id.toLowerCase().includes(q) || w.assetCode.toLowerCase().includes(q) || w.assetName.toLowerCase().includes(q);
        const matchBuilding = building === 'All' || w.building === building;
        const matchStatus = statusFilter === 'All' || w.status === statusFilter;
        const matchType = typeFilter === 'All' || w.type === typeFilter;
        const matchTech = technicianFilter === 'All' || w.mainTechnicianId === technicianFilter;
        return matchSearch && matchBuilding && matchStatus && matchType && matchTech;
      }),
    [scoped, search, building, statusFilter, typeFilter, technicianFilter],
  );

  const clearAll = () => {
    setSearch('');
    setBuilding('All');
    setStatusFilter('All');
    setTypeFilter('All');
    setTechnicianFilter('All');
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: WorkOrder) => {
    e.stopPropagation();
    setMenuRow(row);
    setMenuAnchor(e.currentTarget);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  /** Status-specific actions for the row context menu. */
  const rowActions = (wo: WorkOrder): { label: string; onClick: () => void }[] => {
    const acts: { label: string; onClick: () => void }[] = [
      { label: 'View Detail', onClick: () => navigate(`/msp/work-orders/${wo.id}`) },
    ];
    if (wo.status === 'Pending - Unassigned') {
      acts.push({ label: 'Assign', onClick: () => navigate(`/msp/work-orders/${wo.id}`) });
    }
    if (wo.status === 'Completed') {
      acts.push(
        { label: 'Sign Off', onClick: () => navigate(`/msp/work-orders/${wo.id}`) },
        { label: 'Reject', onClick: () => navigate(`/msp/work-orders/${wo.id}`) },
      );
    }
    return acts;
  };

  const columns: GridColDef<WorkOrder>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 150,
      renderCell: (p) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {woNumber(p.row.id)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(p.row.createdDate)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 190,
      renderCell: (p) => {
        const ref = planRef(p.row);
        return (
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2">{p.row.type}</Typography>
            {ref && (
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (p.row.maintenancePlanId) navigate(`/msp/maintenance-plans/${p.row.maintenancePlanId}`);
                }}
                sx={{ fontSize: '0.75rem', color: 'primary.main', textDecorationColor: 'inherit' }}
              >
                {ref}
              </Link>
            )}
          </Box>
        );
      },
    },
    {
      field: 'assetCode',
      headerName: 'Name',
      flex: 1,
      minWidth: 170,
      renderCell: (p) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {p.row.assetCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {p.row.assetName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (p) => (
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2">
            {p.row.area} / {p.row.floor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {p.row.building}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 140,
      renderCell: (p) =>
        p.row.dueDate ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            {p.row.overdue && <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />}
            <Typography
              variant="body2"
              color={p.row.overdue ? 'error.main' : 'text.primary'}
              sx={{ fontWeight: p.row.overdue ? 700 : 400 }}
            >
              {formatDate(p.row.dueDate)}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 170,
      renderCell: (p) => {
        const info = statusGroupInfo(p.row.status);
        return (
          <Box sx={{ py: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: info.color, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {info.group}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2.25, display: 'block' }}>
              {info.subStatus}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <IconButton size="small" onClick={(e) => openMenu(e, p.row)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={scope === 'closed' ? 'Closed Work Orders' : 'Open Work Orders'}
        subtitle="All work orders and requests within your scope"
        breadcrumbs={[
          { label: 'Dashboard', to: '/msp/dashboard' },
          { label: 'Work Orders' },
          { label: scopeName },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/msp/work-orders/new')}>
              Create
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by WO ID, asset code or name"
          sx={{ minWidth: { xs: '100%', sm: 280 } }}
        />
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={(e) => setFilterAnchor(e.currentTarget)}>
          Filter
        </Button>
        <Button variant="text" color="inherit" onClick={clearAll}>
          Clear All
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Found: {filtered.length} results
      </Typography>

      <Popover
        open={!!filterAnchor}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Stack spacing={2} sx={{ p: 2.5, width: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <TextField select size="small" label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} fullWidth>
            <MenuItem value="All">All Buildings</MenuItem>
            {USER_GROUP_BUILDINGS.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} fullWidth>
            <MenuItem value="All">All Statuses</MenuItem>
            {[...new Set(scoped.map((w) => w.status))].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} fullWidth>
            <MenuItem value="All">All Types</MenuItem>
            {WO_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Technician" value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} fullWidth>
            <MenuItem value="All">All Technicians</MenuItem>
            {technicians.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button color="inherit" onClick={clearAll}>
              Clear All
            </Button>
            <Button variant="contained" onClick={() => setFilterAnchor(null)}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>

      {filtered.length === 0 ? (
        <EmptyState title="No work orders found" description="No work orders found for the selected filters." />
      ) : (
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            getRowHeight={() => 64}
            onRowClick={(p) => navigate(`/msp/work-orders/${p.id}`)}
            disableRowSelectionOnClick
            pageSizeOptions={[20, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            autoHeight
            sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          />
        </Box>
      )}

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {menuRow &&
          rowActions(menuRow).map((a) => (
            <MenuItem
              key={a.label}
              onClick={() => {
                a.onClick();
                closeMenu();
              }}
            >
              {a.label}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}
