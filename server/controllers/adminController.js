import sql from "../configs/db.js";

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `;
    return user.length > 0 && user[0].is_admin === true;
  } catch (error) {
    return false;
  }
};

// Récupérer les données admin
export const getAdminData = async (req, res) => {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const userStats = await sql`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as new_today,
        SUM(CASE WHEN created_at::date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as new_this_week
      FROM users
    `;

    const creationStats = await sql`
      SELECT 
        COUNT(*) as total_creations,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN publish = true THEN 1 ELSE 0 END) as published
      FROM creations
    `;

    const videoStats = await sql`
      SELECT 
        COUNT(*) as total_videos,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
      FROM videos
    `;

    const packStats = await sql`
      SELECT COUNT(*) as total_packs FROM packs
    `;

    const complaintStats = await sql`
      SELECT 
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_complaints,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `;

    res.json({
      success: true,
      stats: {
        users: userStats[0],
        creations: creationStats[0],
        videos: videoStats[0],
        packs: packStats[0],
        complaints: complaintStats[0],
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await sql`
      SELECT id, email, first_name, last_name, created_at, last_sign_in_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const total = await sql`SELECT COUNT(*) as total FROM users`;

    res.json({
      success: true,
      users,
      pagination: {
        total: parseInt(total[0].total),
        page,
        limit,
        pages: Math.ceil(total[0].total / limit),
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Détails utilisateur
export const getUserDetails = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const user = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (!user.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const creations = await sql`SELECT COUNT(*) FROM creations WHERE user_id = ${id}`;
    const videos = await sql`SELECT COUNT(*) FROM videos WHERE user_id = ${id}`;
    const subscriptions = await sql`SELECT * FROM user_subscriptions WHERE user_id = ${id}`;

    res.json({
      success: true,
      user: {
        ...user[0],
        creations_count: parseInt(creations[0].count),
        videos_count: parseInt(videos[0].count),
        subscription: subscriptions[0] || null,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bloquer / débloquer
export const toggleUserStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { isBlocked } = req.body;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const user = await sql`
      UPDATE users
      SET is_blocked = ${isBlocked}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!user.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
      user: user[0],
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer utilisateur
export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    await sql`DELETE FROM creations WHERE user_id = ${id}`;
    await sql`DELETE FROM videos WHERE user_id = ${id}`;
    await sql`DELETE FROM video_shares WHERE user_id = ${id}`;
    await sql`DELETE FROM user_subscriptions WHERE user_id = ${id}`;
    await sql`DELETE FROM complaints WHERE user_id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id}`;

    res.json({ success: true, message: "User and associated data deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Statistiques journalières
export const getDailyStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const stats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as users_created
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `;

    res.json({ success: true, stats });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


;











// Récupérer les statistiques du dashboard (ADMIN)
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Statistiques globales
    const userStats = await sql`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as new_today,
        SUM(CASE WHEN created_at::date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as new_this_week
      FROM users
    `;

    const creationStats = await sql`
      SELECT 
        COUNT(*) as total_creations,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN publish = true THEN 1 ELSE 0 END) as published
      FROM creations
    `;

    const videoStats = await sql`
      SELECT 
        COUNT(*) as total_videos,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
      FROM videos
    `;

    const complaintStats = await sql`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_complaints,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `;

 const subscriptionStats = await sql`
  SELECT 
    COUNT(us.id) as total_subscriptions,

    SUM(CASE WHEN p.name = 'pro' THEN 1 ELSE 0 END) as pro_users,
    SUM(CASE WHEN p.name = 'premium' THEN 1 ELSE 0 END) as premium_users,

    COUNT(DISTINCT p.id) as total_packs
  FROM user_subscriptions us
  LEFT JOIN packs p ON us.pack_id = p.id
`;


    res.json({
      success: true,
      stats: {
        users: userStats[0],
        creations: creationStats[0],
        videos: videoStats[0],
        complaints: complaintStats[0],
        subscriptions: subscriptionStats[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Récupérer les statistiques de utilisation des features (ADMIN)
export const getFeatureUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const stats = await sql`
      SELECT 
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        (SELECT COUNT(*) FROM videos) as videos,
        (SELECT COUNT(*) FROM video_shares) as social_shares
      FROM creations
    `;

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
