-- Create credit transactions table for tracking all credit changes
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduct', 'add', 'refund', 'initial')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  related_analysis_id UUID REFERENCES crack_analyses(id),
  related_conversation_id UUID REFERENCES conversations(id),
  pdf_export_id UUID,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create PDF exports table for tracking exports and preventing duplicate charges
CREATE TABLE IF NOT EXISTS pdf_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  analysis_id UUID NOT NULL REFERENCES crack_analyses(id),
  model_used TEXT NOT NULL,
  credits_charged INTEGER NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, analysis_id) -- Prevent duplicate exports per analysis
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_analysis_id ON credit_transactions(related_analysis_id);

CREATE INDEX IF NOT EXISTS idx_pdf_exports_user_id ON pdf_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_analysis_id ON pdf_exports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_exported_at ON pdf_exports(exported_at DESC);

-- Add foreign key constraint for pdf_export_id in credit_transactions
ALTER TABLE credit_transactions 
ADD CONSTRAINT fk_credit_transactions_pdf_export_id 
FOREIGN KEY (pdf_export_id) REFERENCES pdf_exports(id);

-- Add RLS (Row Level Security) policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_exports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own credit transactions
CREATE POLICY "Users can view own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Users can only see their own PDF exports  
CREATE POLICY "Users can view own PDF exports" ON pdf_exports
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Service role can insert/update credit transactions
CREATE POLICY "Service role can manage credit transactions" ON credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Service role can insert/update PDF exports
CREATE POLICY "Service role can manage PDF exports" ON pdf_exports
  FOR ALL USING (auth.role() = 'service_role');