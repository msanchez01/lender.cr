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
