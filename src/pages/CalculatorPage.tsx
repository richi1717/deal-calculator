import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AppShell, { useSettingsDrawer } from '../components/AppShell'
import { calculateSimpleMao } from '../calc/simpleMao'
import { useQueryMoneyField } from '../hooks/useQueryMoneyField'
import { useQueryStateNumber } from '../hooks/useQueryStateNumber'
import { useQueryStateString } from '../hooks/useQueryStateString'
import { useSettings } from '../context/settings'

const REHAB_TIERS = [
  { rate: 15, grade: 'Lipstick' },
  { rate: 20, grade: 'Mid Grade' },
  { rate: 25, grade: 'Mid Grade' },
  { rate: 30, grade: 'Mid Grade' },
  { rate: 35, grade: 'Mid Grade' },
  { rate: 40, grade: 'Mid Grade' },
  { rate: 45, grade: 'High Grade' },
  { rate: 50, grade: 'High Grade' },
  { rate: 55, grade: 'High Grade' },
  { rate: 60, grade: 'High Grade' },
  { rate: 65, grade: 'High Grade' },
] as const

type GradeChipColor = 'default' | 'primary' | 'warning'

function gradeColor(grade: string): GradeChipColor {
  if (grade === 'Lipstick') return 'default'
  if (grade === 'Mid Grade') return 'primary'
  return 'warning'
}

