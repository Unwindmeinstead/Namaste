import { useState, useEffect } from 'react'
import { CloseIcon, TrashIcon } from './Icons'
import { CATEGORIES } from '../utils/categories'

export function EditModal({ isOpen, entry, onClose, onSave, onDelete, settings }) {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('other')

  useEffect(() => {
    if (entry) {
      setAmount(entry.amount.toString())
      setSource(entry.source || '')
      setDate(entry.date)
      setNotes(entry.notes || '')
      setCategory(entry.category || 'other')
    }
  }, [entry])

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) return

    onSave({
      ...entry,
      amount: amountNum,
      source: source.trim() || CATEGORIES.find(c => c.id === category)?.name || 'Income',
      date,
      notes: notes.trim(),
      category,
      updatedAt: new Date().toISOString()
    })
  }

  const handleDelete = () => {
    if (confirm('Delete this entry?')) {
      onDelete(entry.id)
      onClose()
    }
  }

  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
  const symbol = symbols[settings.currency] || '$'

  if (!entry) return null

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>Edit Entry</h2>
          <button className="delete-header-btn" onClick={handleDelete}>
            <TrashIcon className="delete-icon" />
          </button>
        </div>

        <form className="income-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input-wrap">
              <span className="currency">{symbol}</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={{ '--cat-color': cat.color }}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Source (optional)</label>
            <input
              type="text"
              placeholder="Custom description"
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
            <label>Notes (optional)</label>
            <input
              type="text"
              placeholder="Additional details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">Save Changes</button>
        </form>
      </div>
    </div>
  )
}

