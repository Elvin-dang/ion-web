/**
 * InfoField — a labelled read-only value pair for detail screens.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface InfoFieldProps {
  label: string;
  value: ReactNode;
}

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }} component="div">
        {value ?? '-'}
      </Typography>
    </Box>
  );
}
