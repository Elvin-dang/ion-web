/**
 * SectionCard — a soft-shadowed, hover-lifting card wrapper with an optional
 * title row + action slot. Used to frame tables, forms and detail sections.
 */
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}

export default function SectionCard({ title, action, children, noPad }: SectionCardProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: '16px',
        p: noPad ? 0 : { xs: 2, sm: 2.5 },
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': { boxShadow: 6 },
      }}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            px: noPad ? 2.5 : 0,
            pt: noPad ? 2.5 : 0,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Paper>
  );
}
