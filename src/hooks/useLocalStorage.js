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
  const [settings, setSettings] = useLocalStorage('yagya_settings', {
    currency: 'USD',
    language: 'en',
    theme: 'dark',
    fiscalYearStart: 1,
    showCategories: true,
    hapticFeedback: true
  })

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return [settings, updateSetting, setSettings]
}

export function useProfile() {
  const [profile, setProfile] = useLocalStorage('yagya_profile', {
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  })

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  return [profile, updateProfile, setProfile]
}
