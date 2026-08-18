-- Migration: Add publicId column and fix login
ALTER TABLE users ADD COLUMN IF NOT EXISTS "publicId" varchar;
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS UQ_users_publicId UNIQUE ("publicId");