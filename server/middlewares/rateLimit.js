const limits = new Map();

export default function rateLimit({ windowMs = 60 * 1000, max = 60 } = {}) {
  return (req, res, next) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const now = Date.now()
      const entry = limits.get(key) || { count: 0, start: now }
      if (now - entry.start > windowMs) {
        entry.count = 1
        entry.start = now
      } else {
        entry.count += 1
      }
      limits.set(key, entry)
      if (entry.count > max) {
        res.status(429).json({ success: false, message: 'Too many requests, slow down.' })
        return
      }
      next()
    } catch (e) {
      next()
    }
  }
}

