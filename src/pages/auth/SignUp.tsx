/**
 * SignUp — full name / email / password / confirm + terms (RHF + Zod). On
 * submit, logs in as the default demo account. Includes demo-account quick
 * access.
 */
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import FormHelperText from '@mui/material/FormHelperText';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AuthShell from './AuthShell';
import DemoAccounts from './DemoAccounts';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME } from '../../config/navTypes';
import { defaultDemoAccount } from '../../data/demoAccounts';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((v) => v, { message: 'You must accept the terms' }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '', terms: false },
  });

  const onSubmit = (values: FormValues) => {
    const acct = defaultDemoAccount;
    login({
      id: acct.id,
      name: values.name || acct.name,
      email: values.email || acct.email,
      role: acct.role,
      avatar: acct.avatar,
    });
    navigate(ROLE_HOME[acct.role]);
  };

  return (
    <AuthShell>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" gutterBottom>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start managing your facilities with EZAxis.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Full name"
            fullWidth
            autoComplete="name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name')}
          />
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
            autoComplete="new-password"
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
          <TextField
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="new-password"
            error={Boolean(errors.confirm)}
            helperText={errors.confirm?.message}
            {...register('confirm')}
          />
          <Box>
            <FormControlLabel
              control={<Checkbox {...register('terms')} />}
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link component={RouterLink} to="/" underline="hover">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/" underline="hover">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
            {errors.terms && <FormHelperText error>{errors.terms.message}</FormHelperText>}
          </Box>
          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
            Sign Up
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
          Sign In
        </Link>
      </Typography>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Or select a demo account
        </Typography>
      </Divider>

      <DemoAccounts />
    </AuthShell>
  );
}
