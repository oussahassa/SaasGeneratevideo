# Troubleshooting Guide & Common Issues

## Database Connection Issues

### Issue: "ECONNREFUSED - Connection refused"

**Symptoms**: Backend won't start, Error: `connect ECONNREFUSED`  
**Cause**: PostgreSQL database not running or DATABASE_URL incorrect  
**Solution**:

1. Verify PostgreSQL running: `psql -U postgres -c "SELECT version();"`
2. Check DATABASE_URL format: `postgresql://user:password@host:port/dbname`
3. If using Neon (serverless), verify URL hasn't expired
4. Test connection: `psql "<your_database_url>"`

### Issue: "relation 'users' does not exist"

**Symptoms**: Error when trying to INSERT/SELECT from users table  
**Cause**: Migration not run  
**Solution**:

1. Connect to database: `psql "<your_database_url>"`
2. Run migration: `\i server/migrations/001_init_database.sql`
3. Verify tables: `\dt`

---

## Authentication Issues

### Issue: Signup succeeds but login fails with "Invalid email or password"

**Symptoms**: Can register but can't log in with same credentials  
**Cause**: Password hashing failed or password_hash column missing  
**Solution**:

1. Check database column exists: `SELECT column_name FROM information_schema.columns WHERE table_name='users';`
2. Verify password_hash is VARCHAR(255)
3. Check bcryptjs installed: `npm list bcryptjs` in server/
4. Restart server and try signup again

### Issue: "Invalid token" error on protected routes

**Symptoms**: JWT token received but protected routes return 401  
**Cause**: JWT_SECRET mismatch or token format incorrect  
**Solution**:

1. Verify JWT_SECRET same in both `.env`: `echo $JWT_SECRET`
2. Check Authorization header format: `Authorization: Bearer <token>`
3. Ensure token not expired: `jwt decode <token>` (use jwt.io)
4. Verify token in Authorization header uses correct case (Bearer, not bearer)

### Issue: Token verification fails after deploy

**Symptoms**: Works locally but fails in production  
**Cause**: Different JWT_SECRET values  
**Solution**:

1. Set same JWT_SECRET in production .env
2. If changing SECRET, all existing tokens invalid (users need to re-login)
3. Use strong random secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Issue: "Unauthorized access" on admin routes

**Symptoms**: Admin user gets 403 error  
**Cause**: is_admin flag not set in database  
**Solution**:

1. Connect to database directly
2. Check user: `SELECT email, is_admin FROM users WHERE email = 'admin@example.com';`
3. Set admin flag: `UPDATE users SET is_admin = true WHERE email = 'admin@example.com';`
4. Logout and login again to refresh session

---

## Redux & State Management Issues

### Issue: Redux DevTools not showing actions

**Symptoms**: DevTools tab empty or doesn't exist  
**Cause**: Extension not installed or store not configured correctly  
**Solution**:

1. Install Redux DevTools extension from Chrome Web Store
2. Check store.js has devTools config:

```javascript
devTools: {
  trace: true,
  traceLimit: 25,
}
```

3. Refresh page after installing extension
4. Make a Redux action and check if visible

### Issue: State not persisting after refresh

**Symptoms**: Redux state resets to initial state on refresh  
**Cause**: redux-persist not initialized or localStorage disabled  
**Solution**:

1. Check localStorage enabled: Open DevTools → Application → Local Storage
2. Verify redux-persist imported: `import persistor from './redux/persistor'`
3. Check PersistGate wrapping app in main.jsx
4. Try clearing cache: Ctrl+Shift+Delete
5. Check for localStorage errors in console

### Issue: "localStorage is undefined"

**Symptoms**: Error during build or initial load  
**Cause**: Code trying to access localStorage on server or during SSR  
**Solution**:

1. Wrap localStorage calls in: `if (typeof window !== 'undefined') { ... }`
2. Only use localStorage in useEffect, not during render
3. Check environment: Is this running in browser or Node.js?

---

## Frontend Build Issues

### Issue: "Cannot find module" error during build

**Symptoms**: Build fails with module not found  
**Cause**: Missing dependency  
**Solution**:

