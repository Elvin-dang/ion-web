/**
 * SectionCard — a soft-shadow card with optional title + action, used to group
 * detail/form sections across the MSP Supervisor screens.
 */
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export default function SectionCard({ title, action, children, noPadding }: SectionCardProps) {
  return (
    <Card
      sx={{
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardContent sx={noPadding ? { p: 0, '&:last-child': { pb: 0 } } : undefined}>
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              px: noPadding ? 2 : 0,
              pt: noPadding ? 2 : 0,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {action}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
