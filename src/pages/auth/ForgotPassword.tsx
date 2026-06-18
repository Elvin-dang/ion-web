/**
 * ForgotPassword — email field + send reset link (mock). Shows a success state
 * after submit. Back to Sign In link.
 */
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

import AuthShell from './AuthShell';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = () => setSent(true);

  return (
    <AuthShell>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" gutterBottom>
          Reset your password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email and we&apos;ll send you a reset link.
        </Typography>
      </Box>

      {sent ? (
        <Stack spacing={3}>
          <Alert icon={<MarkEmailReadOutlinedIcon />} severity="success">
            If an account exists for <strong>{getValues('email')}</strong>, a reset link is on its
            way.
          </Alert>
          <Button component={RouterLink} to="/login" variant="contained" startIcon={<ArrowBackIcon />}>
            Back to Sign In
          </Button>
        </Stack>
      ) : (
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
            <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
              Send Reset Link
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              startIcon={<ArrowBackIcon />}
              sx={{ alignSelf: 'center' }}
            >
              Back to Sign In
            </Button>
          </Stack>
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        Remembered it?{' '}
        <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
          Sign In
        </Link>
      </Typography>
    </AuthShell>
  );
}
