import passport from 'passport'
import LocalStrategy from 'passport-local'
import JWTStrategy from 'passport-jwt'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql from '../configs/db.js'

const JwtFromRequestExtractor = JWTStrategy.ExtractJwt.fromAuthHeaderAsBearerToken()

// Local Strategy for login
passport.use('local', new LocalStrategy.Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await sql('SELECT * FROM users WHERE email = $1', [email])
      
      if (!user || user.length === 0) {
        return done(null, false, { message: 'User not found' })
      }

      const isPasswordValid = await bcryptjs.compare(password, user[0].password_hash)
      
      if (!isPasswordValid) {
        return done(null, false, { message: 'Invalid password' })
      }

      return done(null, { id: user[0].id, email: user[0].email })
    } catch (error) {
      return done(error)
    }
  }
))

// JWT Strategy for protected routes
passport.use('jwt', new JWTStrategy.Strategy(
  {
    jwtFromRequest: JwtFromRequestExtractor,
    secretOrKey: process.env.JWT_SECRET || 'your_secret_key'
  },
  async (payload, done) => {
    try {
      const user = await sql('SELECT * FROM users WHERE id = $1', [payload.id])
      
      if (!user || user.length === 0) {
        return done(null, false)
      }

      return done(null, user[0])
    } catch (error) {
      return done(error)
    }
  }
))

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '7d' }
  )
}

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret',
    { expiresIn: '30d' }
  )
}

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export default passport
