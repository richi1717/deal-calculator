import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  Divider,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareIcon from '@mui/icons-material/Share'
import { makeTheme } from '../theme/theme'
import SettingsDrawer from './SettingsDrawer'

const STORAGE_KEY = 'dealcalc_theme_mode'

type SettingsDrawerContextValue = {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const SettingsDrawerContext = createContext<SettingsDrawerContextValue | null>(
  null,
)

export function useSettingsDrawer() {
  const ctx = useContext(SettingsDrawerContext)
  if (!ctx) throw new Error('useSettingsDrawer must be used within AppShell')
  return ctx
}

export default function AppShell({ children }: PropsWithChildren) {
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return systemPrefersDark ? 'dark' : 'dark'
  })

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  const theme = useMemo(() => makeTheme(mode), [mode])

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const ctxValue = useMemo(
    () => ({
      isOpen: settingsOpen,
      openDrawer: () => setSettingsOpen(true),
      closeDrawer: () => setSettingsOpen(false),
    }),
    [settingsOpen],
  )

  return (
    <SettingsDrawerContext.Provider value={ctxValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Deal Calculator
            </Typography>

            <IconButton onClick={handleShare} aria-label="Share">
              <ShareIcon />
            </IconButton>

            <IconButton
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              edge="end"
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="right"
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          slotProps={{ paper: { sx: { width: 320 } } }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                width: 1,
                justifyContent: 'flex-end',
              }}
            >
              <IconButton onClick={toggle} aria-label="Toggle theme" edge="end">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                onClick={() => setSettingsOpen(false)}
                aria-label="Settings close"
                edge="end"
              >
                <CloseIcon />
              </IconButton>
            </Stack>
            <Typography variant="h6">Settings</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.7 }}>
              Defaults that apply to all deals
            </Typography>
          </Box>

          <Divider />

          <SettingsDrawer />
        </Drawer>

        <Box sx={{ p: 2 }}>{children}</Box>

        <Snackbar
          open={shareCopied}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: { xs: 56, sm: 64 } }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </SettingsDrawerContext.Provider>
  )
}
