/**
 * Pennsylvania & Federal Tax Calculations for Self-Employed Individuals
 * Updated for 2024/2025 tax rates
 */

// ===== IRS MILEAGE RATES =====
export const IRS_MILEAGE_RATE = 0.67 // 2024 rate: 67 cents per mile

// ===== PENNSYLVANIA STATE TAX =====
export const PA_STATE_TAX_RATE = 0.0307 // 3.07% flat rate

// ===== FEDERAL SELF-EMPLOYMENT TAX =====
export const SELF_EMPLOYMENT_TAX_RATE = 0.153 // 15.3% (12.4% Social Security + 2.9% Medicare)
export const SE_TAX_DEDUCTIBLE_PORTION = 0.5 // Can deduct 50% of SE tax from income

// ===== FEDERAL INCOME TAX BRACKETS (2024 - Single Filer) =====
export const FEDERAL_TAX_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 }
]

// ===== FEDERAL INCOME TAX BRACKETS (2024 - Married Filing Jointly) =====
export const FEDERAL_TAX_BRACKETS_MARRIED = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 }
]

// ===== STANDARD DEDUCTIONS (2024) =====
export const STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
  headOfHousehold: 21900
}

// ===== QUARTERLY PAYMENT DUE DATES =====
export const QUARTERLY_DUE_DATES = {
  Q1: { period: 'Jan 1 - Mar 31', due: 'April 15' },
  Q2: { period: 'Apr 1 - May 31', due: 'June 15' },
  Q3: { period: 'Jun 1 - Aug 31', due: 'September 15' },
  Q4: { period: 'Sep 1 - Dec 31', due: 'January 15 (next year)' }
}

/**
 * Calculate mileage deduction
 */
export function calculateMileageDeduction(totalMiles, rate = IRS_MILEAGE_RATE) {
  return totalMiles * rate
}

/**
 * Calculate Self-Employment Tax
 * Only applies to 92.35% of net self-employment income
 */
export function calculateSelfEmploymentTax(netIncome) {
  if (netIncome <= 0) return { tax: 0, deductibleAmount: 0 }
  
  const taxableAmount = netIncome * 0.9235 // 92.35% subject to SE tax
  const seTax = taxableAmount * SELF_EMPLOYMENT_TAX_RATE
  const deductibleAmount = seTax * SE_TAX_DEDUCTIBLE_PORTION
  
  return {
    taxableAmount,
    tax: seTax,
    deductibleAmount, // Can deduct half of SE tax from AGI
    socialSecurityPortion: taxableAmount * 0.124,
    medicarePortion: taxableAmount * 0.029
  }
}

/**
 * Calculate Federal Income Tax using progressive brackets
 */
export function calculateFederalIncomeTax(taxableIncome, filingStatus = 'single') {
  const brackets = filingStatus === 'married' 
    ? FEDERAL_TAX_BRACKETS_MARRIED 
    : FEDERAL_TAX_BRACKETS_SINGLE
  
  if (taxableIncome <= 0) return { tax: 0, effectiveRate: 0, marginalRate: 0, breakdown: [] }
  
  let totalTax = 0
  let remaining = taxableIncome
  const breakdown = []
  let marginalRate = 0.10
  
  for (const bracket of brackets) {
    if (remaining <= 0) break
    
    const bracketWidth = bracket.max - bracket.min
    const taxableInBracket = Math.min(remaining, bracketWidth)
    const taxInBracket = taxableInBracket * bracket.rate
    
    if (taxableInBracket > 0) {
      breakdown.push({
        bracket: `${(bracket.rate * 100).toFixed(0)}%`,
        income: taxableInBracket,
        tax: taxInBracket,
        range: `$${bracket.min.toLocaleString()} - $${bracket.max === Infinity ? '+' : bracket.max.toLocaleString()}`
      })
      marginalRate = bracket.rate
    }
    
    totalTax += taxInBracket
    remaining -= taxableInBracket
  }
  
  return {
    tax: totalTax,
    effectiveRate: taxableIncome > 0 ? totalTax / taxableIncome : 0,
    marginalRate,
    breakdown
  }
}

