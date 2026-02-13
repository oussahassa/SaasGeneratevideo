import sql from "../configs/db.js";


export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await sql('SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1', [userId])
        
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        res.json({ success: true, user: user[0] })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getUserPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const subscription = await sql(
            `SELECT * FROM user_subscriptions 
             WHERE user_id = $1 AND is_active = TRUE AND end_date > NOW()`,
            [userId]
        )

        const planType = subscription.length > 0 ? 'premium' : 'free'
        const credits = subscription.length > 0 ? subscription[0].monthly_limit : 5

        res.json({
            success: true,
            planType,
            credits,
            exists: subscription.length > 0
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const getUserCreations = async (req, res)=> {
    try {
        const userId = req.user.id;

        const creations = await sql('SELECT * FROM creations WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

        res.json({success: true, creations})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const getPublishedCreations = async (req, res)=> {
    try {
        const creations = await sql('SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC');

        res.json({success: true, creations})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const toggleLikeCreation = async (req, res)=> {
    try {
        const userId = req.user.id;
        const { id } = req.body

        const creation = await sql('SELECT * FROM creations WHERE id = $1', [id])

        if(!creation || creation.length === 0) {
            return res.json({success: false, message: "Creation not found"})
        }

        const currentLikes = creation[0].likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user)=> user !== userIdStr);
            message = 'Creation Unliked'
        } else {
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql('UPDATE creations SET likes = $1::text[] WHERE id = $2', [formattedArray, id])

        res.json({success: true, message})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}
