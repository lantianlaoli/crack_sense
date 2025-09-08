/**
 * Location utility functions - handle zip codes, cities and geolocation operations
 */

import { supabase } from './supabase'

export interface City {
  id: number
  city_name: string
  state_code: string
  state_name: string
  county_name: string
  zip_codes: string[]
  latitude: number
  longitude: number
  population: number
}

export interface ZipCodeInfo {
  zip_code: string
  city: City
  latitude: number
  longitude: number
}

// supabase instance imported above

/**
 * Find city information by zip code
 */
export async function getCityFromZipCode(zipCode: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('us_cities')
    .select('*')
    .contains('zip_codes', [zipCode])
    .limit(1)

  if (error || !data || data.length === 0) {
    console.log('No city found in database for zipCode:', zipCode, 'Error:', error)
    // If not found in database, try to fetch from external API
    return await fetchCityFromExternalAPI(zipCode)
  }

  console.log('Found existing city for zipCode:', zipCode, ':', data[0])
  return data[0]
}

/**
 * Get nearest zip code and city by coordinates
 */
export async function getZipCodeFromCoordinates(
  latitude: number, 
  longitude: number
): Promise<ZipCodeInfo | null> {
  // Use PostGIS function to find nearest city
  const { data, error } = await supabase.rpc('find_nearest_city', {
    lat: latitude,
    lng: longitude
  })

  if (error || !data) {
    return await fetchLocationFromExternalAPI(latitude, longitude)
  }

  return data
}

/**
 * Calculate distance between two coordinate points (in miles)
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959 // Earth radius (in miles)
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(value: number): number {
  return value * Math.PI / 180
}

/**
 * Fetch city information from external API (fallback)
 */
async function fetchCityFromExternalAPI(zipCode: string): Promise<City | null> {
  try {
    // Use free ZIP Code API
    const response = await fetch(`http://api.zippopotam.us/us/${zipCode}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0]
      
      // Save to database for future use
      const cityData = {
        city_name: place['place name'],
        state_code: place['state abbreviation'],
        state_name: place['state'],
        zip_codes: [zipCode],
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude)
      }

      const { data: savedCity } = await supabase
        .from('us_cities')
        .insert(cityData)
        .select()
        .single()

      return savedCity
    }
  } catch (error) {
    console.error('Failed to fetch city from external API:', error)
  }
  
  return null
}

/**
 * Get location information from coordinates (fallback)
 */
async function fetchLocationFromExternalAPI(
  latitude: number, 
  longitude: number
): Promise<ZipCodeInfo | null> {
  try {
    // Use Nominatim reverse geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    )
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data && data.address) {
      const zipCode = data.address.postcode
      const cityName = data.address.city || data.address.town || data.address.village
      const stateCode = data.address.state
      
      if (zipCode && cityName && stateCode) {
        // Try to get or create city record
        let city = await getCityFromZipCode(zipCode)
        
        if (!city) {
          const cityData = {
            city_name: cityName,
            state_code: stateCode,
            state_name: stateCode, // This can be extended to get full state name
            zip_codes: [zipCode],
            latitude,
            longitude
          }

          const { data: savedCity } = await supabase
            .from('us_cities')
            .insert(cityData)
            .select()
            .single()

          city = savedCity
        }

        if (city) {
          return {
            zip_code: zipCode,
            city,
            latitude,
            longitude
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch location from external API:', error)
  }
  
  return null
}

/**
 * Validate US zip code format
 */
export function isValidUSZipCode(zipCode: string): boolean {
  // Support 5-digit or 5-digit-4-digit format
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

/**
 * Normalize zip code format (remove part after hyphen)
 */
export function normalizeZipCode(zipCode: string): string {
  return zipCode.split('-')[0]
}

/**
 * Find city by city name and state code
 */
export async function getCityByNameAndState(
  cityName: string, 
  stateCode: string
): Promise<City | null> {
  const { data, error } = await supabase
    .from('us_cities')
    .select('*')
    .ilike('city_name', cityName)
    .eq('state_code', stateCode.toUpperCase())
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Find cities within specified radius
 */
export async function getCitiesInRadius(
  latitude: number,
  longitude: number,
  radiusMiles: number
): Promise<City[]> {
  // Use PostGIS to query cities within specified radius
  const { data, error } = await supabase.rpc('find_cities_in_radius', {
    center_lat: latitude,
    center_lng: longitude,
    radius_miles: radiusMiles
  })

  if (error) {
    console.error('Failed to find cities in radius:', error)
    return []
  }

  return data || []
}