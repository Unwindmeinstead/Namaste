import { useState, useEffect, useRef } from 'react'
import { t } from '../utils/translations'

export function PinLock({ mode, onSuccess, onCancel, language = 'en' }) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [step, setStep] = useState(1) // 1 = enter, 2 = confirm (for setup)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const inputRefs = [useRef(), useRef(), useRef(), useRef()]
  const confirmRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => inputRefs[0].current?.focus(), 100)
  }, [])

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => confirmRefs[0].current?.focus(), 100)
    }
  }, [step])

  const handleInput = (index, value, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return
    
    const refs = isConfirm ? confirmRefs : inputRefs
    const setter = isConfirm ? setConfirmPin : setPin
    const current = isConfirm ? [...confirmPin] : [...pin]
    
    current[index] = value.slice(-1)
    setter(current)
    setError('')
    
    if (value && index < 3) {
      refs[index + 1].current?.focus()
    }
    
    // Check if complete
    if (current.every(d => d !== '')) {
      handleComplete(current, isConfirm)
    }
  }

  const handleKeyDown = (index, e, isConfirm = false) => {
    const refs = isConfirm ? confirmRefs : inputRefs
    const current = isConfirm ? confirmPin : pin
    const setter = isConfirm ? setConfirmPin : setPin
    
    if (e.key === 'Backspace' && !current[index] && index > 0) {
      refs[index - 1].current?.focus()
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      refs[index - 1].current?.focus()
    }
    
    if (e.key === 'ArrowRight' && index < 3) {
      refs[index + 1].current?.focus()
    }
  }

  const handleComplete = (digits, isConfirm) => {
    const pinValue = digits.join('')
    
    if (mode === 'setup') {
      if (!isConfirm) {
        // First entry done, move to confirm
        setStep(2)
      } else {
        // Confirming PIN
        const firstPin = pin.join('')
        if (pinValue === firstPin) {
          onSuccess(pinValue)
        } else {
          triggerError(t('pinsDontMatch', language))
          setConfirmPin(['', '', '', ''])
          setTimeout(() => confirmRefs[0].current?.focus(), 300)
        }
      }
    } else if (mode === 'unlock') {
      const storedPin = localStorage.getItem('guruji_pin')
      if (pinValue === storedPin) {
        onSuccess()
      } else {
        triggerError(t('wrongPin', language))
        setPin(['', '', '', ''])
        setTimeout(() => inputRefs[0].current?.focus(), 300)
      }
    } else if (mode === 'verify') {
      const storedPin = localStorage.getItem('guruji_pin')
      if (pinValue === storedPin) {
        onSuccess()
      } else {
        triggerError(t('wrongPin', language))
        setPin(['', '', '', ''])
        setTimeout(() => inputRefs[0].current?.focus(), 300)
      }
    }
  }

  const triggerError = (msg) => {
    setError(msg)
    setShake(true)
    if (navigator.vibrate) navigator.vibrate(100)
    setTimeout(() => setShake(false), 500)
  }

  const renderPinInputs = (values, refs, isConfirm = false) => (
    <div className={`pin-inputs ${shake && ((isConfirm && step === 2) || (!isConfirm && step === 1)) ? 'shake' : ''}`}>
      {values.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(i, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(i, e, isConfirm)}
          className={`pin-input ${digit ? 'filled' : ''}`}
          autoComplete="off"
        />
      ))}
    </div>
  )

  const getTitle = () => {
    if (mode === 'setup') {
      return step === 1 ? t('createPin', language) : t('confirmPin', language)
    }
    if (mode === 'verify') {
      return t('enterCurrentPin', language)
    }
    return t('enterPin', language)
  }

  const getSubtitle = () => {
    if (mode === 'setup') {
      return step === 1 ? t('createPinDesc', language) : t('confirmPinDesc', language)
    }
    if (mode === 'verify') {
      return t('verifyPinDesc', language)
    }
    return t('enterPinDesc', language)
  }

  return (
    <div className="pin-lock-overlay">
      <div className="pin-lock-content">
        <div className="pin-lock-header">
          <div className="pin-lock-icon">🔒</div>
          <h1 className="pin-lock-title">{getTitle()}</h1>
          <p className="pin-lock-subtitle">{getSubtitle()}</p>
        </div>

        {step === 1 && renderPinInputs(pin, inputRefs, false)}
        {step === 2 && mode === 'setup' && renderPinInputs(confirmPin, confirmRefs, true)}

        {error && <p className="pin-error">{error}</p>}

        <div className="pin-dots">
          {(step === 1 ? pin : confirmPin).map((digit, i) => (
            <div key={i} className={`pin-dot ${digit ? 'filled' : ''}`} />
          ))}
        </div>

        {onCancel && (
          <button className="pin-cancel-btn" onClick={onCancel}>
            {t('cancel', language)}
          </button>
        )}

        {mode === 'unlock' && (
          <p className="pin-footer">Guruji Income Tracker</p>
        )}
      </div>
    </div>
  )
}

