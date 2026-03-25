import { alpha, createTheme } from '@mui/material/styles'

export const baltutorTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#2dd4bf',
      light: '#5eead4',
      dark: '#14b8a6',
      contrastText: '#042f2e',
    },
    secondary: {
      main: '#a5b4fc',
      dark: '#6366f1',
    },
    background: {
      default: '#0a0e14',
      paper: alpha('#1e293b', 0.65),
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: alpha('#e2e8f0', 0.08),
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha('#2dd4bf', 0.35)} transparent`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12 },
        sizeLarge: { padding: '12px 24px', fontSize: '1rem' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha('#fff', 0.06)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha('#fff', 0.06)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
        filledPrimary: {
          backgroundColor: alpha('#2dd4bf', 0.14),
          color: '#5eead4',
          border: `1px solid ${alpha('#2dd4bf', 0.28)}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: `linear-gradient(165deg, ${alpha('#1e293b', 0.95)} 0%, ${alpha('#0f172a', 0.98)} 100%)`,
          border: `1px solid ${alpha('#fff', 0.08)}`,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
          color: '#042f2e',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, height: 10, backgroundColor: alpha('#fff', 0.08) },
        bar: { borderRadius: 999 },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: alpha('#fff', 0.03),
          border: `1px solid ${alpha('#fff', 0.06)}`,
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          marginBottom: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#0a0e14', 0.72),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
        },
      },
    },
  },
})
