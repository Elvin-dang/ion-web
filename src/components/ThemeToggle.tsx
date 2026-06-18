/**
 * ThemeToggle — light/dark switch for I-ON (EZAxis).
 *
 * Placement: render inside the AppBar Toolbar, right-aligned
 * (e.g. after a `<Box sx={{ flexGrow: 1 }} />` spacer, before the user menu).
 *
 * Requires the app to be wrapped in <CssVarsProvider> / <ThemeProvider> from
 * the theme in `src/theme/theme.ts` (which enables `cssVariables`).
 */

import { useEffect, useState } from 'react';
import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  // Avoid first-paint mismatch: render nothing until mounted, since `mode` is
  // undefined before the color-scheme provider resolves. This one-shot mount
  // flag is the intended use of a synchronous setState in a mount effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || !mode) {
    return null;
  }

  const isDark = mode === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={() => setMode(next)}
        color="inherit"
        aria-label={`Activate ${next} mode`}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}
