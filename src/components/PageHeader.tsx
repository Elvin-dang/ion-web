/**
 * PageHeader — title, optional subtitle, breadcrumbs and an optional action
 * button/area. Drop at the top of any feature screen for a consistent header.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface Breadcrumb {
  label: string;
  /** If omitted, rendered as plain text (the current page). */
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, action }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 1, '& .MuiBreadcrumbs-li': { fontSize: '0.8125rem' } }}
        >
          {breadcrumbs.map((bc, i) =>
            bc.to ? (
              <Link
                key={i}
                component={RouterLink}
                to={bc.to}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: '0.8125rem' }}
              >
                {bc.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {bc.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
