/**
 * I-ON (EZAxis) — Facility & Building Maintenance Management (CMMS) Design System
 * MUI v7 theme with CSS variables + light/dark color schemes.
 *
 * ---------------------------------------------------------------------------
 * GOOGLE FONT LOADING
 * ---------------------------------------------------------------------------
 * Add Plus Jakarta Sans to your index.html <head> (preferred — no FOUT config):
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 *   <link
 *     href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
 *     rel="stylesheet"
 *   >
 *
 * (Monospace numeric/code fallback uses the system mono stack.)
 * ---------------------------------------------------------------------------
 */

import { createTheme, alpha } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

/* =========================================================================
 * DESIGN TOKENS
 * ========================================================================= */

const FONT_FAMILY =
  '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Brand — confident teal/blue-green primary (trust + maintenance/industrial),
// warm amber secondary (energy + "EZAxis" highlight). NOT default MUI blue.
const BRAND = {
  primary: {
    main: '#0F766E', // deep teal
    light: '#14B8A6',
    dark: '#0B5A54',
    contrastText: '#FFFFFF',
    tint: '#E6F4F1', // light surface tint
    tintDark: '#0E2A28', // dark surface tint
  },
  secondary: {
    main: '#F59E0B', // amber
    light: '#FBBF24',
    dark: '#B45309',
    contrastText: '#1A1206',
    tint: '#FEF3DC',
    tintDark: '#2E2206',
  },
};

// Work-order / status accents (chips, charts, badges)
const STATUS = {
  open: '#3B82F6', // blue — open / new
  inProgress: '#8B5CF6', // violet — in progress
  completed: '#10B981', // green — completed / done
  overdue: '#EF4444', // red — overdue / breached
  scheduled: '#0EA5E9', // sky — scheduled / planned
};

// Semantic colors (each with light tint variants)
const SEMANTIC = {
  error: { main: '#DC2626', light: '#F87171', dark: '#991B1B', tint: '#FEECEC', tintDark: '#2A1212' },
  warning: { main: '#D97706', light: '#FBBF24', dark: '#92400E', tint: '#FEF3DC', tintDark: '#2A1F08' },
  info: { main: '#2563EB', light: '#60A5FA', dark: '#1E40AF', tint: '#E7EFFE', tintDark: '#0E1B33' },
  success: { main: '#059669', light: '#34D399', dark: '#047857', tint: '#E3F6EE', tintDark: '#0C2620' },
};

// Neutrals (warm-cool slate)
const NEUTRAL = {
  // Light mode page bg is warm off-white — NEVER pure white.
  bgLight: '#F8F9FA',
  paperLight: '#FFFFFF',
  textPrimaryLight: '#0F172A',
  textSecondaryLight: '#5B6472',
  dividerLight: '#E7E9EE',
  // Dark mode rich slate
  bgDark: '#0F1117',
  paperDark: '#171A21',
  paperDarkElevated: '#1E222B',
  textPrimaryDark: '#F1F3F7',
  textSecondaryDark: '#9AA3B2',
  dividerDark: '#262B35',
};

const RADIUS = {
  card: 16,
  input: 10,
  pill: 999,
  base: 12,
};

// Dark-green enterprise sidebar palette (constant across light/dark mode — the
// sidebar is always dark to separate navigation from the light content area).
const SIDEBAR = {
  bg: '#0B2E2A', // near-black deep green
  text: 'rgba(255,255,255,0.82)',
  hover: 'rgba(255,255,255,0.08)',
  active: '#0F766E', // solid brand green
  activeText: '#FFFFFF',
  divider: 'rgba(255,255,255,0.10)',
};

// Soft tinted shadow scale (light mode). Index aligns with MUI elevation 0..24.
const SOFT = (a: number, blur: number, y: number, spread = 0) =>
  `0px ${y}px ${blur}px ${spread}px rgba(15, 23, 42, ${a})`;

