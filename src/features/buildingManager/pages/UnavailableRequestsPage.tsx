/**
 * 3.6.12 Handle Spare Part Unavailable.
 *
 * Lists spare-part shortages flagged against Work Orders. The BM can review the
 * shortage and either Approve Continuation (with an optional note) so the
 * Technician proceeds without the part, or mark the request Waiting for Restock.
 */
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/shared';
import { unavailableRequests as seed } from '../data/mockData';
import type { UnavailableRequest } from '../data/types';

const STATUSES: UnavailableRequest['status'][] = [
  'Unavailable',
  'Approved to Continue',
  'Waiting for Restock',
];

export default function UnavailableRequestsPage() {
  const [rows, setRows] = useState<UnavailableRequest[]>(seed);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [approveTarget, setApproveTarget] = useState<UnavailableRequest | null>(null);
  const [note, setNote] = useState('');
  const { show, node } = useToast();

  const filtered = useMemo(
    () =>
      rows
        .filter((r) => (statusFilter === 'All' ? true : r.status === statusFilter))
        .filter((r) => r.woId.toLowerCase().includes(search.toLowerCase())),
    [rows, statusFilter, search],
  );

  const openApprove = (req: UnavailableRequest) => {
    setApproveTarget(req);
    setNote(req.bmNote);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === approveTarget.id
          ? { ...r, status: 'Approved to Continue', bmNote: note.trim() }
          : r,
      ),
    );
    show(`Continuation approved for ${approveTarget.woId}.`);
    setApproveTarget(null);
    setNote('');
  };

  const waitForRestock = (req: UnavailableRequest) => {
    setRows((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'Waiting for Restock' } : r)),
    );
    show(`${req.sparePartName} marked as waiting for restock.`);
  };

  const columns: GridColDef<UnavailableRequest>[] = [
    {
      field: 'woId',
      headerName: 'WO ID',
      width: 120,
      renderCell: (p) => (
        <Link component={RouterLink} to={`/bm/work-orders/${p.value}`} underline="hover">
          {p.value as string}
        </Link>
      ),
    },
    { field: 'sparePartName', headerName: 'Spare Part', flex: 1, minWidth: 180 },
    { field: 'requestedQty', headerName: 'Requested Qty', width: 130, type: 'number' },
    { field: 'availableQty', headerName: 'Available Qty', width: 130, type: 'number' },
    {
      field: 'shortage',
      headerName: 'Shortage',
      width: 110,
      type: 'number',
      valueGetter: (_v, row) => Math.max(row.requestedQty - row.availableQty, 0),
    },
    { field: 'bmNote', headerName: 'BM Note', flex: 1, minWidth: 160, renderCell: (p) => (p.value ? (p.value as string) : '—') },
    {
      field: 'status',
      headerName: 'Status',
      width: 180,
      renderCell: (p) => <StatusChip status={p.value as string} />,
    },
    { field: 'dateFlagged', headerName: 'Date Flagged', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      sortable: false,
      renderCell: (p) =>
        p.row.status === 'Approved to Continue' ? (
          '—'
        ) : (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={() => openApprove(p.row)}>
              Approve Continuation
            </Button>
            {p.row.status !== 'Waiting for Restock' && (
              <Button size="small" color="inherit" onClick={() => waitForRestock(p.row)}>
                Wait for Restock
              </Button>
            )}
          </Stack>
        ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Unavailable Spare Part Requests"
        subtitle="Review and resolve spare-part shortages flagged against work orders"
      />

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by work order"
        filters={
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <Box sx={{ height: 480, bgcolor: 'background.paper', borderRadius: '16px', p: 1 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          slots={{ noRowsOverlay: () => <EmptyState title="No unavailable spare part requests." /> }}
        />
      </Box>

      <Dialog open={!!approveTarget} onClose={() => setApproveTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Continuation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The work order will not be blocked. The Technician can proceed with the remaining
            checklist items without {approveTarget?.sparePartName}.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setApproveTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmApprove}>
            Approve Continuation
          </Button>
        </DialogActions>
      </Dialog>
      {node}
    </Box>
  );
}
