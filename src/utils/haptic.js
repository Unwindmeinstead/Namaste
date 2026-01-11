// Haptic feedback utility
// Reads setting from localStorage to avoid prop drilling

export function haptic(intensity = 'light') {
  // Check if haptic feedback is enabled
  try {
    const settings = JSON.parse(localStorage.getItem('yagya_settings') || '{}')
    if (!settings.hapticFeedback) return
  } catch {
    return
  }

  if (!navigator.vibrate) return

  // Different vibration patterns
  switch (intensity) {
    case 'light':
      navigator.vibrate(8)
      break
    case 'medium':
      navigator.vibrate(15)
      break
    case 'heavy':
      navigator.vibrate(25)
      break
    case 'success':
      navigator.vibrate([10, 50, 10])
      break
    case 'error':
      navigator.vibrate([50, 30, 50])
      break
    default:
      navigator.vibrate(10)
  }
}

// Button click handler wrapper
export function withHaptic(callback, intensity = 'light') {
  return (...args) => {
    haptic(intensity)
    if (callback) callback(...args)
  }
}
