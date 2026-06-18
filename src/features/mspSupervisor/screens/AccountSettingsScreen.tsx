/**
 * 5.1.5 Account Settings (Update Profile + Change Password) for MSP Supervisor.
 * Also surfaces 5.1.4 Multi-Language Switch and 5.1.2 Logout confirmation, since
 * those Supervisor-specific profile bits live alongside account settings.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import LogoutIcon from '@mui/icons-material/Logout';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import ConfirmDialog from '../../../components/ConfirmDialog';
import InfoField from '../components/InfoField';
import { useToast } from '../components/useToast';
import { SUPERVISOR_PROFILE } from '../data/mockData';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.').max(100, 'Full name must not exceed 100 characters.'),
  phone: z.string().max(20).optional(),
  language: z.enum(['EN', 'VI']),
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

export default function AccountSettingsScreen() {
  const navigate = useNavigate();
  const { toast, toastElement } = useToast();
  const [tab, setTab] = useState(0);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [avatarName] = useState(SUPERVISOR_PROFILE.name);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: SUPERVISOR_PROFILE.name, phone: SUPERVISOR_PROFILE.phone, language: 'EN' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    void data;
    toast('Profile updated successfully.');
  };

  const onPasswordSubmit = () => {
    passwordForm.reset();
    toast('Password changed successfully.');
  };

  return (
    <Box>
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile, password and language preference"
        breadcrumbs={[{ label: 'MSP Supervisor', to: '/msp/dashboard' }, { label: 'Account Settings' }]}
        action={
          <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => setSignOutOpen(true)}>
            Sign out
          </Button>
        }
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Update Profile" />
        <Tab label="Change Password" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SectionCard title="Avatar">
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    avatarName,
                  )}&background=0F766E&color=fff&bold=true&format=svg`}
                  sx={{ width: 96, height: 96 }}
                />
                <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
                  Upload Photo
                  <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!['image/png', 'image/jpeg'].includes(file.type)) {
                        toast('Only JPG and PNG files are accepted.', 'error');
                        return;
                      }
                      if (file.size > 2 * 1024 * 1024) {
                        toast('File size must not exceed 2 MB.', 'error');
                        return;
                      }
                      toast('Avatar ready. Click Save to apply.', 'info');
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG or PNG, max 2 MB
                </Typography>
              </Stack>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <SectionCard title="Profile Information">
              <Box component="form" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      required
                      {...profileForm.register('fullName')}
                      error={!!profileForm.formState.errors.fullName}
                      helperText={profileForm.formState.errors.fullName?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...profileForm.register('phone')}
                      error={!!profileForm.formState.errors.phone}
                      helperText={profileForm.formState.errors.phone?.message}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Email" value={SUPERVISOR_PROFILE.email} disabled />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoField label="User Group (read-only)" value={SUPERVISOR_PROFILE.userGroup} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Language"
                      {...profileForm.register('language')}
                      defaultValue="EN"
                      helperText="UI language preference (5.1.4)"
                    >
                      <MenuItem value="EN">English</MenuItem>
                      <MenuItem value="VI">Tiếng Việt</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                  <Button type="submit" variant="contained">
                    Save
                  </Button>
                  <Button variant="text" color="inherit" onClick={() => navigate('/msp/dashboard')}>
                    Cancel
                  </Button>
                </Stack>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Change Password">
              <Box component="form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <Stack spacing={2}>
                  <TextField
                    type="password"
                    label="Current Password"
                    required
                    {...passwordForm.register('currentPassword')}
                    error={!!passwordForm.formState.errors.currentPassword}
                    helperText={passwordForm.formState.errors.currentPassword?.message}
                  />
                  <TextField
                    type="password"
                    label="New Password"
                    required
                    {...passwordForm.register('newPassword')}
                    error={!!passwordForm.formState.errors.newPassword}
                    helperText={passwordForm.formState.errors.newPassword?.message}
                  />
                  <TextField
                    type="password"
                    label="Confirm New Password"
                    required
                    {...passwordForm.register('confirmPassword')}
                    error={!!passwordForm.formState.errors.confirmPassword}
                    helperText={passwordForm.formState.errors.confirmPassword?.message}
                  />
                  <Box>
                    <Button type="submit" variant="contained">
                      Save
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={signOutOpen}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        destructive
        onConfirm={() => {
          setSignOutOpen(false);
          navigate('/login');
        }}
        onClose={() => setSignOutOpen(false)}
      />
      {toastElement}
    </Box>
  );
}