const fmt$ = (n: number) => `$${Math.round(n).toLocaleString()}`
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`

function InfoRow({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick?: () => void
}) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
        py: 0.25,
        cursor: onClick ? 'pointer' : undefined,
        borderRadius: 1,
        px: 0.5,
        mx: -0.5,
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
      }}
      onClick={onClick}
    >
      <Typography variant="body2" sx={{ opacity: 0.65 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

export default function CalculatorPage() {
  return (
    <AppShell>
      <CalculatorContent />
    </AppShell>
  )
}

function CalculatorContent() {
  const { settings } = useSettings()
  const { kMode } = settings
  const { openDrawer } = useSettingsDrawer()

  const title = useQueryStateString('t', '')

  const arv = useQueryMoneyField({ key: 'arv', defaultDollars: 0, kMode })
  const rehab = useQueryMoneyField({
    key: 'rehab',
    defaultDollars: 25000,
    hardCodedDefault: 25000,
    kMode,
  })
  const profit = useQueryMoneyField({
    key: 'profit',
    defaultDollars: settings.defaultProfit,
    hardCodedDefault: 25000,
    kMode,
  })
  const fee = useQueryMoneyField({
    key: 'fee',
    defaultDollars: settings.defaultFee,
    hardCodedDefault: 15000,
    kMode,
  })
  const list = useQueryMoneyField({ key: 'list', defaultDollars: 0, kMode })

  // Gross Yield fields
  const gyRent = useQueryMoneyField({
    key: 'gy_rent',
    defaultDollars: 0,
    kMode,
  })
  const gyPurchase = useQueryMoneyField({
    key: 'gy_pp',
    defaultDollars: 0,
    kMode,
  })
  const gyRehab = useQueryMoneyField({
    key: 'gy_rehab',
    defaultDollars: 0,
    kMode,
  })

  const [sqft, setSqft] = useQueryStateNumber('sqft', 0)
  const [sqftRaw, setSqftRaw] = useState(sqft > 0 ? String(sqft) : '')
  const prevDefaultProfit = useRef(settings.defaultProfit)

  useEffect(() => {
    if (settings.defaultProfit === prevDefaultProfit.current) {
      return
    }

    const prev = prevDefaultProfit.current

    prevDefaultProfit.current = settings.defaultProfit

    if (profit.dollars === prev) {
      profit.setValue(settings.defaultProfit)
    }
  }, [settings.defaultProfit])

  const prevDefaultFee = useRef(settings.defaultFee)

  useEffect(() => {
    if (settings.defaultFee === prevDefaultFee.current) {
      return
    }

    const prev = prevDefaultFee.current

    prevDefaultFee.current = settings.defaultFee

    if (fee.dollars === prev) {
      fee.setValue(settings.defaultFee)
    }
  }, [settings.defaultFee])

  const result = calculateSimpleMao({
    arv: arv.dollars,
    rehab: rehab.dollars,
    profit: profit.dollars,
    wholesaleFee: fee.dollars,
    haircutPct: settings.haircutPct,
    commissionPct: settings.commissionPct,
    dpPct: settings.dpPct,
    interestRate: settings.interestRate,
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

  const grossYield = useMemo(() => {
    const denom = gyPurchase.dollars + gyRehab.dollars
    if (denom <= 0 || gyRent.dollars <= 0) return null
    return gyRent.dollars / denom
  }, [gyRent.dollars, gyPurchase.dollars, gyRehab.dollars])

  const kHelper = (dollars: number) =>
    kMode && dollars > 0 ? fmt$(dollars) : undefined

  const fmtTableMoney = (n: number) =>
    kMode
      ? `$${(n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`
      : fmt$(n)

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
    },
  } as const

  return (
    <Grid container spacing={2}>
      {/* ── Inputs ── */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Inputs</Typography>

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
              onFocus={list.onFocus}
              onBlur={list.onBlur}
              helperText={kHelper(list.dollars)}
              fullWidth
              margin="normal"
              slotProps={moneySlotProps}
            />

            <Divider sx={{ my: 2 }} />

            <TextField
              label="ARV"
              value={arv.raw}
              onChange={(e) => arv.onChange(e.target.value)}
              onFocus={arv.onFocus}
              onBlur={arv.onBlur}
              helperText={kHelper(arv.dollars)}
              fullWidth
              margin="normal"
              slotProps={moneySlotProps}
            />

            <TextField
              label="Rehab"
              value={rehab.raw}
              onChange={(e) => rehab.onChange(e.target.value)}
              onFocus={rehab.onFocus}
              onBlur={rehab.onBlur}
              helperText={kHelper(rehab.dollars)}
              fullWidth
              margin="normal"
              slotProps={moneySlotProps}
            />

            <TextField
              label="Desired Profit"
              value={profit.raw}
              onChange={(e) => profit.onChange(e.target.value)}
              onFocus={profit.onFocus}
              onBlur={profit.onBlur}
              helperText={kHelper(profit.dollars)}
              fullWidth
              margin="normal"
              slotProps={moneySlotProps}
            />

            <TextField
              label="Wholesale Fee"
              value={fee.raw}
              onChange={(e) => fee.onChange(e.target.value)}
              onFocus={fee.onFocus}
              onBlur={fee.onBlur}
              helperText={kHelper(fee.dollars)}
              fullWidth
              margin="normal"
              slotProps={moneySlotProps}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* ── Results ── */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Results</Typography>

            {title.raw.trim() && (
              <Typography sx={{ mt: 1, opacity: 0.8 }} variant="body2">
                {title.raw}
              </Typography>
            )}

            <Typography sx={{ mt: 2, opacity: 0.65 }} variant="body2">
              ARV Adjusted ({fmtPct(1 - settings.haircutPct)})
            </Typography>
            <Typography variant="body1">{fmt$(result.arvAdjusted)}</Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                MAO
              </Typography>
              {listChip}
            </Stack>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                color: result.mao < 0 ? 'error.main' : undefined,
              }}
            >
              {fmt$(result.mao)}
            </Typography>

            {showListCheck && (
              <Typography sx={{ mt: 0.5, opacity: 0.7 }} variant="body2">
                List: {fmt$(list.dollars)}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <InfoRow
              label={`Est Commission (${fmtPct(settings.commissionPct)})`}
              value={fmt$(result.estCommission)}
              onClick={openDrawer}
            />
            <InfoRow
              label={`Est Down Pmt (${fmtPct(settings.dpPct)})`}
              value={fmt$(result.estDP)}
              onClick={openDrawer}
            />
            <InfoRow
              label="Est Monthly I/O"
              value={fmt$(result.estMonthlyIO)}
              onClick={openDrawer}
            />

            <Divider sx={{ my: 1.5 }} />

            <InfoRow label="Buy Ratio" value={fmtPct(result.buyRatio)} />
            <InfoRow
              label="Cash on Cash ROI"
              value={fmtPct(result.cashOnCashROI)}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* ── Quick Rehab Calculator ── */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Quick Rehab Calculator
            </Typography>

            <TextField
              label="Square Feet"
              value={sqftRaw}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setSqftRaw(v)
              }}
              onBlur={() => {
                const n = parseInt(sqftRaw)
                if (Number.isFinite(n) && n > 0) setSqft(n)
                else {
                  setSqft(0)
                  setSqftRaw('')
                }
              }}
              placeholder="0"
              sx={{ width: 160, mb: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">sqft</InputAdornment>
                  ),
                },
              }}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rate</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {REHAB_TIERS.map((tier) => {
                  const total = sqft > 0 ? tier.rate * sqft : null
                  const isActive = total !== null && total === rehab.dollars
                  return (
                    <Tooltip
                      key={tier.rate}
                      title={
                        sqft > 0
                          ? 'Click to use this rehab estimate'
                          : 'Enter sqft first'
                      }
                      placement="left"
                      disableInteractive
                    >
                      <TableRow
                        hover
                        selected={isActive}
                        onClick={() => {
                          if (total !== null) rehab.setValue(total)
                        }}
                        sx={{ cursor: sqft > 0 ? 'pointer' : 'default' }}
                      >
                        <TableCell>${tier.rate}/sqft</TableCell>
                        <TableCell>
                          <Chip
                            label={tier.grade}
                            color={gradeColor(tier.grade)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {total !== null ? fmtTableMoney(total) : '—'}
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
      {settings.showGrossYield && (
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Gross Yield Calculator</Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, mb: 2, opacity: 0.65 }}
              >
                For rental analysis. Annual rent ÷ (purchase + rehab).
              </Typography>

              <TextField
                label="Annual Market Rent"
                value={gyRent.raw}
                onChange={(e) => gyRent.onChange(e.target.value)}
                onFocus={gyRent.onFocus}
                onBlur={gyRent.onBlur}
                fullWidth
                margin="dense"
                slotProps={moneySlotProps}
              />
              <TextField
                label="Purchase Price"
                value={gyPurchase.raw}
                onChange={(e) => gyPurchase.onChange(e.target.value)}
                onFocus={gyPurchase.onFocus}
                onBlur={gyPurchase.onBlur}
                fullWidth
                margin="dense"
                slotProps={moneySlotProps}
              />
              <TextField
                label="Rehab"
                value={gyRehab.raw}
                onChange={(e) => gyRehab.onChange(e.target.value)}
                onFocus={gyRehab.onFocus}
                onBlur={gyRehab.onBlur}
                fullWidth
                margin="dense"
                slotProps={moneySlotProps}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ opacity: 0.65 }}>
                  Gross Yield
                </Typography>
                <Typography sx={{ fontSize: 32, fontWeight: 800 }}>
                  {grossYield !== null
                    ? `${(grossYield * 100).toFixed(2)}%`
                    : '—'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}
