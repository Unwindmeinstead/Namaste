import { formatCurrency } from '../utils/format'

export function SummaryCard({ total }) {
  return (
    <section className="summary-card">
      <p className="summary-label">Total Earnings</p>
      <h2 className="summary-amount">{formatCurrency(total)}</h2>
      <p className="summary-period">FY 2025-26</p>
    </section>
  )
}

