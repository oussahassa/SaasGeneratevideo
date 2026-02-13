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
        next()
    } catch (error) {
        req.plan = 'free'
        next()
    }
}
