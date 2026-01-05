import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [key, value])

  return [value, setValue]
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage('guruji_settings', {
    currency: 'USD',
    language: 'en',
    fiscalYearStart: 1,
    showCategories: true,
    hapticFeedback: true
  })

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return [settings, updateSetting, setSettings]
}
