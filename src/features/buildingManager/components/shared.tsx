/**
 * Shared building-manager UI helpers: soft-shadow hover card, detail field rows,
 * section card, history log, KPI card, and a lightweight toast hook.
 */
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import type { HistoryEntry } from '../data/types';

/** Soft-shadow card that lifts on hover (per styleguide). */
export function HoverCard({ children, sx, onClick }: { children: ReactNode; sx?: object; onClick?: () => void }) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': onClick
          ? { boxShadow: 6, transform: 'translateY(-2px)' }
          : { boxShadow: 3 },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

/** A section container with a title heading and optional action slot. */
export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

/** A label/value pair for read-only detail screens. */
export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

/** KPI metric card for the dashboard. */
export function KpiCard({
  label,
  value,
  color,
  icon,
  onClick,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <HoverCard onClick={onClick} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(color, 0.12),
            color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </HoverCard>
  );
}

/** Scrollable history log timeline. */
export function HistoryLog({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No transaction history yet.
      </Typography>
    );
  }
  return (
    <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 1 }}>
      <Stack spacing={2}>
        {entries.map((e, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
            <Box
              sx={(t) => ({
                mt: 0.5,
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: t.palette.primary.main,
              })}
            />
            <Box>
              <Typography variant="body2">{e.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {e.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

/** Lightweight toast hook used across BM screens for success/error feedback. */
// eslint-disable-next-line react-refresh/only-export-components -- shared BM helpers co-located by design
export function useToast() {
  const [state, setState] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const show = useCallback((message: string, severity: AlertColor = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const node = (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={close} severity={state.severity} variant="filled" sx={{ borderRadius: 3 }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { show, node };
}
