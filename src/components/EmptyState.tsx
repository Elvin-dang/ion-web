/**
 * EmptyState — a centered placeholder for empty lists, no-results searches and
 * not-yet-implemented screens. Optional icon, title, description and action.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Defaults to an inbox icon. Pass any MUI icon element. */
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={(theme) => ({
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: 'primary.main',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '& svg': { fontSize: 34 },
        })}
      >
        {icon ?? <InboxIcon />}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}
