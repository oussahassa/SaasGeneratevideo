-- Migration: Add translations table

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(100) NOT NULL,
  entity_id INTEGER NOT NULL,
  locale VARCHAR(10) NOT NULL,
  field VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (entity_type, entity_id, locale, field)
);

CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
