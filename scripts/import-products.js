#!/usr/bin/env node

/**
 * Script to import Amazon product data into Supabase repair_products table
 * Usage: node scripts/import-products.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Please add these to your .env.local file')
  process.exit(1)
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Product type classification based on title keywords
function classifyProduct(title) {
  const titleLower = title.toLowerCase()
  
  let productType = 'other'
  let materialType = 'other'
  let skillLevel = 'beginner'
  
  // Product type classification
  if (titleLower.includes('spackle') || titleLower.includes('spackling')) {
    productType = 'spackling_paste'
    materialType = 'compound'
  } else if (titleLower.includes('patch') && titleLower.includes('kit')) {
    productType = 'patch_kit'
    materialType = 'compound'
  } else if (titleLower.includes('caulk') || titleLower.includes('sealant')) {
    productType = 'caulk'
    materialType = 'acrylic'
  } else if (titleLower.includes('mesh') || titleLower.includes('tape')) {
    productType = 'mesh_tape'
    materialType = 'mesh'
  } else if (titleLower.includes('putty') || titleLower.includes('filler')) {
    productType = 'spackling_paste'
    materialType = 'compound'
  } else if (titleLower.includes('primer')) {
    productType = 'primer'
    materialType = 'acrylic'
  } else if (titleLower.includes('paint')) {
    productType = 'paint'
    materialType = 'acrylic'
  } else if (titleLower.includes('scraper') || titleLower.includes('tool')) {
    productType = 'tools'
    materialType = 'other'
  }
  
  // Material type refinement
  if (titleLower.includes('acrylic')) materialType = 'acrylic'
  else if (titleLower.includes('vinyl')) materialType = 'vinyl'
  else if (titleLower.includes('plaster')) materialType = 'plaster'
  else if (titleLower.includes('fiberglass')) materialType = 'fiberglass'
  
  // Skill level determination
  if (titleLower.includes('professional') || titleLower.includes('contractor') || 
      titleLower.includes('commercial')) {
    skillLevel = 'professional'
  } else if (titleLower.includes('diy') || titleLower.includes('easy') || 
             titleLower.includes('quick') || titleLower.includes('simple')) {
    skillLevel = 'beginner'
  } else if (titleLower.includes('heavy duty') || titleLower.includes('industrial')) {
    skillLevel = 'intermediate'
  }
  
  return { productType, materialType, skillLevel }
}

// Determine suitable severity levels based on product characteristics
function determineSuitability(title, productType, price) {
  const titleLower = title.toLowerCase()
  let suitableForSeverity = []
  let suitableForCrackTypes = []
  
  // Severity suitability
  if (productType === 'spackling_paste' || productType === 'patch_kit') {
    if (titleLower.includes('hairline') || titleLower.includes('small') || 
        titleLower.includes('minor') || price < 15) {
      suitableForSeverity = ['low']
    } else if (titleLower.includes('heavy') || titleLower.includes('large') || 
               titleLower.includes('deep') || price > 25) {
      suitableForSeverity = ['moderate', 'high']
    } else {
      suitableForSeverity = ['low', 'moderate']
    }
  } else if (productType === 'caulk') {
    suitableForSeverity = ['low', 'moderate']
  } else if (productType === 'mesh_tape') {
    suitableForSeverity = ['moderate', 'high']
  } else {
    suitableForSeverity = ['low', 'moderate']
  }
  
  // Crack type suitability
  if (titleLower.includes('hairline') || titleLower.includes('fine')) {
    suitableForCrackTypes = ['hairline']
  } else if (titleLower.includes('wide') || titleLower.includes('large')) {
    suitableForCrackTypes = ['wide', 'stepped']
  } else if (productType === 'mesh_tape') {
    suitableForCrackTypes = ['horizontal', 'vertical', 'stepped']
  } else if (productType === 'caulk') {
    suitableForCrackTypes = ['hairline', 'horizontal', 'vertical']
  } else {
    suitableForCrackTypes = ['horizontal', 'vertical', 'diagonal', 'random']
  }
  
  return { suitableForSeverity, suitableForCrackTypes }
}

// Extract application areas from title
function extractApplicationAreas(title) {
  const titleLower = title.toLowerCase()
  const areas = []
  
  if (titleLower.includes('drywall')) areas.push('drywall')
  if (titleLower.includes('plaster')) areas.push('plaster')
  if (titleLower.includes('wood')) areas.push('wood')
  if (titleLower.includes('concrete')) areas.push('concrete')
  if (titleLower.includes('wall')) areas.push('wall')
  if (titleLower.includes('ceiling')) areas.push('ceiling')
  
  return areas.length > 0 ? areas : ['wall']
}

// Extract drying time from title
function extractDryingTime(title) {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('15 min')) return '15 minutes'
  if (titleLower.includes('30 min')) return '30 minutes'
  if (titleLower.includes('1 hour')) return '1 hour'
  if (titleLower.includes('quick dry') || titleLower.includes('fast dry')) return '30 minutes'
  if (titleLower.includes('instant')) return '15 minutes'
  
  return null
}

// Generate search keywords from title
function generateSearchKeywords(title, productType) {
  const titleLower = title.toLowerCase()
  const keywords = []
  
  // Extract key terms
  const keyTerms = titleLower.match(/\b(crack|hole|repair|fix|fill|patch|spackle|putty|drywall|wall|quick|easy|diy)\b/g)
  if (keyTerms) keywords.push(...keyTerms)
  
  // Add product type related keywords
  if (productType === 'spackling_paste') {
    keywords.push('spackle', 'spackling', 'paste', 'compound')
  } else if (productType === 'patch_kit') {
    keywords.push('patch', 'kit', 'repair kit')
  } else if (productType === 'caulk') {
    keywords.push('caulk', 'sealant', 'flexible')
  }
  
  // Remove duplicates and return
  return [...new Set(keywords)]
}

async function importProducts() {
  try {
    console.log('🔄 Starting product import...')
    
    // Read Amazon data
    const amazonDataPath = join(__dirname, '..', 'Amazon_data.json')
    const rawData = readFileSync(amazonDataPath, 'utf-8')
    const amazonProducts = JSON.parse(rawData)
    
    console.log(`📦 Found ${amazonProducts.length} products in Amazon data`)
    
    // Transform products for database
    const productsToInsert = amazonProducts.map((product, index) => {
      const { productType, materialType, skillLevel } = classifyProduct(product.title)
      const { suitableForSeverity, suitableForCrackTypes } = determineSuitability(
        product.title, 
        productType, 
        parseFloat(product.price) || 0
      )
      
      return {
        asin: product.asin,
        title: product.title,
        url: product.url,
        price: product.price ? parseFloat(product.price) : null,
        before_price: product.beforePrice ? parseFloat(product.beforePrice) : null,
        price_symbol: product.priceSymbol || '$',
        rating: product.rating ? parseFloat(product.rating) : null,
        reviews: product.reviews || null,
        amazon_prime: product.amazonPrime === 'true' || product.amazonPrime === true,
        amazon_choice: product.amazonChoice === 'true' || product.amazonChoice === true,
        best_seller: product.bestSeller === 'true' || product.bestSeller === true,
        image_url: product.image,
        product_type: productType,
        material_type: materialType,
        suitable_for_severity: suitableForSeverity,
        suitable_for_crack_types: suitableForCrackTypes,
        search_keywords: generateSearchKeywords(product.title, productType),
        application_areas: extractApplicationAreas(product.title),
        skill_level: skillLevel,
        drying_time: extractDryingTime(product.title),
        original_keyword: product.keyword || 'cracks in wall',
        position: product.position || index + 1
      }
    })
    
    console.log('🔄 Inserting products into database...')
    
    // Clear existing products (optional)
    const { error: deleteError } = await supabase
      .from('repair_products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.warn('⚠️ Warning: Could not clear existing products:', deleteError.message)
    }
    
    // Insert products in batches to avoid timeout
    const batchSize = 50
    let insertedCount = 0
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('repair_products')
        .insert(batch)
        .select('id')
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
        // Continue with next batch
        continue
      }
      
      insertedCount += data.length
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${data.length} products)`)
    }
    
    console.log(`🎉 Successfully imported ${insertedCount} products`)
    
    // Show summary statistics
    const { data: stats } = await supabase
      .from('repair_products')
      .select('product_type')
    
    if (stats) {
      const typeCount = stats.reduce((acc, product) => {
        acc[product.product_type] = (acc[product.product_type] || 0) + 1
        return acc
      }, {})
      
      console.log('\\n📊 Import Summary:')
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} products`)
      })
    }
    
    console.log('\\n✨ Import completed successfully!')
    console.log('\\n💡 Next steps:')
    console.log('   1. Run your application to test product recommendations')
    console.log('   2. Optionally generate embeddings for vector search')
    console.log('   3. Test the recommendation API endpoints')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importProducts()