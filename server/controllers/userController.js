import sql from "../configs/db.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await sql`SELECT id, email, first_name, last_name, profile_picture, created_at FROM users WHERE id = ${userId}`;
    
    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const plan = req.plan;
    const credits = req.credits;

    res.json({ success: true, user: { ...user[0], plan, credits } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await sql`
      SELECT * FROM user_subscriptions
      WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()
    `;

    const planType = subscription.length > 0 ? "premium" : "free";
    const credits = subscription.length > 0 ? subscription[0].monthly_limit : 5;

    res.json({ success: true, planType, credits, exists: subscription.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const buildCreationsQuery = ({ userId, type, startDate, endDate, publishedOnly } = {}) => {
  let query = sql`SELECT * FROM creations WHERE TRUE`;

  if (userId) {
    query = sql`${query} AND user_id = ${userId}`;
  }

  if (publishedOnly) {
    query = sql`${query} AND publish = TRUE`;
  }

  if (type) {
    query = sql`${query} AND type = ${type}`;
  }

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) {
      query = sql`${query} AND created_at >= ${start.toISOString()}`;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      query = sql`${query} AND created_at <= ${end.toISOString()}`;
    }
  }

  return sql`${query} ORDER BY created_at DESC`;
};

export const getUserCreations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate } = req.query;

    const query = buildCreationsQuery({ userId, type, startDate, endDate });
    const creations = await query;

    res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const query = buildCreationsQuery({ publishedOnly: true, type, startDate, endDate });
    const creations = await query;

    res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const { id } = req.body;

    const creation = await sql`SELECT * FROM creations WHERE id = ${id}`;
    if (!creation || creation.length === 0) {
      return res.json({ success: false, message: "Creation not found" });
    }

    let currentLikes = creation[0].likes || [];
    if (typeof currentLikes === "string") {
      currentLikes = currentLikes.replace(/[{}]/g, "").split(",").filter(Boolean);
    }

    let updatedLikes, message;
    if (currentLikes.includes(userId)) {
      updatedLikes = currentLikes.filter(u => u !== userId);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userId];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;
    await sql`UPDATE creations SET likes = ${formattedArray} WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, password } = req.body;
    const profileImageFile = req.file;

    if (!firstName && !lastName && !password && !profileImageFile) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Get current user data
    const currentUser = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profilePictureUrl = currentUser[0].profile_picture;
    let hashedPassword = currentUser[0].password_hash;

    // Handle profile picture upload
    if (profileImageFile) {
      const result = await cloudinary.uploader.upload(profileImageFile.path, {
        folder: 'nexai/profiles',
        resource_type: 'auto'
      });
      profilePictureUrl = result.secure_url;
    }

    // Hash password if provided
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user profile
    const updated = await sql`
      UPDATE users
      SET first_name = ${firstName || currentUser[0].first_name},
          last_name = ${lastName || currentUser[0].last_name},
          password_hash = ${hashedPassword},
          profile_picture = ${profilePictureUrl}
      WHERE id = ${userId}
      RETURNING id, email, first_name, last_name, profile_picture, created_at
    `;

    if (!updated || updated.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updated[0] });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const counts = await sql`
      SELECT 
        COUNT(*) as creations,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles
      FROM creations WHERE user_id = ${userId}
    `;
const countsVideos = await sql`
      SELECT 
        COUNT(*) as videos
        
      FROM videos vs  WHERE user_id = ${userId}
    `;
    const connected = await sql`SELECT COUNT(DISTINCT user_id) as connected FROM sessions WHERE last_active_at > NOW() - INTERVAL '10 minutes'`;
console.log(countsVideos)
    res.json({
      success: true,
      stats: {
        creations: parseInt(counts[0].creations || 0),
        images: parseInt(counts[0].images || 0),
        videos: parseInt( countsVideos[0].videos || 0),
        articles: parseInt(counts[0].articles || 0),
        connectedUsers: parseInt(connected[0].connected || 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await sql`
      SELECT id, ip_address as ip, user_agent, device_type as device, created_at, last_active_at as lastActive
      FROM sessions WHERE user_id = ${userId} ORDER BY last_active_at DESC
    `;
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Session id required" });

    const del = await sql`DELETE FROM sessions WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
    if (!del || del.length === 0) return res.status(404).json({ success: false, message: "Session not found" });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { packId } = req.body;

    if (!packId) {
      return res.status(400).json({ success: false, message: "Pack ID is required" });
    }

    // Get pack details
    const pack = await sql`SELECT * FROM packs WHERE id = ${packId}`;
    if (!pack || pack.length === 0) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    const selectedPack = pack[0];

    // Check if user already has an active subscription
    const existingSubscription = await sql`
      SELECT * FROM user_subscriptions
      WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()
    `;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await sql`
        UPDATE user_subscriptions
        SET pack_id = ${packId}, end_date = ${endDate}, updated_at = NOW()
        WHERE user_id = ${userId} AND is_active = TRUE
      `;
    } else {
      // Create new subscription
      await sql`
        INSERT INTO user_subscriptions (user_id, pack_id, start_date, end_date, is_active, monthly_limit)
        VALUES (${userId}, ${packId}, ${startDate}, ${endDate}, TRUE, ${selectedPack.monthly_limit || 0})
      `;
    }

    res.json({
      success: true,
      message: `Successfully upgraded to ${selectedPack.name} plan`,
      plan: selectedPack
    });
  } catch (error) {
    console.error('Upgrade plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getImageHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const lim = parseInt(req.query.lim) || 10;
    const offset = (page - 1) * lim;

    const images = await sql`
      SELECT * FROM creations
      WHERE user_id = ${userId} AND type = 'image'
      ORDER BY id DESC
      LIMIT ${lim} OFFSET ${offset}
    `;

    res.json({ success: true, images });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