1. Install missing package: `npm install <package_name>`
2. Check imports path is correct (case-sensitive on Linux/Mac)
3. Clear node_modules: `rm -rf node_modules; npm install`
4. Check package.json has dependency listed

### Issue: "VITE_API_URL is undefined"

**Symptoms**: API calls to `undefined/api/auth/login`  
**Cause**: Environment variable not set  
**Solution**:

1. Create `.env` file in `client/`:

```
VITE_API_URL=http://localhost:3000/api
```

2. Restart dev server: `npm run dev`
3. Verify accessible: `console.log(import.meta.env.VITE_API_URL)`

### Issue: CORS errors: "Access to XMLHttpRequest blocked"

**Symptoms**: API calls fail with CORS error  
**Cause**: Backend CORS not configured or wrong origin  
**Solution**:

1. Check server.js has CORS enabled:

```javascript
app.use(cors());
```

2. Verify frontend URL allowed: `cors({ origin: 'http://localhost:5173' })`
3. Check backend running on port 3000
4. Ensure API_URL in frontend matches backend: `http://localhost:3000/api`

---

## Login/Signup Form Issues

### Issue: Form submission hangs, no response

**Symptoms**: Click submit, button state changes but nothing happens  
**Cause**: API not responding or network timeout  
**Solution**:

1. Verify backend running: `curl http://localhost:3000/api/health`
2. Check network tab in DevTools (F12 → Network → Fetch/XHR)
3. Set timeout: `axios.defaults.timeout = 10000` (10 seconds)
4. Check API_URL matches backend: `console.log(import.meta.env.VITE_API_URL)`

### Issue: Password validation too strict or too lenient

**Symptoms**: Valid passwords rejected or invalid passwords accepted  
**Cause**: Validation pattern incorrect  
**Solution**:

1. Check Signup.jsx validation regex/logic
2. Verify password minimum 6 characters
3. Ensure confirm password comparison works
4. Test with various passwords: "123456", "Pass@123", etc.

### Issue: Cannot read property of undefined in form

**Symptoms**: Console error during form input  
**Cause**: Redux store not initialized properly  
**Solution**:

1. Check Redux Provider wraps app in main.jsx
2. Verify auth slice exported from store
3. Check useSelector hook used correctly: `useSelector(state => state.auth)`
4. Ensure no typos in state path

---

## API Call Issues

### Issue: "Cannot read property 'data' of undefined"

**Symptoms**: Error when processing API response  
**Cause**: API returned unexpected structure  
**Solution**:

1. Log response: console.log(response) before accessing
2. Check API response structure matches expectation
3. Use optional chaining: `response?.data?.token ?? null`
4. Test endpoint with Postman to see actual response

### Issue: Multipart form data not working

**Symptoms**: Image upload fails  
**Cause**: Content-Type or FormData construction incorrect  
**Solution**:

```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("prompt", prompt);

axios.post(url, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

Don't manually set Content-Type for FormData; browser will

### Issue: Axios Authorization header not sent

**Symptoms**: API returns 401 even with valid token  
**Cause**: Authorization header not added or incorrect format  
**Solution**:

1. Check every axios call includes:

```javascript
headers: {
  Authorization: `Bearer ${token}`;
}
```

2. Create axios instance with interceptor:

```javascript
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Navigation/Routing Issues

### Issue: Page doesn't redirect after login

**Symptoms**: Login succeeds but stays on /login page  
**Cause**: useNavigate not called or conditions not met  
**Solution**:

1. Check useNavigate hook imported: `import { useNavigate } from 'react-router-dom'`
2. Verify navigation called: `navigate('/ai')`
3. Check auth state updated before navigation
4. Add delay if needed: `setTimeout(() => navigate('/ai'), 500)`

### Issue: Can access protected pages without login

**Symptoms**: Anyone can visit /dashboard without token  
**Cause**: Protected route wrapper not implemented  
**Solution**:

1. Create PrivateRoute component:

