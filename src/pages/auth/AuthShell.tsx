/**
 * AuthShell — a two-pane responsive wrapper shared by Login / SignUp /
 * ForgotPassword. Left: brand panel (hidden on small screens). Right: the form.
 */
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ReactNode } from 'react';

import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

const HIGHLIGHTS = [
  'Role-aware portals for every operator',
  'Work orders, assets, inventory & plans',
  'Calm, data-dense dashboards & reporting',
];

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Brand panel */}
      <Box
        sx={(t) => ({
          display: { xs: 'none', md: 'flex' },
          width: '44%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: t.palette.primary.contrastText,
          background: `linear-gradient(150deg, ${t.palette.primary.dark}, ${t.palette.primary.main})`,
          position: 'relative',
          overflow: 'hidden',
        })}
      >
        <Box
          aria-hidden
          sx={(t) => ({
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(600px 300px at 90% 10%, ${alpha(
              t.palette.secondary.main,
              0.3,
            )}, transparent)`,
          })}
        />
        <Box sx={{ position: 'relative' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              display: 'inline-flex',
              p: 1,
              borderRadius: 2,
              bgcolor: alpha('#FFFFFF', 0.16),
            }}
          >
            <Logo size="md" />
          </Box>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h2" sx={{ color: 'inherit', mb: 2 }}>
            Smarter Facility & Maintenance Management
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 4 }}>
            One control plane for buildings, assets, work orders and the teams that keep them
            running.
          </Typography>
          <Stack spacing={1.5}>
            {HIGHLIGHTS.map((h) => (
              <Stack key={h} direction="row" spacing={1.25} alignItems="center">
                <CheckCircleIcon sx={{ color: 'secondary.light' }} />
                <Typography sx={{ opacity: 0.95 }}>{h}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ position: 'relative', opacity: 0.8 }}>
          © {new Date().getFullYear()} I-ON · EZAxis
        </Typography>
      </Box>

      {/* Form panel */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}>
          <ThemeToggle />
        </Stack>
        <Container
          maxWidth="sm"
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
            <Logo size="lg" />
          </Box>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
