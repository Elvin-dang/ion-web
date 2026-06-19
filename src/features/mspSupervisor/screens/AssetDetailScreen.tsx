/**
 * 5.4.2 View Asset Detail (MSP Supervisor — Read-only). Renders the shared
 * AssetDetailView. MSP is read-only: the only header action is Download QR (no
 * edit, no deactivate). All WO IDs deep-link to WO Detail (5.3.3).
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
import AssetDetailView from '../../../components/AssetDetailView';
import type { AssetDetailViewModel } from '../../../components/AssetDetailView';
import { useToast } from '../components/useToast';
import { formatDate } from '../../../utils/date';
import { assets, maintenancePlanById, technicianName, workOrders } from '../data/mockData';

export default function AssetDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const asset = useMemo(() => assets.find((a) => a.id === id), [id]);

  const relatedWos = useMemo(() => (asset ? workOrders.filter((w) => w.assetCode === asset.code) : []), [asset]);
  const maintenanceWos = relatedWos.filter((w) => w.maintenancePlanId && w.status === 'Closed');
  const pendingWos = relatedWos.filter((w) => !['Closed', 'Ad-hoc Declined'].includes(w.status));

  if (!asset) {
    return (
      <Box>
        <PageHeader title="Asset" breadcrumbs={[{ label: 'Assets', to: '/msp/assets' }, { label: 'Not found' }]} />
        <EmptyState title="Asset not found" description="Failed to load asset details. Please go back and try again." action={<Button variant="contained" onClick={() => navigate('/msp/assets')}>Back to list</Button>} />
      </Box>
    );
  }

  const woLink = (woId: string) => (
    <Link component="button" type="button" onClick={() => navigate(`/msp/work-orders/${woId}`)}>
      {woId}
    </Link>
  );

  const vm: AssetDetailViewModel = {
    name: asset.name,
    qrCaption: asset.qrCode,
    statusChip: <StatusChip status={asset.status} />,
    classification: [
      { label: 'Asset System', value: asset.assetSystem },
      { label: 'Sub-system', value: asset.subSystem },
      { label: 'Asset Type', value: asset.assetType },
    ],
    location: [
      { label: 'Building', value: asset.building },
      { label: 'Floor', value: asset.floor },
      { label: 'Area / Unit', value: asset.area },
    ],
    details: [
      { label: 'Asset Code', value: asset.code },
      { label: 'Model', value: asset.model },
      { label: 'Serial Number', value: asset.serialNumber },
      { label: 'Brand', value: asset.brand },
      { label: 'Purchase Date', value: formatDate(asset.purchaseDate) },
      { label: 'Manufactured Date', value: formatDate(asset.manufacturedDate) },
      { label: 'Status', value: <StatusChip status={asset.status} /> },
    ],
    maintenanceHistory: {
      headers: ['WO ID', 'Plan Name', 'Round', 'Completed Date', 'Technician', 'Status'],
      rows: maintenanceWos.map((w) => [
        woLink(w.id),
        (w.maintenancePlanId && maintenancePlanById(w.maintenancePlanId)?.name) || '-',
        w.maintenanceRound,
        formatDate(w.endTime),
        technicianName(w.mainTechnicianId),
        <StatusChip key={w.id} status={w.status} />,
      ]),
      empty: 'No maintenance history.',
    },
    relatedWorkOrders: {
      headers: ['WO ID', 'Type', 'Created Date', 'Status', 'Technician'],
      rows: relatedWos.map((w) => [
        woLink(w.id),
        w.type,
        formatDate(w.createdDate),
        <StatusChip key={w.id} status={w.status} />,
        technicianName(w.mainTechnicianId),
      ]),
      empty: 'No related work orders.',
    },
    pendingWorkOrders: {
      headers: ['WO ID', 'Type', 'Status'],
      rows: pendingWos.map((w) => [woLink(w.id), w.type, <StatusChip key={w.id} status={w.status} />]),
      empty: 'No pending work orders.',
    },
  };

  return (
    <Box>
      <PageHeader
        title={asset.name}
        subtitle={`${asset.code} · ${asset.assetSystem}`}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Assets', to: '/msp/assets' }, { label: asset.code }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => navigate('/msp/assets')}>
              <ArrowBackIcon />
            </IconButton>
            <StatusChip status={asset.status} />
          </Stack>
        }
      />

      <AssetDetailView
        vm={vm}
        actions={
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => toast('QR code downloaded.')}>
            Download QR
          </Button>
        }
      />
      {toastElement}
    </Box>
  );
}
