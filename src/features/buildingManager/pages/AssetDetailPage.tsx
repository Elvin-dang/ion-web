/**
 * 3.5.2 Asset Detail + 3.5.7-3.5.13 As-Built Drawing & Asset Tag management.
 * Renders the shared AssetDetailView (QR header, classification/location/details
 * and the three WO history tables) with BM action buttons (Edit / Deactivate-
 * Activate / Download QR) and a BM-only "As-Built Drawing" extra tab where tags
 * can be placed/moved/removed.
 */
import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import AssetDetailView from '../../../components/AssetDetailView';
import type { AssetDetailViewModel, AssetExtraTab } from '../../../components/AssetDetailView';
import { useToast } from '../components/shared';
import { assets, workOrders, buildingName } from '../data/mockData';
import type { AssetStatus } from '../data/types';
import { formatDate } from '../../../utils/date';

interface Tag {
  id: number;
  x: number;
  y: number;
  label: string;
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, node } = useToast();
  const asset = assets.find((a) => a.id === id);

  const [status, setStatus] = useState<AssetStatus>(asset?.status ?? 'Active');
  const [hasDrawing, setHasDrawing] = useState(true);
  const [tags, setTags] = useState<Tag[]>([{ id: 1, x: 40, y: 50, label: asset?.code ?? 'TAG' }]);
  const [placing, setPlacing] = useState(false);
  const [deleteDrawingOpen, setDeleteDrawingOpen] = useState(false);

  if (!asset) {
    return (
      <Box>
        <PageHeader title="Asset Detail" breadcrumbs={[{ label: 'Assets', to: '/bm/assets' }, { label: 'Not Found' }]} />
        <EmptyState title="Failed to load asset details. Please go back and try again." />
      </Box>
    );
  }

  const relatedWos = workOrders.filter((w) => w.assetCode === asset.code);
  const maintenanceWos = relatedWos.filter((w) => w.type === 'Maintenance Scheduling' && (w.status === 'Closed' || w.status === 'Verified'));
  const pendingWos = relatedWos.filter((w) => w.status !== 'Closed' && w.status !== 'Cancelled');

  const handleDrawingClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTags((prev) => [...prev, { id: Date.now(), x, y, label: asset.code }]);
    setPlacing(false);
    show('Asset tag placed on drawing.');
  };

  const woLink = (woId: string) => (
    <Link component={RouterLink} to={`/bm/work-orders/${woId}`} underline="hover">
      {woId}
    </Link>
  );

  const vm: AssetDetailViewModel = {
    name: asset.name,
    qrCaption: asset.code,
    statusChip: <StatusChip status={status} />,
    classification: [
      { label: 'Asset System', value: asset.assetSystem },
      { label: 'Sub-system', value: asset.subSystem },
      { label: 'Asset Type', value: asset.assetType },
    ],
    location: [
      { label: 'Building', value: buildingName(asset.buildingId) },
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
      { label: 'Status', value: <StatusChip status={status} /> },
    ],
    maintenanceHistory: {
      headers: ['WO ID', 'Plan Name', 'Round', 'Completed Date', 'Technician', 'Status'],
      rows: maintenanceWos.map((w) => [
        woLink(w.id),
        w.planRef?.planName ?? '—',
        w.planRef?.round ?? '—',
        w.endTime,
        w.mainTechnician?.name ?? '—',
        <StatusChip key={w.id} status={w.status} />,
      ]),
      empty: 'No maintenance history.',
    },
    relatedWorkOrders: {
      headers: ['WO ID', 'Type', 'Created Date', 'Status', 'Technician'],
      rows: relatedWos.map((w) => [
        woLink(w.id),
        w.type,
        w.createdDate,
        <StatusChip key={w.id} status={w.status} />,
        w.mainTechnician?.name ?? '—',
      ]),
      empty: 'No related work orders.',
    },
    pendingWorkOrders: {
      headers: ['WO ID', 'Type', 'Created Date', 'Current Status'],
      rows: pendingWos.map((w) => [woLink(w.id), w.type, w.createdDate, <StatusChip key={w.id} status={w.status} />]),
      empty: 'No pending work orders.',
    },
  };

  const asBuiltTab: AssetExtraTab = {
    label: 'As-Built Drawing',
    content: (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Stack direction="row" spacing={1}>
            {!hasDrawing ? (
              <Button variant="outlined" component="label" size="small" startIcon={<UploadFileIcon />} sx={{ borderRadius: 8 }}>
                Upload Drawing
                <input hidden type="file" accept=".pdf,image/*" onChange={() => { setHasDrawing(true); show('As-built drawing uploaded.'); }} />
              </Button>
            ) : (
              <>
                <Button variant={placing ? 'contained' : 'outlined'} size="small" startIcon={<PlaceIcon />} onClick={() => setPlacing((p) => !p)} sx={{ borderRadius: 8 }}>
                  {placing ? 'Click drawing to place' : 'Place Asset Tag'}
                </Button>
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => setDeleteDrawingOpen(true)} sx={{ borderRadius: 8 }}>
                  Delete Drawing
                </Button>
              </>
            )}
          </Stack>
        </Box>
        {!hasDrawing ? (
          <EmptyState title="No as-built drawing uploaded." description="Upload a floor plan to start placing asset tags." />
        ) : (
          <>
            <Paper
              variant="outlined"
              onClick={handleDrawingClick}
              sx={(t) => ({
                position: 'relative',
                height: 420,
                borderRadius: '16px',
                cursor: placing ? 'crosshair' : 'default',
                backgroundColor: alpha(t.palette.primary.main, 0.04),
                backgroundImage: `linear-gradient(${alpha(t.palette.divider, 0.6)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(t.palette.divider, 0.6)} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                overflow: 'hidden',
              })}
            >
              {tags.map((tag) => (
                <Tooltip key={tag.id} title={`${tag.label} (click X to remove)`}>
                  <Box sx={{ position: 'absolute', left: `${tag.x}%`, top: `${tag.y}%`, transform: 'translate(-50%, -100%)', textAlign: 'center' }}>
                    <PlaceIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box sx={(t) => ({ mt: -0.5, px: 0.5, borderRadius: 1, backgroundColor: t.palette.primary.main, color: t.palette.primary.contrastText, fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 0.5 })}>
                      {tag.label}
                      <IconButton size="small" sx={{ p: 0, color: 'inherit' }} onClick={(e) => { e.stopPropagation(); setTags((p) => p.filter((x) => x.id !== tag.id)); show('Asset tag removed from drawing.'); }}>
                        <DeleteIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Tooltip>
              ))}
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {tags.length} asset tag(s) placed. Use "Place Asset Tag" then click on the drawing. Tag positions are saved automatically.
            </Typography>
          </>
        )}
      </>
    ),
  };

  return (
    <Box>
      <PageHeader
        title={asset.name}
        breadcrumbs={[{ label: 'Assets', to: '/bm/assets' }, { label: asset.code }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StatusChip status={status} />
            <Typography variant="body2" color="text.secondary">Code: {asset.code}</Typography>
          </Stack>
        }
      />

      <AssetDetailView
        vm={vm}
        actions={
          <>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => show('QR code download started.')} sx={{ borderRadius: 8 }}>
              Download QR
            </Button>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => navigate('/bm/assets')} sx={{ borderRadius: 8 }}>
              Edit
            </Button>
            {status === 'Inactive' ? (
              <Button variant="outlined" color="success" size="small" startIcon={<CheckCircleIcon />} onClick={() => { setStatus('Active'); show('Asset activated successfully.'); }} sx={{ borderRadius: 8 }}>
                Activate
              </Button>
            ) : (
              <Button variant="outlined" color="error" size="small" startIcon={<BlockIcon />} onClick={() => { setStatus('Inactive'); show('Asset deactivated successfully.'); }} sx={{ borderRadius: 8 }}>
                Deactivate
              </Button>
            )}
          </>
        }
        extraTabs={[asBuiltTab]}
      />

      <ConfirmDialog
        open={deleteDrawingOpen}
        title="Delete As-Built Drawing"
        description="Delete this drawing? All placed asset tags will also be removed."
        destructive
        confirmLabel="Delete"
        onConfirm={() => { setHasDrawing(false); setTags([]); setDeleteDrawingOpen(false); show('As-built drawing deleted.'); }}
        onClose={() => setDeleteDrawingOpen(false)}
      />
      {node}
    </Box>
  );
}
