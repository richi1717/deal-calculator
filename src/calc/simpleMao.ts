export type SimpleMaoInputs = {
  arv: number
  rehab: number
  profit: number
  wholesaleFee: number
  haircutPct?: number
  commissionPct?: number
  dpPct?: number
  interestRate?: number
}

export type SimpleMaoOutputs = {
  arvAdjusted: number
  mao: number
  estCommission: number
  estDP: number
  estMonthlyIO: number
  buyRatio: number
  cashOnCashROI: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function calculateSimpleMao(input: SimpleMaoInputs): SimpleMaoOutputs {
  const haircutPct = input.haircutPct ?? 0.07
  const commissionPct = input.commissionPct ?? 0.015
  const dpPct = input.dpPct ?? 0.15
  const interestRate = input.interestRate ?? 0.1

  const arv = Math.max(0, input.arv || 0)
  const rehab = Math.max(0, input.rehab || 0)
  const profit = Math.max(0, input.profit || 0)
  const wholesaleFee = Math.max(0, input.wholesaleFee || 0)

  const arvAdjusted = arv * (1 - haircutPct)
  const mao = arvAdjusted - rehab - profit - wholesaleFee

  const effectiveMao = Math.max(0, mao)
  const estCommission = round2(effectiveMao * commissionPct)
  const estDP = round2(effectiveMao * dpPct)
  const estMonthlyIO = round2(((effectiveMao - estDP) * interestRate) / 12)

  const buyRatio = arv > 0 ? round2(mao / arv) : 0
  const cocDenominator = rehab + estDP
  const cashOnCashROI = cocDenominator > 0 ? round2(profit / cocDenominator) : 0

  return {
    arvAdjusted: round2(arvAdjusted),
    mao: round2(mao),
    estCommission,
    estDP,
    estMonthlyIO,
    buyRatio,
    cashOnCashROI,
  }
}
