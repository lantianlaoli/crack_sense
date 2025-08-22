# Procurement Agent Setup Guide

## Overview

The Procurement Agent is an AI-powered product recommendation system that suggests repair materials based on crack analysis results and user conversations.

## Setup Steps

### 1. Database Migration

Run the new migrations to set up the product tables:

```bash
# Apply migrations in Supabase dashboard or CLI
# Files: 007_create_repair_products_with_vectors.sql
#        008_create_product_matching_functions.sql
```

### 2. Enable Vector Extension

In your Supabase SQL editor, ensure the vector extension is enabled:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Import Product Data

Set up environment variables and import Amazon product data:

```bash
# Add to your .env.local:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Import product data
pnpm import-products
```

### 4. Environment Variables

Add these to your `.env.local`:

```bash
# Required for product imports and vector operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For future vector embeddings generation
OPENAI_API_KEY=your_openai_api_key  # For embeddings (future enhancement)
```

## Features

### Analysis-Based Recommendations
- Automatically shows product recommendations for low/moderate severity cracks
- Products are filtered by crack type and severity level
- Displayed in a new "Repair Materials" tab on analysis results

### Chat-Based Recommendations
- AI chat system detects product-related queries
- Automatically suggests 3 top products with prices and ratings
- Includes direct Amazon purchase links

### Vector Search (Future Enhancement)
- Database is set up for vector embeddings
- Can be enhanced with OpenAI embeddings for semantic product search
- Currently uses rule-based and text matching

## API Endpoints

### Product Recommendations
- `POST /api/recommendations` - Get recommendations by analysis ID or query
- `POST /api/recommendations/track` - Track user interactions

### Parameters
- `recommendationType`: 'analysis_based', 'chat_based', or 'diy_focused'
- `analysisId`: For analysis-based recommendations
- `userQuery`: For chat-based recommendations
- `crackSeverity`, `budget`, `preferredSkillLevel`: Optional filters

## Database Schema

### repair_products
- Product catalog with Amazon data
- Classification fields (product_type, suitable_for_severity, etc.)
- Vector field for future semantic search
- Indexes for fast filtering

### product_recommendations
- Tracks all recommendations shown to users
- Records user interactions (views, clicks, purchases)
- Links to analyses and conversations

## Usage in Components

```tsx
import ProductRecommendations from '@/components/ProductRecommendations'

<ProductRecommendations
  analysisId={analysisId}
  crackSeverity="low"
  crackType="horizontal"
/>
```

## Development

### Testing
1. Run analysis on test images
2. Check that product recommendations appear for low/moderate severity results
3. Test chat queries like "what materials should I use for crack repair?"
4. Verify product links and tracking work correctly

### Future Enhancements
1. **Vector Embeddings**: Generate OpenAI embeddings for products and queries
2. **User Profiles**: Track user preferences for better recommendations
3. **Price Tracking**: Monitor price changes and notify users
4. **Affiliate Integration**: Add affiliate tracking codes
5. **Inventory Updates**: Sync with Amazon API for availability

## Monitoring

The system tracks:
- Recommendation views and clicks
- Product purchase conversions (manually trackable)
- Popular products and search queries
- User engagement with recommendations

Check the `product_recommendations` table for analytics data.