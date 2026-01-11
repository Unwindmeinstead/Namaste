import { useState, useEffect, useRef } from 'react'
import { CloseIcon, ChevronIcon } from './Icons'

const SLIDES = {
  en: [
    {
      id: 1,
      icon: '🙏',
      title: 'Welcome to Yagya',
      desc: 'Your complete income tracker for spiritual services',
      details: 'Track earnings, manage expenses, schedule ceremonies, and generate tax reports — all in one secure app.'
    },
    {
      id: 2,
      icon: '➕',
      title: 'Recording Income',
      desc: 'Tap the + Add Transaction button on home',
      details: 'Select category (Saptahah, Vivah, etc.), enter amount, add payer name, and choose payment method. Each entry is saved instantly.'
    },
    {
      id: 3,
      icon: '💸',
      title: 'Tracking Expenses',
      desc: 'Switch to Expense tab when adding',
      details: 'Log travel costs, supplies, equipment. Link expenses to specific jobs for accurate profit tracking per ceremony.'
    },
    {
      id: 4,
      icon: '📅',
      title: 'Scheduling Services',
      desc: 'Tap any date on the calendar',
      details: 'Add upcoming ceremonies with contact info, expected amount, and location. Never miss a booking again.'
    },
    {
      id: 5,
      icon: '📊',
      title: 'Reports & Analytics',
      desc: 'View monthly and yearly breakdowns',
      details: 'See income by category, monthly trends, and expense summaries. Visual charts help you understand your earnings.'
    },
    {
      id: 6,
      icon: '📄',
      title: 'Tax Reports',
      desc: 'Generate professional PDF reports',
      details: 'One tap to create detailed tax documents with all income, expenses, and mileage. Email or share directly.'
    },
    {
      id: 7,
      icon: '💾',
      title: 'Backup Vault',
      desc: 'Your data is auto-saved after each entry',
      details: 'Access Settings → Backup Vault to view snapshots. Download anytime, restore if needed. Data never leaves your device.'
    },
    {
      id: 8,
      icon: '🔒',
      title: 'Security & Privacy',
      desc: 'Set a PIN lock in Settings',
      details: 'All data stored locally on your device. No cloud, no account needed. Optional PIN protects your information.'
    },
    {
      id: 9,
      icon: '🌙',
      title: 'Personalize',
      desc: 'Dark mode, light mode, and more',
      details: 'Change theme, language, and currency in Settings. The app adapts to your preferences.'
    }
  ],
  ne: [
    {
      id: 1,
      icon: '🙏',
      title: 'Yagya मा स्वागत छ',
      desc: 'आध्यात्मिक सेवाहरूको लागि तपाईंको पूर्ण आम्दानी ट्र्याकर',
      details: 'कमाई ट्र्याक गर्नुहोस्, खर्च व्यवस्थापन गर्नुहोस्, समारोहहरू तालिका बनाउनुहोस्, र कर रिपोर्टहरू बनाउनुहोस् — सबै एक सुरक्षित एपमा।'
    },
    {
      id: 2,
      icon: '➕',
      title: 'आम्दानी रेकर्ड गर्ने',
      desc: 'गृहपृष्ठमा + लेनदेन थप्नुहोस् बटन थिच्नुहोस्',
      details: 'श्रेणी छान्नुहोस् (सप्ताह, विवाह, आदि), रकम प्रविष्ट गर्नुहोस्, भुक्तानीकर्ताको नाम थप्नुहोस्, र भुक्तानी विधि छान्नुहोस्। प्रत्येक प्रविष्टि तुरुन्त सुरक्षित हुन्छ।'
    },
    {
      id: 3,
      icon: '💸',
      title: 'खर्च ट्र्याकिङ',
      desc: 'थप्दा खर्च ट्याबमा स्विच गर्नुहोस्',
      details: 'यात्रा खर्च, सामान, उपकरण लग गर्नुहोस्। प्रति समारोह सही नाफा ट्र्याकिङको लागि विशेष कामहरूसँग खर्चहरू लिंक गर्नुहोस्।'
    },
    {
      id: 4,
      icon: '📅',
      title: 'सेवाहरू तालिका बनाउने',
      desc: 'क्यालेन्डरमा कुनै पनि मिति थिच्नुहोस्',
      details: 'सम्पर्क जानकारी, अपेक्षित रकम, र स्थानसहित आगामी समारोहहरू थप्नुहोस्। फेरि कहिल्यै बुकिङ छुटाउनुहुन्न।'
    },
    {
      id: 5,
      icon: '📊',
      title: 'रिपोर्ट र विश्लेषण',
      desc: 'मासिक र वार्षिक विवरणहरू हेर्नुहोस्',
      details: 'श्रेणी अनुसार आम्दानी, मासिक प्रवृत्ति, र खर्च सारांश हेर्नुहोस्। भिजुअल चार्टहरूले तपाईंको कमाई बुझ्न मद्दत गर्छ।'
    },
    {
      id: 6,
      icon: '📄',
      title: 'कर रिपोर्टहरू',
      desc: 'व्यावसायिक PDF रिपोर्टहरू बनाउनुहोस्',
      details: 'सबै आम्दानी, खर्च, र माइलेजसहित विस्तृत कर कागजातहरू सिर्जना गर्न एक ट्याप। सीधा इमेल वा शेयर गर्नुहोस्।'
    },
    {
      id: 7,
      icon: '💾',
      title: 'ब्याकअप भल्ट',
      desc: 'प्रत्येक प्रविष्टि पछि तपाईंको डाटा स्वत: सुरक्षित हुन्छ',
      details: 'स्न्यापशटहरू हेर्न सेटिङ → ब्याकअप भल्टमा जानुहोस्। जुनसुकै बेला डाउनलोड गर्नुहोस्, आवश्यक भएमा पुनर्स्थापना गर्नुहोस्। डाटा तपाईंको उपकरण छोड्दैन।'
    },
    {
      id: 8,
      icon: '🔒',
      title: 'सुरक्षा र गोपनीयता',
      desc: 'सेटिङमा PIN लक सेट गर्नुहोस्',
      details: 'सबै डाटा तपाईंको उपकरणमा स्थानीय रूपमा भण्डारण गरिएको छ। क्लाउड छैन, खाता आवश्यक छैन। वैकल्पिक PIN ले तपाईंको जानकारी सुरक्षित गर्छ।'
    },
    {
      id: 9,
      icon: '🌙',
      title: 'व्यक्तिगतकरण',
      desc: 'डार्क मोड, लाइट मोड, र थप',
      details: 'सेटिङमा थिम, भाषा, र मुद्रा परिवर्तन गर्नुहोस्। एपले तपाईंको प्राथमिकताहरूमा अनुकूलन गर्दछ।'
    }
  ],
  hi: [
    {
      id: 1,
      icon: '🙏',
      title: 'Yagya में आपका स्वागत है',
      desc: 'आध्यात्मिक सेवाओं के लिए आपका पूर्ण आय ट्रैकर',
      details: 'कमाई ट्रैक करें, खर्च प्रबंधित करें, समारोह शेड्यूल करें, और टैक्स रिपोर्ट बनाएं — सब एक सुरक्षित ऐप में।'
    },
    {
      id: 2,
      icon: '➕',
      title: 'आय रिकॉर्ड करना',
      desc: 'होम पर + लेनदेन जोड़ें बटन टैप करें',
      details: 'श्रेणी चुनें (सप्ताह, विवाह, आदि), राशि दर्ज करें, भुगतानकर्ता का नाम जोड़ें, और भुगतान विधि चुनें।'
    },
    {
      id: 3,
      icon: '💸',
      title: 'खर्च ट्रैकिंग',
      desc: 'जोड़ते समय खर्च टैब पर स्विच करें',
      details: 'यात्रा लागत, सामग्री, उपकरण लॉग करें। प्रति समारोह सटीक लाभ ट्रैकिंग के लिए खर्चों को विशिष्ट कार्यों से लिंक करें।'
    },
    {
      id: 4,
      icon: '📅',
      title: 'सेवाएं शेड्यूल करना',
      desc: 'कैलेंडर पर कोई भी तारीख टैप करें',
      details: 'संपर्क जानकारी, अपेक्षित राशि और स्थान के साथ आगामी समारोह जोड़ें।'
    },
    {
      id: 5,
      icon: '📊',
      title: 'रिपोर्ट और विश्लेषण',
      desc: 'मासिक और वार्षिक विवरण देखें',
      details: 'श्रेणी के अनुसार आय, मासिक रुझान और खर्च सारांश देखें।'
    },
    {
      id: 6,
      icon: '📄',
      title: 'टैक्स रिपोर्ट',
      desc: 'पेशेवर PDF रिपोर्ट बनाएं',
      details: 'सभी आय, खर्च और माइलेज के साथ विस्तृत टैक्स दस्तावेज़ बनाने के लिए एक टैप।'
    },
    {
      id: 7,
      icon: '💾',
      title: 'बैकअप वॉल्ट',
      desc: 'प्रत्येक प्रविष्टि के बाद आपका डेटा स्वतः सहेजा जाता है',
      details: 'स्नैपशॉट देखने के लिए सेटिंग्स → बैकअप वॉल्ट पर जाएं।'
    },
    {
      id: 8,
      icon: '🔒',
      title: 'सुरक्षा और गोपनीयता',
      desc: 'सेटिंग्स में PIN लॉक सेट करें',
      details: 'सभी डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत है। कोई क्लाउड नहीं, कोई खाता आवश्यक नहीं।'
    },
    {
      id: 9,
      icon: '🌙',
      title: 'वैयक्तिकरण',
      desc: 'डार्क मोड, लाइट मोड, और अधिक',
      details: 'सेटिंग्स में थीम, भाषा और मुद्रा बदलें।'
    }
  ]
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ne', name: 'नेपाली' },
  { code: 'hi', name: 'हिन्दी' }
]

