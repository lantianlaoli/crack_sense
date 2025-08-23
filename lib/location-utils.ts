/**
 * 位置工具函数 - 处理邮编、城市和地理位置相关操作
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
 * 根据邮编查找城市信息
 */
export async function getCityFromZipCode(zipCode: string): Promise<City | null> {
  const { data, error } = await supabase
    .from('us_cities')
    .select('*')
    .contains('zip_codes', [zipCode])
    .limit(1)

  if (error || !data || data.length === 0) {
    console.log('No city found in database for zipCode:', zipCode, 'Error:', error)
    // 如果数据库中没有找到，尝试从外部API获取
    return await fetchCityFromExternalAPI(zipCode)
  }

  console.log('Found existing city for zipCode:', zipCode, ':', data[0])
  return data[0]
}

/**
 * 根据坐标获取最近的邮编和城市
 */
export async function getZipCodeFromCoordinates(
  latitude: number, 
  longitude: number
): Promise<ZipCodeInfo | null> {
  // 使用PostGIS函数查找最近的城市
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
 * 计算两个坐标点之间的距离（英里）
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959 // 地球半径（英里）
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
 * 从外部API获取城市信息（备用方案）
 */
async function fetchCityFromExternalAPI(zipCode: string): Promise<City | null> {
  try {
    // 使用免费的ZIP Code API
    const response = await fetch(`http://api.zippopotam.us/us/${zipCode}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0]
      
      // 保存到数据库以备将来使用
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
 * 从坐标获取位置信息（备用方案）
 */
async function fetchLocationFromExternalAPI(
  latitude: number, 
  longitude: number
): Promise<ZipCodeInfo | null> {
  try {
    // 使用Nominatim反向地理编码API
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
        // 尝试获取或创建城市记录
        let city = await getCityFromZipCode(zipCode)
        
        if (!city) {
          const cityData = {
            city_name: cityName,
            state_code: stateCode,
            state_name: stateCode, // 这里可以扩展获取完整州名
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
 * 验证美国邮编格式
 */
export function isValidUSZipCode(zipCode: string): boolean {
  // 支持5位数字或5位数字-4位数字格式
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

/**
 * 标准化邮编格式（移除连字符后的部分）
 */
export function normalizeZipCode(zipCode: string): string {
  return zipCode.split('-')[0]
}

/**
 * 根据城市名和州代码查找城市
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
 * 在指定半径内查找城市
 */
export async function getCitiesInRadius(
  latitude: number,
  longitude: number,
  radiusMiles: number
): Promise<City[]> {
  // 使用PostGIS查询指定半径内的城市
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