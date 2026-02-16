import passport from 'passport'
import sql from '../configs/db.js'

// Middleware to verify JWT token and check user plan
export const auth = passport.authenticate('jwt', { session: false })

// Middleware to check if user has premium plan
export const requirePremium = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' })
        }

        const subscription = await sql(
            `SELECT * FROM user_subscriptions 
             WHERE user_id = $1 AND is_active = TRUE AND end_date > NOW()`,
            [req.user.id]
        )

        if (subscription.length === 0) {
            return res.status(403).json({ success: false, message: 'Premium plan required' })
        }

        req.plan = 'premium'
        next()
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Middleware to attach plan info to request
export const attachPlanInfo = async (req, res, next) => {
    try {
        if (!req.user) {
            req.plan = 'free'
            return next()
        }

        const subscription = await sql(
            `SELECT * FROM user_subscriptions 
             WHERE user_id = $1 AND is_active = TRUE AND end_date > NOW()`,
            [req.user.id]
        )

        req.plan = subscription.length > 0 ? 'premium' : 'free'

        // Update session last_active_at if possible (match by ip + user agent)
        try {
            const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || null
            const userAgent = req.headers['user-agent'] || null
            if (ip || userAgent) {
                await sql(`UPDATE sessions SET last_active_at = NOW() WHERE user_id = $1 AND (ip_address = $2 OR user_agent = $3)`, [req.user.id, ip, userAgent])
            }
        } catch (e) {
            // non-fatal
        }

        next()
    } catch (error) {
        req.plan = 'free'
        next()
    }
}
