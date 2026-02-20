import sql from '../configs/db.js'
import axios from 'axios'
import { getCache, setCache } from '../middlewares/cache.js'

// Basic translator function - uses external provider if available
async function translateText(text, from, to) {
  // Try to use provider defined in env
  const providerUrl = process.env.TRANSLATION_API_URL
  const apiKey = process.env.TRANSLATION_API_KEY
  if (providerUrl && apiKey) {
    try {
      const cacheKey = `trans:${from}:${to}:${text}`
      const cached = getCache(cacheKey)
      if (cached) return cached
      const resp = await axios.post(providerUrl, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        data: { q: text, source: from, target: to }
      })
      const data = resp.data      
      const result = data?.translatedText || data?.translations?.[0]?.text || text
      try { setCache(cacheKey, result, 60 * 60) } catch (e) {}
      return result
    } catch (e) {
      return text
    }
  }
  // Fallback: return original text (no-op) - admin should be warned
  return text
}

export const translateAndSave = async (req, res) => {
  try {
    const { entityType, entityId, sourceLocale = 'fr', fields = {} } = req.body
    if (!entityType || !entityId || !fields || Object.keys(fields).length === 0) {
      return res.status(400).json({ success: false, message: 'Missing parameters' })
    }

    const targetLocales = ['en', 'ar']

    const saved = []
    for (const [field, value] of Object.entries(fields)) {
      // Insert source locale as well
      await sql`
        INSERT INTO translations (entity_type, entity_id, locale, field, content)
        VALUES (${entityType}, ${entityId}, ${sourceLocale}, ${field}, ${value})
        ON CONFLICT (entity_type, entity_id, locale, field)
        DO UPDATE SET content = EXCLUDED.content
      `

      for (const loc of targetLocales) {
        const translated = await translateText(value, sourceLocale, loc)
        await sql`
          INSERT INTO translations (entity_type, entity_id, locale, field, content)
          VALUES (${entityType}, ${entityId}, ${loc}, ${field}, ${translated})
          ON CONFLICT (entity_type, entity_id, locale, field)
          DO UPDATE SET content = EXCLUDED.content
        `
        saved.push({ locale: loc, field, content: translated })
      }
    }

    res.json({ success: true, saved })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getTranslations = async (req, res) => {
  try {
    const { entityType, entityId } = req.query
    if (!entityType || !entityId) return res.status(400).json({ success: false, message: 'Missing parameters' })
    const rows = await sql`
      SELECT locale, field, content FROM translations WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    `
    const out = {}
    for (const r of rows) {
      out[r.locale] = out[r.locale] || {}
      out[r.locale][r.field] = r.content
    }
    res.json({ success: true, translations: out })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

