/**
 * 初始化美国城市和邮编数据
 * 
 * 从公开数据源导入美国主要城市的信息，为Professional Finder提供地理数据支持
 */

import { createClient } from '../lib/supabase'
import fs from 'fs/promises'
import path from 'path'

interface CityData {
  city_name: string
  state_code: string
  state_name: string
  county_name: string
  zip_codes: string[]
  latitude: number
  longitude: number
  population: number
}

// 美国主要城市数据（简化版，实际使用时应该从完整的数据源导入）
const majorCitiesData: CityData[] = [
  // 加利福尼亚州 - 地震高危地区
  {
    city_name: 'Los Angeles',
    state_code: 'CA',
    state_name: 'California',
    county_name: 'Los Angeles County',
    zip_codes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010'],
    latitude: 34.0522,
    longitude: -118.2437,
    population: 3898747
  },
  {
    city_name: 'San Francisco',
    state_code: 'CA',
    state_name: 'California',
    county_name: 'San Francisco County',
    zip_codes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112'],
    latitude: 37.7749,
    longitude: -122.4194,
    population: 873965
  },
  {
    city_name: 'San Diego',
    state_code: 'CA',
    state_name: 'California',
    county_name: 'San Diego County',
    zip_codes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110'],
    latitude: 32.7157,
    longitude: -117.1611,
    population: 1386932
  },
  
  // 纽约州
  {
    city_name: 'New York',
    state_code: 'NY',
    state_name: 'New York',
    county_name: 'New York County',
    zip_codes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10008', '10009', '10010'],
    latitude: 40.7128,
    longitude: -74.0060,
    population: 8336817
  },
  
  // 德克萨斯州
  {
    city_name: 'Houston',
    state_code: 'TX',
    state_name: 'Texas',
    county_name: 'Harris County',
    zip_codes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010'],
    latitude: 29.7604,
    longitude: -95.3698,
    population: 2320268
  },
  {
    city_name: 'Dallas',
    state_code: 'TX',
    state_name: 'Texas',
    county_name: 'Dallas County',
    zip_codes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210'],
    latitude: 32.7767,
    longitude: -96.7970,
    population: 1343573
  },
  
  // 佛罗里达州
  {
    city_name: 'Miami',
    state_code: 'FL',
    state_name: 'Florida',
    county_name: 'Miami-Dade County',
    zip_codes: ['33101', '33102', '33109', '33111', '33112', '33114', '33116', '33119', '33122', '33124'],
    latitude: 25.7617,
    longitude: -80.1918,
    population: 467963
  },
  
  // 伊利诺伊州
  {
    city_name: 'Chicago',
    state_code: 'IL',
    state_name: 'Illinois',
    county_name: 'Cook County',
    zip_codes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610'],
    latitude: 41.8781,
    longitude: -87.6298,
    population: 2693976
  },
  
  // 亚利桑那州
  {
    city_name: 'Phoenix',
    state_code: 'AZ',
    state_name: 'Arizona',
    county_name: 'Maricopa County',
    zip_codes: ['85001', '85002', '85003', '85004', '85006', '85007', '85008', '85009', '85012', '85013'],
    latitude: 33.4484,
    longitude: -112.0740,
    population: 1608139
  },
  
  // 宾夕法尼亚州
  {
    city_name: 'Philadelphia',
    state_code: 'PA',
    state_name: 'Pennsylvania',
    county_name: 'Philadelphia County',
    zip_codes: ['19101', '19102', '19103', '19104', '19105', '19106', '19107', '19108', '19109', '19110'],
    latitude: 39.9526,
    longitude: -75.1652,
    population: 1584064
  },
  
  // 华盛顿州 - 地震风险地区
  {
    city_name: 'Seattle',
    state_code: 'WA',
    state_name: 'Washington',
    county_name: 'King County',
    zip_codes: ['98101', '98102', '98103', '98104', '98105', '98106', '98107', '98108', '98109', '98110'],
    latitude: 47.6062,
    longitude: -122.3321,
    population: 749256
  },
  
  // 马萨诸塞州
  {
    city_name: 'Boston',
    state_code: 'MA',
    state_name: 'Massachusetts',
    county_name: 'Suffolk County',
    zip_codes: ['02101', '02102', '02103', '02104', '02105', '02106', '02107', '02108', '02109', '02110'],
    latitude: 42.3601,
    longitude: -71.0589,
    population: 692600
  },
  
  // 科罗拉多州
  {
    city_name: 'Denver',
    state_code: 'CO',
    state_name: 'Colorado',
    county_name: 'Denver County',
    zip_codes: ['80201', '80202', '80203', '80204', '80205', '80206', '80207', '80208', '80209', '80210'],
    latitude: 39.7392,
    longitude: -104.9903,
    population: 715522
  },
  
  // 华盛顿特区
  {
    city_name: 'Washington',
    state_code: 'DC',
    state_name: 'District of Columbia',
    county_name: 'District of Columbia',
    zip_codes: ['20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008', '20009', '20010'],
    latitude: 38.9072,
    longitude: -77.0369,
    population: 692683
  },
  
  // 俄勒冈州 - 地震风险地区
  {
    city_name: 'Portland',
    state_code: 'OR',
    state_name: 'Oregon',
    county_name: 'Multnomah County',
    zip_codes: ['97201', '97202', '97203', '97204', '97205', '97206', '97207', '97208', '97209', '97210'],
    latitude: 45.5152,
    longitude: -122.6784,
    population: 652503
  },
  
  // 内华达州 - 地震风险地区
  {
    city_name: 'Las Vegas',
    state_code: 'NV',
    state_name: 'Nevada',
    county_name: 'Clark County',
    zip_codes: ['89101', '89102', '89103', '89104', '89105', '89106', '89107', '89108', '89109', '89110'],
    latitude: 36.1699,
    longitude: -115.1398,
    population: 641903
  }
]

