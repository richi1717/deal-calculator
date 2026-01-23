import { PropsWithChildren, useMemo, useState } from 'react'
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { makeTheme } from '../theme/theme'

const STORAGE_KEY = 'dealcalc_theme_mode'

export default function AppShell({ children }: PropsWithChildren) {
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return systemPrefersDark ? 'dark' : 'dark' // default dark like you want
  })

  const theme = useMemo(() => makeTheme(mode), [mode])

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Deal Calculator
          </Typography>
          <IconButton onClick={toggle} aria-label="Toggle theme" edge="end">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>{children}</Box>
    </ThemeProvider>
  )
}
