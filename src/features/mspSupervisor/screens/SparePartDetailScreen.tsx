/**
 * 5.4.5 View Spare Part Detail (MSP Supervisor — Read-only). Uses the shared
 * cross-role SparePartDetailView with NO edit pencils and NO Set Active/Inactive
 * actions — full read-only.
 */
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import SparePartDetailView, { type SparePartDetailVM } from '../../../components/SparePartDetailView';
import { formatDate } from '../../../utils/date';
import { spareParts } from '../data/mockData';

export default function SparePartDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const part = useMemo(() => spareParts.find((p) => p.id === id), [id]);

  const vm = useMemo<SparePartDetailVM | null>(() => {
    if (!part) return null;
    // Creation timestamp: earliest history entry, else purchase date.
    const createdAt = part.history[part.history.length - 1]?.timestamp ?? part.purchaseDate;
    return {
      name: part.name,
      createdAt,
      status: part.status,
      totalStock: part.totalStock,
      available: part.available,
      onHold: part.onHold,
      general: [
        { label: 'Spare Part Code', value: part.code },
        { label: 'Location', value: part.location },
        { label: 'Asset Type', value: part.assetType },
        { label: 'Sub-system', value: part.subSystem },
        { label: 'Asset System', value: part.assetSystem },
        { label: 'Brand', value: part.brand },
        { label: 'Model', value: part.model },
        { label: 'Serial Number', value: part.serialNumber },
      ],
      stock: [
        { label: 'Quantity', value: part.totalStock },
        { label: 'Department', value: part.department },
        { label: 'Store Room', value: part.storeRoom },
        { label: 'Origin', value: part.origin },
        { label: 'Purchase Date', value: formatDate(part.purchaseDate) },
        { label: 'Year of Manufacture', value: part.yearOfManufacture },
        { label: 'Usage Date', value: formatDate(part.usageDate) },
        { label: 'Warranty Expiry Date', value: formatDate(part.warrantyExpiry) },
      ],
      specification: part.specification,
      photos: Array.from({ length: part.photos }, (_, i) => ({ label: `Photo ${i + 1}` })),
      documents: Array.from({ length: part.documents }, (_, i) => ({ label: `Doc ${i + 1}` })),
      history: part.history.map((h, i) => ({
        id: `${i}`,
        action: h.action,
        quantity: h.qty,
        timestamp: h.timestamp,
        reference: h.reference,
      })),
    };
  }, [part]);

  if (!part || !vm) {
    return (
      <Box>
        <PageHeader title="Spare Part" breadcrumbs={[{ label: 'Inventory', to: '/msp/inventory' }, { label: 'Not found' }]} />
        <EmptyState title="Spare part not found" description="Failed to load spare part details. Please go back and try again." action={<Button variant="contained" onClick={() => navigate('/msp/inventory')}>Back to list</Button>} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={part.name}
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Inventory', to: '/msp/inventory' }, { label: part.code }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => navigate('/msp/inventory')}>
              <ArrowBackIcon />
            </IconButton>
          </Stack>
        }
      />

      {/* Read-only: no headerActions, no onEdit* pencils, no View more handler. */}
      <SparePartDetailView vm={vm} onViewMoreHistory={() => {}} />
    </Box>
  );
}
