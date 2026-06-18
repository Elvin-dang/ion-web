/**
 * 1.3.10 Account Settings — Super Admin profile update + change password.
 * Two cards: Update Profile (name/phone/avatar) and Change Password.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PageHeader from '../../../components/PageHeader';
import SectionCard from '../components/SectionCard';
import { useToast } from '../components/AdminToast';
import { useAuth } from '../../../contexts/AuthContext';

export default function AccountSettingsPage() {
  const { currentUser } = useAuth();
  const { toast, node } = useToast();

  const [fullName, setFullName] = useState(currentUser?.name ?? 'Nguyen Van An');
  const [phone, setPhone] = useState('+84 901 234 567');
  const [nameErr, setNameErr] = useState('');

  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwErr, setPwErr] = useState<Record<string, string>>({});

  const saveProfile = () => {
    if (!fullName.trim()) { setNameErr('Full name is required.'); return; }
    setNameErr('');
    toast('Profile updated successfully.');
  };

  const savePassword = () => {
    const e: Record<string, string> = {};
    if (!cur) e.cur = 'Current password is required.';
    if (!next) e.next = 'New password is required.';
    else if (next.length < 8) e.next = 'Password must be at least 8 characters.';
    if (confirm !== next) e.confirm = 'Passwords do not match.';
    setPwErr(e);
    if (Object.keys(e).length) return;
    setCur(''); setNext(''); setConfirm('');
    toast('Password changed successfully.');
  };

  return (
    <Box>
      <PageHeader title="Account Settings" subtitle="Manage your profile and password." />
      <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
        <SectionCard title="Update Profile">
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64 }}>{fullName.charAt(0)}</Avatar>
              <Button variant="outlined" startIcon={<PhotoCameraIcon />} component="label">
                Change Avatar
                <input type="file" hidden accept="image/png,image/jpeg" onChange={() => toast('Avatar selected (demo).')} />
              </Button>
            </Box>
            <TextField label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} error={!!nameErr} helperText={nameErr} fullWidth />
            <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={saveProfile}>Save</Button>
            </Box>
          </Stack>
        </SectionCard>

        <SectionCard title="Change Password">
          <Stack spacing={2}>
            <TextField type="password" label="Current Password" required value={cur} onChange={(e) => setCur(e.target.value)} error={!!pwErr.cur} helperText={pwErr.cur} fullWidth />
            <TextField type="password" label="New Password" required value={next} onChange={(e) => setNext(e.target.value)} error={!!pwErr.next} helperText={pwErr.next} fullWidth />
            <TextField type="password" label="Confirm New Password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} error={!!pwErr.confirm} helperText={pwErr.confirm} fullWidth />
            <Typography variant="caption" color="text.secondary">Changing your password signs out all other devices.</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={savePassword}>Save</Button>
            </Box>
          </Stack>
        </SectionCard>
      </Stack>
      {node}
    </Box>
  );
}
