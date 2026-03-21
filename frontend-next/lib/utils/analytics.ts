type GtagEventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: [string, string, GtagEventParams?]) => void
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''
const ADS_LABEL_LEAD = process.env.NEXT_PUBLIC_ADS_CONVERSION_LABEL_LEAD || ''
const ADS_LABEL_CONTACT = process.env.NEXT_PUBLIC_ADS_CONVERSION_LABEL_CONTACT || ''

export function trackEvent(eventName: string, params: GtagEventParams = {}) {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', eventName, params)
  }
}

function trackAdsConversion(label: string, value?: number, currency?: string) {
  if (!ADS_ID || !label) return
  trackEvent('conversion', {
    send_to: `${ADS_ID}/${label}`,
    ...(value != null && { value }),
    ...(currency && { currency }),
  })
}

// --- Borrower events ---

export function trackLoanApplication(loanAmount: number) {
  trackEvent('generate_lead', {
    event_category: 'borrower',
    event_label: 'loan_application',
    value: loanAmount,
    currency: 'USD',
  })
  trackAdsConversion(ADS_LABEL_LEAD, loanAmount, 'USD')
}

// --- Investor events ---

export function trackInvestorSignup() {
  trackEvent('sign_up', {
    event_category: 'investor',
    event_label: 'investor_registration',
  })
}

export function trackDealViewed(dealId: string, loanAmount: number) {
  trackEvent('view_item', {
    item_id: dealId,
    value: loanAmount,
    currency: 'USD',
  })
}

export function trackInterestExpressed(dealId: string, amount: number) {
  trackEvent('generate_lead', {
    event_category: 'investor',
    event_label: 'interest_expressed',
    item_id: dealId,
    value: amount,
    currency: 'USD',
  })
  trackAdsConversion(ADS_LABEL_LEAD, amount, 'USD')
}

// --- Calculator events ---

export function trackCalculatorUsed(propertyValue: number, loanAmount: number) {
  trackEvent('calculator_used', {
    property_value: propertyValue,
    loan_amount: loanAmount,
    ltv_ratio: Math.round((loanAmount / propertyValue) * 100),
  })
}

// --- Contact events ---

export function trackContactFormSubmission() {
  trackEvent('contact_form_submit', {})
  trackAdsConversion(ADS_LABEL_CONTACT)
}
