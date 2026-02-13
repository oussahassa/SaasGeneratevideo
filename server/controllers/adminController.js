import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.publicMetadata?.isAdmin === true;
  } catch (error) {
    return false;
  }
};

// Récupérer les statistiques globales du dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    // Statistiques des utilisateurs
    const [userStats] = await sql`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at::date = CURRENT_DATE THEN 1 ELSE 0 END) as new_today,
        SUM(CASE WHEN created_at::date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END) as new_this_week
      FROM users
    `;

    // Statistiques des créations
    const [creationStats] = await sql`
      SELECT 
        COUNT(*) as total_creations,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN publish = true THEN 1 ELSE 0 END) as published
      FROM creations
    `;

    // Statistiques des vidéos
    const [videoStats] = await sql`
      SELECT 
        COUNT(*) as total_videos,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
      FROM videos
    `;

    // Statistiques des packs
    const [packStats] = await sql`
      SELECT 
        COUNT(*) as total_packs
      FROM packs
    `;

    // Statistiques des réclamations
    const [complaintStats] = await sql`
      SELECT 
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_complaints,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `;

    res.json({
      success: true,
      stats: {
        users: userStats,
        creations: creationStats,
        videos: videoStats,
        packs: packStats,
        complaints: complaintStats
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Récupérer tous les utilisateurs (ADMIN)
export const getAllUsers = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await sql`
      SELECT id, email, first_name, last_name, created_at, last_sign_in_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ total }] = await sql`SELECT COUNT(*) as total FROM users`;

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Récupérer les détails d'un utilisateur (ADMIN)
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Récupérer les créations de l'utilisateur
    const creations = await sql`SELECT * FROM creations WHERE user_id = ${id}`;
    const videos = await sql`SELECT * FROM videos WHERE user_id = ${id}`;
    const subscriptions = await sql`SELECT * FROM user_subscriptions WHERE user_id = ${id}`;

    res.json({
      success: true,
      user: {
        ...user,
        creations_count: creations.length,
        videos_count: videos.length,
        subscription: subscriptions[0] || null
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Bloquer/Débloquer un utilisateur (ADMIN)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const { isBlocked } = req.body;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const [user] = await sql`
      UPDATE users 
      SET is_blocked = ${isBlocked}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({ 
      success: true, 
      message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
      user 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Supprimer un utilisateur (ADMIN)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    // Supprimer les données associées
    await sql`DELETE FROM creations WHERE user_id = ${id}`;
    await sql`DELETE FROM videos WHERE user_id = ${id}`;
    await sql`DELETE FROM video_shares WHERE user_id = ${id}`;
    await sql`DELETE FROM user_subscriptions WHERE user_id = ${id}`;
    await sql`DELETE FROM complaints WHERE user_id = ${id}`;
    await sql`DELETE FROM users WHERE id = ${id}`;

    res.json({ success: true, message: "User and associated data deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Récupérer les statistiques par jour (ADMIN)
export const getDailyStats = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { days = 30 } = req.query;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const stats = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT id) as users_created,
        (SELECT COUNT(*) FROM creations WHERE DATE(created_at) = DATE(users.created_at)) as creations,
        (SELECT COUNT(*) FROM videos WHERE DATE(created_at) = DATE(users.created_at)) as videos
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `;

    res.json({ success: true, stats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Récupérer les statistiques de utilisation des features (ADMIN)
export const getFeatureUsageStats = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const [stats] = await sql`
      SELECT 
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        (SELECT COUNT(*) FROM videos) as videos,
        (SELECT COUNT(*) FROM video_shares) as social_shares
      FROM creations
    `;

    res.json({ success: true, stats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
