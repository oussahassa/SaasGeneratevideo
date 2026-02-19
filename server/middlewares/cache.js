const cache = new Map();

export function setCache(key, value, ttl = 60) {
  const expires = Date.now() + ttl * 1000
  cache.set(key, { value, expires })
}

export function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) { cache.delete(key); return null }
  return entry.value
}

export function clearCache() { cache.clear() }

export default function cacheMiddleware(ttl = 60) {
  return (req, res, next) => {
    const key = req.originalUrl || req.url
    const cached = getCache(key)
    if (cached) return res.json(cached)
    // monkey-patch res.json
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      try { setCache(key, body, ttl) } catch (e) {}
      return originalJson(body)
    }
    next()
  }
}
