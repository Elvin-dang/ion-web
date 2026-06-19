/**
 * DemoAccounts — quick-access cards (one per web role). Clicking a card logs in
 * as that account and navigates to its home route. Used by Login.
 */
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { demoAccounts } from '../../data/demoAccounts';
import type { DemoUser } from '../../data/demoAccounts';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_HOME, ROLE_LABELS } from '../../config/navTypes';

export default function DemoAccounts() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePick = (acct: DemoUser) => {
    login({
      id: acct.id,
      name: acct.name,
      email: acct.email,
      role: acct.role,
      avatar: acct.avatar,
    });
    navigate(ROLE_HOME[acct.role]);
  };

  return (
    <Grid container spacing={1.5}>
      {demoAccounts.map((acct) => (
        <Grid size={{ xs: 12, sm: 6 }} key={acct.id}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardActionArea onClick={() => handlePick(acct)} sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar src={acct.avatar} alt={acct.name} sx={{ width: 40, height: 40 }}>
                  {acct.name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {acct.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {acct.email}
                  </Typography>
                  <Chip
                    label={ROLE_LABELS[acct.role]}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                  />
                </Box>
              </Stack>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
