-- Migration to add missing columns to user_subscriptions table
-- Add monthly_limit and updated_at columns

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS monthly_limit INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have updated_at
UPDATE user_subscriptions
SET updated_at = created_at
WHERE updated_at IS NULL;