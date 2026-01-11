import { useState, useEffect } from 'react'
import { CloseIcon } from './Icons'
import { t } from '../utils/translations'
import { haptic } from '../utils/haptic'

// Simple QR Code icon for the button
export const QRIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="3" height="3"/>
    <rect x="18" y="14" width="3" height="3"/>
    <rect x="14" y="18" width="3" height="3"/>
    <rect x="18" y="18" width="3" height="3"/>
  </svg>
)

// Generate QR code as SVG path data
function generateQRMatrix(data) {
  // Simple QR-like pattern generator for demo
  // In production, you'd use a proper QR library
  const size = 21
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
  
  // Position patterns (corners)
  const addPositionPattern = (x, y) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isOuter = i === 0 || i === 6 || j === 0 || j === 6
        const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4
        matrix[y + i][x + j] = isOuter || isInner
      }
    }
  }
  
  addPositionPattern(0, 0)
  addPositionPattern(14, 0)
  addPositionPattern(0, 14)
  
  // Timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0
    matrix[i][6] = i % 2 === 0
  }
  
  // Generate pseudo-random data pattern from input
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash = hash & hash
  }
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x] && x > 7 && y > 7) {
        matrix[y][x] = ((hash * (x + 1) * (y + 1)) % 3) === 0
      }
    }
  }
  
  return matrix
}

export function QRCodeModal({ isOpen, onClose, profile, settings }) {
  const lang = settings?.language || 'en'
  const [paymentInfo, setPaymentInfo] = useState(profile?.paymentId || '')
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const qrData = paymentInfo || profile?.email || profile?.phone || 'yagya-payment'
  const matrix = generateQRMatrix(qrData)
  const cellSize = 10
  const size = matrix.length * cellSize

  return (
    <div className="qr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="qr-modal">
        <button className="qr-close" onClick={() => { haptic(); onClose() }}>
          <CloseIcon />
        </button>
        
        <div className="qr-content">
          <h2 className="qr-title">{t('scanToPay', lang) || 'Scan to Pay'}</h2>
          <p className="qr-subtitle">{profile?.name || 'Yagya'}</p>
          
          <div className="qr-code-container">
            <svg 
              viewBox={`0 0 ${size + 20} ${size + 20}`} 
              className="qr-code-svg"
            >
              <rect x="0" y="0" width={size + 20} height={size + 20} fill="white" rx="12"/>
              <g transform="translate(10, 10)">
                {matrix.map((row, y) =>
                  row.map((cell, x) =>
                    cell ? (
                      <rect
                        key={`${x}-${y}`}
                        x={x * cellSize}
                        y={y * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill="#0a0a0a"
                      />
                    ) : null
                  )
                )}
              </g>
            </svg>
          </div>
          
          <div className="qr-info">
            <label className="qr-label">{t('paymentId', lang) || 'Payment ID / UPI'}</label>
            <input
              type="text"
              className="qr-input"
              placeholder={t('enterPaymentId', lang) || 'e.g., name@upi or phone number'}
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
            />
            <p className="qr-hint">
              {t('qrHint', lang) || 'Enter your UPI ID or payment info to generate a personalized QR code'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