export function TutorialSlides({ isOpen, onClose, settings }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideLang, setSlideLang] = useState(settings?.language || 'en')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const containerRef = useRef(null)
  const touchStartRef = useRef(null)
  
  const slides = SLIDES[slideLang] || SLIDES.en
  
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0)
      setSlideLang(settings?.language || 'en')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, settings?.language])

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide || index < 0 || index >= slides.length) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 400)
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1)
  }

  const prevSlide = () => {
    if (currentSlide > 0) goToSlide(currentSlide - 1)
  }

  // Horizontal scroll detection
  const handleScroll = (e) => {
    if (isAnimating) return
    const delta = e.deltaX || e.deltaY
    if (delta > 30) nextSlide()
    else if (delta < -30) prevSlide()
  }

  const onTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX
  }
  
  const onTouchEnd = (e) => {
    if (!touchStartRef.current || isAnimating) return
    const delta = touchStartRef.current - e.changedTouches[0].clientX
    if (delta > 50) nextSlide()
    else if (delta < -50) prevSlide()
    touchStartRef.current = null
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide()
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide()
    else if (e.key === 'Escape') onClose()
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
        setShowLangMenu(false)
      }}
    >
      <div 
        className="tutorial-modal"
        onWheel={handleScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        ref={containerRef}
      >
        {/* Top Bar */}
        <div className="tutorial-topbar">
          <div className="tutorial-counter">
            {currentSlide + 1} / {slides.length}
          </div>
          
          {/* Language Selector */}
          <div className="tutorial-lang-wrapper">
            <button 
              className="tutorial-lang-btn"
              onClick={(e) => { e.stopPropagation(); setShowLangMenu(!showLangMenu) }}
            >
              {LANGUAGES.find(l => l.code === slideLang)?.name || 'English'}
              <ChevronIcon className={`tutorial-lang-chevron ${showLangMenu ? 'open' : ''}`} />
            </button>
            {showLangMenu && (
              <div className="tutorial-lang-menu">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`tutorial-lang-option ${slideLang === lang.code ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSlideLang(lang.code)
                      setShowLangMenu(false)
                      setCurrentSlide(0)
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="tutorial-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Slides Container */}
        <div className="tutorial-slides-wrapper">
          <div 
            className="tutorial-slides-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="tutorial-slide">
                <div className="tutorial-icon">{slide.icon}</div>
                <h2 className="tutorial-title">{slide.title}</h2>
                <p className="tutorial-desc">{slide.desc}</p>
                <p className="tutorial-details">{slide.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className={`tutorial-arrow tutorial-arrow-left ${currentSlide === 0 ? 'hidden' : ''}`}
          onClick={prevSlide}
        >
          <ChevronIcon />
        </button>
        <button 
          className={`tutorial-arrow tutorial-arrow-right ${currentSlide === slides.length - 1 ? 'hidden' : ''}`}
          onClick={nextSlide}
        >
          <ChevronIcon />
        </button>

        {/* Navigation Dots */}
        <div className="tutorial-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`tutorial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>

        {/* Hint */}
        <div className="tutorial-hint">
          {currentSlide < slides.length - 1 
            ? (slideLang === 'ne' ? 'दायाँ स्वाइप गर्नुहोस्' : slideLang === 'hi' ? 'दाएं स्वाइप करें' : 'Swipe right to continue →')
            : (slideLang === 'ne' ? 'बन्द गर्न ट्याप गर्नुहोस्' : slideLang === 'hi' ? 'बंद करने के लिए टैप करें' : 'Tap outside to close')
          }
        </div>
      </div>
    </div>
  )
}
