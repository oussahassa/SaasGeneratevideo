-- Migration 005: Add profile_picture and other missing columns to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500),
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);
