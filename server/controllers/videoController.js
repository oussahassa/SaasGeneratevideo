import OpenAI from "openai";
import sql from "../configs/db.js";
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Générer un script vidéo avec l'IA
export const generateVideoScript = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, duration, tone } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Video generation is only available for premium subscriptions.",
      });
    }

    const prompt = `Generate a ${duration} second video script about "${topic}" with a ${tone} tone. 
    The script should be engaging and suitable for social media. Include scene descriptions and voiceover text.
    Format: [SCENE 1], [VOICEOVER], [DURATION] etc.`;

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const script = response.choices[0].message.content;

    const videoId = uuidv4();
    await sql(
      'INSERT INTO videos (id, user_id, script, status, type) VALUES ($1, $2, $3, $4, $5)',
      [videoId, userId, script, 'script_generated', 'generated']
    );

    res.json({ success: true, videoId, script });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Générer une vidéo à partir d'images et d'audio (simulation)
export const generateVideoFromAssets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId, imageUrls, audioUrl, duration } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Video generation is only available for premium subscriptions.",
      });
    }

    // Simulation - En production, utiliseriez FFmpeg pour créer la vidéo
    // Pour l'instant, créez un placeholder
    const videoUrl = `https://video-placeholder.com/${videoId}.mp4`;

    await sql(
      'UPDATE videos SET status = $1, video_url = $2 WHERE id = $3',
      ['completed', videoUrl, videoId]
    );

    res.json({ success: true, videoUrl });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Partager une vidéo sur les réseaux sociaux
export const shareVideoToSocial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId, platform, caption } = req.body;

    // Récupérer la vidéo
    const video = await sql('SELECT * FROM videos WHERE id = $1', [videoId]);

    if (!video || video.length === 0) {
      return res.json({ success: false, message: "Video not found" });
    }

    if (video[0].user_id !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    // Créer un enregistrement de partage
    const share = await sql(
      'INSERT INTO video_shares (video_id, user_id, platform, caption, shared_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [videoId, userId, platform, caption]
    );

    // Simulation - En production, vous intégreriez les APIs réelles
    // des réseaux sociaux (Instagram, TikTok, Facebook)
    const shareUrl = `https://${platform}.com/${videoId}`;

    res.json({
      success: true,
      message: `Video shared to ${platform}`,
      share: { ...share[0], shareUrl }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer les statistiques des vidéos de l'utilisateur
export const getUserVideoStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const videos = await sql('SELECT * FROM videos WHERE user_id = $1', [userId]);
    const shares = await sql('SELECT * FROM video_shares WHERE user_id = $1', [userId]);

    const stats = {
      totalVideos: videos.length,
      totalShares: shares.length,
      sharesByPlatform: {},
      videos: videos,
      shares: shares
    };

    shares.forEach(share => {
      stats.sharesByPlatform[share.platform] = (stats.sharesByPlatform[share.platform] || 0) + 1;
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lister les vidéos de l'utilisateur
export const getUserVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    const videos = await sql('SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    res.json({ success: true, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer une vidéo
export const deleteVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const video = await sql('SELECT * FROM videos WHERE id = $1', [videoId]);

    if (!video || video.length === 0) {
      return res.json({ success: false, message: "Video not found" });
    }

    if (video[0].user_id !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await sql('DELETE FROM videos WHERE id = $1', [videoId]);
    await sql('DELETE FROM video_shares WHERE video_id = $1', [videoId]);

    res.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
