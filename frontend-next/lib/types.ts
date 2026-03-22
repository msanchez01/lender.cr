// Property types

export interface Property {
  id: string
  borrower_id: string
  property_type: string
  address: string
  city: string | null
  province: string | null
  lot_size_sqm: number | null
  built_area_sqm: number | null
  year_built: number | null
  folio_real: string | null
  plano_catastrado: string | null
  estimated_value_usd: number | null
  appraised_value_usd: number | null
  existing_liens_usd: number | null
  net_equity_usd: number | null
  description: string | null
  images: PropertyImage[]
  documents: PropertyDocument[]
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  image_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface PropertyDocument {
  id: string
  document_type: string
  file_url: string
  file_name: string | null
  file_size_bytes: number | null
  is_verified: boolean
  created_at: string
}

export interface PropertyListItem {
  id: string
  property_type: string
  address: string
  city: string | null
  province: string | null
  estimated_value_usd: number | null
  image_count: number
  document_count: number
  created_at: string
}

export interface PropertyList {
  items: PropertyListItem[]
  total: number
}

// Loan Application types

export interface LoanApplication {
  id: string
  application_number: string
  borrower_id: string
  property_id: string
  amount_requested: number
  currency: string
  purpose: string
  purpose_description: string | null
  preferred_term_months: number
  max_interest_rate_monthly: number | null
  status: string
  preliminary_ltv: number | null
  final_ltv: number | null
  rejection_reason: string | null
  submitted_at: string | null
  approved_at: string | null
  funded_at: string | null
  created_at: string
  updated_at: string
}

export interface LoanApplicationList {
  items: LoanApplication[]
  total: number
}

// Marketplace types (investor view)

export interface MarketplacePropertySummary {
  property_type: string
  city: string | null
  province: string | null
  estimated_value_usd: number | null
  appraised_value_usd: number | null
  lot_size_sqm: number | null
  built_area_sqm: number | null
  year_built: number | null
  image_urls: string[]
}

export interface MarketplaceDeal {
  id: string
  application_number: string
  amount_requested: number
  currency: string
  purpose: string
  purpose_description: string | null
  preferred_term_months: number
  max_interest_rate_monthly: number | null
  preliminary_ltv: number | null
  final_ltv: number | null
  status: string
  property: MarketplacePropertySummary
  interest_count: number
  my_interest: InvestorInterest | null
  created_at: string
}

export interface MarketplaceDealList {
  items: MarketplaceDeal[]
  total: number
  page: number
  page_size: number
}

export interface InvestorInterest {
  id: string
  investor_id: string
  loan_application_id: string
  amount_willing: number | null
  proposed_rate_monthly: number | null
  message: string | null
  status: string
  created_at: string
}

export interface InvestorInterestWithDeal extends InvestorInterest {
  application_number: string | null
  amount_requested: number | null
  property_type: string | null
  property_city: string | null
}

export interface PortfolioSummary {
  total_invested: number
  active_deals_count: number
  total_interest_earned: number
  avg_annual_return: number
  interests_expressed: number
  interests_committed: number
}
