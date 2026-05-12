import { createTheme } from '@mui/material/styles'

const green = {
  main: '#10b981',
  light: '#34d399',
  dark: '#059669',
  contrastText: '#fff',
}

export function makeTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: green,
      background: isDark
        ? { default: '#0d1117', paper: '#161b22' }
        : { default: '#f0fdf4', paper: '#ffffff' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", "system-ui", sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: isDark
            ? {
                backgroundImage: 'none',
                border: '1px solid rgba(255,255,255,0.07)',
              }
            : {
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#0d1117' : '#ffffff',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  })
}