```javascript
function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

2. Wrap protected routes: `<PrivateRoute><Dashboard /></PrivateRoute>`

---

## Plan Component Issues

### Issue: Plan not loading - always shows loading state

**Symptoms**: Plan component shows spinner indefinitely  
**Cause**: fetchUserPlan action stuck or failing silently  
**Solution**:

1. Check Redux DevTools for action status
2. Verify `/api/user/plan` endpoint exists on backend
3. Test endpoint: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/user/plan`
4. Check error in Redux state: `user.error` in DevTools

### Issue: Upgrade button doesn't work

**Symptoms**: Click upgrade, nothing happens  
**Cause**: upgradePlan action not dispatching or failing  
**Solution**:

1. Check Redux DevTools for `upgradePlan` action
2. Look at network tab to see if request sent
3. Verify endpoint: POST `/api/user/plan/upgrade`
4. Check error notification for error message

### Issue: Plan type shows "undefined"

**Symptoms**: Instead of "Free" or "Premium", shows undefined  
**Cause**: plan data not loaded or wrong key accessed  
**Solution**:

1. Check Redux state path: `state.user.plan.type` (not `state.user.type`)
2. Add fallback: `plan?.type ?? 'free'`
3. Verify plan endpoint returns: `{ type: 'free', exists: true, credits: 100 }`

---

## Performance Issues

### Issue: App feels slow after login

**Symptoms**: Redux actions take >2 seconds  
**Cause**: Multiple async operations or large state  
**Solution**:

1. Use Redux DevTools to measure action duration
2. Only fetch necessary data
3. Implement request debouncing for filters
4. Check for N+1 query problems in backend

### Issue: Redux DevTools shows 1000+ actions

**Symptoms**: DevTools slow, time-travel doesn't work  
**Cause**: Action history too large (default limit is 25)  
**Solution**:

1. Check store.js traceLimit: should be 25 (configured)
2. DevTools automatically clears old actions
3. Clear history: Redux DevTools action → Clear history

---

## Environment Variable Issues

### Issue: "Cannot read property of undefined" for API_URL

**Symptoms**: `import.meta.env.VITE_API_URL` is undefined  
**Cause**: .env file missing or wrong format  
**Solution**:

1. Create `.env` file in `client/` directory
2. Use format: `VITE_API_URL=http://localhost:3000/api`
3. Restart dev server: `npm run dev`
4. Verify: `console.log(import.meta.env.VITE_API_URL)`

### Issue: Backend .env variables not loading

**Symptoms**: process.env.JWT_SECRET is undefined  
**Cause**: dotenv not loaded or .env missing  
**Solution**:

1. Check server.js imports: `require('dotenv').config()`
2. Create `.env` in `server/` directory
3. Set variables:

```
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://...
PORT=3000
```

4. Restart server

---

## SSL/HTTPS Issues

### Issue: "Mixed content" error in production

**Symptoms**: CORS errors or blocked resources  
**Cause**: Frontend https, backend http  
**Solution**:

1. Use https for both frontend and backend
2. Or set frontend to http if backend is http
3. Check API_URL in production env: must match backend

---

## Debugging Techniques

### Check Redux State

```javascript
// In browser console:
import { store } from "./redux/store";
console.log(store.getState());
```

### Check LocalStorage

```javascript
// In browser console:
console.log(localStorage.getItem("token"));
console.log(JSON.parse(localStorage.getItem("persist:root")));
```

### Check Network Requests

1. Open DevTools: F12
2. Go to Network tab
3. Perform action
4. Click request and check:
   - Request Headers (Authorization present?)
   - Response Headers (200 OK?)
   - Response Body (data structure correct?)

### Check Backend Logs

```bash
# In server terminal:
npm run dev  # Should show all requests and errors
```

### Decode JWT Token

```javascript
// In browser console:
const token = localStorage.getItem("token");
console.log(JSON.parse(atob(token.split(".")[1])));
```

### Test API Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Getting Help

When reporting issues, include:

1. Error message (exact text from console or terminal)
2. Browser DevTools console errors screenshot
3. Redux state snapshot (Redux DevTools → Export)
4. Network tab showing failed request
5. Steps to reproduce the issue
6. OS and browser version

---

Last Updated: After Auth Migration
For latest issues, check: [GitHub Issues](https://github.com/yourusername/NexAI/issues)
