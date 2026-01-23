import { useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
  Chip,
  Stack,
} from '@mui/material'
import AppShell from '../components/AppShell'
import { calculateSimpleMao } from '../calc/simpleMao'
import { useQueryMoneyField } from '../hooks/useQueryMoneyField'
import { useQueryStateString } from '../hooks/useQueryStateString'

const K_MODE_KEY = 'dealcalc_k_mode'

function useKMode() {
  const [kMode, setKMode] = useState(() => {
    const saved = localStorage.getItem(K_MODE_KEY)
    if (saved === 'true') return true
    if (saved === 'false') return false
    return true
  })

  const setAndPersist = (next: boolean) => {
    setKMode(next)
    localStorage.setItem(K_MODE_KEY, String(next))
  }

  return { kMode, setKMode: setAndPersist }
}

const formatMoney = (n: number) => `$${Math.round(n).toLocaleString()}`

export default function CalculatorPage() {
  const { kMode, setKMode } = useKMode()
  const title = useQueryStateString('t', '')

  const arv = useQueryMoneyField({ key: 'arv', defaultDollars: 215000, kMode })
  const rehab = useQueryMoneyField({
    key: 'rehab',
    defaultDollars: 25000,
    kMode,
  })
  const profit = useQueryMoneyField({
    key: 'profit',
    defaultDollars: 25000,
    kMode,
  })
  const fee = useQueryMoneyField({ key: 'fee', defaultDollars: 15000, kMode })

  const list = useQueryMoneyField({ key: 'list', defaultDollars: 0, kMode })

  const result = calculateSimpleMao({
    arv: arv.dollars,
    rehab: rehab.dollars,
    profit: profit.dollars,
    wholesaleFee: fee.dollars,
  })

  const showListCheck = list.raw.trim() !== '' && list.dollars > 0

  const listChip = useMemo(() => {
    if (!showListCheck) return null

    if (result.mao >= list.dollars) {
      return <Chip label="MAO clears list" color="success" size="small" />
    }

    return <Chip label="MAO below list" color="warning" size="small" />
  }, [showListCheck, result.mao, list.dollars])

  const kLabel = (label: string) => (kMode ? `${label} (K)` : label)

  return (
    <AppShell>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">Inputs</Typography>

              <Box
                sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={kMode}
                      onChange={(e) => setKMode(e.target.checked)}
                    />
                  }
                  label="Use K inputs"
                />
              </Box>

              <TextField
                label="Title"
                placeholder="123 Main St, Springfield"
                value={title.raw}
                onChange={(e) => title.onChange(e.target.value)}
                onBlur={title.onBlur}
                fullWidth
                margin="normal"
              />

              <TextField
                label={kLabel('List Price')}
                value={list.raw}
                onChange={(e) => list.onChange(e.target.value)}
                onBlur={list.onBlur}
                fullWidth
                margin="normal"
                slotProps={{ input: { inputMode: 'decimal' } }}
              />

              <Divider sx={{ my: 2 }} />

              <TextField
                label={kLabel('ARV')}
                value={arv.raw}
                onChange={(e) => arv.onChange(e.target.value)}
                onBlur={arv.onBlur}
                fullWidth
                margin="normal"
                slotProps={{ input: { inputMode: 'decimal' } }}
              />

              <TextField
                label={kLabel('Rehab')}
                value={rehab.raw}
                onChange={(e) => rehab.onChange(e.target.value)}
                onBlur={rehab.onBlur}
                fullWidth
                margin="normal"
                slotProps={{ input: { inputMode: 'decimal' } }}
              />

              <TextField
                label={kLabel('Desired Profit')}
                value={profit.raw}
                onChange={(e) => profit.onChange(e.target.value)}
                onBlur={profit.onBlur}
                fullWidth
                margin="normal"
                slotProps={{ input: { inputMode: 'decimal' } }}
              />

              <TextField
                label={kLabel('Wholesale Fee')}
                value={fee.raw}
                onChange={(e) => fee.onChange(e.target.value)}
                onBlur={fee.onBlur}
                fullWidth
                margin="normal"
                slotProps={{ input: { inputMode: 'decimal' } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">Results</Typography>
                {listChip}
              </Stack>

              {title.raw.trim() ? (
                <Typography sx={{ mt: 1, opacity: 0.8 }} variant="body2">
                  {title.raw}
                </Typography>
              ) : null}

              <Typography sx={{ mt: 2, opacity: 0.75 }}>
                ARV Adjusted
              </Typography>
              <Typography variant="body1">
                {formatMoney(result.arvAdjusted)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                MAO
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
                {formatMoney(result.mao)}
              </Typography>

              {showListCheck ? (
                <Typography sx={{ mt: 2, opacity: 0.8 }} variant="body2">
                  List: {formatMoney(list.dollars)}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  )
}
