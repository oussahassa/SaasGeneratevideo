# Quick Start Guide: NexAI with Passport & Redux

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Git

## Installation

### 1. Backend Setup

```bash
cd server
npm install
```

### 2. Frontend Setup

```bash
cd client
npm install
```

## Configuration

### 1. Backend Environment Variables

Create `.env` file in `server/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexai
JWT_SECRET=your_very_secure_secret_key_change_this_in_production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Frontend Environment Variables

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
createdb nexai
```

### 2. Run Migrations

Connect to your database and run the migration file:

```bash
psql nexai < server/migrations/001_init_database.sql
```

### 3. Create Admin User (Optional)

Connect to database and run:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

## Running the Application

### Start Backend

```bash
cd server
npm run server
```

The server will start on `http://localhost:3000`

### Start Frontend (New Terminal)

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing Authentication

### 1. Sign Up

- Go to `http://localhost:5173/signup`
- Fill in email, password, and name
- Click "Create Account"

### 2. Login

- Go to `http://localhost:5173/login`
- Enter credentials
- You'll be redirected to `/ai` dashboard

### 3. Redux DevTools

- Install Redux DevTools browser extension
- Open browser DevTools → Redux tab
- Monitor all state changes and actions

### 4. Plans

- Go to `/plan` page
- View available plans
- Click "Upgrade" to test plan upgrade (requires proper backend setup)

## API Testing

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

### Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
NexAI/
├── client/
│   ├── src/
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── userSlice.js
│   │   │       ├── aiSlice.js
│   │   │       ├── videoSlice.js
│   │   │       ├── packSlice.js
│   │   │       └── adminSlice.js
│   │   ├── pages/
│   │   │   ├── Login.jsx (NEW)
│   │   │   ├── Signup.jsx (NEW)
│   │   │   ├── Plan.jsx (UPDATED)
│   │   │   └── ...
│   │   ├── App.jsx (UPDATED)
│   │   └── main.jsx (UPDATED)
│   └── package.json (UPDATED)
├── server/
│   ├── configs/
│   │   ├── passport.js (NEW)
│   │   └── db.js
│   ├── routes/
│   │   ├── authRoutes.js (NEW)
│   │   └── ...
│   ├── controllers/
│   │   ├── userController.js (UPDATED)
│   │   ├── aiController.js (UPDATED)
│   │   ├── videoController.js (UPDATED)
│   │   ├── packController.js (UPDATED)
│   │   ├── adminController.js (UPDATED)
│   │   └── supportController.js (UPDATED)
│   ├── middlewares/
│   │   └── auth.js (UPDATED)
│   ├── migrations/
│   │   └── 001_init_database.sql (UPDATED)
│   ├── server.js (UPDATED)
│   └── package.json (UPDATED)
└── MIGRATION_SUMMARY.md (NEW)
```

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Database Connection Error

- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check database exists and is accessible

### JWT Token Invalid

- Clear localStorage and login again
- Check JWT_SECRET matches between requests
- Verify token hasn't expired (7 days)

### Redux DevTools Not Working

- Install Redux DevTools browser extension
- Ensure Redux store is properly configured
- Check Redux tab in DevTools

## Production Deployment

### Before Deploying:

1. **Security**
   - Change JWT_SECRET to strong random value
   - Use environment-specific .env files
   - Enable HTTPS
   - Add rate limiting

2. **Backend**

   ```bash
   npm run build
   npm start
   ```

3. **Frontend**

   ```bash
   npm run build
   # Deploy dist/ folder to hosting
   ```

4. **Database**
   - Use managed PostgreSQL service
   - Enable automatic backups
   - Use connection pooling

## Support & Documentation

- [Passport.js Documentation](http://www.passportjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux DevTools Guide](https://github.com/reduxjs/redux-devtools)

---

**Happy coding! 🚀**
