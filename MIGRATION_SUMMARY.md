# NexAI Migration Summary: Clerk → Passport + Redux Implementation

## Overview

Successfully removed Clerk authentication and replaced it with Passport.js authentication. Implemented Redux state management for all API calls with Redux DevTools enabled.

---

## Changes Made

### 1. **Frontend Dependencies Updated**

#### [client/package.json](client/package.json)

- **Removed**: `@clerk/clerk-react`
- **Added**:
  - `@reduxjs/toolkit` - Redux state management
  - `react-redux` - React bindings for Redux
  - `redux` - Core Redux
  - `redux-persist` - Persist Redux state to localStorage

---

### 2. **Backend Dependencies Updated**

#### [server/package.json](server/package.json)

- **Removed**: `@clerk/express`
- **Added**:
  - `passport` - Authentication middleware
  - `passport-local` - Local strategy (username/password)
  - `passport-jwt` - JWT strategy for API protection
  - `express-session` - Session management
  - `bcryptjs` - Password hashing
  - `jsonwebtoken` - JWT token generation

---

### 3. **Redux Store Setup**

#### [client/src/redux/store.js](client/src/redux/store.js)

- Configured Redux store with DevTools enabled
- Includes trace support for debugging

#### Redux Slices Created:

- **[client/src/redux/slices/authSlice.js](client/src/redux/slices/authSlice.js)**
  - Manage authentication state (login, signup, logout, verify token)
  - Actions: `loginUser`, `signupUser`, `logoutUser`, `verifyToken`

- **[client/src/redux/slices/userSlice.js](client/src/redux/slices/userSlice.js)**
  - Manage user data and plan information
  - Actions: `fetchUserData`, `fetchUserPlan`, `upgradePlan`
  - Plan state includes: `type`, `exists`, `credits`

- **[client/src/redux/slices/aiSlice.js](client/src/redux/slices/aiSlice.js)**
  - Handle AI API calls
  - Actions: `generateBlogTitles`, `writeArticle`, `generateImages`, `removeBackground`, `removeObject`

- **[client/src/redux/slices/videoSlice.js](client/src/redux/slices/videoSlice.js)**
  - Handle video operations
  - Actions: `generateVideo`, `fetchVideos`

- **[client/src/redux/slices/packSlice.js](client/src/redux/slices/packSlice.js)**
  - Handle plan/pack operations
  - Actions: `fetchPacks`, `purchasePack`

- **[client/src/redux/slices/adminSlice.js](client/src/redux/slices/adminSlice.js)**
  - Handle admin operations
  - Actions: `fetchAdminData`, `fetchUsers`, `deleteUser`

---

### 4. **Frontend Updates**

#### [client/src/main.jsx](client/src/main.jsx)

- Removed Clerk provider
- Added Redux Provider with store
- No dependencies on Clerk environment variables

#### [client/src/App.jsx](client/src/App.jsx)

- Added token verification on app load with `verifyToken` action
- Added routes for `/login` and `/signup`
- Import dispatch from useRedux

#### [client/src/components/Plan.jsx](client/src/components/Plan.jsx)

- **Completely redesigned**
- Now displays plan options (Free, Pro, Premium)
- Shows current plan if user has active subscription
- Displays credits remaining
- Plan upgrade functionality connected to Redux
- Uses Redux state to manage plan data

#### New Pages Created:

- **[client/src/pages/Login.jsx](client/src/pages/Login.jsx)**
  - Login form with email and password
  - Connected to Redux `loginUser` action
  - Redirects to `/ai` on successful login

- **[client/src/pages/Signup.jsx](client/src/pages/Signup.jsx)**
  - Signup form with first name, last name, email, password
  - Password confirmation validation
  - Connected to Redux `signupUser` action
  - Redirects to `/ai` on successful signup

---

### 5. **Backend Updates**

#### [server/server.js](server/server.js)

- Removed `clerkMiddleware` and `requireAuth`
- Added Passport initialization
- Added `/api/auth` public routes (no auth required)
- Protected all other routes with Passport JWT authentication
- Added `attachPlanInfo` middleware to determine user's plan

#### [server/configs/passport.js](server/configs/passport.js) - NEW FILE

- Configured Local strategy for login (email + password)
- Configured JWT strategy for protecting API routes
- Helper functions: `generateToken`, `hashPassword`

#### [server/routes/authRoutes.js](server/routes/authRoutes.js) - NEW FILE

- **POST /api/auth/signup** - Create new account
- **POST /api/auth/login** - User login
- **POST /api/auth/logout** - User logout (stateless)
- **GET /api/auth/verify** - Verify JWT token

#### [server/middlewares/auth.js](server/middlewares/auth.js)

- Updated to use Passport JWT authentication
- `auth` middleware - verify JWT token
- `requirePremium` middleware - check if user has premium subscription
- `attachPlanInfo` middleware - attach plan info to request

#### Database Schema Update

##### [server/migrations/001_init_database.sql](server/migrations/001_init_database.sql)

