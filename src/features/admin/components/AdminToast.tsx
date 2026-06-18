/**
 * Lightweight toast hook + provider-free snackbar for the Admin section.
 * Returns { toast, node }; render `node` once per page and call `toast(msg)`.
 */
import { useCallback, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Severity = 'success' | 'error' | 'warning' | 'info';

export function useToast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('success');

  const toast = useCallback((msg: string, sev: Severity = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const node = (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { toast, node };
}
