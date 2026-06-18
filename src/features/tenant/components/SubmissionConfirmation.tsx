/**
 * SubmissionConfirmation — Service Request confirmation screen (WBS 2.1.1 step 5).
 *
 * Shows the success message, the prominently-displayed Request ID, the
 * save-your-id / email-updates note, and a [Submit Another Request] action that
 * resets the form to empty.
 */
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

interface SubmissionConfirmationProps {
  requestId: string;
  email: string;
  onSubmitAnother: () => void;
}

export default function SubmissionConfirmation({
  requestId,
  email,
  onSubmitAnother,
}: SubmissionConfirmationProps) {
  return (
    <Card sx={{ maxWidth: 620, mx: 'auto' }}>
      <CardContent sx={{ textAlign: 'center', py: 5 }}>
        <Box
          sx={(theme) => ({
            width: 84,
            height: 84,
            borderRadius: '50%',
            mx: 'auto',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'success.main',
            backgroundColor: alpha(theme.palette.success.main, 0.12),
            '& svg': { fontSize: 46 },
          })}
        >
          <CheckCircleIcon />
        </Box>

        <Typography variant="h5" gutterBottom>
          Your service request has been submitted successfully.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: 'auto' }}>
          You will receive email updates on the status of your request.
        </Typography>

        <Box
          sx={(theme) => ({
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 4,
            py: 2.5,
            mb: 3,
            borderRadius: 3,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          })}
        >
          <Typography variant="overline" color="text.secondary">
            Request ID
          </Typography>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
            {requestId}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            justifyContent: 'center',
            mb: 4,
            maxWidth: 480,
            mx: 'auto',
            textAlign: 'left',
          }}
        >
          <MailOutlineIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
          <Typography variant="body2" color="text.secondary">
            Please save your Request ID. You will receive email updates at{' '}
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {email}
            </Box>
            .
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          <Button variant="contained" startIcon={<AddIcon />} onClick={onSubmitAnother}>
            Submit Another Request
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
