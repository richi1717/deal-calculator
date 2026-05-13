import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useSettings } from '../context/settings'
import { useSettingsDrawer } from '../context/settingsDrawer'

function makeBookmarklet(appOrigin: string) {
  return `javascript:(function(){var text=document.body.innerText;var addr=document.title.replace(/\\s*[|\\-\\u2013\\u2014].*/,'').trim();var sqM=text.match(/([1-9][\\d,]{2,5})\\s*(?:sq\\.?\\s*ft\\.?|square\\s*feet)/i);var sqft=sqM?sqM[1].replace(/,/g,''):'';var pM=text.match(/\\$\\s*([1-9]\\d{0,2}(?:,\\d{3}){1,2})/g)||[];var price='';for(var i=0;i<pM.length;i++){var n=parseInt(pM[i].replace(/[$,\\s]/g,''));if(n>=50000&&n<=5000000){price=String(n);break;}}var msg='Scraped from page:\\n\\nTitle:  '+(addr||'not found')+'\\nSqft:   '+(sqft?sqft+' sqft':'not found')+'\\nPrice:  '+(price?'$'+Number(price).toLocaleString():'not found')+'\\n\\nOpen Deal Calculator?';if(!confirm(msg))return;var p=new URLSearchParams();if(addr)p.set('t',addr);if(sqft)p.set('sqft',sqft);if(price)p.set('list',price);window.open('${appOrigin}?'+p.toString(),'_blank');})();`
}

function pctToDisplay(pct: number) {
  return String(Math.round(pct * 10000) / 100)
}

function usePctField(value: number, onCommit: (v: number) => void) {
  const [raw, setRaw] = useState(pctToDisplay(value))

  useEffect(() => {
    setRaw(pctToDisplay(value))
  }, [value])

  return {
    value: raw,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (/^\d*\.?\d*$/.test(e.target.value)) setRaw(e.target.value)
    },
    onBlur: () => {
      const n = parseFloat(raw)
      if (Number.isFinite(n) && n >= 0 && n <= 100) {
        onCommit(Math.round(n * 100) / 10000)
        setRaw(String(Math.round(n * 100) / 100))
      } else {
        setRaw(pctToDisplay(value))
      }
    },
  }
}

function useMoneyField(value: number, onCommit: (v: number) => void) {
  const [raw, setRaw] = useState(String(value))

  useEffect(() => {
    setRaw(String(value))
  }, [value])

  return {
    value: raw,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (/^\d*$/.test(e.target.value)) setRaw(e.target.value)
    },
    onBlur: () => {
      const num = parseInt(raw)

      if (Number.isFinite(num) && num >= 0) {
        onCommit(num)
        setRaw(String(num))
      } else {
        setRaw(String(value))
      }
    },
  }
}

export default function SettingsDrawer() {
  const { settings, update, reset } = useSettings()
  const { closeDrawer } = useSettingsDrawer()
  const [copied, setCopied] = useState(false)
  const bookmarklet = makeBookmarklet(window.location.origin)

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarklet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const haircutField = usePctField(settings.haircutPct, (v) =>
    update({ haircutPct: v }),
  )
  const commissionField = usePctField(settings.commissionPct, (v) =>
    update({ commissionPct: v }),
  )
  const dpField = usePctField(settings.dpPct, (v) => update({ dpPct: v }))
  const interestField = usePctField(settings.interestRate, (v) =>
    update({ interestRate: v }),
  )
  const profitField = useMoneyField(settings.defaultProfit, (v) =>
    update({ defaultProfit: v }),
  )
  const feeField = useMoneyField(settings.defaultFee, (v) =>
    update({ defaultFee: v }),
  )

  const pctProps = (field: ReturnType<typeof usePctField>) => ({
    ...field,
    slotProps: {
      input: {
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
      },
    },
    fullWidth: true as const,
    margin: 'dense' as const,
  })

  const moneyProps = (field: ReturnType<typeof useMoneyField>) => ({
    ...field,
    slotProps: {
      input: {
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      },
    },
    fullWidth: true as const,
    margin: 'dense' as const,
  })

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault()
        ;(document.activeElement as HTMLElement)?.blur()
        closeDrawer()
      }}
    >
      <Box sx={{ px: 2, pt: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.kMode}
              onChange={(e) => update({ kMode: e.target.checked })}
            />
          }
          label="Show values in K (thousands)"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.showGrossYield}
              onChange={(e) => update({ showGrossYield: e.target.checked })}
            />
          }
          label="Show Gross Yield Calculator"
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, opacity: 0.7 }}>
          Deal Defaults
        </Typography>
        <TextField label="Default Profit" {...moneyProps(profitField)} />
        <TextField label="Default Wholesale Fee" {...moneyProps(feeField)} />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, opacity: 0.7 }}>
          Assumptions
        </Typography>
        <TextField label="ARV Haircut" {...pctProps(haircutField)} />
        <TextField label="Est Commission" {...pctProps(commissionField)} />
        <TextField label="Down Payment" {...pctProps(dpField)} />
        <TextField label="Interest Rate (I/O)" {...pctProps(interestField)} />
      </Box>
      <Button sx={{ display: 'none ' }} type="submit"></Button>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ px: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Want to make your life even easier?
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.65, mb: 1 }}>
          Install the bookmarklet — open any Zillow, Redfin, or MLS listing and
          click it to auto-fill the title, list price, and sqft.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.65, mb: 1 }}>
          How to install: create a new bookmark, set the URL to the code below.
          In Chrome you must type{' '}
          <Box component="span" sx={{ fontFamily: 'monospace' }}>
            javascript:
          </Box>{' '}
          first, then paste the rest.
        </Typography>
        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'action.hover',
            borderRadius: 1,
            p: 1,
            pr: 5,
            fontFamily: 'monospace',
            fontSize: 11,
            wordBreak: 'break-all',
            lineHeight: 1.5,
            maxHeight: 80,
            overflow: 'hidden',
          }}
        >
          {bookmarklet}
          <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          type="button"
          variant="outlined"
          color="warning"
          size="small"
          onClick={reset}
          fullWidth
        >
          Reset to defaults
        </Button>
      </Box>

      <Button type="submit" sx={{ display: 'none' }} />
    </Box>
  )
}