class USCitiesInitializer {
  private supabase = createClient()

  async initializeCities(): Promise<void> {
    console.log('Starting US cities data initialization...')
    
    try {
      // 检查是否已有数据
      const { count } = await this.supabase
        .from('us_cities')
        .select('*', { count: 'exact', head: true })

      if (count && count > 0) {
        console.log(`Database already contains ${count} cities. Skipping initialization.`)
        console.log('If you want to reset the data, please clear the us_cities table first.')
        return
      }

      console.log('Inserting major cities data...')
      
      // 批量插入城市数据
      const { data, error } = await this.supabase
        .from('us_cities')
        .insert(majorCitiesData)
        .select()

      if (error) {
        throw error
      }

      console.log(`✅ Successfully inserted ${data?.length || 0} cities`)

      // 创建地理索引（如果还没有的话）
      await this.createIndexes()

      console.log('🎉 US cities initialization completed successfully!')
      
    } catch (error) {
      console.error('❌ Failed to initialize US cities:', error)
      throw error
    }
  }

  private async createIndexes(): Promise<void> {
    console.log('Creating additional indexes...')
    
    try {
      // 这些索引在migration中已经创建，这里是确保操作
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_us_cities_state_city ON us_cities(state_code, city_name);',
        'CREATE INDEX IF NOT EXISTS idx_us_cities_population ON us_cities(population DESC);'
      ]

      for (const query of indexQueries) {
        await this.supabase.rpc('exec_sql', { sql: query })
      }

      console.log('✅ Indexes created successfully')
    } catch (error) {
      console.error('⚠️ Warning: Failed to create some indexes:', error)
      // 不抛出错误，因为索引创建失败不应该阻止整个初始化过程
    }
  }

  async addMoreCitiesFromFile(filePath: string): Promise<void> {
    console.log(`Loading cities from file: ${filePath}`)
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const citiesData = JSON.parse(fileContent) as CityData[]

      console.log(`Found ${citiesData.length} cities in file`)

      // 批量插入，每次处理100条记录
      const batchSize = 100
      let insertedCount = 0

      for (let i = 0; i < citiesData.length; i += batchSize) {
        const batch = citiesData.slice(i, i + batchSize)
        
        const { data, error } = await this.supabase
          .from('us_cities')
          .insert(batch)
          .select('id')

        if (error) {
          console.error(`Error inserting batch ${i}-${i + batch.length}:`, error)
          continue
        }

        insertedCount += data?.length || 0
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(citiesData.length / batchSize)}`)
      }

      console.log(`✅ Successfully inserted ${insertedCount} cities from file`)
      
    } catch (error) {
      console.error('❌ Failed to load cities from file:', error)
      throw error
    }
  }

  async generateCitiesFile(): Promise<void> {
    const outputPath = path.join(__dirname, '../data/sample-cities.json')
    
    console.log('Generating sample cities file...')
    
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, JSON.stringify(majorCitiesData, null, 2))
      
      console.log(`✅ Sample cities file generated: ${outputPath}`)
      console.log('You can expand this file with more cities and use addMoreCitiesFromFile() to import them.')
      
    } catch (error) {
      console.error('❌ Failed to generate cities file:', error)
      throw error
    }
  }

  async validateData(): Promise<void> {
    console.log('Validating cities data...')
    
    try {
      const { data: cities, error } = await this.supabase
        .from('us_cities')
        .select('*')
        .limit(10)

      if (error) {
        throw error
      }

      console.log('Sample cities data:')
      cities?.forEach(city => {
        console.log(`- ${city.city_name}, ${city.state_code} (${city.zip_codes?.length || 0} zip codes)`)
      })

      // 检查地理坐标
      const { count: coordCount } = await this.supabase
        .from('us_cities')
        .select('*', { count: 'exact', head: true })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      console.log(`✅ ${coordCount} cities have geographic coordinates`)

      // 检查邮编数据
      const { count: zipCount } = await this.supabase
        .from('us_cities')
        .select('*', { count: 'exact', head: true })
        .not('zip_codes', 'is', null)

      console.log(`✅ ${zipCount} cities have zip code data`)
      
    } catch (error) {
      console.error('❌ Data validation failed:', error)
      throw error
    }
  }
}

// 主执行函数
async function main() {
  const initializer = new USCitiesInitializer()
  
  try {
    console.log('🚀 Starting US Cities Data Initialization')
    console.log('=====================================')
    
    await initializer.initializeCities()
    await initializer.generateCitiesFile()
    await initializer.validateData()
    
    console.log('\n🎉 All initialization tasks completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run the Thumbtack scraper to populate professional data')
    console.log('2. Test the Professional Finder API endpoints')
    console.log('3. Add more cities data if needed')
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export default USCitiesInitializer