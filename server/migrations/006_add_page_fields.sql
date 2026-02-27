-- Migration file to add page-specific fields for Facebook and Instagram
-- Add page_id and page_access_token for Facebook pages and Instagram business accounts

ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS page_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS page_access_token TEXT,
ADD COLUMN IF NOT EXISTS page_name VARCHAR(255);