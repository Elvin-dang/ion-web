/**
 * StatusChip — maps work-order / request statuses to soft tinted pill chips
 * using the brand status palette (brandTokens.status). Renders as a 12%-tint
 * fill with the saturated color as text, per the styleguide.
 *
 * FEATURE AGENTS: pass any status string; unknown values fall back to neutral.
 */
import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { brandTokens } from '../theme/theme';

const STATUS_COLORS: Record<string, string> = {
  open: brandTokens.status.open,
  new: brandTokens.status.open,
  unassigned: brandTokens.status.open,
  in_progress: brandTokens.status.inProgress,
  'in progress': brandTokens.status.inProgress,
  assigned: brandTokens.status.inProgress,
  completed: brandTokens.status.completed,
  done: brandTokens.status.completed,
  closed: brandTokens.status.completed,
  approved: brandTokens.status.completed,
  overdue: brandTokens.status.overdue,
  breached: brandTokens.status.overdue,
  rejected: brandTokens.status.overdue,
  declined: brandTokens.status.overdue,
  scheduled: brandTokens.status.scheduled,
  planned: brandTokens.status.scheduled,
  pending: brandTokens.status.scheduled,
};

function normalize(status: string): string {
  return status.trim().toLowerCase().replace(/-/g, '_');
}

function labelize(status: string): string {
  return status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusChipProps extends Omit<ChipProps, 'color' | 'label'> {
  status: string;
  /** Optional override label; defaults to a title-cased status. */
  label?: string;
}

export default function StatusChip({ status, label, sx, size = 'small', ...rest }: StatusChipProps) {
  const key = normalize(status);
  const color = STATUS_COLORS[key];

  return (
    <Chip
      size={size}
      label={label ?? labelize(status)}
      sx={[
        color
          ? { backgroundColor: alpha(color, 0.12), color, fontWeight: 600 }
          : { backgroundColor: 'action.hover', color: 'text.secondary', fontWeight: 600 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
}
