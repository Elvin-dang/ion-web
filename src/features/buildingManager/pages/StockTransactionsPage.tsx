/**
 * 3.6.6 Record Stock-In + 3.6.7 Stock-In History + 3.6.8 Stock-Out (view) +
 * 3.6.9 Stock-Out History. Tabs for Stock-In and Stock-Out.
 */
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '../../../components/PageHeader';
import DataTableToolbar from '../../../components/DataTableToolbar';
import EmptyState from '../../../components/EmptyState';
import { useToast } from '../components/shared';
import { formatDate } from '../../../utils/date';
import { stockInTxns as seedIn, stockOutTxns, spareParts } from '../data/mockData';
import type { StockTxn } from '../data/types';

const schema = z.object({
  sparePartCode: z.string().min(1, 'Please select a spare part.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  date: z.string().min(1, 'Stock-In date is required.'),
  sourceReference: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export default function StockTransactionsPage() {
  const [tab, setTab] = useState<'in' | 'out'>('in');
  const [inRows, setInRows] = useState<StockTxn[]>(seedIn);
  const [partFilter, setPartFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { show, node } = useToast();

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sparePartCode: '', quantity: 1, date: new Date().toISOString().slice(0, 10), sourceReference: '', notes: '' },
  });

  const filteredIn = useMemo(
    () =>
      inRows
        .filter((r) => (partFilter === 'All' ? true : r.sparePartCode === partFilter))
        .filter((r) => r.sparePartName.toLowerCase().includes(search.toLowerCase())),
    [inRows, partFilter, search],
  );
  const filteredOut = useMemo(
    () =>
      stockOutTxns
        .filter((r) => (partFilter === 'All' ? true : r.sparePartCode === partFilter))
        .filter((r) => r.sparePartName.toLowerCase().includes(search.toLowerCase())),
    [partFilter, search],
  );

  const onSubmit = (v: FormValues) => {
    const part = spareParts.find((s) => s.code === v.sparePartCode);
    if (part?.status === 'Inactive') {
      show('Cannot record stock-in for an inactive spare part.', 'error');
      return;
    }
    setInRows((prev) => [
      { id: `SI-${prev.length + 100}`, date: v.date, sparePartCode: v.sparePartCode, sparePartName: part?.name ?? v.sparePartCode, quantity: v.quantity, sourceReference: v.sourceReference ?? '', recordedBy: 'Building Manager', notes: v.notes },
      ...prev,
    ]);
    show('Stock-in recorded successfully.');
    setDialogOpen(false);
    reset();
  };

  const inColumns: GridColDef<StockTxn>[] = [
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v as string) },
    { field: 'sparePartName', headerName: 'Spare Part', flex: 1, minWidth: 180 },
    { field: 'quantity', headerName: 'Quantity', width: 110, type: 'number' },
    { field: 'sourceReference', headerName: 'Source Reference', flex: 1, minWidth: 160 },
    { field: 'recordedBy', headerName: 'Recorded By', width: 150 },
  ];

  const outColumns: GridColDef<StockTxn>[] = [
    { field: 'date', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v as string) },
    { field: 'sparePartName', headerName: 'Spare Part', flex: 1, minWidth: 180 },
    { field: 'quantity', headerName: 'Quantity', width: 110, type: 'number' },
    { field: 'woId', headerName: 'WO ID', width: 120, renderCell: (p) => (p.value ? <Link component={RouterLink} to={`/bm/work-orders/${p.value}`} underline="hover">{p.value as string}</Link> : '—') },
    { field: 'sourceReference', headerName: 'Reference', width: 130 },
    { field: 'recordedBy', headerName: 'Processed By', width: 140 },
    { field: 'status', headerName: 'Status', width: 120 },
  ];

  return (
    <Box>
      <PageHeader
        title="Stock Transactions"
        subtitle="Record stock-in and review stock movement history"
        action={
          tab === 'in' ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 8 }}>
              New Stock-In
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Stock-In" value="in" />
        <Tab label="Stock-Out" value="out" />
      </Tabs>

      <DataTableToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by spare part"
        filters={
          <TextField select size="small" label="Spare Part" value={partFilter} onChange={(e) => setPartFilter(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="All">All Spare Parts</MenuItem>
            {spareParts.map((s) => (<MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>))}
          </TextField>
        }
      />

      <Box sx={{ height: 480, bgcolor: 'background.paper', borderRadius: 4, p: 1 }}>
        {tab === 'in' ? (
          <DataGrid
            rows={filteredIn}
            columns={inColumns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ noRowsOverlay: () => <EmptyState title="No stock-in records found for the selected filters." /> }}
          />
        ) : (
          <DataGrid
            rows={filteredOut}
            columns={outColumns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ noRowsOverlay: () => <EmptyState title="No stock-out records found for the selected filters." /> }}
          />
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Stock-In</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField select fullWidth required label="Spare Part" sx={{ mb: 2 }} value={watch('sparePartCode')} onChange={(e) => setValue('sparePartCode', e.target.value, { shouldValidate: true })} error={!!formState.errors.sparePartCode} helperText={formState.errors.sparePartCode?.message}>
              {spareParts.map((s) => (<MenuItem key={s.code} value={s.code}>{s.name} ({s.code})</MenuItem>))}
            </TextField>
            <TextField fullWidth required type="number" label="Quantity" sx={{ mb: 2 }} {...register('quantity')} error={!!formState.errors.quantity} helperText={formState.errors.quantity?.message} />
            <DatePicker
              label="Stock-In Date"
              format="DD/MM/YYYY"
              value={watch('date') ? dayjs(watch('date')) : null}
              onChange={(d) => setValue('date', d ? d.format('YYYY-MM-DD') : '', { shouldValidate: true })}
              slotProps={{ textField: { fullWidth: true, required: true, sx: { mb: 2 }, error: !!formState.errors.date, helperText: formState.errors.date?.message } }}
            />
            <TextField fullWidth label="Source Reference" sx={{ mb: 2 }} {...register('sourceReference')} />
            <TextField fullWidth multiline rows={3} label="Notes" {...register('notes')} />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
      {node}
    </Box>
  );
}
