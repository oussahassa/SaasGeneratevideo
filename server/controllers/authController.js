import sql from '../configs/db.js'
import { hashPassword, generateToken } from '../configs/passport.js'
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../configs/mailtrap.js'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

/**
 * Generate a random 6-digit OTP code
 */
const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a secure password reset token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Signup - Create account and send verification email
 */
export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    const existingUser = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate OTP verification code
    const verificationCode = generateOTPCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user (not yet verified)
    const userId = uuidv4()
    await sql(
      `INSERT INTO users (id, email, first_name, last_name, password_hash, verification_code, verification_code_expires_at, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email, firstName || '', lastName || '', passwordHash, verificationCode, verificationCodeExpires, false]
    )

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode)

    if (!emailResult.success) {
      // Delete user if email fails
      await sql('DELETE FROM users WHERE id = $1', [userId])
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

    // Find user by email
    const users = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const user = users[0]

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    // Check verification code
    if (user.verification_code !== verificationCode) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' })
    }

    // Check if code expired
    if (new Date() > new Date(user.verification_code_expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification code expired' })
    }

    // Mark email as verified
    await sql(
      'UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires_at = NULL WHERE id = $1',
      [user.id]
    )

    // Send welcome email
    await sendWelcomeEmail(email, user.first_name)

    // Generate token
    const token = generateToken({ id: user.id, email: user.email })

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
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

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    // Find user by email
    const users = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const user = users[0]

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email already verified' })
    }

    // Generate new OTP code
    const verificationCode = generateOTPCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update verification code
    await sql(
      'UPDATE users SET verification_code = $1, verification_code_expires_at = $2 WHERE id = $3',
      [verificationCode, verificationCodeExpires, user.id]
    )

    // Resend verification email
    const emailResult = await sendVerificationEmail(email, verificationCode)

    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send verification email' })
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    })
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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    // Find user
    const users = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const user = users[0]

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first',
        requiresEmailVerification: true,
        userId: user.id
      })
    }

    // Validate password (use Passport)
    const isPasswordValid = await require('bcryptjs').compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    // Update last sign in
    await sql('UPDATE users SET last_sign_in_at = NOW() WHERE id = $1', [user.id])

    // Generate token
    const token = generateToken({ id: user.id, email: user.email })

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Forgot password - Send reset link
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    // Find user
    const users = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If email exists, reset link will be sent' })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = generateResetToken()
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Save reset token
    await sql(
      'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3',
      [resetToken, resetTokenExpires, user.id]
    )

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, resetLink)

    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send reset email' })
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body

    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, token, and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    // Find user
    const users = await sql('SELECT * FROM users WHERE email = $1', [email])
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const user = users[0]

    // Verify token
    if (user.password_reset_token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' })
    }

    // Check if token expired
    if (!user.password_reset_expires_at || new Date() > new Date(user.password_reset_expires_at)) {
      return res.status(400).json({ success: false, message: 'Reset token expired' })
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password and clear reset token
    await sql(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = $2',
      [passwordHash, user.id]
    )

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Logout - Client-side only (stateless JWT)
 */
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
}

/**
 * Verify token - Check if JWT is valid
 */
export const verifyToken = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    res.json({ success: true, valid: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
