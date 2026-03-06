// controllers/authController.js

import sql from '../configs/db.js'
import bcrypt from 'bcryptjs'
import { hashPassword, generateToken, generateRefreshToken } from '../configs/passport.js'
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../configs/mailtrap.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

/**
 * Generate a random 6-digit OTP code
 */
const generateOTPCode = () => Math.floor(100000 + Math.random() * 900000).toString()

/**
 * Generate a secure password reset token
 */
const generateResetToken = () => crypto.randomBytes(32).toString('hex')

/**
 * Signup - Create account and send verification email
 */
export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body
    console.log('Signup request:', { email, firstName, lastName }) // Don't log password

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate OTP verification code
    const verificationCode = generateOTPCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user (not yet verified)
    const userId = uuidv4()
    await sql`
      INSERT INTO users (
        id,
        email,
        first_name,
        last_name,
        password_hash,
        verification_code,
        verification_code_expires_at,
        email_verified
      ) VALUES (
        ${userId},
        ${email},
        ${firstName || ''},
        ${lastName || ''},
        ${passwordHash},
        ${verificationCode},
        ${verificationCodeExpires},
        ${false}
      )
    `

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode)
    if (!emailResult.success) {
      // Delete user if email fails
      await sql`DELETE FROM users WHERE id = ${userId}`
      return res.status(500).json({ success: false, message: 'Failed to send verification email' })
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for verification code.',
      userId,
      requiresEmailVerification: true
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Verify email with OTP code
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body

    if (!email || !verificationCode) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' })
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const user = users[0]

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' })
    }

    if (new Date() > new Date(user.verification_code_expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification code expired' })
    }

    // Mark email as verified
    await sql`
      UPDATE users
      SET email_verified = ${true},
          verification_code = NULL,
          verification_code_expires_at = NULL
      WHERE id = ${user.id}
    `

    // Send welcome email
    await sendWelcomeEmail(email, user.first_name)

    // Generate token
    const token = generateToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email })

    // Record session
    try {
      const sessionId = uuidv4()
      const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || null
      const userAgent = req.headers['user-agent'] || null
      const deviceType = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'web'
      await sql`
        INSERT INTO sessions (id, user_id, ip_address, user_agent, device_type, created_at, last_active_at)
        VALUES (${sessionId}, ${user.id}, ${ip}, ${userAgent}, ${deviceType}, NOW(), NOW())
      `
    } catch (e) {
      console.warn('Failed to record session:', e.message)
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Resend verification code
 */
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' })

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) return res.status(400).json({ success: false, message: 'User not found' })

    const user = users[0]

    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    const verificationCode = generateOTPCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000)

    await sql`
      UPDATE users
      SET verification_code = ${verificationCode},
          verification_code_expires_at = ${verificationCodeExpires}
      WHERE id = ${user.id}
    `

    const emailResult = await sendVerificationEmail(email, verificationCode)
    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' })
    }

    res.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Resend verification code error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Login - Require email verification
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' })

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const user = users[0]

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
        requiresEmailVerification: true,
        userId: user.id
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid email or password' })

    await sql`UPDATE users SET last_sign_in_at = NOW() WHERE id = ${user.id}`

    // Create session
    const sessionId = uuidv4()
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get('user-agent')
    
    await sql`
      INSERT INTO sessions (id, user_id, ip_address, user_agent, created_at, last_active_at)
      VALUES (${sessionId}, ${user.id}, ${ipAddress}, ${userAgent}, NOW(), NOW())
    `

    const token = generateToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email })

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profile_picture: user.profile_picture,
        role: user.is_admin ? 'admin' : 'user'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Forgot password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' })

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) return res.json({ success: true, message: 'If email exists, reset link will be sent' })

    const user = users[0]
    const resetToken = generateResetToken()
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000)

    await sql`
      UPDATE users
      SET password_reset_token = ${resetToken},
          password_reset_expires_at = ${resetTokenExpires}
      WHERE id = ${user.id}
    `

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`
    const emailResult = await sendPasswordResetEmail(email, resetToken, resetLink)
    if (!emailResult.success) return res.status(500).json({ success: false, message: 'Failed to send reset email' })

    res.json({ success: true, message: 'Password reset link sent to your email' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Reset password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: 'Email, token, and new password are required' })
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) return res.status(400).json({ success: false, message: 'User not found' })

    const user = users[0]

    if (user.password_reset_token !== token) return res.status(400).json({ success: false, message: 'Invalid reset token' })
    if (!user.password_reset_expires_at || new Date() > new Date(user.password_reset_expires_at)) return res.status(400).json({ success: false, message: 'Reset token expired' })

    const passwordHash = await hashPassword(newPassword)
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash},
          password_reset_token = NULL,
          password_reset_expires_at = NULL
      WHERE id = ${user.id}
    `

    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Logout
 */
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
}

