import sql from "../configs/db.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await sql`SELECT id, email, first_name, last_name, created_at FROM users WHERE id = ${userId}`;
    
    if (!user || user.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: user[0] });
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

export const getUserCreations = async (req, res) => {
  try {
    const userId = req.user.id;
    const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
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
    const { firstName, lastName, email } = req.body;

    if (!firstName && !lastName && !email) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    if (email) {
      const existing = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${userId}`;
      if (existing.length > 0) return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const updated = await sql`
      UPDATE users
      SET first_name = COALESCE(${firstName}, first_name),
          last_name = COALESCE(${lastName}, last_name),
          email = COALESCE(${email}, email)
      WHERE id = ${userId}
      RETURNING id, email, first_name, last_name, created_at
    `;

    if (!updated || updated.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: updated[0] });
  } catch (error) {
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
        SUM(CASE WHEN type = 'video' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles
      FROM creations WHERE user_id = ${userId}
    `;

    const connected = await sql`SELECT COUNT(DISTINCT user_id) as connected FROM sessions WHERE last_active_at > NOW() - INTERVAL '10 minutes'`;

    res.json({
      success: true,
      stats: {
        creations: parseInt(counts[0].creations || 0),
        images: parseInt(counts[0].images || 0),
        videos: parseInt(counts[0].videos || 0),
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
