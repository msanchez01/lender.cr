export interface LendingLocation {
  slug: string
  name: string
  nameEs: string
  avgPropertyValue: number
  commonLoanRange: [number, number]
}

export const LOCATIONS: Record<string, LendingLocation> = {
  escazu: {
    slug: 'escazu',
    name: 'Escazú',
    nameEs: 'Escazú',
    avgPropertyValue: 450000,
    commonLoanRange: [50000, 200000],
  },
  'santa-ana': {
    slug: 'santa-ana',
    name: 'Santa Ana',
    nameEs: 'Santa Ana',
    avgPropertyValue: 400000,
    commonLoanRange: [40000, 175000],
  },
  guanacaste: {
    slug: 'guanacaste',
    name: 'Guanacaste',
    nameEs: 'Guanacaste',
    avgPropertyValue: 350000,
    commonLoanRange: [50000, 250000],
  },
  tamarindo: {
    slug: 'tamarindo',
    name: 'Tamarindo',
    nameEs: 'Tamarindo',
    avgPropertyValue: 500000,
    commonLoanRange: [60000, 300000],
  },
  jaco: {
    slug: 'jaco',
    name: 'Jacó',
    nameEs: 'Jacó',
    avgPropertyValue: 300000,
    commonLoanRange: [30000, 150000],
  },
}

export const LOCATION_SLUGS = Object.keys(LOCATIONS)
