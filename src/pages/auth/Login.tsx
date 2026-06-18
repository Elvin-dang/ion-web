/**
 * Login — email/password form (RHF + Zod) with show/hide password, remember me,
 * forgot-password link, and demo-account quick access. Accounts are managed
 * internally — there is no self-registration or third-party SSO (per feedback).
 * Any credentials log in as the matching/default demo account.
 */
import { useState } from 'react';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AuthShell from './AuthShell';
import DemoAccounts from './DemoAccounts';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME } from '../../config/navTypes';
import { defaultDemoAccount, findDemoAccountByEmail } from '../../data/demoAccounts';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = (values: FormValues) => {
    // Any credentials log in. Match a demo account by email if possible.
    const acct = findDemoAccountByEmail(values.email) ?? defaultDemoAccount;
    login({ id: acct.id, name: acct.name, email: acct.email, role: acct.role, avatar: acct.avatar });
    navigate(ROLE_HOME[acct.role]);
  };

  // Already-authenticated users should not see the Login form — send them to
  // their role's home dashboard (FAM-LOGIN-02).
  if (isAuthenticated && currentUser) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
  }

  return (
    <AuthShell>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your EZAxis workspace.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            {...register('password')}
          />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <FormControlLabel
              control={<Checkbox defaultChecked {...register('remember')} />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
              Forgot password?
            </Link>
          </Stack>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
            Sign In
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Or select a demo account
        </Typography>
      </Divider>

      <DemoAccounts />
    </AuthShell>
  );
}
