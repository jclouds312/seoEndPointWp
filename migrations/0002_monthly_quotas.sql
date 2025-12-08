
-- Add maxContent column to monthly_quotas
ALTER TABLE monthly_quotas 
ADD COLUMN IF NOT EXISTS max_content INTEGER DEFAULT 8 NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_monthly_quotas_user_month 
ON monthly_quotas(user_id, month);
