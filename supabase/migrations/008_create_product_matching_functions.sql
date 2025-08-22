-- Function to match products using vector similarity search
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_severity text[] DEFAULT NULL,
  filter_crack_types text[] DEFAULT NULL,
  filter_product_types text[] DEFAULT NULL,
  max_price decimal DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  asin text,
  title text,
  url text,
  price decimal,
  rating decimal,
  image_url text,
  product_type text,
  material_type text,
  suitable_for_severity text[],
  suitable_for_crack_types text[],
  skill_level text,
  coverage_area text,
  drying_time text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rp.id,
    rp.asin,
    rp.title,
    rp.url,
    rp.price,
    rp.rating,
    rp.image_url,
    rp.product_type,
    rp.material_type,
    rp.suitable_for_severity,
    rp.suitable_for_crack_types,
    rp.skill_level,
    rp.coverage_area,
    rp.drying_time,
    (rp.embedding <=> query_embedding) * -1 + 1 as similarity
  FROM repair_products rp
  WHERE rp.embedding IS NOT NULL
    AND (rp.embedding <=> query_embedding) < (1 - match_threshold)
    -- Filter by severity if specified
    AND (filter_severity IS NULL OR rp.suitable_for_severity && filter_severity)
    -- Filter by crack types if specified  
    AND (filter_crack_types IS NULL OR rp.suitable_for_crack_types && filter_crack_types)
    -- Filter by product types if specified
    AND (filter_product_types IS NULL OR rp.product_type = ANY(filter_product_types))
    -- Filter by price if specified
    AND (max_price IS NULL OR rp.price IS NULL OR rp.price <= max_price)
  ORDER BY rp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get product recommendations based on analysis
CREATE OR REPLACE FUNCTION get_analysis_product_recommendations(
  analysis_id_param uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  product_id uuid,
  asin text,
  title text,
  url text,
  price decimal,
  rating decimal,
  image_url text,
  product_type text,
  recommendation_reason text,
  similarity_score float
)
LANGUAGE plpgsql
AS $$
DECLARE
  analysis_record crack_analyses%ROWTYPE;
  search_text text;
  query_embedding vector(1536);
BEGIN
  -- Get the analysis record
  SELECT * INTO analysis_record 
  FROM crack_analyses 
  WHERE id = analysis_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Build search text from analysis
  search_text := COALESCE(analysis_record.personalized_analysis, '') || ' ' ||
                 COALESCE(analysis_record.user_question, '') || ' ' ||
                 analysis_record.crack_cause_category || ' ' ||
                 analysis_record.crack_type || ' ' ||
                 analysis_record.crack_severity || ' crack repair material';
  
  -- For now, return rule-based recommendations
  -- In production, you would generate embeddings from search_text using OpenAI API
  RETURN QUERY
  SELECT
    rp.id as product_id,
    rp.asin,
    rp.title,
    rp.url,
    rp.price,
    rp.rating,
    rp.image_url,
    rp.product_type,
    CASE 
      WHEN analysis_record.crack_severity = 'low' THEN 'Recommended for low-risk DIY crack repair'
      WHEN analysis_record.crack_severity = 'moderate' THEN 'Suitable for moderate crack repair tasks'
      ELSE 'Professional-grade material for serious repairs'
    END as recommendation_reason,
    0.85 as similarity_score
  FROM repair_products rp
  WHERE 
    -- Match severity level
    (analysis_record.crack_severity = ANY(rp.suitable_for_severity) OR rp.suitable_for_severity = '{}')
    -- Match crack type if available
    AND (analysis_record.crack_type = ANY(rp.suitable_for_crack_types) OR rp.suitable_for_crack_types = '{}')
    -- For low/moderate severity, prefer beginner/intermediate products
    AND (analysis_record.crack_severity IN ('low', 'moderate') AND rp.skill_level IN ('beginner', 'intermediate')
         OR analysis_record.crack_severity = 'high')
  ORDER BY 
    rp.rating DESC NULLS LAST,
    rp.price ASC NULLS LAST
  LIMIT match_count;
END;
$$;

-- Function to search products by text query (for chat-based recommendations)
CREATE OR REPLACE FUNCTION search_products_by_text(
  search_query text,
  match_count int DEFAULT 10,
  min_rating decimal DEFAULT 3.0
)
RETURNS TABLE (
  id uuid,
  asin text,
  title text,
  url text,
  price decimal,
  rating decimal,
  image_url text,
  product_type text,
  material_type text,
  skill_level text,
  search_rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rp.id,
    rp.asin,
    rp.title,
    rp.url,
    rp.price,
    rp.rating,
    rp.image_url,
    rp.product_type,
    rp.material_type,
    rp.skill_level,
    -- Simple text matching score (can be enhanced with full-text search)
    CASE 
      WHEN rp.title ILIKE '%' || search_query || '%' THEN 1.0
      WHEN rp.search_keywords && string_to_array(lower(search_query), ' ') THEN 0.8
      ELSE 0.5
    END as search_rank
  FROM repair_products rp
  WHERE 
    -- Text search in title or keywords
    (rp.title ILIKE '%' || search_query || '%' 
     OR rp.search_keywords && string_to_array(lower(search_query), ' '))
    -- Filter by minimum rating if specified
    AND (rp.rating IS NULL OR rp.rating >= min_rating)
  ORDER BY 
    search_rank DESC,
    rp.rating DESC NULLS LAST,
    rp.price ASC NULLS LAST
  LIMIT match_count;
END;
$$;

-- Function to track product recommendation views/clicks
CREATE OR REPLACE FUNCTION track_recommendation_interaction(
  recommendation_id_param uuid,
  interaction_type text -- 'view', 'click', 'purchase'
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_recommendations 
  SET 
    viewed_at = CASE WHEN interaction_type = 'view' THEN CURRENT_TIMESTAMP ELSE viewed_at END,
    clicked_at = CASE WHEN interaction_type = 'click' THEN CURRENT_TIMESTAMP ELSE clicked_at END,
    purchased_at = CASE WHEN interaction_type = 'purchase' THEN CURRENT_TIMESTAMP ELSE purchased_at END
  WHERE id = recommendation_id_param;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION match_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_analysis_product_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION search_products_by_text TO authenticated;
GRANT EXECUTE ON FUNCTION track_recommendation_interaction TO authenticated;