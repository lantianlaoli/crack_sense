/**
 * Thumbtack专业人员数据爬取脚本
 * 
 * 使用Playwright自动化爬取全美国城市的结构工程师数据
 * 策略：按州按城市系统性爬取，避免重复和遗漏
 */

import { chromium, Browser, Page } from 'playwright'
import { createClient } from '../lib/supabase'
import fs from 'fs/promises'
import path from 'path'

interface ScrapeTarget {
  state: string
  city: string
  zipCode: string
  priority: number // 1=高危地区(地震带等), 2=大城市, 3=普通城市
}

interface ScrapedProfessional {
  thumbtack_id?: string
  company_name: string
  rating?: number
  review_count?: number
  hire_count?: number
  is_top_pro?: boolean
  is_licensed?: boolean
  response_time_minutes?: number
  estimate_fee_amount?: number
  estimate_fee_waived_if_hired?: boolean
  description?: string
  phone?: string
  email?: string
  website_url?: string
  service_areas?: string[]
  years_in_business?: number
  employee_count?: number
  services?: Array<{
    service_name: string
    project_types: string[]
    property_types: string[]
  }>
  credentials?: Array<{
    credential_type: string
    credential_name: string
    license_number?: string
    states_valid?: string[]
  }>
  reviews?: Array<{
    reviewer_name: string
    rating: number
    review_text: string
    review_date: string
    project_details?: string
    professional_reply?: string
  }>
}

class ThumbTackScraper {
  private browser!: Browser
  private page!: Page
  private supabase = createClient()
  private scrapedCount = 0
  private errorCount = 0
  private logFile = ''

  constructor() {
    this.logFile = path.join(__dirname, `../logs/scrape-${Date.now()}.log`)
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    
    // 设置用户代理和其他反检测措施
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    await this.page.setViewportSize({ width: 1920, height: 1080 })
    
    // 创建日志目录
    await fs.mkdir(path.dirname(this.logFile), { recursive: true })
    await this.log('Scraper initialized')
  }

  async scrapeAllCities(): Promise<void> {
    const targets = await this.getScrapeTargets()
    
    await this.log(`Starting to scrape ${targets.length} cities`)
    
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      await this.log(`Processing ${target.city}, ${target.state} (${i + 1}/${targets.length})`)
      
      try {
        await this.scrapeCityProfessionals(target)
        
        // 随机延迟避免被检测
        const delay = 2000 + Math.random() * 3000
        await this.page.waitForTimeout(delay)
        
      } catch (error) {
        this.errorCount++
        await this.log(`Error scraping ${target.city}, ${target.state}: ${error}`)
        
        // 如果连续错误太多，停止爬取
        if (this.errorCount > 10) {
          await this.log('Too many errors, stopping scraper')
          break
        }
      }
      
      // 每爬取50个城市保存一次进度
      if ((i + 1) % 50 === 0) {
        await this.saveProgress(i + 1)
      }
    }
    
