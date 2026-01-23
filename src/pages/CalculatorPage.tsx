import {
  Grid,
  TextField,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Divider,
} from '@mui/material'
import AppShell from '../components/AppShell'
import { calculateSimpleMao } from '../calc/simpleMao'
import { useEffect, useState } from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { useQueryMoneyField } from '../hooks/useQueryMoneyField'

const K_MODE_KEY = 'dealcalc_k_mode'

function useKMode() {
  const [kMode, setKMode] = useState(() => {
    const saved = localStorage.getItem(K_MODE_KEY)
    if (saved === 'true') return true
    if (saved === 'false') return false
    return true // default on
  })

  useEffect(() => {
    localStorage.setItem(K_MODE_KEY, String(kMode))
  }, [kMode])

  return { kMode, setKMode }
}

export default function CalculatorPage() {
  const { kMode, setKMode } = useKMode()

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

  const result = calculateSimpleMao({
    arv: arv.dollars,
    rehab: rehab.dollars,
    profit: profit.dollars,
    wholesaleFee: fee.dollars,
  })

  const kLabel = (label: string) => (kMode ? `${label} (K)` : label)

  return (
    <AppShell>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6">Inputs</Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={kMode}
                    onChange={(e) => setKMode(e.target.checked)}
                  />
                }
                label="Use K inputs"
              />

              <TextField
                label={kLabel('ARV')}
                fullWidth
                margin="normal"
                value={arv.raw}
                onChange={(e) => arv.onChange(e.target.value)}
                onBlur={arv.onBlur}
                slotProps={{
                  input: {
                    inputMode: 'decimal',
                  },
                }}
              />

              <TextField
                label={kLabel('Rehab')}
                type="text"
                fullWidth
                margin="normal"
                value={rehab.raw}
                onChange={(e) => rehab.onChange(e.target.value)}
                onBlur={rehab.onBlur}
                slotProps={{
                  input: {
                    inputMode: 'decimal',
                  },
                }}
              />

              <TextField
                label={kLabel('Desired Profit')}
                type="text"
                fullWidth
                margin="normal"
                value={profit.raw}
                onChange={(e) => profit.onChange(e.target.value)}
                onBlur={profit.onBlur}
                slotProps={{
                  input: {
                    inputMode: 'decimal',
                  },
                }}
              />

              <TextField
                label={kLabel('Wholesale Fee')}
                type="text"
                fullWidth
                margin="normal"
                value={fee.raw}
                onChange={(e) => fee.onChange(e.target.value)}
                onBlur={fee.onBlur}
                slotProps={{
                  input: {
                    inputMode: 'decimal',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6">Results</Typography>

              <Typography sx={{ mt: 2, opacity: 0.75 }}>
                ARV Adjusted
              </Typography>
              <Typography variant="body1">
                ${result.arvAdjusted.toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                MAO
              </Typography>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                ${result.mao.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  )
}