/**
 * Verify token
 */
export const verifyToken = async (req, res) => {
  try {
    const user = req.user
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' })

    res.json({ success: true, valid: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' })

    // verify refresh token
    const { default: jwtLib } = await import('jsonwebtoken')
    const secret = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret'
    let payload
    try {
      payload = jwtLib.verify(token, secret)
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' })
    }

    // Optionally: check user still exists
    const users = await sql`SELECT * FROM users WHERE id = ${payload.id}`
    if (!users || users.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

    const user = users[0]
    // Issue new access token and a new refresh token (rotation)
    const newAccessToken = generateToken({ id: user.id, email: user.email })
    const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email })

    res.json({ success: true, token: newAccessToken, refreshToken: newRefreshToken })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Social Login Functions
export const initiateSocialLogin = async (req, res) => {
  try {
    const { platform } = req.params;
    const { redirectUrl } = req.query;

    if (!['instagram', 'tiktok', 'facebook'].includes(platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    // Generate OAuth URLs for each platform
    let authUrl = '';

    switch (platform) {
      case 'instagram':
        // Instagram Business Account via Facebook Graph API
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&scope=pages_manage_posts,pages_show_list,instagram_basic,instagram_content_publish&response_type=code&state=${redirectUrl || ''}`;
        break;
      case 'tiktok':
        // TikTok OAuth
           // IMPORTANT: Utilisez l'URL exacte configurée dans votre sandbox TikTok
        const tiktokRedirectUri = "https://semipatriotic-unpoisonously-jaime.ngrok-free.dev/ai/generate-videos";
        
        authUrl = new URL("https://www.tiktok.com/auth/authorize");
        authUrl.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY);
        authUrl.searchParams.set("scope", "user.info.basic,video.publish");
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("redirect_uri", tiktokRedirectUri);
        authUrl.searchParams.set("state", JSON.stringify({ 
          redirectUrl: redirectUrl || '/',
          platform: 'tiktok'
        }));
        break
       /*   authUrl =
    `https://www.tiktok.com/auth/authorize` +
    `?client_key=${process.env.TIKTOK_CLIENT_KEY}` +
    `&response_type=code` +
    `&scope=user.info.basic,video.publish` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&state=test`;
*/

  //`&state=${encodeURIComponent(redirectUrl)}`;
    //    authUrl = `https://www.tiktok.com/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.publish&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${redirectUrl || ''}`;
        break;
      case 'facebook':
        // Facebook OAuth for pages
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}&scope=pages_manage_posts,pages_show_list&response_type=code&state=${redirectUrl || ''}`;
        break;
    }
    console.log('Request IP:', req.ip);
console.log('Request headers:', req.headers)
console.log(`Initiating ${platform} login with redirectUrl: ${redirectUrl}, redirecting to:`, authUrl);
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('Social login initiation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleSocialCallback = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code required' });
    }

    // Exchange code for access token
    let tokenData = {};

    switch (platform) {
      case 'instagram':
        // Instagram via Facebook Graph API
        const igFbResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`, {
          method: 'GET'
        });
        tokenData = await igFbResponse.json();

        // Récupérer les pages et comptes Instagram associés
        if (tokenData.access_token) {
          try {
            const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${tokenData.access_token}`, {
              method: 'GET'
            });
            const pagesData = await pagesResponse.json();

            if (pagesData.data && pagesData.data.length > 0) {
              // Chercher une page avec un compte Instagram Business
              const pageWithInstagram = pagesData.data.find(page => page.instagram_business_account);
              if (pageWithInstagram) {
                tokenData.page_id = pageWithInstagram.id;
                tokenData.page_access_token = pageWithInstagram.access_token;
                tokenData.page_name = pageWithInstagram.name;
                tokenData.instagram_account_id = pageWithInstagram.instagram_business_account.id;
              }
            }
          } catch (igError) {
            console.warn('Failed to fetch Instagram business account:', igError);
          }
        }
        break;

      case 'tiktok':
        const tiktokResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TIKTOK_REDIRECT_URI
          })
        });
        tokenData = await tiktokResponse.json();
        console.log('TikTok token response:', tokenData);
        break;

      case 'facebook':
        const fbResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`, {
          method: 'GET'
        });
        tokenData = await fbResponse.json();

        // Si succès, récupérer les pages Facebook de l'utilisateur
        if (tokenData.access_token) {
          try {
            const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenData.access_token}`, {
              method: 'GET'
            });
            const pagesData = await pagesResponse.json();

            if (pagesData.data && pagesData.data.length > 0) {
              // Prendre la première page (ou permettre à l'utilisateur de choisir plus tard)
              const firstPage = pagesData.data[0];
              tokenData.page_id = firstPage.id;
              tokenData.page_access_token = firstPage.access_token;
              tokenData.page_name = firstPage.name;
            }
          } catch (pageError) {
            console.warn('Failed to fetch Facebook pages:', pageError);
            // Continue without page info - user can reconnect later
          }
        }
        break;
    }

    if (tokenData.error) {
      return res.status(400).json({ success: false, message: tokenData.error_description || tokenData.error });
    }

    // For demo purposes, we'll assume the user is already logged in
    // In production, you'd need to handle the OAuth flow properly with user sessions
    const userId = req.user ? req.user.id : null; // This won't work without proper session handling

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Store social account
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null;

    if (platform === 'facebook') {
      // Pour Facebook, stocker les infos de page
      await sql`
        INSERT INTO social_accounts (user_id, platform, access_token, refresh_token, expires_at, platform_user_id, page_id, page_access_token, page_name)
        VALUES (${userId}, ${platform}, ${tokenData.access_token}, ${tokenData.refresh_token || null}, ${expiresAt}, ${tokenData.user_id || null}, ${tokenData.page_id || null}, ${tokenData.page_access_token || null}, ${tokenData.page_name || null})
        ON CONFLICT (user_id, platform) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          platform_user_id = EXCLUDED.platform_user_id,
          page_id = EXCLUDED.page_id,
          page_access_token = EXCLUDED.page_access_token,
          page_name = EXCLUDED.page_name,
          updated_at = NOW()
      `;
    } else if (platform === 'instagram') {
      // Pour Instagram, stocker les infos de page Facebook et compte Instagram
      await sql`
        INSERT INTO social_accounts (user_id, platform, access_token, refresh_token, expires_at, platform_user_id, page_id, page_access_token, page_name)
        VALUES (${userId}, ${platform}, ${tokenData.access_token}, ${tokenData.refresh_token || null}, ${expiresAt}, ${tokenData.instagram_account_id || null}, ${tokenData.page_id || null}, ${tokenData.page_access_token || null}, ${tokenData.page_name || null})
        ON CONFLICT (user_id, platform) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          platform_user_id = EXCLUDED.platform_user_id,
          page_id = EXCLUDED.page_id,
          page_access_token = EXCLUDED.page_access_token,
          page_name = EXCLUDED.page_name,
          updated_at = NOW()
      `;
    } else {
      // Pour les autres plateformes
      await sql`
        INSERT INTO social_accounts (user_id, platform, access_token, refresh_token, expires_at, platform_user_id)
        VALUES (${userId}, ${platform}, ${tokenData.access_token}, ${tokenData.refresh_token || null}, ${expiresAt}, ${tokenData.user_id || null})
        ON CONFLICT (user_id, platform) DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          platform_user_id = EXCLUDED.platform_user_id,
          updated_at = NOW()
      `;
    }

    // Redirect back to frontend
    // If TikTok login, append a flag so UI can react immediately
    let redirectUrl = state || `${process.env.FRONTEND_URL}/dashboard`;
    if (platform === 'tiktok' && tokenData.access_token) {
      // include basic info in query string for client-side notification
      const params = new URLSearchParams();
      params.set('platform', 'tiktok');
      params.set('connected', '1');
      // we do NOT include the raw token for security
      const sep = redirectUrl.includes('?') ? '&' : '?';
      redirectUrl = `${redirectUrl}${sep}${params.toString()}`;
    }
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Social callback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserSocialAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await sql`
      SELECT id, platform, platform_user_id, page_id, page_name, created_at, updated_at
      FROM social_accounts
      WHERE user_id = ${userId}
    `;

    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Get social accounts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const disconnectSocialAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.params;

    await sql`
      DELETE FROM social_accounts
      WHERE user_id = ${userId} AND platform = ${platform}
    `;

    res.json({ success: true, message: 'Social account disconnected' });
  } catch (error) {
    console.error('Disconnect social account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
