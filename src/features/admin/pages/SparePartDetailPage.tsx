/**
 * 1.6.6 View Spare Part Detail — left: General / Stock / Supporting info
 * sections (each with edit pencil → edit dialog, 1.6.8). Right: stock counters
 * (Total / Available / On-Hold), Set Active/Inactive toggle and a history
 * timeline. Layout matches the cross-role standard Spare Part Detail.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import SparePartDetailView, { type SparePartDetailVM } from '../../../components/SparePartDetailView';
import { useToast } from '../components/AdminToast';
import { spareParts, systemName, subsystemName, typeName } from '../data/mockData';
import { formatDate } from '../../../utils/date';

const HISTORY_PREVIEW = 5;

export default function SparePartDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, node } = useToast();
  const part = spareParts.find((p) => p.id === id);
  const [status, setStatus] = useState(part?.status ?? 'Active');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const vm = useMemo<SparePartDetailVM | null>(() => {
    if (!part) return null;
    const usageDate = part.history.find((h) => h.action === 'Stock-Out')?.date;
    const fullHistory = part.history;
    const visible = showAllHistory ? fullHistory : fullHistory.slice(0, HISTORY_PREVIEW);
    return {
      name: part.name,
      createdAt: part.createdAt,
      status,
      totalStock: part.totalStock,
      available: part.totalStock - part.onHold,
      onHold: part.onHold,
      general: [
        { label: 'ID / Code', value: part.code },
        { label: 'Location', value: part.location },
        { label: 'Asset Type', value: typeName(part.typeId) },
        { label: 'Sub-system', value: subsystemName(part.subsystemId) },
        { label: 'Asset System', value: systemName(part.systemId) },
        { label: 'Brand', value: part.brand },
        { label: 'Model', value: part.model },
        { label: 'Serial Number', value: part.serial },
      ],
      stock: [
        { label: 'Quantity', value: part.totalStock },
        { label: 'Department', value: part.department },
        { label: 'Store Room', value: part.storeRoom },
        { label: 'Origin', value: part.origin },
        { label: 'Purchase Date', value: formatDate(part.purchaseDate) },
        { label: 'Year of Manufacture', value: part.yearOfManufacture },
        { label: 'Usage Date', value: formatDate(usageDate) },
        { label: 'Warranty Expiry Date', value: formatDate(part.warrantyExpiry) },
      ],
      specification: part.specification,
      photos: [],
      documents: [],
      history: visible.map((h) => ({
        id: h.id,
        action: h.action,
        quantity: h.quantity,
        timestamp: h.date,
        reference: `${h.reference} · ${h.recordedBy}`,
      })),
    };
  }, [part, status, showAllHistory]);

  if (!part || !vm) {
    return <Box><PageHeader title="Spare Part" /><EmptyState title="Not found" description="Failed to load spare part details. Please go back and try again." action={<Button onClick={() => navigate('/admin/inventory')}>Back</Button>} /></Box>;
  }

  const toggleStatus = () => {
    const ns = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(ns);
    toast(ns === 'Active' ? 'Spare part activated successfully.' : 'Spare part deactivated successfully.');
  };

  return (
    <Box>
      <PageHeader title={part.name} breadcrumbs={[{ label: 'Inventory', to: '/admin/inventory' }, { label: part.name }]} />
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/inventory')} sx={{ mb: 2 }}>Back to Inventory</Button>

      <SparePartDetailView
        vm={vm}
        headerActions={
          <Button variant="outlined" onClick={toggleStatus}>
            {status === 'Active' ? 'Set Inactive' : 'Set Active'}
          </Button>
        }
        onEditGeneral={() => toast('Edit General Info (demo).')}
        onEditStock={() => toast('Edit Stock Info (demo).')}
        onEditSupporting={() => toast('Edit Supporting Info (demo).')}
        onViewMoreHistory={part.history.length > HISTORY_PREVIEW ? () => setShowAllHistory((s) => !s) : undefined}
      />
      {node}
    </Box>
  );
}
