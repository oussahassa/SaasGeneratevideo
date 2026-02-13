# Testing Checklist & Validation Guide

## Pre-Testing Setup

- [ ] Database initialized with migration file
- [ ] `.env` files created with all required variables
- [ ] Dependencies installed: `npm install` in both `client/` and `server/`
- [ ] Backend server running on port 3000
- [ ] Frontend running on `http://localhost:5173`
- [ ] Redux DevTools browser extension installed

---

## 1. Authentication Flow Tests

### 1.1 Signup Process

- [ ] Navigate to `/signup`
- [ ] Form displays all 5 fields: First Name, Last Name, Email, Password, Confirm Password
- [ ] Submit with mismatched passwords → Error message displayed
- [ ] Submit with password < 6 characters → Validation error
- [ ] Submit with valid data
  - [ ] New user created in database
  - [ ] Password hashed (not stored as plain text)
  - [ ] JWT token returned and stored in localStorage
  - [ ] localStorage key `token` contains JWT value
  - [ ] Redirected to `/ai` page
  - [ ] Redux auth state shows: `isAuthenticated: true`, user data populated

### 1.2 Login Process

- [ ] Navigate to `/login`
- [ ] Form displays Email and Password fields
- [ ] Submit with invalid credentials → Error message "Invalid email or password"
- [ ] Submit with valid credentials
  - [ ] JWT token returned and stored in localStorage
  - [ ] Redirected to `/ai` page
  - [ ] Redux auth state shows: `isAuthenticated: true`
  - [ ] User data loaded correctly

### 1.3 Token Persistence

- [ ] Login successfully
- [ ] Refresh page (F5)
  - [ ] Page doesn't redirect to login
  - [ ] Redux auth state still shows `isAuthenticated: true`
  - [ ] User data still available
  - [ ] This indicates verifyToken action worked correctly
- [ ] Clear localStorage manually
- [ ] Refresh page
  - [ ] Should redirect to login page
  - [ ] Redux auth state shows `isAuthenticated: false`

### 1.4 Logout

- [ ] Login successfully
- [ ] Click logout button
  - [ ] localStorage cleared (token removed)
  - [ ] Redux auth state: `isAuthenticated: false`
  - [ ] Redirected to home page
  - [ ] Cannot access protected routes

---

## 2. Plan Component Tests

### 2.1 Initial Plan Load

- [ ] Login successfully
- [ ] Navigate to `/plan`
- [ ] Redux action `fetchUserPlan` dispatched
- [ ] Plan type displays (Free/Pro/Premium)
- [ ] `plan.exists` boolean determines display:
  - [ ] If `true`: Show "Current Plan: [Type]"
  - [ ] If `false`: Show "No active plan"
- [ ] Credits display correctly

### 2.2 Plan Upgrade

- [ ] Currently on Free plan
  - [ ] Pro and Premium upgrade buttons enabled
  - [ ] Free button disabled or grayed out
- [ ] Click "Upgrade to Pro"
  - [ ] Redux action `upgradePlan('pro')` dispatches
  - [ ] Success toast notification appears
  - [ ] Plan type updates to "premium"
  - [ ] Database shows updated subscription
- [ ] Navigate away and back to `/plan`
  - [ ] Plan still shows upgraded type
  - [ ] Persistence works correctly

### 2.3 Plan Features Display

- [ ] Free plan shows features: [list from component]
- [ ] Pro plan shows features: [list from component]
- [ ] Premium plan shows features: [list from component]
- [ ] Price displays correctly for each: $0 / $9.99 / $19.99

---

## 3. Redux DevTools Tests

### 3.1 DevTools Integration

- [ ] Open Redux DevTools (browser extension)
- [ ] Perform login
  - [ ] See `auth/loginUser/fulfilled` action
  - [ ] State shows auth payload with token
- [ ] Perform plan fetch
  - [ ] See `user/fetchUserPlan/fulfilled` action
  - [ ] State shows plan data

### 3.2 Action History

