// Default home address
export const DEFAULT_HOME_ADDRESS = '1038 Betty Rae Dr, Pittsburgh, PA 15236'

// Haversine formula to calculate distance between two lat/lng points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return deg * (Math.PI / 180)
}

// Geocode an address using OpenStreetMap Nominatim (free, no API key needed)
async function geocodeAddress(address) {
  try {
    const encoded = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
      {
        headers: {
          'User-Agent': 'GurujiIncomeTracker/1.0'
        }
      }
    )
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Calculate miles between home and destination
export async function calculateMiles(destinationAddress, homeAddress = DEFAULT_HOME_ADDRESS) {
  if (!destinationAddress || !destinationAddress.trim()) {
    return { miles: 0, error: 'No destination address provided' }
  }

  try {
    // Geocode both addresses
    const [homeCoords, destCoords] = await Promise.all([
      geocodeAddress(homeAddress),
      geocodeAddress(destinationAddress)
    ])

    if (!homeCoords) {
      return { miles: 0, error: 'Could not find home address' }
    }

    if (!destCoords) {
      return { miles: 0, error: 'Could not find destination address' }
    }

    // Calculate straight-line distance
    const miles = haversineDistance(
      homeCoords.lat, homeCoords.lon,
      destCoords.lat, destCoords.lon
    )

    return {
      miles: Math.round(miles * 10) / 10, // Round to 1 decimal
      homeAddress: homeCoords.displayName,
      destAddress: destCoords.displayName,
      error: null
    }
  } catch (error) {
    console.error('Mileage calculation error:', error)
    return { miles: 0, error: 'Failed to calculate distance' }
  }
}

// Calculate mileage expense based on IRS rate
export function calculateMileageExpense(miles, ratePerMile = 0.67) {
  return Math.round(miles * ratePerMile * 100) / 100
}

// Get total miles from entries
export function getTotalMiles(entries) {
  return entries
    .filter(e => e.type === 'expense' && e.miles)
    .reduce((total, e) => total + (e.miles || 0), 0)
}

