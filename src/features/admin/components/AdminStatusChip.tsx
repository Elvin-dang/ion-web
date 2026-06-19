/**
 * AdminStatusChip — maps Admin-domain statuses (Active/Inactive/Pending/
 * Cancelled/Suspended/Approval Rejected + WO statuses) to soft tinted pills.
 * Builds on the brand status palette to stay theme-token driven.
 */
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { brandTokens } from '../../../theme/theme';

const S = brandTokens.status;

const MAP: Record<string, string> = {
  active: S.completed,
  inactive: S.scheduled,
  archived: S.scheduled,
  pending: S.scheduled,
  'pending - unassigned': S.open,
  suspended: S.overdue,
  cancelled: S.overdue,
  'approval rejected': S.overdue,
  assigned: S.open,
  started: S.inProgress,
  'in progress': S.inProgress,
  completed: S.completed,
  verified: S.completed,
  closed: S.completed,
  consumed: S.completed,
  reversed: S.overdue,
  released: S.scheduled,
  reserved: S.inProgress,
  'awaiting bm decision': S.overdue,
  'approved to continue': S.completed,
  'waiting for restock': S.scheduled,
};

export default function AdminStatusChip({ status, size = 'small' }: { status: string; size?: 'small' | 'medium' }) {
  const color = MAP[status.trim().toLowerCase()];
  return (
    <Chip
      size={size}
      label={status}
      sx={
        color
          ? { backgroundColor: alpha(color, 0.14), color, fontWeight: 600 }
          : { backgroundColor: 'action.hover', color: 'text.secondary', fontWeight: 600 }
      }
    />
  );
}
