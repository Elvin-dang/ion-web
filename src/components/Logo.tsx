/**
 * EZAxis brand logo lockup — an MUI icon glyph in a tinted rounded square plus
 * the "EZAxis" wordmark (with the "Axis" in secondary/amber accent). No image
 * asset exists, so this is a pure SVG/text lockup using theme tokens.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import HubIcon from '@mui/icons-material/Hub';
import { alpha } from '@mui/material/styles';

interface LogoProps {
  /** Overall scale. sm for compact toolbars, lg for auth/landing hero. */
  size?: 'sm' | 'md' | 'lg';
  /** Hide the wordmark, show only the glyph (collapsed sidebar etc.). */
  iconOnly?: boolean;
  /** Render the "EZ" wordmark in white for use on a dark sidebar/background. */
  onDark?: boolean;
}

const SIZES = {
  sm: { box: 30, icon: 18, font: '1.05rem' },
  md: { box: 36, icon: 22, font: '1.25rem' },
  lg: { box: 46, icon: 28, font: '1.6rem' },
} as const;

export default function Logo({ size = 'md', iconOnly = false, onDark = false }: LogoProps) {
  const s = SIZES[size];

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, userSelect: 'none' }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: s.box,
          height: s.box,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.primary.contrastText,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
          flexShrink: 0,
        })}
      >
        <HubIcon sx={{ fontSize: s.icon }} />
      </Box>

      {!iconOnly && (
        <Typography
          component="span"
          sx={{
            fontWeight: 800,
            fontSize: s.font,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          <Box component="span" sx={{ color: onDark ? '#FFFFFF' : 'text.primary' }}>
            EZ
          </Box>
          <Box component="span" sx={{ color: 'secondary.main' }}>
            Axis
          </Box>
        </Typography>
      )}
    </Box>
  );
}
