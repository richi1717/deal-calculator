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
  InputAdornment,
} from '@mui/material'
import AppShell from '../components/AppShell'
import { calculateSimpleMao } from '../calc/simpleMao'
import { useQueryMoneyField } from '../hooks/useQueryMoneyField'
import { useQueryStateString } from '../hooks/useQueryStateString'

const K_MODE_KEY = 'dealcalc_k_mode'

function useKMode() {
  const [kMode, setKMode] = useState(
    () => localStorage.getItem(K_MODE_KEY) !== 'false',
  )

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
    return result.mao >= list.dollars ? (
      <Chip label="MAO clears list" color="success" size="small" />
    ) : (
      <Chip label="MAO below list" color="warning" size="small" />
    )
  }, [showListCheck, result.mao, list.dollars])

  const moneySlotProps = {
    input: {
      endAdornment: kMode ? (
        <InputAdornment
          position="end"
          sx={{
            pointerEvents: 'none',
            opacity: 0.6,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          K
        </InputAdornment>
      ) : null,
      sx: {
        // ensure our absolute adornment anchors correctly
        position: 'relative',

        // keep number tight to the K visually
        '& .MuiOutlinedInput-input': {
          textAlign: 'right',
          paddingRight: kMode ? '8px' : undefined,
        },

        // place adornment centered in the input height (not baseline hacks)
        '& .MuiInputAdornment-root': {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          margin: 0,
        },
      },
    },
  } as const

  return (
    <AppShell>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
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
                label="List Price"
                value={list.raw}
                onChange={(e) => list.onChange(e.target.value)}
                onBlur={list.onBlur}
                fullWidth
                margin="normal"
                slotProps={moneySlotProps}
              />

              <Divider sx={{ my: 2 }} />

              <TextField
                label="ARV"
                value={arv.raw}
                onChange={(e) => arv.onChange(e.target.value)}
                onBlur={arv.onBlur}
                fullWidth
                margin="normal"
                slotProps={moneySlotProps}
              />

              <TextField
                label="Rehab"
                value={rehab.raw}
                onChange={(e) => rehab.onChange(e.target.value)}
                onBlur={rehab.onBlur}
                fullWidth
                margin="normal"
                slotProps={moneySlotProps}
              />

              <TextField
                label="Desired Profit"
                value={profit.raw}
                onChange={(e) => profit.onChange(e.target.value)}
                onBlur={profit.onBlur}
                fullWidth
                margin="normal"
                slotProps={moneySlotProps}
              />

              <TextField
                label="Wholesale Fee"
                value={fee.raw}
                onChange={(e) => fee.onChange(e.target.value)}
                onBlur={fee.onBlur}
                fullWidth
                margin="normal"
                slotProps={moneySlotProps}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Results</Typography>

              {title.raw.trim() && (
                <Typography sx={{ mt: 1, opacity: 0.8 }} variant="body2">
                  {title.raw}
                </Typography>
              )}

              <Typography sx={{ mt: 2, opacity: 0.75 }}>
                ARV Adjusted
              </Typography>
              <Typography variant="body1">
                {formatMoney(result.arvAdjusted)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                  MAO
                </Typography>
                {listChip}
              </Stack>

              <Typography sx={{ fontSize: 28, fontWeight: 800 }}>
                {formatMoney(result.mao)}
              </Typography>

              {showListCheck && (
                <Typography sx={{ mt: 2, opacity: 0.8 }} variant="body2">
                  List: {formatMoney(list.dollars)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  )
}