    await this.log(`Scraping completed. Total scraped: ${this.scrapedCount}, Errors: ${this.errorCount}`)
  }

  private async scrapeCityProfessionals(target: ScrapeTarget): Promise<void> {
    const searchUrl = `https://www.thumbtack.com/instant-results/?keyword_pk=102906937152990059&zip_code=${target.zipCode}`
    
    await this.page.goto(searchUrl, { waitUntil: 'networkidle' })
    
    // 等待结果加载
    await this.page.waitForSelector('[data-testid="pro-card"]', { timeout: 10000 }).catch(() => {
      throw new Error('No professionals found or page failed to load')
    })
    
    // 关闭任何弹窗
    await this.dismissPopups()
    
    // 获取专业人员列表
    const professionalElements = await this.page.$$('[data-testid="pro-card"]')
    
    for (const element of professionalElements) {
      try {
        const professional = await this.extractProfessionalBasicInfo(element)
        
        if (professional) {
          // 点击查看详细信息
          const detailsButton = await element.$('button:has-text("View profile")')
          if (detailsButton) {
            await detailsButton.click()
            await this.page.waitForLoadState('networkidle')
            
            // 提取详细信息
            const detailedInfo = await this.extractProfessionalDetailedInfo()
            
            // 合并信息
            const completeProfessional = { ...professional, ...detailedInfo }
            
            // 保存到数据库
            await this.saveProfessional(completeProfessional, target)
            
            // 返回列表页
            await this.page.goBack()
            await this.page.waitForLoadState('networkidle')
          }
        }
      } catch (error) {
        await this.log(`Error processing professional: ${error}`)
      }
    }
  }

  private async extractProfessionalBasicInfo(element: any): Promise<Partial<ScrapedProfessional> | null> {
    try {
      const company_name = await element.$eval('h3, h2', (el: any) => el.textContent?.trim())
      if (!company_name) return null

      const rating = await element.$eval('[data-testid="rating"]', (el: any) => {
        const text = el.textContent || ''
        const match = text.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : null
      }).catch(() => null)

      const review_count = await element.$eval('[data-testid="review-count"]', (el: any) => {
        const text = el.textContent || ''
        const match = text.match(/\((\d+)\)/)
        return match ? parseInt(match[1]) : null
      }).catch(() => null)

      const is_top_pro = await element.$('text="Top Pro"').then(() => true).catch(() => false)
      const is_licensed = await element.$('text="Licensed"').then(() => true).catch(() => false)

      const response_time_text = await element.$eval('[data-testid="response-time"]', (el: any) => 
        el.textContent?.trim()
      ).catch(() => null)

      let response_time_minutes = null
      if (response_time_text) {
        if (response_time_text.includes('min')) {
          const match = response_time_text.match(/(\d+)\s*min/)
          response_time_minutes = match ? parseInt(match[1]) : null
        } else if (response_time_text.includes('hour')) {
          const match = response_time_text.match(/(\d+)\s*hour/)
          response_time_minutes = match ? parseInt(match[1]) * 60 : null
        } else if (response_time_text.includes('day')) {
          const match = response_time_text.match(/(\d+)\s*day/)
          response_time_minutes = match ? parseInt(match[1]) * 24 * 60 : null
        }
      }

      return {
        company_name,
        rating,
        review_count,
        is_top_pro,
        is_licensed,
        response_time_minutes
      }
    } catch (error) {
      await this.log(`Error extracting basic info: ${error}`)
      return null
    }
  }

  private async extractProfessionalDetailedInfo(): Promise<Partial<ScrapedProfessional>> {
    const details: Partial<ScrapedProfessional> = {}

    try {
      // 提取描述
      details.description = await this.page.$eval('[data-testid="about-section"]', el => 
        el.textContent?.trim()
      ).catch(() => undefined)

      // 提取业务信息
      const businessInfo = await this.page.$$eval('[data-testid="business-info"] li', elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => [])

      for (const info of businessInfo) {
        if (info.includes('years in business')) {
          const match = info.match(/(\d+)\s*years/)
          if (match) details.years_in_business = parseInt(match[1])
        }
        if (info.includes('employees')) {
          const match = info.match(/(\d+)\s*employees/)
          if (match) details.employee_count = parseInt(match[1])
        }
        if (info.includes('hires on Thumbtack')) {
          const match = info.match(/(\d+)\s*hires/)
          if (match) details.hire_count = parseInt(match[1])
        }
      }

      // 提取定价信息
      const pricingText = await this.page.$eval('[data-testid="pricing"]', el => 
        el.textContent?.trim()
      ).catch(() => null)

      if (pricingText) {
        const feeMatch = pricingText.match(/\$(\d+)/)
        if (feeMatch) {
          details.estimate_fee_amount = parseFloat(feeMatch[1])
          details.estimate_fee_waived_if_hired = pricingText.includes('waived if hired')
        }
      }

      // 提取服务信息
      details.services = await this.extractServices()

      // 提取证书信息
      details.credentials = await this.extractCredentials()

      // 提取评价
      details.reviews = await this.extractReviews()

    } catch (error) {
      await this.log(`Error extracting detailed info: ${error}`)
    }

    return details
  }

  private async extractServices(): Promise<any[]> {
    try {
      const services = []
      
      // 提取项目类型
      const projectTypes = await this.page.$$eval('[data-testid="project-types"] li', elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => [])

      // 提取服务需求
      const serviceNeeds = await this.page.$$eval('[data-testid="service-needs"] li', elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => [])

      // 提取物业类型
      const propertyTypes = await this.page.$$eval('[data-testid="property-types"] li', elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => [])

      if (serviceNeeds.length > 0) {
        services.push({
          service_name: 'Structural Engineering',
          project_types: projectTypes,
          property_types: propertyTypes
        })
      }

      return services
    } catch (error) {
      return []
    }
  }

  private async extractCredentials(): Promise<any[]> {
    try {
      const credentials = []
      
      const credentialElements = await this.page.$$('[data-testid="credentials"] [data-testid="credential-item"]')
      
      for (const element of credentialElements) {
        const credentialType = await element.$eval('[data-testid="credential-type"]', el => 
          el.textContent?.trim()
        ).catch(() => '')

        const credentialName = await element.$eval('[data-testid="credential-name"]', el => 
          el.textContent?.trim()
        ).catch(() => '')

        const licenseNumber = await element.$eval('[data-testid="license-number"]', el => 
          el.textContent?.trim()
        ).catch(() => undefined)

        if (credentialType && credentialName) {
          credentials.push({
            credential_type: credentialType,
            credential_name: credentialName,
            license_number: licenseNumber
          })
        }
      }

      return credentials
    } catch (error) {
      return []
    }
  }

  private async extractReviews(): Promise<any[]> {
    try {
      const reviews = []
      const reviewElements = await this.page.$$('[data-testid="review-item"]').catch(() => [])
      
      // 只提取前5个评价
      for (let i = 0; i < Math.min(reviewElements.length, 5); i++) {
        const element = reviewElements[i]
        
        const reviewer_name = await element.$eval('[data-testid="reviewer-name"]', el => 
          el.textContent?.trim()
        ).catch(() => '')

        const rating = await element.$eval('[data-testid="review-rating"]', (el: any) => {
          const stars = el.querySelectorAll('[data-testid="star-filled"]').length
          return stars || 5
        }).catch(() => 5)

        const review_text = await element.$eval('[data-testid="review-text"]', el => 
          el.textContent?.trim()
        ).catch(() => '')

        const review_date = await element.$eval('[data-testid="review-date"]', el => 
          el.textContent?.trim()
        ).catch(() => '')

        if (reviewer_name && review_text) {
          reviews.push({
            reviewer_name,
            rating,
            review_text,
            review_date
          })
        }
      }

      return reviews
    } catch (error) {
      return []
    }
  }

  private async dismissPopups(): Promise<void> {
    try {
      // 常见的弹窗关闭按钮
      const popupSelectors = [
        'button:has-text("Exit")',
        'button:has-text("Close")',
        'button:has-text("×")',
        '[data-testid="modal-close"]',
        '[aria-label="Close"]'
      ]

      for (const selector of popupSelectors) {
        const button = await this.page.$(selector)
        if (button) {
          await button.click()
          await this.page.waitForTimeout(1000)
        }
      }
    } catch (error) {
      // 忽略弹窗关闭错误
    }
  }

  private async saveProfessional(professional: ScrapedProfessional, target: ScrapeTarget): Promise<void> {
    try {
      // 首先获取或创建城市记录
      const { data: city } = await this.supabase
        .from('us_cities')
        .select('id')
        .contains('zip_codes', [target.zipCode])
        .single()

      if (!city) {
        await this.log(`City not found for zip code: ${target.zipCode}`)
        return
      }

      // 检查是否已存在
      const { data: existing } = await this.supabase
        .from('professionals')
        .select('id')
        .eq('company_name', professional.company_name)
        .eq('primary_city_id', city.id)
        .single()

      if (existing) {
        await this.log(`Professional already exists: ${professional.company_name}`)
        return
      }

      // 插入专业人员记录
      const { data: insertedPro, error } = await this.supabase
        .from('professionals')
        .insert({
          company_name: professional.company_name,
          rating: professional.rating,
          review_count: professional.review_count || 0,
          hire_count: professional.hire_count || 0,
          is_top_pro: professional.is_top_pro || false,
          is_licensed: professional.is_licensed || false,
          response_time_minutes: professional.response_time_minutes,
          estimate_fee_amount: professional.estimate_fee_amount,
          estimate_fee_waived_if_hired: professional.estimate_fee_waived_if_hired || false,
          description: professional.description,
          years_in_business: professional.years_in_business,
          employee_count: professional.employee_count,
          primary_city_id: city.id,
          last_scraped_at: new Date().toISOString(),
          data_source: 'thumbtack'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // 插入关联的服务、证书、评价等
      if (insertedPro && professional.services) {
        await this.saveServices(insertedPro.id, professional.services)
      }

      if (insertedPro && professional.credentials) {
        await this.saveCredentials(insertedPro.id, professional.credentials)
      }

      if (insertedPro && professional.reviews) {
        await this.saveReviews(insertedPro.id, professional.reviews)
      }

      this.scrapedCount++
      await this.log(`Saved professional: ${professional.company_name}`)

    } catch (error) {
      await this.log(`Error saving professional: ${error}`)
      throw error
    }
  }

  private async saveServices(professionalId: number, services: any[]): Promise<void> {
    // 实现服务保存逻辑
  }

  private async saveCredentials(professionalId: number, credentials: any[]): Promise<void> {
    if (credentials.length === 0) return

    const credentialRecords = credentials.map(cred => ({
      professional_id: professionalId,
      credential_type: cred.credential_type,
      credential_name: cred.credential_name,
      license_number: cred.license_number
    }))

    await this.supabase
      .from('professional_credentials')
      .insert(credentialRecords)
  }

  private async saveReviews(professionalId: number, reviews: any[]): Promise<void> {
    if (reviews.length === 0) return

    const reviewRecords = reviews.map(review => ({
      professional_id: professionalId,
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date
    }))

    await this.supabase
      .from('professional_reviews')
      .insert(reviewRecords)
  }

  private async getScrapeTargets(): Promise<ScrapeTarget[]> {
    // 从数据库获取美国主要城市和邮编
    const { data: cities } = await this.supabase
      .from('us_cities')
      .select('city_name, state_code, zip_codes')
      .not('zip_codes', 'is', null)
      .order('population', { ascending: false })
      .limit(1000) // 先爬取前1000个城市

    if (!cities) return []

    return cities.flatMap(city => 
      city.zip_codes.slice(0, 1).map((zipCode: string) => ({
        state: city.state_code,
        city: city.city_name,
        zipCode,
        priority: this.getCityPriority(city.city_name, city.state_code)
      }))
    ).sort((a, b) => a.priority - b.priority)
  }

  private getCityPriority(city: string, state: string): number {
    // 高危地区（地震带）
    const highRiskStates = ['CA', 'AK', 'NV', 'HI', 'WA', 'OR']
    if (highRiskStates.includes(state)) return 1

    // 大城市
    const majorCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']
    if (majorCities.includes(city)) return 2

    return 3
  }

  private async log(message: string): Promise<void> {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    
    console.log(message)
    await fs.appendFile(this.logFile, logMessage)
  }

  private async saveProgress(processedCount: number): Promise<void> {
    const progress = {
      processed_count: processedCount,
      scraped_count: this.scrapedCount,
      error_count: this.errorCount,
      last_updated: new Date().toISOString()
    }

    await fs.writeFile(
      path.join(__dirname, '../logs/scrape-progress.json'),
      JSON.stringify(progress, null, 2)
    )
  }

  async close(): Promise<void> {
    await this.browser?.close()
  }
}

// 主执行函数
async function main() {
  const scraper = new ThumbTackScraper()
  
  try {
    await scraper.init()
    await scraper.scrapeAllCities()
  } catch (error) {
    console.error('Scraping failed:', error)
  } finally {
    await scraper.close()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error)
}

export default ThumbTackScraper