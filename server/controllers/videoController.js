import sql from "../configs/db.js";
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});



// Générer une vidéo avec l'IA
export const generateVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, duration, tone } = req.body;
    const plan = req.plan;

    console.log("User video plan:", plan);

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Video generation is only available for premium subscriptions.",
      });
    }
 const prompt = `Generate a ${duration} second video script about "${topic}" with a ${tone} tone. 
    The script should be engaging and suitable for social media. Include scene descriptions and voiceover text.
    Format: [SCENE 1], [VOICEOVER], [DURATION] etc.`;
/*
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
     */

    const prompt2 = `Generate a ${duration} second video about "${topic}" with a ${tone} tone. 
The video should be engaging and suitable for social media.`;

    // Call RunwayML API for video generation
    const runwayResponse = await axios.post('https://api.dev.runwayml.com/v1/text_to_video', {
      model:"gen4.5",
      promptText: prompt2,
      duration: Math.min(duration, 10), // Max 10 seconds for demo
      ratio: '1280:720'
    }, {
      headers: {
        'Authorization': `Bearer key_b8fc9b1ac378699f60966285a73888ebe7234c2244addac0a6f1d9ad2f767cfa111ee8b23324162aae96cdb5871bdcfd254d7d71cf29483833ed766bda02e5a6`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06' // Specify API version if neededs
      }
    });
        console.log("Runway response:", runwayResponse);

console.log("Runway response:", runwayResponse.data);
    const taskId = runwayResponse.data.id;

    const videoId = uuidv4();
    await sql`INSERT INTO videos (id, user_id, script, status, type, created_at) VALUES (${videoId}, ${userId}, ${topic}, 'processing', 'generated', NOW())`;

    // For demo, simulate completion - in production, poll for status
    // Here, we'll assume the video is generated instantly for simplicity
    const videoUrl = `https://runwayml.com/videos/${taskId}.mp4`; // Placeholder

    await sql`UPDATE videos SET video_url = ${videoUrl}, status = 'completed' WHERE id = ${videoId}`;
   const subscription = await sql`SELECT id, monthly_limit FROM user_subscriptions WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()`;
    if (subscription.length === 0 || subscription[0].monthly_limit < 5) {
      return res.json({
        success: false,
        message: "Insufficient credits.",
      });
    }

        await sql`UPDATE user_subscriptions SET monthly_limit = monthly_limit - 5 WHERE id = ${subscription[0].id}`;

    console.log("Generated video:", videoUrl);
    res.json({ success: true, videoId, videoUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Générer un script vidéo avec l'IA


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
    const { videoId, platforms, caption } = req.body; // platforms as array

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, message: "Platforms required" });
    }

    // Récupérer la vidéo
    const video = await sql`SELECT * FROM videos WHERE id = ${videoId}`;

    if (!video || video.length === 0) {
      return res.json({ success: false, message: "Video not found" });
    }

    if (video[0].user_id !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const results = [];

    for (const platform of platforms) {
      const account = await sql`
        SELECT id, user_id, platform, access_token, refresh_token, expires_at, platform_user_id, page_id, page_access_token, page_name, created_at, updated_at
        FROM social_accounts
        WHERE user_id = ${userId} AND platform = ${platform}
      `;

      if (!account || account.length === 0) {
        results.push({
          platform,
          success: false,
          error: "Account not connected"
        });
        continue;
      }

      try {
        let response;

        if (platform === "instagram") {
          // if we have page_access_token use standard container; else fallback to share link
          if (account[0].page_access_token) {
            response = await postToInstagram(video[0].video_url, caption, account[0]);
          } else {
            // can't post to personal profile via API, provide sharer link
            response = { shareUrl: `https://www.instagram.com/sharing?u=${encodeURIComponent(video[0].video_url)}` };
          }
        } else if (platform === "tiktok") {
          response = await postToTikTok(video[0].video_url, caption, account[0]);
        } else if (platform === "facebook") {
          // if page token available use page share, otherwise use profile
          if (account[0].page_access_token && account[0].page_id) {
            response = await postToFacebook(video[0].video_url, caption, account[0]);
          } else {
            // post to personal profile
            const profileResponse = await axios.post(
              `https://graph.facebook.com/v19.0/me/videos`,
              {
                file_url: video[0].video_url,
                description: caption,
                access_token: account[0].access_token
              }
            );
            response = profileResponse.data;
          }
        }

        // Créer un enregistrement de partage
        await sql`
          INSERT INTO video_shares (video_id, user_id, platform, caption, shared_at)
          VALUES (${videoId}, ${userId}, ${platform}, ${caption}, NOW())
        `;

        results.push({
          platform,
          success: true,
          response
        });

      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Video sharing completed`,
      results
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer les statistiques des vidéos de l'utilisateur
export const getUserVideoStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const videos = await sql`SELECT * FROM videos WHERE user_id = ${userId}`;
    const shares = await sql`SELECT * FROM video_shares WHERE user_id = ${userId}`;

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

    const videos = await sql`SELECT * FROM videos WHERE user_id = ${userId} ORDER BY created_at DESC`;

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

    const video = await sql`SELECT * FROM videos WHERE id = ${videoId}`;

    if (!video || video.length === 0) {
      return res.json({ success: false, message: "Video not found" });
    }

    if (video[0].user_id !== userId) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await sql`DELETE FROM videos WHERE id = ${videoId}`;
    await sql`DELETE FROM video_shares WHERE video_id = ${videoId}`;

    res.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function postToTikTok(videoUrl, caption, account) {

  const response = await axios.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl
      },
      post_info: {
        title: caption,
        privacy_level: "SELF_ONLY"
      }
    },
    {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

async function postToInstagram(videoUrl, caption, account) {

  const IG_USER_ID = account.platform_user_id; // Instagram Business Account ID
  const ACCESS_TOKEN = account.page_access_token; // Page access token

  if (!ACCESS_TOKEN) {
    throw new Error('Page access token required for Instagram publishing');
  }

  // 1️⃣ Create media container
  const container = await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
    {
      media_type: "REELS",
      video_url: videoUrl,
      caption,
      access_token: ACCESS_TOKEN,
    }
  );

  // 2️⃣ Publish
  const publish = await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
    {
      creation_id: container.data.id,
      access_token: ACCESS_TOKEN,
    }
  );

  return publish.data;
}


async function postToFacebook(videoUrl, caption, account) {

  const PAGE_ID = account.page_id; // Page ID
  const ACCESS_TOKEN = account.page_access_token; // Page access token

  if (!ACCESS_TOKEN || !PAGE_ID) {
    throw new Error('Page access token and page ID required for Facebook publishing');
  }

  // 1️⃣ Upload vidéo depuis URL
  const upload = await axios.post(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/videos`,
    {
      file_url: videoUrl,
      description: caption,
      access_token: ACCESS_TOKEN
    }
  );

  return upload.data;
}