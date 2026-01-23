export type SimpleMaoInputs = {
  arv: number
  rehab: number
  profit: number
  wholesaleFee: number
  haircutPct?: number // default 0.07
}

export type SimpleMaoOutputs = {
  arvAdjusted: number
  mao: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function calculateSimpleMao(input: SimpleMaoInputs): SimpleMaoOutputs {
  const haircutPct = input.haircutPct ?? 0.07

  const arv = Math.max(0, input.arv || 0)
  const rehab = Math.max(0, input.rehab || 0)
  const profit = Math.max(0, input.profit || 0)
  const wholesaleFee = Math.max(0, input.wholesaleFee || 0)

  const arvAdjusted = arv * (1 - haircutPct)
  const mao = arvAdjusted - rehab - profit - wholesaleFee

  return {
    arvAdjusted: round2(arvAdjusted),
    mao: round2(mao),
  }
}
