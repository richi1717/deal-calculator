import { Grid, TextField, Card, CardContent, Typography } from '@mui/material'
import { useQueryStateNumber } from '../hooks/useQueryStateNumber'
import { calculateSimpleMao } from '../calc/simpleMao'
import AppShell from '../components/AppShell'

export default function CalculatorPage() {
  const [arv, setArv] = useQueryStateNumber('arv', 0)
  const [rehab, setRehab] = useQueryStateNumber('rehab', 0)
  const [profit, setProfit] = useQueryStateNumber('profit', 30000)
  const [fee, setFee] = useQueryStateNumber('fee', 10000)

  const result = calculateSimpleMao({
    arv,
    rehab,
    profit,
    wholesaleFee: fee,
  })

  return (
    <AppShell>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Inputs</Typography>

              <TextField
                label="ARV"
                type="number"
                fullWidth
                margin="normal"
                value={arv}
                onChange={(e) => setArv(Number(e.target.value))}
              />

              <TextField
                label="Rehab"
                type="number"
                fullWidth
                margin="normal"
                value={rehab}
                onChange={(e) => setRehab(Number(e.target.value))}
              />

              <TextField
                label="Desired Profit"
                type="number"
                fullWidth
                margin="normal"
                value={profit}
                onChange={(e) => setProfit(Number(e.target.value))}
              />

              <TextField
                label="Wholesale Fee"
                type="number"
                fullWidth
                margin="normal"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Results</Typography>

              <Typography sx={{ mt: 2 }}>
                ARV Adjusted: ${result.arvAdjusted.toLocaleString()}
              </Typography>

              <Typography sx={{ mt: 1, fontWeight: 600 }}>
                MAO: ${result.mao.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppShell>
  )
}
