import { useState, useEffect, useRef } from 'react'
import { CloseIcon } from './Icons'
import { t } from '../utils/translations'

const SLIDES = [
  {
    id: 1,
    icon: '🙏',
    titleKey: 'tutorialWelcomeTitle',
    titleFallback: 'Welcome to Yagya',
    descKey: 'tutorialWelcomeDesc',
    descFallback: 'Your spiritual income tracker'
  },
  {
    id: 2,
    icon: '➕',
    titleKey: 'tutorialAddTitle',
    titleFallback: 'Add Income',
    descKey: 'tutorialAddDesc',
    descFallback: 'Tap + button to record earnings'
  },
  {
    id: 3,
    icon: '📅',
    titleKey: 'tutorialScheduleTitle',
    titleFallback: 'Schedule Services',
    descKey: 'tutorialScheduleDesc',
    descFallback: 'Plan upcoming ceremonies'
  },
  {
    id: 4,
    icon: '💰',
    titleKey: 'tutorialExpenseTitle',
    titleFallback: 'Track Expenses',
    descKey: 'tutorialExpenseDesc',
    descFallback: 'Log travel, supplies & more'
  },
  {
    id: 5,
    icon: '📊',
    titleKey: 'tutorialReportsTitle',
    titleFallback: 'Tax Reports',
    descKey: 'tutorialReportsDesc',
    descFallback: 'Generate beautiful PDF reports'
  },
  {
    id: 6,
    icon: '🔒',
    titleKey: 'tutorialSecurityTitle',
    titleFallback: 'Secure & Private',
    descKey: 'tutorialSecurityDesc',
    descFallback: 'Data stays on your device'
  },
  {
    id: 7,
    icon: '💾',
    titleKey: 'tutorialBackupTitle',
    titleFallback: 'Backup Vault',
    descKey: 'tutorialBackupDesc',
    descFallback: 'Auto-save every transaction'
  },
  {
    id: 8,
    icon: '🌙',
    titleKey: 'tutorialThemeTitle',
    titleFallback: 'Dark & Light',
    descKey: 'tutorialThemeDesc',
    descFallback: 'Switch themes in settings'
  }
]

export function TutorialSlides({ isOpen, onClose, settings }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef(null)
  const lang = settings?.language || 'en'
  
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 400)
  }

  const handleScroll = (e) => {
    if (isAnimating) return
    const delta = e.deltaY
    if (delta > 30 && currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1)
    } else if (delta < -30 && currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }

  const handleTouchStart = useRef(null)
  
  const onTouchStart = (e) => {
    handleTouchStart.current = e.touches[0].clientY
  }
  
  const onTouchEnd = (e) => {
    if (!handleTouchStart.current || isAnimating) return
    const delta = handleTouchStart.current - e.changedTouches[0].clientY
    if (delta > 50 && currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1)
    } else if (delta < -50 && currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
    handleTouchStart.current = null
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      if (currentSlide < SLIDES.length - 1) goToSlide(currentSlide + 1)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      if (currentSlide > 0) goToSlide(currentSlide - 1)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentSlide, isAnimating])

  if (!isOpen) return null

  return (
    <div 
      className="tutorial-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onWheel={handleScroll}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      ref={containerRef}
    >
      <div className="tutorial-modal">
        {/* Slide Counter */}
        <div className="tutorial-counter">
          {currentSlide + 1}/{SLIDES.length}
        </div>
        
        {/* Close Button */}
        <button className="tutorial-close" onClick={onClose}>
          <CloseIcon />
        </button>

        {/* Slides Container */}
        <div className="tutorial-slides-container">
          {SLIDES.map((slide, index) => (
            <div 
              key={slide.id}
              className={`tutorial-slide ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'passed' : ''}`}
            >
              <div className="tutorial-icon">{slide.icon}</div>
              <h2 className="tutorial-title">
                {t(slide.titleKey, lang) || slide.titleFallback}
              </h2>
              <p className="tutorial-desc">
                {t(slide.descKey, lang) || slide.descFallback}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="tutorial-dots">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              className={`tutorial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Navigation Hint */}
        <div className="tutorial-hint">
          {currentSlide < SLIDES.length - 1 
            ? (t('scrollToContinue', lang) || 'Scroll or swipe to continue')
            : (t('tapToClose', lang) || 'Tap anywhere to close')
          }
        </div>
      </div>
    </div>
  )
}
