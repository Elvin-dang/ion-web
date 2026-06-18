/**
 * 3.5.2 Asset Detail + 3.5.7-3.5.13 As-Built Drawing & Asset Tag management.
 * QR code, classification/location/details, maintenance & WO history tables,
 * and an interactive as-built drawing where tags can be placed/moved/removed.
 */
import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import Chip from '@mui/material/Chip';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import { SectionCard, DetailField, useToast } from '../components/shared';
import { assets, workOrders, buildingName } from '../data/mockData';
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

  const [tab, setTab] = useState(0);
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

  return (
    <Box>
      <PageHeader
        title={asset.name}
        breadcrumbs={[{ label: 'Assets', to: '/bm/assets' }, { label: asset.code }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => show('QR code download started.')} sx={{ borderRadius: 8 }}>
              Download QR
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate('/bm/assets')} sx={{ borderRadius: 8 }}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => navigate('/bm/assets')} sx={{ borderRadius: 8 }}>
              Deactivate
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <StatusChip status={asset.status} />
        <Typography variant="body2" color="text.secondary">Code: {asset.code}</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="QR Code">
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Box sx={(t) => ({ width: 160, height: 160, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(t.palette.primary.main, 0.08), color: 'primary.main' })}>
                <QrCode2Icon sx={{ fontSize: 120 }} />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" align="center" display="block">{asset.code}</Typography>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Asset Classification">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset System" value={asset.assetSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Sub-system" value={asset.subSystem} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Type" value={asset.assetType} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Tag" value={asset.assetTag} /></Grid>
            </Grid>
          </SectionCard>
          <SectionCard title="Location">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Building" value={buildingName(asset.buildingId)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Floor" value={asset.floor} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Area / Unit" value={asset.area} /></Grid>
            </Grid>
          </SectionCard>
          <SectionCard title="Asset Details">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Asset Code" value={asset.code} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Model" value={asset.model} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Serial Number" value={asset.serialNumber} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Brand" value={asset.brand} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Origin" value={asset.origin} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Purchase Date" value={formatDate(asset.purchaseDate)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Year of Manufacture" value={asset.yearOfManufacture} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Manufactured Date" value={formatDate(asset.manufacturedDate)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Usage Date" value={formatDate(asset.usageDate)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Warranty Expiry Date" value={formatDate(asset.warrantyExpiry)} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Status" value={asset.status} /></Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Supporting / Additional Information">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}><DetailField label="Specification" value={asset.specification} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><DetailField label="Maintenance Frequency" value={asset.maintenanceFrequency} /></Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>Photos</Typography>
            {asset.photos > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.from({ length: asset.photos }).map((_, i) => (
                  <Box key={i} sx={(t) => ({ width: 72, height: 72, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(t.palette.primary.main, 0.08), color: 'primary.main' })}>
                    <ImageIcon />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No photos attached.</Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, mb: 0.5 }}>Relevant Documents</Typography>
            {(asset.documents ?? 0) > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.from({ length: asset.documents ?? 0 }).map((_, i) => (
                  <Chip key={i} icon={<DescriptionIcon />} label={`Document ${i + 1}.pdf`} variant="outlined" sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No documents attached.</Typography>
            )}
          </SectionCard>

          <SectionCard title="Work Checklist">
            {(asset.checklist?.length ?? 0) === 0 ? (
              <Typography variant="body2" color="text.secondary">No checklist items configured.</Typography>
            ) : (
              <Table size="small">
                <TableHead><TableRow><TableCell>Checklist Item</TableCell><TableCell>Description</TableCell><TableCell>Photos</TableCell></TableRow></TableHead>
                <TableBody>
                  {asset.checklist!.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.requireDescription ? 'Required' : 'Optional'}</TableCell>
                      <TableCell>{c.requirePhotos ? 'Required' : 'Optional'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Maintenance History" />
        <Tab label="Related Work Orders" />
        <Tab label="Pending Work Orders" />
        <Tab label="As-Built Drawing" />
      </Tabs>

      {tab === 0 && (
        <SectionCard title="Maintenance History">
          {maintenanceWos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No maintenance history.</Typography>
          ) : (
            <Table size="small">
              <TableHead><TableRow><TableCell>WO ID</TableCell><TableCell>Plan</TableCell><TableCell>Round</TableCell><TableCell>Completed Date</TableCell><TableCell>Technician</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {maintenanceWos.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell><Link component={RouterLink} to={`/bm/work-orders/${w.id}`} underline="hover">{w.id}</Link></TableCell>
                    <TableCell>{w.planRef?.planName ?? '—'}</TableCell>
                    <TableCell>{w.planRef?.round ?? '—'}</TableCell>
                    <TableCell>{w.endTime}</TableCell>
                    <TableCell>{w.mainTechnician?.name ?? '—'}</TableCell>
                    <TableCell><StatusChip status={w.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      )}

      {tab === 1 && (
        <SectionCard title="Related Work Orders">
          {relatedWos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No related work orders.</Typography>
          ) : (
            <Table size="small">
              <TableHead><TableRow><TableCell>WO ID</TableCell><TableCell>Type</TableCell><TableCell>Created Date</TableCell><TableCell>Status</TableCell><TableCell>Technician</TableCell></TableRow></TableHead>
              <TableBody>
                {relatedWos.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell><Link component={RouterLink} to={`/bm/work-orders/${w.id}`} underline="hover">{w.id}</Link></TableCell>
                    <TableCell>{w.type}</TableCell>
                    <TableCell>{w.createdDate}</TableCell>
                    <TableCell><StatusChip status={w.status} /></TableCell>
                    <TableCell>{w.mainTechnician?.name ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      )}

      {tab === 2 && (
        <SectionCard title="Pending Work Orders">
          {pendingWos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No pending work orders.</Typography>
          ) : (
            <Table size="small">
              <TableHead><TableRow><TableCell>WO ID</TableCell><TableCell>Type</TableCell><TableCell>Created Date</TableCell><TableCell>Current Status</TableCell></TableRow></TableHead>
              <TableBody>
                {pendingWos.map((w) => (
                  <TableRow key={w.id} hover>
                    <TableCell><Link component={RouterLink} to={`/bm/work-orders/${w.id}`} underline="hover">{w.id}</Link></TableCell>
                    <TableCell>{w.type}</TableCell>
                    <TableCell>{w.createdDate}</TableCell>
                    <TableCell><StatusChip status={w.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      )}

      {tab === 3 && (
        <SectionCard
          title="As-Built Drawing"
          action={
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
          }
        >
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
                  borderRadius: 3,
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
        </SectionCard>
      )}

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