- [ ] Redux DevTools shows complete action history
- [ ] Each action has timestamp
- [ ] Can time-travel between states
- [ ] Trace support enabled (shows where action came from)
- [ ] State diffs visible between actions

---

## 4. Protected Routes Tests

### 4.1 API Protection

- [ ] Without token: Call `/api/ai/generateBlogTitles` (tools like Postman)
  - [ ] Returns 401 Unauthorized
  - [ ] No data returned
- [ ] With valid token: Same request with `Authorization: Bearer {token}`
  - [ ] Returns 200 OK
  - [ ] Data returned successfully
- [ ] With expired token: Use token with modified expiry
  - [ ] Returns 401 Unauthorized
  - [ ] User should be logged out

### 4.2 Route Access Control

- [ ] Not logged in: Try accessing `/ai`, `/video`, `/dashboard`
  - [ ] All blocked, redirect to login
- [ ] Logged in: Can access `/ai`, `/video`, etc.
  - [ ] Pages load correctly
  - [ ] Data fetches work

---

## 5. Premium Features Tests

### 5.1 Premium-Only Routes

- [ ] On Free plan: Try accessing premium features
  - [ ] Should return 403 Forbidden
  - [ ] Error message: "Premium subscription required"
- [ ] On Premium plan: Access premium features
  - [ ] All resources available
  - [ ] No restrictions

### 5.2 Middleware Chain

- [ ] Login → Plan attached to request
- [ ] Each request validated: JWT → User data → Plan status
- [ ] middleware flow: `auth` → `attachPlanInfo` → controller

---

## 6. Database Tests

### 6.1 User Table

- [ ] Users table has columns:
  - [ ] `id` (UUID)
  - [ ] `email` (VARCHAR, unique)
  - [ ] `password_hash` (VARCHAR, not null)
  - [ ] `first_name` (VARCHAR)
  - [ ] `last_name` (VARCHAR)
  - [ ] `is_admin` (BOOLEAN, default false)
  - [ ] `created_at` (TIMESTAMP)

### 6.2 Password Hashing

- [ ] Query user from database with new signup user
- [ ] `password_hash` field contains hash (not plain password)
- [ ] Hash starts with `$2a$` or `$2b$` (bcrypt format)
- [ ] Hash length ~60 characters

### 6.3 Admin Status

- [ ] New user: `is_admin` = false
- [ ] Manually set `is_admin` = true for test user
- [ ] Login with that user
- [ ] Access `/api/admin/*` endpoints → Success
- [ ] Set `is_admin` = false
- [ ] Try access `/api/admin/*` → 403 Forbidden

---

## 7. Error Handling Tests

### 7.1 Invalid Input

- [ ] Signup with existing email → Error: "Email already registered"
- [ ] Login with non-existent email → Error: "Invalid email or password"
- [ ] Submit form with empty fields → Validation error
- [ ] All errors displayed with toast notification to user

### 7.2 Server Errors

- [ ] Stop backend server
- [ ] Try to fetch data in frontend
  - [ ] Redux loading state shows `isLoading: true`
  - [ ] After timeout, error state shows error message
  - [ ] Error toast displays to user
  - [ ] UI doesn't crash

### 7.3 Network Issues

- [ ] Use browser DevTools to throttle network
- [ ] Perform login on slow network
  - [ ] Button shows loading state
  - [ ] Request completes successfully
  - [ ] No race conditions

---

## 8. State Management Tests

### 8.1 Redux Slices

- [ ] Open Redux DevTools
- [ ] Check `auth` slice has:
  - [ ] `user`, `token`, `isAuthenticated`, `isLoading`, `error`, `success`
- [ ] Check `user` slice has:
  - [ ] `userData`, `plan`, `isLoading`, `error`, `success`
- [ ] Check `ai`, `video`, `pack`, `admin` slices all present

### 8.2 State Consistency

- [ ] Make API call that updates multiple slices
- [ ] Verify all relevant slices update together
- [ ] No orphaned/stale data in Redux

