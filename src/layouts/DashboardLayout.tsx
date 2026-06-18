/**
 * DashboardLayout — the authenticated app shell.
 *
 * - Desktop: persistent glass left Drawer + glass AppBar + scrollable content.
 * - Mobile: temporary (hamburger) Drawer + AppBar + bottom navigation.
 *
 * Nav items come from `navForRole(currentUser.role)` — the single source of
 * truth in config/routes.tsx — so every nav item maps to a registered route
 * and there are zero orphan links.
 */
import { useMemo, useState } from 'react';
import { Link as RouterLink, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { navForRole } from '../config/routes';
import { ROLE_LABELS } from '../config/navTypes';

const DRAWER_WIDTH = 264;

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const navItems = useMemo(() => navForRole(currentUser?.role), [currentUser?.role]);

  // Current page title derived from the active nav item.
  const pageTitle = useMemo(() => {
    const active = navItems.find(
      (n) => location.pathname === n.path || location.pathname.startsWith(n.path + '/'),
    );
    return active?.label ?? 'Dashboard';
  }, [navItems, location.pathname]);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Per-role Account Settings route reached from the user menu "Profile" item.
  const accountSettingsPath = useMemo(() => {
    switch (currentUser?.role) {
      case 'super_admin':
        return '/admin/account';
      case 'building_manager':
        return '/bm/account-settings';
      case 'msp_supervisor':
        return '/msp/account-settings';
      default:
        return '/';
    }
  }, [currentUser?.role]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.25, display: 'flex', alignItems: 'center' }}>
        <Box component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          <Logo size="md" onDark />
        </Box>
      </Box>
      <Divider />

      {/* Nav items */}
      <List sx={{ flexGrow: 1, py: 1.5, overflowY: 'auto' }}>
        {navItems.length === 0 && (
          <ListItem sx={{ px: 3 }}>
            <ListItemText
              primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              primary="No navigation registered yet."
            />
          </ListItem>
        )}
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              }
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9375rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User footer */}
      <Divider />
      {currentUser && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 1.25,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Avatar src={currentUser.avatar} alt={currentUser.name} sx={{ width: 38, height: 38 }}>
              {currentUser.name.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ color: '#FFFFFF' }}>
                {currentUser.name}
              </Typography>
              <Chip
                label={ROLE_LABELS[currentUser.role]}
                size="small"
                color="primary"
                sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
              />
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                size="small"
                onClick={() => setSignOutOpen(true)}
                aria-label="Sign out"
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#FFFFFF' } }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Bottom nav: first few nav items (mobile only).
  const bottomItems = navItems.slice(0, 4);
  const bottomValue = bottomItems.findIndex(
    (n) => location.pathname === n.path || location.pathname.startsWith(n.path + '/'),
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }} noWrap>
            {pageTitle}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <ThemeToggle />

          <Tooltip title="Account">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0.5, ml: 0.5 }}
              aria-label="Account menu"
            >
              <Avatar
                src={currentUser?.avatar}
                alt={currentUser?.name}
                sx={{ width: 34, height: 34 }}
              >
                {currentUser?.name.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 220 } } }}
          >
            {currentUser && (
              <Box sx={{ px: 2, py: 1.25 }}>
                <Typography variant="subtitle2" noWrap>
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {currentUser.email}
                </Typography>
              </Box>
            )}
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate(accountSettingsPath);
              }}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Account Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setSignOutOpen(true);
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop persistent drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Main navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            pb: { xs: 10, md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && bottomItems.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.appBar,
            borderTop: 1,
            borderColor: 'divider',
            display: { xs: 'block', md: 'none' },
          }}
        >
          <BottomNavigation
            showLabels
            value={bottomValue === -1 ? false : bottomValue}
            onChange={(_, idx) => handleNav(bottomItems[idx].path)}
          >
            {bottomItems.map((item) => (
              <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        onConfirm={() => {
          setSignOutOpen(false);
          logout();
        }}
        onClose={() => setSignOutOpen(false)}
      />
    </Box>
  );
}

// Re-export a default dashboard icon for sections that want one without an import.
export { DashboardOutlinedIcon };
