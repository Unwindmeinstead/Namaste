import { useState } from 'react'

export function AddModal({ isOpen, onClose, onAdd }) {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return

    onAdd({
      id: Date.now().toString(),
      amount: amountNum,
      source: source.trim(),
      date,
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    })

    setAmount('')
    setSource('')
    setDate(today)
    setNotes('')
    onClose()

    if (navigator.vibrate) navigator.vibrate(10)
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <h2>Add Income</h2>
          <div></div>
        </div>

        <form className="income-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input-wrap">
              <span className="currency">$</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Source</label>
            <input
              type="text"
              placeholder="e.g. Satsang, Donation, Teaching"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">Save Entry</button>
        </form>
      </div>
    </div>
  )
}

