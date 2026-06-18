/**
 * useToast — minimal local snackbar hook for MSP Supervisor screens.
 * Returns a `toast(message, severity)` callback and the snackbar element to
 * render once per screen.
 */
import { useCallback, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ open: false, message: '', severity: 'success' });

  const toast = useCallback((message: string, severity: AlertColor = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const toastElement = (
    <Snackbar
      open={state.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={state.severity} variant="filled" sx={{ borderRadius: 2 }}>
        {state.message}
      </Alert>
    </Snackbar>
  );

  return { toast, toastElement };
}
