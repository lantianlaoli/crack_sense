-- Enable the vector extension for AI/Vector functionality
CREATE EXTENSION IF NOT EXISTS vector;

-- Create repair_products table for Amazon product data
CREATE TABLE IF NOT EXISTS repair_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Amazon product data
  asin TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  price DECIMAL(10,2),
  before_price DECIMAL(10,2),
  price_symbol TEXT DEFAULT '$',
  rating DECIMAL(3,1),
  reviews TEXT,
  amazon_prime BOOLEAN DEFAULT false,
  amazon_choice BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  image_url TEXT,
  
  -- Classification fields for intelligent matching
  product_type TEXT CHECK (product_type IN ('spackling_paste', 'patch_kit', 'caulk', 'mesh_tape', 'primer', 'paint', 'tools', 'other')),
  material_type TEXT CHECK (material_type IN ('acrylic', 'vinyl', 'plaster', 'mesh', 'fiberglass', 'compound', 'other')),
  suitable_for_severity TEXT[] DEFAULT '{}' CHECK (suitable_for_severity <@ ARRAY['low', 'moderate', 'high']),
  suitable_for_crack_types TEXT[] DEFAULT '{}' CHECK (suitable_for_crack_types <@ ARRAY['horizontal', 'vertical', 'diagonal', 'stepped', 'random', 'hairline', 'wide']),
  
  -- Vector embedding for semantic search (OpenAI ada-002 = 1536 dimensions)
  embedding vector(1536),
  
  -- Search and recommendation metadata
  search_keywords TEXT[], -- Additional keywords for matching
  application_areas TEXT[], -- e.g., ['drywall', 'plaster', 'wood']
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'professional')) DEFAULT 'beginner',
  coverage_area TEXT, -- e.g., "up to 50 sq ft"
  drying_time TEXT, -- e.g., "30 minutes"
  
  -- Metadata
  original_keyword TEXT DEFAULT 'cracks in wall', -- From Amazon scraping
  position INTEGER, -- Original position in search results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create product_recommendations table to track recommendations
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to analysis or conversation
  analysis_id UUID REFERENCES crack_analyses(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Product recommendation data
  product_id UUID NOT NULL REFERENCES repair_products(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(5,4) NOT NULL CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
  recommendation_reason TEXT NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('analysis_based', 'chat_based', 'follow_up')),
  
  -- User interaction tracking
  viewed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE, -- Could be updated via webhooks later
  
  -- Context that led to recommendation
  user_query TEXT,
  matched_analysis_terms TEXT[], -- Which terms from analysis matched
  vector_similarity_score DECIMAL(5,4), -- If using vector search
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_repair_products_asin ON repair_products(asin);
CREATE INDEX IF NOT EXISTS idx_repair_products_product_type ON repair_products(product_type);
CREATE INDEX IF NOT EXISTS idx_repair_products_price ON repair_products(price);
CREATE INDEX IF NOT EXISTS idx_repair_products_rating ON repair_products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_repair_products_suitable_severity ON repair_products USING GIN(suitable_for_severity);
CREATE INDEX IF NOT EXISTS idx_repair_products_suitable_crack_types ON repair_products USING GIN(suitable_for_crack_types);
CREATE INDEX IF NOT EXISTS idx_repair_products_search_keywords ON repair_products USING GIN(search_keywords);

-- Create vector index for semantic search (using HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_repair_products_embedding ON repair_products 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_product_recommendations_analysis_id ON product_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_conversation_id ON product_recommendations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_user_id ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_product_id ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_score ON product_recommendations(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_created_at ON product_recommendations(created_at DESC);

-- Enable RLS for both tables
ALTER TABLE repair_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for repair_products (public read access)
CREATE POLICY "Anyone can view repair products" ON repair_products 
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Only service role can modify repair products" ON repair_products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RLS policies for product_recommendations (user-specific)
CREATE POLICY "Users can view their own recommendations" ON product_recommendations 
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own recommendations" ON product_recommendations 
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all recommendations" ON product_recommendations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_repair_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_repair_products_updated_at_trigger
  BEFORE UPDATE ON repair_products
  FOR EACH ROW
  EXECUTE FUNCTION update_repair_products_updated_at();