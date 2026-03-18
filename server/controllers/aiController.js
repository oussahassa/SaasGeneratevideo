import OpenAI from "openai";
import sql from "../configs/db.js";
import axios from 'axios';
import {v2 as cloudinary} from 'cloudinary';


export const generateArticle = async (req, res) => {
  const API_KEY = process.env.GEMINI_API_KEY;
      const userId = req.user.id;
    const { prompt, length } = req.body;
    const plan = req.plan; // ton X-goog-api-key
    const credits = req.credits; // credits from subscription
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const body = {
  contents: [
    {
      parts: [
        { text: prompt }
      ]
    }
  ]
};
  try {

    if (plan != "premium" || credits < 5) {
      return res.json({success: false, message: "This feature requires premium plan.",
      });
    }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": API_KEY
    },
    body: JSON.stringify(body)
  });
     const subscription = await sql`SELECT id, monthly_limit FROM user_subscriptions WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()`;
   if (subscription.length>0) {
        await sql`UPDATE user_subscriptions SET monthly_limit = monthly_limit - 5 WHERE id = ${subscription[0].id}`;
   }
    const content = await response.json();
          console.log("API response status:", content); // Debug log

    console.log("API response status:", content.candidates[0].content.parts[0].text); // Debug log
const data = content.candidates[0].content.parts[0].text.trim();

    if (!data || data.length < 10) {
await sql`
  INSERT INTO creations (user_id, prompt, content, type)
  VALUES (${userId}, ${prompt}, ${data}, ${'article'})
`;



    res.json({success: true, content: data})
    } else {
      res.json({
        success: false,
        message: "AI returned incomplete response"
      });
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({success: false, message: error.message})
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uiPrompt, aiPrompt } = req.body;
    const plan = req.plan;

    if (plan != "premium") {
      return res.json({success: false, message: "This feature requires premium plan.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: aiPrompt ,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content?.trim()

    if (!content || content.length < 10) {
      return res.json({
        success: false,
        message: "AI returned incomplete response"
      });
    }

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${uiPrompt}, ${content}, ${'blog-title'})
    `;

    res.json({success: true, content})

  } catch (error) {
    console.log(error.message)
    res.status(500).json({success: false, message: error.message})
  }
};

export const generateImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, publish } = req.body;
    const plan = req.plan;
    if (plan != 'premium') {
      return res.json({success: false, message: "This feature is only available for premium subscriptions.",
      });
    }

    // Deduct 5 credits
    const subscription = await sql`SELECT id, monthly_limit FROM user_subscriptions WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()`;
    if (subscription.length === 0 || subscription[0].monthly_limit < 5) {
      return res.json({
        success: false,
        message: "Insufficient credits.",
      });
    }
    await sql`UPDATE user_subscriptions SET monthly_limit = monthly_limit - 5 WHERE id = ${subscription[0].id}`;

    const formData = new FormData()
    formData.append('prompt', prompt)
    const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
      headers: {'x-api-key': process.env.CLIPDROP_API_KEY},
      responseType: "arraybuffer"
    })
    
    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

    const {secure_url} = await cloudinary.uploader.upload(base64Image)

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, ${'image'}, ${publish ?? false})
    `;

    res.json({success: true, content: secure_url})

  } catch (error) {
    console.log(error.message)
    res.status(500).json({success: false, message: error.message})
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = req.file;
    const plan = req.plan;

    if (plan != 'premium') {
      return res.json({success: false, message: "This feature is only available for premium subscriptions.",
      });
    }

    const {secure_url} = await cloudinary.uploader.upload(image.path, {
      format: "png",
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background',
          background: "transparent"
        }
      ]
    })


      await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, ${'image'})
    `;
    res.json({success: true, content: secure_url})

  } catch (error) {
    console.log(error.message)
    res.status(500).json({success: false, message: error.message})
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan != 'premium') {
      return res.json({success: false, message: "This feature is only available for premium subscriptions.",
      });
    }

    const {public_id} = await cloudinary.uploader.upload(image.path)

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{effect: `gen_remove:${object}`}],
      resource_type: 'image'
    })

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, ${'image'})
    `;
    
    res.json({success: true, content: imageUrl})

  } catch (error) {
    console.log(error.message)
    res.status(500).json({success: false, message: error.message})
  }
};
