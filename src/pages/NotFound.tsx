/**
 * NotFound — 404 catch-all. Routes feature home paths that aren't implemented
 * yet land here gracefully until feature agents register them.
 */
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { alpha } from '@mui/material/styles';

import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_HOME } from '../config/navTypes';

export default function NotFound() {
  const { currentUser } = useAuth();
  const home = currentUser ? ROLE_HOME[currentUser.role] : '/';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Logo size="lg" />
      </Box>
      <Box
        sx={(t) => ({
          width: 96,
          height: 96,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: 'primary.main',
          backgroundColor: alpha(t.palette.primary.main, 0.1),
          '& svg': { fontSize: 48 },
        })}
      >
        <SearchOffIcon />
      </Box>
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mb: 4 }}>
        The page you&apos;re looking for doesn&apos;t exist or hasn&apos;t been built yet.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button component={RouterLink} to={home} variant="contained" startIcon={<HomeOutlinedIcon />}>
          Go Home
        </Button>
        <Button component={RouterLink} to="/" variant="outlined">
          Landing
        </Button>
      </Stack>
    </Box>
  );
}
