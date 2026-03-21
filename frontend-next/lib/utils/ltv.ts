export function calculateLtv(propertyValue: number, loanAmount: number): number {
  if (propertyValue <= 0) return 0
  return (loanAmount / propertyValue) * 100
}

export interface LtvTier {
  tier: 'excellent' | 'good' | 'standard' | 'not_qualified'
  color: string
  bgColor: string
  rateMin: number
  rateMax: number
}

const LTV_TIERS: { maxLtv: number; tier: LtvTier }[] = [
  {
    maxLtv: 30,
    tier: { tier: 'excellent', color: 'text-success-700', bgColor: 'bg-success-100', rateMin: 12, rateMax: 13 },
  },
  {
    maxLtv: 40,
    tier: { tier: 'good', color: 'text-primary-700', bgColor: 'bg-primary-100', rateMin: 13, rateMax: 14 },
  },
  {
    maxLtv: 50,
    tier: { tier: 'standard', color: 'text-gold-700', bgColor: 'bg-gold-100', rateMin: 14, rateMax: 16 },
  },
]

const NOT_QUALIFIED: LtvTier = {
  tier: 'not_qualified',
  color: 'text-red-700',
  bgColor: 'bg-red-100',
  rateMin: 0,
  rateMax: 0,
}

export function getLtvTier(ltv: number): LtvTier {
  for (const { maxLtv, tier } of LTV_TIERS) {
    if (ltv <= maxLtv) return tier
  }
  return NOT_QUALIFIED
}

export const MAX_LTV = 50
export const ORIGINATION_FEE_PERCENT = 4.5

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
