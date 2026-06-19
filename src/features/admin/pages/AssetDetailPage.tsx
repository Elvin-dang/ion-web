/**
 * 1.5.13 View Asset Detail (+ 1.7.8 Maintenance History access point). Renders
 * the shared AssetDetailView with SA action buttons (Edit / Deactivate-Activate
 * / Download QR). Classification / location / detail sections and the three
 * history tables come from the shared layout.
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import AssetDetailView from '../../../components/AssetDetailView';
import type { AssetDetailViewModel } from '../../../components/AssetDetailView';
import AdminStatusChip from '../components/AdminStatusChip';
import { useToast } from '../components/AdminToast';
import { formatDate } from '../../../utils/date';
import { assets, maintenancePlans, systemName, subsystemName, typeName, buildingName, floorName, areaName } from '../data/mockData';
import type { ActiveStatus } from '../data/types';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const asset = assets.find((a) => a.id === id);
  const [status, setStatus] = useState<ActiveStatus>(asset?.status ?? 'Active');

  if (!asset) {
    return <Box><PageHeader title="Asset" /><EmptyState title="Asset not found" description="Failed to load asset details. Please go back and try again." action={<Button onClick={() => navigate('/admin/assets')}>Back to Assets</Button>} /></Box>;
  }

  const wos = maintenancePlans.flatMap((p) => p.workOrders.filter((w) => w.assetId === asset.id).map((w) => ({ ...w, plan: p.name })));
  const maintenance = wos.filter((w) => w.status === 'Closed');
  const pending = wos.filter((w) => w.status !== 'Closed' && w.status !== 'Cancelled');

  const vm: AssetDetailViewModel = {
    name: asset.name,
    qrCaption: asset.code,
    statusChip: <AdminStatusChip status={status} />,
    classification: [
      { label: 'Asset System', value: systemName(asset.systemId) },
      { label: 'Sub-system', value: subsystemName(asset.subsystemId) },
      { label: 'Asset Type', value: typeName(asset.typeId) },
    ],
    location: [
      { label: 'Building', value: buildingName(asset.buildingId) },
      { label: 'Floor', value: floorName(asset.buildingId, asset.floorId) },
      { label: 'Area / Unit', value: areaName(asset.buildingId, asset.floorId, asset.areaId) },
    ],
    details: [
      { label: 'Asset Code', value: asset.code },
      { label: 'QR Code', value: asset.qrCode || asset.code },
      { label: 'Manufacturer', value: asset.manufacturer || '—' },
      { label: 'Model', value: asset.model || '—' },
      { label: 'Serial Number', value: asset.serial || '—' },
      { label: 'Brand', value: asset.brand || '—' },
      { label: 'Installation Date', value: formatDate(asset.installationDate) },
      { label: 'Purchase Date', value: formatDate(asset.purchaseDate) },
      { label: 'Manufactured Date', value: formatDate(asset.manufacturedDate) },
      { label: 'Status', value: <AdminStatusChip status={status} /> },
      { label: 'Description / Remarks', value: asset.description || '—' },
      { label: 'Supporting Documents', value: asset.documents?.length ? asset.documents.map((d) => d.name).join(', ') : '—' },
    ],
    maintenanceHistory: {
      headers: ['WO ID', 'Plan Name', 'Round', 'Completed Date', 'Technician', 'Status'],
      rows: maintenance.map((w) => [w.id, w.plan, w.round, formatDate(w.completionDate), w.technician, <AdminStatusChip key={w.id} status={w.status} />]),
      empty: 'No maintenance history.',
    },
    relatedWorkOrders: {
      headers: ['WO ID', 'Type', 'Round', 'Technician', 'Status'],
      rows: wos.map((w) => [w.id, 'Maintenance Scheduling', w.round, w.technician, <AdminStatusChip key={w.id} status={w.status} />]),
      empty: 'No related work orders.',
    },
    pendingWorkOrders: {
      headers: ['WO ID', 'Type', 'Assigned To', 'Status'],
      rows: pending.map((w) => [w.id, 'Maintenance Scheduling', w.technician, <AdminStatusChip key={w.id} status={w.status} />]),
      empty: 'No pending work orders.',
    },
  };

  return (
    <Box>
      <PageHeader title={asset.name} breadcrumbs={[{ label: 'Assets', to: '/admin/assets' }, { label: asset.name }]} />
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/assets')} sx={{ mb: 2 }}>Back to Asset List</Button>

      <AssetDetailView
        vm={vm}
        actions={
          <>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => toast(`${asset.code}_QR.png downloaded.`)}>Download QR</Button>
            <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/admin/assets/${asset.id}/edit`)}>Edit</Button>
            {status === 'Active'
              ? <Button size="small" color="error" startIcon={<BlockIcon />} onClick={() => { setStatus('Inactive'); toast('Asset deactivated successfully.'); }}>Deactivate</Button>
              : <Button size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => { setStatus('Active'); toast('Asset activated successfully.'); }}>Activate</Button>}
          </>
        }
      />
      {node}
    </Box>
  );
}