const lightShadows: string[] = [
  'none',
  SOFT(0.04, 2, 1),
  SOFT(0.05, 4, 2),
  SOFT(0.06, 8, 3),
  SOFT(0.07, 12, 4),
  SOFT(0.08, 16, 6),
  SOFT(0.08, 18, 6),
  SOFT(0.09, 20, 7),
  SOFT(0.1, 24, 8),
  SOFT(0.1, 26, 9),
  SOFT(0.11, 28, 10),
  SOFT(0.11, 30, 11),
  SOFT(0.12, 32, 12),
  SOFT(0.12, 34, 13),
  SOFT(0.13, 36, 14),
  SOFT(0.13, 38, 15),
  SOFT(0.14, 40, 16),
  SOFT(0.14, 42, 17),
  SOFT(0.15, 44, 18),
  SOFT(0.15, 46, 19),
  SOFT(0.16, 48, 20),
  SOFT(0.16, 50, 21),
  SOFT(0.17, 52, 22),
  SOFT(0.17, 54, 23),
  SOFT(0.18, 56, 24),
];

/* =========================================================================
 * THEME
 * ========================================================================= */

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: BRAND.primary.main,
          light: BRAND.primary.light,
          dark: BRAND.primary.dark,
          contrastText: BRAND.primary.contrastText,
        },
        secondary: {
          main: BRAND.secondary.main,
          light: BRAND.secondary.light,
          dark: BRAND.secondary.dark,
          contrastText: BRAND.secondary.contrastText,
        },
        error: { main: SEMANTIC.error.main, light: SEMANTIC.error.light, dark: SEMANTIC.error.dark, contrastText: '#FFFFFF' },
        warning: { main: SEMANTIC.warning.main, light: SEMANTIC.warning.light, dark: SEMANTIC.warning.dark, contrastText: '#FFFFFF' },
        info: { main: SEMANTIC.info.main, light: SEMANTIC.info.light, dark: SEMANTIC.info.dark, contrastText: '#FFFFFF' },
        success: { main: SEMANTIC.success.main, light: SEMANTIC.success.light, dark: SEMANTIC.success.dark, contrastText: '#FFFFFF' },
        background: {
          default: NEUTRAL.bgLight,
          paper: NEUTRAL.paperLight,
        },
        text: {
          primary: NEUTRAL.textPrimaryLight,
          secondary: NEUTRAL.textSecondaryLight,
        },
        divider: NEUTRAL.dividerLight,
        grey: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E7E9EE',
          300: '#D5D9E0',
          400: '#AEB5C0',
          500: '#8A93A1',
          600: '#5B6472',
          700: '#3F4753',
          800: '#272E38',
          900: '#0F172A',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: BRAND.primary.light,
          light: '#5EEAD4',
          dark: BRAND.primary.main,
          contrastText: '#04201D',
        },
        secondary: {
          main: BRAND.secondary.light,
          light: '#FCD34D',
          dark: BRAND.secondary.main,
          contrastText: '#1A1206',
        },
        error: { main: SEMANTIC.error.light, light: '#FCA5A5', dark: SEMANTIC.error.main, contrastText: '#1A0808' },
        warning: { main: SEMANTIC.warning.light, light: '#FCD34D', dark: SEMANTIC.warning.main, contrastText: '#1A1206' },
        info: { main: SEMANTIC.info.light, light: '#93C5FD', dark: SEMANTIC.info.main, contrastText: '#08152E' },
        success: { main: SEMANTIC.success.light, light: '#6EE7B7', dark: SEMANTIC.success.main, contrastText: '#04211A' },
        background: {
          default: NEUTRAL.bgDark,
          paper: NEUTRAL.paperDark,
        },
        text: {
          primary: NEUTRAL.textPrimaryDark,
          secondary: NEUTRAL.textSecondaryDark,
        },
        divider: NEUTRAL.dividerDark,
        grey: {
          50: '#0F1117',
          100: '#171A21',
          200: '#1E222B',
          300: '#262B35',
          400: '#3A4150',
          500: '#5A6271',
          600: '#8A93A1',
          700: '#AEB5C0',
          800: '#D5D9E0',
          900: '#F1F3F7',
        },
      },
    },
  },

  shape: {
    borderRadius: RADIUS.base,
  },

  spacing: 8,

  shadows: lightShadows as Shadows,

  typography: {
    fontFamily: FONT_FAMILY,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.125rem', fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.018em' },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.22, letterSpacing: '-0.015em' },
    h4: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.012em' },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.008em' },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '-0.005em' },
    subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0em' },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0em' },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0em' },
    body2: { fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0em' },
    button: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.01em', textTransform: 'none' },
    caption: { fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
    overline: { fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },

  components: {
    /* ---- Baseline ---- */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          scrollbarColor: 'rgba(138,147,161,0.5) transparent',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(138,147,161,0.45)',
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        '*::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(138,147,161,0.7)' },
      },
    },

    /* ---- Buttons ---- */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: RADIUS.pill,
          textTransform: 'none',
          fontWeight: 600,
          paddingInline: 20,
          paddingBlock: 9,
          transition: 'transform .15s ease, box-shadow .2s ease, background-color .2s ease',
          '&:active': { transform: 'translateY(1px)' },
        },
        sizeSmall: { paddingInline: 14, paddingBlock: 6, fontSize: '0.875rem' },
        sizeLarge: { paddingInline: 26, paddingBlock: 12, fontSize: '1rem' },
        contained: {
          boxShadow: '0 4px 14px rgba(15,118,110,0.25)',
          '&:hover': { boxShadow: '0 6px 20px rgba(15,118,110,0.32)' },
        },
        containedSecondary: {
          boxShadow: '0 4px 14px rgba(245,158,11,0.28)',
          '&:hover': { boxShadow: '0 6px 20px rgba(245,158,11,0.36)' },
        },
        outlined: { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10, transition: 'background-color .2s ease, transform .15s ease' },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { borderRadius: RADIUS.input, textTransform: 'none', fontWeight: 600 },
      },
    },

    /* ---- Surfaces ---- */
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: RADIUS.card },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: RADIUS.card,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'light' ? SOFT(0.05, 14, 4) : 'none',
          transition: 'box-shadow .25s ease, transform .2s ease, border-color .2s ease',
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'light'
                ? SOFT(0.09, 26, 10)
                : `0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}`,
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { padding: 24, paddingBottom: 12 },
        title: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.008em' },
        subheader: { fontSize: '0.875rem' },
      },
    },

    /* ---- AppBar (glassmorphism) ---- */
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'light'
              ? alpha('#FFFFFF', 0.72)
              : alpha(NEUTRAL.paperDark, 0.7),
          backdropFilter: 'blur(14px) saturate(180%)',
          WebkitBackdropFilter: 'blur(14px) saturate(180%)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: { root: { minHeight: 64 } },
    },

    /* ---- Drawer (dark-green enterprise sidebar) ---- */
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          // Dark green / near-black sidebar to separate nav from light content.
          backgroundColor: SIDEBAR.bg,
          color: SIDEBAR.text,
          // Sidebar-scoped nav item states: light text by default, solid green
          // when active, slightly lighter background on hover (per styleguide).
          '& .MuiListItemButton-root': {
            borderRadius: RADIUS.input,
            marginInline: 8,
            marginBlock: 2,
            paddingBlock: 9,
            color: SIDEBAR.text,
            '& .MuiListItemIcon-root': { color: SIDEBAR.text },
            '&:hover': { backgroundColor: SIDEBAR.hover },
            '&.Mui-selected': {
              backgroundColor: SIDEBAR.active,
              color: SIDEBAR.activeText,
              '& .MuiListItemIcon-root': { color: SIDEBAR.activeText },
              '&:hover': { backgroundColor: SIDEBAR.active },
            },
          },
          '& .MuiDivider-root': { borderColor: SIDEBAR.divider },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: RADIUS.input,
          marginInline: 8,
          marginBlock: 2,
          paddingBlock: 9,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.18),
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.14 : 0.24) },
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: 40, color: 'inherit' } },
    },

    /* ---- Inputs ---- */
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: RADIUS.input,
          backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : alpha('#FFFFFF', 0.02),
          transition: 'box-shadow .2s ease, border-color .2s ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grey[400] },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
          },
          '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.14)}` },
        }),
        input: { padding: '11px 14px' },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginLeft: 2, fontSize: '0.75rem' } },
    },

    /* ---- Chips (status badges) ---- */
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: RADIUS.pill, fontWeight: 600, fontSize: '0.8125rem', height: 26 },
        filled: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          color: theme.palette.primary.main,
        }),
        outlined: { borderWidth: 1.5 },
        label: { paddingInline: 12 },
        sizeSmall: { height: 22, fontSize: '0.75rem' },
      },
    },

    /* ---- Tables / DataGrid ---- */
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: RADIUS.card, border: `1px solid ${theme.palette.divider}` }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[100],
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderBottom: `1px solid ${theme.palette.divider}`, padding: '12px 16px' }),
        head: ({ theme }) => ({
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: theme.palette.text.secondary,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'background-color .15s ease',
          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
          '&:last-child td': { borderBottom: 'none' },
        }),
      },
    },

    /* ---- Tabs ---- */
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 3, borderRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, minHeight: 44, fontSize: '0.9375rem', paddingInline: 16 },
      },
    },

    /* ---- Dialog ---- */
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 20,
          boxShadow: theme.palette.mode === 'light' ? SOFT(0.16, 60, 24) : '0 24px 60px rgba(0,0,0,0.6)',
          backgroundImage: 'none',
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', padding: '24px 24px 8px' } },
    },
    MuiDialogContent: { styleOverrides: { root: { padding: '8px 24px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },

    /* ---- Alert ---- */
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: RADIUS.input, fontWeight: 500, alignItems: 'center' },
        standardError: { backgroundColor: SEMANTIC.error.tint, color: SEMANTIC.error.dark },
        standardWarning: { backgroundColor: SEMANTIC.warning.tint, color: SEMANTIC.warning.dark },
        standardInfo: { backgroundColor: SEMANTIC.info.tint, color: SEMANTIC.info.dark },
        standardSuccess: { backgroundColor: SEMANTIC.success.tint, color: SEMANTIC.success.dark },
      },
    },

    /* ---- Avatar ---- */
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 700,
          fontSize: '0.9rem',
          backgroundColor: alpha(theme.palette.primary.main, 0.15),
          color: theme.palette.primary.main,
        }),
      },
    },

    /* ---- Progress ---- */
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({ height: 8, borderRadius: 999, backgroundColor: alpha(theme.palette.primary.main, 0.12) }),
        bar: { borderRadius: 999 },
      },
    },
    MuiCircularProgress: { defaultProps: { thickness: 4 } },

    /* ---- Tooltip ---- */
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '6px 10px',
          backgroundColor: theme.palette.mode === 'light' ? '#0F172A' : '#2A303B',
        }),
        arrow: ({ theme }) => ({ color: theme.palette.mode === 'light' ? '#0F172A' : '#2A303B' }),
      },
    },

    /* ---- Misc ---- */
    MuiDivider: { styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.divider }) } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS.input, marginTop: 6 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, marginInline: 6, marginBlock: 1, fontSize: '0.9375rem' } } },
    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
        track: { borderRadius: 999, opacity: 0.3 },
        thumb: { boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
      },
    },
  },
});

/**
 * Brand token export for charts (Recharts), custom badges and any place that
 * needs raw hex outside the MUI palette (work-order statuses, etc.).
 */
export const brandTokens = {
  status: STATUS,
  brand: BRAND,
  radius: RADIUS,
  sidebar: SIDEBAR,
};

export default theme;
