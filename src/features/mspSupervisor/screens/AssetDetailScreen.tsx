/**
 * 5.4.2 View Asset Detail (MSP Supervisor — Read-only). Classification, location,
 * details + Maintenance History (5.5.5), Related WO History and Pending WO
 * tables. All WO IDs deep-link to WO Detail (5.3.3). No edit/deactivate.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import InfoField from '../components/InfoField';
import StatusChip from '../../../components/StatusChip';
import EmptyState from '../../../components/EmptyState';
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

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <SectionCard title="QR Code">
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ width: 120, height: 120, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode2Icon sx={{ fontSize: 80, color: 'text.secondary' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {asset.qrCode}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => toast('QR code downloaded.')}
                >
                  Download QR
                </Button>
              </Stack>
            </SectionCard>
            <SectionCard title="Classification">
              <InfoField label="Asset System" value={asset.assetSystem} />
              <InfoField label="Asset Sub-system" value={asset.subSystem} />
              <InfoField label="Asset Type" value={asset.assetType} />
            </SectionCard>
            <SectionCard title="Location">
              <InfoField label="Building" value={asset.building} />
              <InfoField label="Floor" value={asset.floor} />
              <InfoField label="Area / Unit" value={asset.area} />
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Asset Details">
              <Grid container spacing={1}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Asset Code" value={asset.code} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Model" value={asset.model} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Serial Number" value={asset.serialNumber} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Brand" value={asset.brand} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Purchase Date" value={formatDate(asset.purchaseDate)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Manufactured Date" value={formatDate(asset.manufacturedDate)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <InfoField label="Status" value={<StatusChip status={asset.status} />} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Maintenance History">
              {maintenanceWos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No maintenance history.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>WO ID</TableCell>
                      <TableCell>Plan Name</TableCell>
                      <TableCell>Round</TableCell>
                      <TableCell>Completed Date</TableCell>
                      <TableCell>Technician</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceWos.map((w) => (
                      <TableRow key={w.id} hover>
                        <TableCell>{woLink(w.id)}</TableCell>
                        <TableCell>{(w.maintenancePlanId && maintenancePlanById(w.maintenancePlanId)?.name) || '-'}</TableCell>
                        <TableCell>{w.maintenanceRound}</TableCell>
                        <TableCell>{formatDate(w.endTime)}</TableCell>
                        <TableCell>{technicianName(w.mainTechnicianId)}</TableCell>
                        <TableCell>
                          <StatusChip status={w.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>

            <SectionCard title="Related Work Order History">
              {relatedWos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No related work orders.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>WO ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Created Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Technician</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatedWos.map((w) => (
                      <TableRow key={w.id} hover>
                        <TableCell>{woLink(w.id)}</TableCell>
                        <TableCell>{w.type}</TableCell>
                        <TableCell>{formatDate(w.createdDate)}</TableCell>
                        <TableCell>
                          <StatusChip status={w.status} />
                        </TableCell>
                        <TableCell>{technicianName(w.mainTechnicianId)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>

            <SectionCard title="Pending Work Orders">
              {pendingWos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending work orders.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>WO ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingWos.map((w) => (
                      <TableRow key={w.id} hover>
                        <TableCell>{woLink(w.id)}</TableCell>
                        <TableCell>{w.type}</TableCell>
                        <TableCell>
                          <StatusChip status={w.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
      {toastElement}
    </Box>
  );
}