Added new columns to users table:

- `password_hash` - Store hashed passwords (VARCHAR 255)
- `is_admin` - Admin status flag (BOOLEAN DEFAULT FALSE)

---

### 6. **Controller Updates**

All controllers updated to replace `req.auth()` with `req.user.id` from Passport JWT payload:

#### [server/controllers/userController.js](server/controllers/userController.js)

- Added `getUserProfile` - Fetch current user profile
- Added `getUserPlan` - Fetch user's plan information
- Updated all existing functions to use `req.user.id`
- Removed Clerk metadata operations

#### [server/controllers/aiController.js](server/controllers/aiController.js)

- Removed Clerk imports and user metadata updates
- Updated all functions to use `req.user.id`
- Removed free_usage tracking via Clerk metadata
- Changed plan validation to use `req.plan` from middleware

#### [server/controllers/videoController.js](server/controllers/videoController.js)

- Removed Clerk imports
- Updated all functions to use `req.user.id`
- Removed Clerk metadata operations for tracking premium usage

#### [server/controllers/packController.js](server/controllers/packController.js)

- Removed Clerk imports
- Updated admin status check to query database
- Updated all functions to use `req.user.id`

#### [server/controllers/adminController.js](server/controllers/adminController.js)

- Removed Clerk dependencies
- Updated `checkAdminStatus` to query `is_admin` from database
- All functions now use `req.user.id`
- Updated all SQL queries to use parameterized queries

#### [server/controllers/supportController.js](server/controllers/supportController.js)

- Removed Clerk imports
- Updated admin status checks to use database
- Updated all functions to use `req.user.id`
- Replaced template literal SQL with parameterized queries

---

### 7. **User Routes Update**

#### [server/routes/userRoutes.js](server/routes/userRoutes.js)

- Added `/profile` GET endpoint
- Added `/plan` GET endpoint
- All routes protected with auth middleware

---

## Redux DevTools Setup

Redux DevTools is configured in the store with:

- `trace: true` - Enable action tracing
- `traceLimit: 25` - Store 25 recent traces
- Full compatibility with Redux DevTools browser extension

To use:

1. Install Redux DevTools extension in browser
2. Open DevTools, go to Redux tab
3. Monitor all Redux state changes and actions

---

## API Documentation for Frontend

### Auth Endpoints (No authentication required)

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Protected Endpoints (Requires JWT token)

- `GET /api/user/profile` - Get user profile
- `GET /api/user/plan` - Get user's plan info
- `POST /api/user/upgrade-plan` - Upgrade user plan
- All AI, video, and admin endpoints require valid JWT

---

## Authentication Flow

### Login/Signup

1. User submits credentials
2. Redux action (`loginUser`/`signupUser`) sent to backend
3. Backend validates and creates user/login
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Redux state updated with user data

### Token Verification

1. On app load, `verifyToken` action dispatched
2. Frontend includes JWT in Authorization header
3. Backend verifies token with Passport JWT strategy
4. If valid, returns user data
5. If invalid, token cleared from localStorage

### API Requests

1. Redux thunk action includes `Authorization: Bearer {token}` header
2. Backend validates token with Passport middleware
3. Request processed with user context from `req.user`
4. Response returned with updated Redux state

---

## Environment Variables Needed

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key_here
PORT=3000
GEMINI_API_KEY=your_gemini_key
CLIPDROP_API_KEY=your_clipdrop_key
```

---

## Testing Checklist

- [ ] Signup creates new user with hashed password
- [ ] Login with correct credentials returns JWT
- [ ] Login with wrong password fails
- [ ] Token verification works on app load
- [ ] Redux DevTools shows all actions and state changes
- [ ] Plan component displays user's current plan
- [ ] Admin endpoints check `is_admin` flag
- [ ] Premium features blocked for free users
- [ ] All API calls include Authorization header
- [ ] Logout clears token from localStorage

---

## Migration Path

To complete the migration:

1. **Database**: Run migrations to add `password_hash` and `is_admin` columns to users table
2. **Environment**: Update `.env` files with JWT_SECRET and other credentials
3. **Admin User**: Manually set `is_admin = true` for admin users in database
4. **Testing**: Test all auth flows and API endpoints
5. **Deployment**: Deploy frontend and backend with new authentication

---

## Security Considerations

✅ **Implemented**:

- Passwords hashed with bcryptjs
- JWT tokens with expiration (7 days)
- Parameterized database queries (SQL injection prevention)
- Admin status stored in database (no client-side control)
- JWT verification on protected routes
- CORS enabled for frontend communication

⚠️ **Recommendations**:

- Use HTTPS in production
- Store JWT_SECRET securely (use environment variables)
- Implement refresh token mechanism
- Add rate limiting to auth endpoints
- Implement password reset functionality
- Add email verification for signup
- Monitor for suspicious authentication attempts

---

## Next Steps

1. Install dependencies: `npm install` in both client and server
2. Run database migrations
3. Set up environment variables
4. Test authentication flows
5. Deploy to production
