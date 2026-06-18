/**
 * Public Tenant Service Request portal (no authentication).
 *
 * Per the internal-feedback contract, the Tenant Portal is a public,
 * unauthenticated request-submission flow — no login, no sidebar, no
 * dashboards, no "My Requests" tracking. This page provides a lightweight
 * public shell (brand header + theme toggle) around the multi-step submit form.
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import SubmitServiceRequest from '../features/tenant/pages/SubmitServiceRequest';

export default function PublicServiceRequest() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public brand header */}
      <Box
        component="header"
        sx={(t) => ({
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(14px) saturate(180%)',
          backgroundColor: alpha(t.palette.background.default, 0.8),
          borderBottom: `1px solid ${t.palette.divider}`,
        })}
      >
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" sx={{ height: 64 }} spacing={2}>
            <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', display: 'inline-flex' }}>
              <Logo size="md" />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <ThemeToggle />
          </Stack>
        </Container>
      </Box>

      {/* Submit form */}
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <SubmitServiceRequest />
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 3 }}>
        <Container maxWidth="md">
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} I-ON · EZAxis — Public Service Request Portal.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