### 8.3 Local Storage Persistence

- [ ] Login successfully
- [ ] Check localStorage: `token` key contains JWT
- [ ] Optional: Check `persist:root` key (redux-persist)
- [ ] Refresh page → State restored from localStorage
- [ ] Logout → localStorage cleaned up

---

## 9. Form Validation Tests

### 9.1 Login Form

- [ ] Empty email → Error: "Email is required"
- [ ] Invalid email format → Error: "Invalid email"
- [ ] Empty password → Error: "Password is required"
- [ ] All valid → Submit enabled

### 9.2 Signup Form

- [ ] Empty first name → Error
- [ ] Empty last name → Error
- [ ] Empty email → Error
- [ ] Invalid email → Error
- [ ] Empty password → Error
- [ ] Empty confirm password → Error
- [ ] Password < 6 chars → Error: "Password must be at least 6 characters"
- [ ] Passwords don't match → Error: "Passwords do not match"
- [ ] All valid → Submit enabled

---

## 10. Performance Tests

### 10.1 Redux Actions

- [ ] Login action completes in < 2 seconds
- [ ] Plan fetch completes in < 2 seconds
- [ ] AI operations show loading state during execution
- [ ] No UI freezing

### 10.2 DevTools Performance

- [ ] Redux DevTools doesn't slow down app
- [ ] Action history maintains 25 most recent actions
- [ ] No memory leaks from maintaining history

---

## 11. Cross-Browser Tests

- [ ] Chrome/Chromium
  - [ ] All features work
  - [ ] Redux DevTools extension works
- [ ] Firefox
  - [ ] All features work
  - [ ] Responsive design works
- [ ] Safari/Edge
  - [ ] localStorage works correctly
  - [ ] JWT token stored and retrieved

---

## 12. Mobile/Responsive Tests

- [ ] Login page responsive on mobile
- [ ] Plan component displays correctly on mobile
- [ ] All buttons clickable on touch devices
- [ ] Form fields properly sized

---

## API Endpoint Testing (with curl/Postman)

### Signup Endpoint

```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

# Expected: 201 Created
# Response: { token: "JWT_TOKEN", user: {...} }
```

### Login Endpoint

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Expected: 200 OK
# Response: { token: "JWT_TOKEN", user: {...} }
```

### Verify Endpoint

```bash
GET http://localhost:3000/api/auth/verify
Authorization: Bearer JWT_TOKEN

# Expected: 200 OK
# Response: { valid: true, user: {...} }
```

### Protected Route (with token)

```bash
POST http://localhost:3000/api/ai/generateBlogTitles
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{ "topic": "AI" }

# Expected: 200 OK
# Response: { success: true, data: {...} }
```

### Protected Route (without token)

```bash
POST http://localhost:3000/api/ai/generateBlogTitles
Content-Type: application/json

{ "topic": "AI" }

# Expected: 401 Unauthorized
# Response: { message: "Unauthorized" }
```

---

## Sign-Off Checklist

Once all tests pass, fill this out:

- [ ] All 12 test categories completed successfully
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Redux DevTools working correctly
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Can deploy to production

**Tested By**: ******\_\_\_******  
**Date**: ******\_\_\_******  
**Notes**: ******\_\_\_******

---

## Troubleshooting Guide

**Issue**: Local token not persisting after refresh
**Solution**: Check `localStorage.setItem('token', ...)` in authSlice

**Issue**: Redux DevTools not showing actions
**Solution**: Check DevTools extension installed and enabled; refresh page

**Issue**: 401 Unauthorized on protected routes
**Solution**: Verify JWT_SECRET matches between signup/login and API verification

**Issue**: Password not hashing
**Solution**: Check bcryptjs dependency installed; verify hashPassword function called

**Issue**: Plan not loading
**Solution**: Check `isAuthenticated` is true; verify /api/user/plan endpoint returns data

**Issue**: Redirect to login after refresh
**Solution**: verifyToken action failed; check token validity and JWT_SECRET