/**
 * Calculate Pennsylvania State Tax
 */
export function calculatePAStateTax(taxableIncome) {
  if (taxableIncome <= 0) return 0
  return taxableIncome * PA_STATE_TAX_RATE
}

/**
 * Complete Tax Calculation for PA Self-Employed Individual
 */
export function calculateCompleteTaxLiability(params) {
  const {
    grossIncome = 0,
    totalExpenses = 0,
    totalMiles = 0,
    filingStatus = 'single',
    additionalDeductions = 0
  } = params
  
  // Step 1: Calculate Net Self-Employment Income
  const mileageDeduction = calculateMileageDeduction(totalMiles)
  const netSelfEmploymentIncome = Math.max(0, grossIncome - totalExpenses - mileageDeduction)
  
  // Step 2: Calculate Self-Employment Tax
  const seResult = calculateSelfEmploymentTax(netSelfEmploymentIncome)
  
  // Step 3: Calculate Adjusted Gross Income (AGI)
  // Deduct half of SE tax from income for federal tax purposes
  const agiBeforeStandardDeduction = netSelfEmploymentIncome - seResult.deductibleAmount - additionalDeductions
  
  // Step 4: Apply Standard Deduction
  const standardDeduction = STANDARD_DEDUCTION[filingStatus] || STANDARD_DEDUCTION.single
  const federalTaxableIncome = Math.max(0, agiBeforeStandardDeduction - standardDeduction)
  
  // Step 5: Calculate Federal Income Tax
  const federalResult = calculateFederalIncomeTax(federalTaxableIncome, filingStatus)
  
  // Step 6: Calculate PA State Tax (on net income, no standard deduction in PA)
  const paTaxableIncome = netSelfEmploymentIncome // PA taxes net income directly
  const paStateTax = calculatePAStateTax(paTaxableIncome)
  
  // Step 7: Calculate Total Tax Liability
  const totalFederalTax = federalResult.tax + seResult.tax
  const totalTaxLiability = totalFederalTax + paStateTax
  
  // Step 8: Calculate Quarterly Payments
  const quarterlyFederal = totalFederalTax / 4
  const quarterlyPA = paStateTax / 4
  const quarterlyTotal = totalTaxLiability / 4
  
  return {
    // Income Summary
    grossIncome,
    totalExpenses,
    mileageDeduction,
    netSelfEmploymentIncome,
    
    // Self-Employment Tax
    selfEmploymentTax: seResult.tax,
    seTaxDeductible: seResult.deductibleAmount,
    socialSecurityTax: seResult.socialSecurityPortion,
    medicareTax: seResult.medicarePortion,
    
    // Federal Income Tax
    adjustedGrossIncome: agiBeforeStandardDeduction,
    standardDeduction,
    federalTaxableIncome,
    federalIncomeTax: federalResult.tax,
    federalEffectiveRate: federalResult.effectiveRate,
    federalMarginalRate: federalResult.marginalRate,
    federalBracketBreakdown: federalResult.breakdown,
    
    // PA State Tax
    paTaxableIncome,
    paStateTax,
    paEffectiveRate: PA_STATE_TAX_RATE,
    
    // Totals
    totalFederalTax, // Federal Income + SE Tax
    totalTaxLiability, // All taxes
    
    // Quarterly Payments
    quarterlyFederal,
    quarterlyPA,
    quarterlyTotal,
    
    // Effective Rates
    overallEffectiveRate: grossIncome > 0 ? totalTaxLiability / grossIncome : 0,
    
    // Take Home
    estimatedTakeHome: grossIncome - totalExpenses - mileageDeduction - totalTaxLiability
  }
}

/**
 * Get tax summary for display
 */
export function getTaxSummary(entries, filingStatus = 'single') {
  const incomeEntries = entries.filter(e => e.type !== 'expense')
  const expenseEntries = entries.filter(e => e.type === 'expense')
  
  const grossIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0)
  const totalMiles = entries.filter(e => e.miles).reduce((sum, e) => sum + (e.miles || 0), 0)
  
  return calculateCompleteTaxLiability({
    grossIncome,
    totalExpenses,
    totalMiles,
    filingStatus
  })
}
