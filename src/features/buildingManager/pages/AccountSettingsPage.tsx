/**
 * 3.1.6 Account Settings (Building Manager) — Update Profile + Change Password.
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageHeader from '../../../components/PageHeader';
import { SectionCard, useToast } from '../components/shared';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.').max(100, 'Full name must not exceed 100 characters.'),
  phone: z.string().max(20, 'Phone number must not exceed 20 characters.').optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountSettingsPage() {
  const { show, node } = useToast();

  const profile = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: 'Building Manager', phone: '+65 9000 0000' },
  });

  const password = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  return (
    <Box>
      <PageHeader title="Account Settings" breadcrumbs={[{ label: 'Dashboard', to: '/bm/dashboard' }, { label: 'Account Settings' }]} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Update Profile">
            <Box component="form" onSubmit={profile.handleSubmit(() => show('Profile updated successfully.'))}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ width: 72, height: 72 }}>BM</Avatar>
                <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />} sx={{ borderRadius: 8 }}>
                  Upload Avatar
                  <input hidden type="file" accept="image/png,image/jpeg" />
                </Button>
              </Stack>
              <TextField
                fullWidth
                label="Full Name"
                required
                sx={{ mb: 2 }}
                {...profile.register('fullName')}
                error={!!profile.formState.errors.fullName}
                helperText={profile.formState.errors.fullName?.message}
              />
              <TextField
                fullWidth
                label="Phone Number"
                sx={{ mb: 3 }}
                {...profile.register('phone')}
                error={!!profile.formState.errors.phone}
                helperText={profile.formState.errors.phone?.message}
              />
              <Stack direction="row" spacing={1.5}>
                <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>
                  Save
                </Button>
                <Button color="inherit" onClick={() => profile.reset()} sx={{ borderRadius: 8 }}>
                  Cancel
                </Button>
              </Stack>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Change Password">
            <Box
              component="form"
              onSubmit={password.handleSubmit(() => {
                show('Password changed successfully.');
                password.reset();
              })}
            >
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                required
                sx={{ mb: 2 }}
                {...password.register('currentPassword')}
                error={!!password.formState.errors.currentPassword}
                helperText={password.formState.errors.currentPassword?.message}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                required
                sx={{ mb: 2 }}
                {...password.register('newPassword')}
                error={!!password.formState.errors.newPassword}
                helperText={password.formState.errors.newPassword?.message}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                required
                sx={{ mb: 3 }}
                {...password.register('confirmPassword')}
                error={!!password.formState.errors.confirmPassword}
                helperText={password.formState.errors.confirmPassword?.message}
              />
              <Stack direction="row" spacing={1.5}>
                <Button type="submit" variant="contained" sx={{ borderRadius: 8 }}>
                  Save
                </Button>
                <Button color="inherit" onClick={() => password.reset()} sx={{ borderRadius: 8 }}>
                  Cancel
                </Button>
              </Stack>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
      {node}
    </Box>
  );
}
