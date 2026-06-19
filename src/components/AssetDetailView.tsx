/**
 * AssetDetailView — shared presentational layout for the Asset Detail screen,
 * used identically by Super Admin, Building Manager and MSP Supervisor. It is
 * purely presentational: it takes a typed view-model plus an `actions` header
 * slot for role-specific buttons and an optional `extraTabs` slot for
 * role-specific extra tabs (e.g. BM's As-Built Drawing). No role logic lives
 * here — each role maps its data into the AssetDetailViewModel.
 *
 * The seven standard sections (Header, Classification, Location, Asset Details,
 * Maintenance History, Related WO History, Pending WOs) always render in the
 * same order with the same labels for every role.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { alpha } from '@mui/material/styles';
import QrCode2Icon from '@mui/icons-material/QrCode2';

/** A single labelled read-only field. */
export interface AssetField {
  label: string;
  value: ReactNode;
}

/** A history-table column header + the cells per row are positional. */
export interface AssetTable {
  headers: string[];
  /** Each row is an array of cells aligned to `headers`. */
  rows: ReactNode[][];
  empty: string;
}

/** A role-supplied extra tab (label + its panel content). */
export interface AssetExtraTab {
  label: string;
  content: ReactNode;
}

export interface AssetDetailViewModel {
  /** Asset name shown bold in the header. */
  name: string;
  /** QR code caption (asset code or QR id). */
  qrCaption: string;
  /** Status chip shown in the header (and Asset Details Status field). */
  statusChip: ReactNode;
  /** (2) Asset Classification — System / Sub-system / Type. */
  classification: AssetField[];
  /** (3) Location — Building / Floor / Area-Unit. */
  location: AssetField[];
  /** (4) Asset Details. */
  details: AssetField[];
  /** (5) Maintenance History. */
  maintenanceHistory: AssetTable;
  /** (6) Related WO History. */
  relatedWorkOrders: AssetTable;
  /** (7) Pending WOs. */
  pendingWorkOrders: AssetTable;
}

interface AssetDetailViewProps {
  vm: AssetDetailViewModel;
  /** Role-specific header action buttons (e.g. Edit / Deactivate). */
  actions?: ReactNode;
  /** Role-specific extra tabs appended after the standard history tabs. */
  extraTabs?: AssetExtraTab[];
}

function FieldGrid({ fields }: { fields: AssetField[] }) {
  return (
    <Grid container spacing={2}>
      {fields.map((f, i) => (
        <Grid key={`${f.label}-${i}`} size={{ xs: 6, sm: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
            {f.label}
          </Typography>
          <Typography variant="body2" fontWeight={600} component="div" sx={{ mt: 0.25 }}>
            {f.value ?? '—'}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
}

function HistoryTable({ table }: { table: AssetTable }) {
  if (table.rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {table.empty}
      </Typography>
    );
  }
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {table.headers.map((h) => (
            <TableCell key={h} sx={{ fontWeight: 700 }}>
              {h}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {table.rows.map((row, i) => (
          <TableRow key={i} hover>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const cardSx = {
  borderRadius: '16px',
  p: { xs: 2, sm: 2.5 },
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': { boxShadow: 6 },
} as const;

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Paper elevation={2} sx={cardSx}>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export default function AssetDetailView({ vm, actions, extraTabs }: AssetDetailViewProps) {
  const [tab, setTab] = useState(0);

  const standardTabs: AssetExtraTab[] = [
    { label: 'Maintenance History', content: <HistoryTable table={vm.maintenanceHistory} /> },
    { label: 'Related Work Orders', content: <HistoryTable table={vm.relatedWorkOrders} /> },
    { label: 'Pending Work Orders', content: <HistoryTable table={vm.pendingWorkOrders} /> },
  ];
  const allTabs = [...standardTabs, ...(extraTabs ?? [])];
  const activeTab = Math.min(tab, allTabs.length - 1);

  return (
    <Box>
      {/* (1) Header */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard>
            <Stack alignItems="center" spacing={1.5}>
              <Box
                sx={(t) => ({
                  width: 160,
                  height: 160,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(t.palette.primary.main, 0.08),
                  color: 'primary.main',
                })}
              >
                <QrCode2Icon sx={{ fontSize: 120 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} align="center">
                {vm.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {vm.qrCaption}
              </Typography>
              <Box>{vm.statusChip}</Box>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {actions}
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            {/* (2) Asset Classification */}
            <SectionCard title="Asset Classification">
              <FieldGrid fields={vm.classification} />
            </SectionCard>
            {/* (3) Location */}
            <SectionCard title="Location">
              <FieldGrid fields={vm.location} />
            </SectionCard>
            {/* (4) Asset Details */}
            <SectionCard title="Asset Details">
              <FieldGrid fields={vm.details} />
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      {/* (5)(6)(7) + role-specific extra tabs */}
      <Box sx={{ mt: 2.5 }}>
        <Tabs value={activeTab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
          {allTabs.map((t, i) => (
            <Tab key={i} label={t.label} />
          ))}
        </Tabs>
        <SectionCard>{allTabs[activeTab]?.content}</SectionCard>
      </Box>
    </Box>
  );
}
