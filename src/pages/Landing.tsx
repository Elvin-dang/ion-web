/**
 * Public marketing landing page (/) for the I-ON (EZAxis) CMMS product.
 * Hero + features + testimonials + footer. If authenticated, the hero CTA
 * becomes "Go to Dashboard".
 */
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';

import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_HOME } from '../config/navTypes';

const FEATURES = [
  {
    icon: <PrecisionManufacturingOutlinedIcon />,
    title: 'Asset Management',
    desc: 'A clear System → Sub-system → Type → Asset hierarchy with QR codes and as-built drawing tags.',
  },
  {
    icon: <AssignmentTurnedInOutlinedIcon />,
    title: 'Work Orders',
    desc: 'From request to sign-off — assign, track and close work with a two-level approval chain.',
  },
  {
    icon: <EventRepeatOutlinedIcon />,
    title: 'Maintenance Plans',
    desc: 'Schedule preventive maintenance and auto-generate work orders before issues appear.',
  },
  {
    icon: <Inventory2OutlinedIcon />,
    title: 'Inventory & Spare Parts',
    desc: 'Stock-in / stock-out, on-hold reservations and low-stock alerts tied to work-order usage.',
  },
  {
    icon: <InsightsOutlinedIcon />,
    title: 'Dashboards & Reporting',
    desc: 'Role-specific KPIs, utilization and maintenance-trend reports with a flexible report builder.',
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: 'Multi-Role Portals',
    desc: 'Tailored surfaces for Super Admin, Building Manager, MSP Supervisor and Tenant.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Helena Brooks',
    title: 'Director of Operations, Meridian Towers',
    quote:
      'EZAxis cut our work-order turnaround in half. The status color system means my team always knows what needs attention first.',
    avatar: 'HB',
  },
  {
    name: 'Daniel Okafor',
    title: 'Facilities Lead, Crestline Group',
    quote:
      'Asset hierarchy and QR drawings finally made our maintenance data trustworthy. Onboarding contractors is effortless now.',
    avatar: 'DO',
  },
  {
    name: 'Sofia Marin',
    title: 'MSP Coordinator, ProServe FM',
    quote:
      'Assigning work, requesting spare parts and signing off — all in one place. The dashboards keep our SLAs visible.',
    avatar: 'SM',
  },
];

const STATS = [
  { value: '40%', label: 'Faster work-order turnaround' },
  { value: '8k+', label: 'Assets under management' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '4', label: 'Coordinated operator roles' },
];

export default function Landing() {
  const { isAuthenticated, currentUser } = useAuth();
  const dashboardHref = currentUser ? ROLE_HOME[currentUser.role] : '/login';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Top bar */}
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
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" sx={{ height: 68 }} spacing={2}>
            <Logo size="md" />
            <Box sx={{ flexGrow: 1 }} />
            <ThemeToggle />
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to={dashboardHref}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button component={RouterLink} to="/service-request" color="inherit">
                  Submit a Request
                </Button>
                <Button component={RouterLink} to="/login" variant="contained">
                  Sign In
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Box
        sx={(t) => ({
          background: `radial-gradient(1200px 500px at 70% -10%, ${alpha(
            t.palette.primary.main,
            0.14,
          )}, transparent), radial-gradient(900px 400px at 0% 0%, ${alpha(
            t.palette.secondary.main,
            0.1,
          )}, transparent)`,
        })}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip
                label="CMMS · Facility & Maintenance Management"
                color="primary"
                variant="outlined"
                sx={{ mb: 3, fontWeight: 600 }}
              />
              <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '2.25rem', md: '3.25rem' } }}>
                Smarter Facility &{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Maintenance
                </Box>{' '}
                Management
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 540 }}>
                EZAxis is the control plane for buildings, assets, work orders and inventory —
                coordinating tenants, building managers and maintenance providers in one calm,
                role-aware workspace.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? dashboardHref : '/login'}
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
                </Button>
                {!isAuthenticated && (
                  <Button
                    component={RouterLink}
                    to="/service-request"
                    size="large"
                    variant="outlined"
                  >
                    Submit a Service Request
                  </Button>
                )}
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 4, flexWrap: 'wrap', gap: 1.5 }}>
                {['No credit card', 'Role-based portals', 'Live demo accounts'].map((t) => (
                  <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      {t}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ p: 1 }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Live Operations Snapshot
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {STATS.map((s) => (
                      <Grid size={6} key={s.label}>
                        <Box
                          sx={(t) => ({
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${t.palette.divider}`,
                            bgcolor: 'background.default',
                          })}
                        >
                          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
                            {s.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" color="primary.main">
            Everything in one place
          </Typography>
          <Typography variant="h2" sx={{ mt: 1, mb: 1.5 }}>
            Built for facility operators
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto' }}>
            From the first tenant request to final sign-off, EZAxis keeps every asset, part and work
            order accountable.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    sx={(t) => ({
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: 'primary.main',
                      backgroundColor: alpha(t.palette.primary.main, 0.1),
                      '& svg': { fontSize: 26 },
                    })}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" color="primary.main">
              Trusted by operators
            </Typography>
            <Typography variant="h2" sx={{ mt: 1 }}>
              What teams say
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t) => (
              <Grid size={{ xs: 12, md: 4 }} key={t.name}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Rating value={5} readOnly size="small" sx={{ mb: 1.5 }} />
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      “{t.quote}”
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar>{t.avatar}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.title}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Ready to take control of your buildings?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Try EZAxis with a one-click demo account — no setup required.
        </Typography>
        <Button
          component={RouterLink}
          to={isAuthenticated ? dashboardHref : '/login'}
          size="large"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
        </Button>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 5 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Logo size="sm" />
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              {['Product', 'Pricing', 'Docs', 'Privacy', 'Contact'].map((l) => (
                <Link key={l} component={RouterLink} to="/" underline="hover" color="text.secondary" variant="body2">
                  {l}
                </Link>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} I-ON · EZAxis. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
