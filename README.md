# NexAI – AI-Powered Content & Video Generation Platform

An intelligent, fully-featured AI SaaS platform designed to enhance productivity through content generation, video creation, image manipulation, and comprehensive admin management. Built with modern, scalable tech stack.

🔗 **Live Demo:** https://nexai-saas.vercel.app/

![NexAI Platform](https://res.cloudinary.com/dxzut3mlw/image/upload/v1769580509/landing_page_phjdfy.png)

---

## ✨ Core Features

### 📝 Content Generation

- ✍️ **AI Article Writer** - Generate full-length articles with AI
- 🏷️ **Blog Title Generator** - Creative title suggestions
- 📹 **Video Script Generation** - AI-powered video scripts

### 🖼️ Image & Media Tools

- 🖼️ **AI Image Generation** - Create images from text prompts
- 🧽 **Background Removal** - Remove image backgrounds instantly
- ✂️ **Object Removal** - Erase unwanted objects from images

### 🎥 Video Features

- 📹 **Video Generation** - Create videos from scripts
- 📱 **Social Media Sharing** - Share to Instagram, TikTok, Facebook
- 📊 **Video Analytics** - Track video performance

### 💼 Business Management

- 💎 **Dynamic Subscription Packs** - Flexible pricing plans
- 📊 **User Dashboard** - Track creation history and usage
- ❓ **FAQ System** - Self-service knowledge base
- 🛟 **Support & Complaints** - Issue tracking and resolution
- 👥 **Community Section** - Share and explore creations
- 🔐 **Admin Dashboard** - Full platform management

### 🆓 Plan Support

- **Free Plan** - 10 creations/month
- **Premium Plan** - Unlimited creations + advanced features

---

## 🛠️ Tech Stack (PERN)

### Frontend

- React 19 + Vite
- Tailwind CSS 4
- Lucide Icons
- React Router 7
- Axios
- React Hot Toast

### Backend

- Node.js + Express 5
- PostgreSQL (Neon)
- OpenAI/Gemini API
- Cloudinary
- Clerk Authentication
- FFmpeg (video processing)
- Sharp (image processing)

### Services

- **Clerk** - Authentication
- **Neon** - Database hosting
- **Cloudinary** - Media storage
- **GeminiAPI** - AI content
- **ClipDrop** - Image generation

---

## 📋 Features Breakdown

### Content Management

| Feature            | Free  | Premium   |
| ------------------ | ----- | --------- |
| Article Writing    | 10/mo | Unlimited |
| Blog Titles        | 10/mo | Unlimited |
| Images             | ❌    | Unlimited |
| Video Generation   | ❌    | Unlimited |
| Background Removal | ❌    | Unlimited |
| Object Removal     | ❌    | Unlimited |

### Admin Panel

- 📊 Real-time statistics dashboard
- 👥 User management (block, delete, view details)
- ❓ FAQ management (create, edit, delete)
- 🛟 Complaint management with status tracking
- 📈 Feature usage analytics
- 📅 Daily user activity reports

### Social Media Integration

- 📲 Share videos to Instagram
- 🎵 Share videos to TikTok
- 📘 Share videos to Facebook
- 📝 Caption customization
- 📊 Share statistics

---

## 🔐 Security Features

- **Clerk Authentication** - Secure user authentication
- **Protected Routes** - Role-based access control
- **Admin Verification** - Metadata-based admin checking
- **User Privacy** - Secure data handling
- **Rate Limiting** - API protection (ready to implement)

---

## 🗄️ Database Schema

PostgreSQL database with optimized tables:

```sql
-- Core Tables
users                   -- User profiles
creations              -- Generated content (articles, images)
videos                 -- Generated videos
video_shares           -- Social media shares tracking

-- Management Tables
packs                  -- Subscription plans
faqs                   -- FAQ entries
complaints             -- User issues/complaints
user_subscriptions     -- Subscription records
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- PostgreSQL (Neon DB)
- Clerk account for authentication

### Installation

#### Automatic Setup (Windows)

```bash
setup.bat
```

#### Automatic Setup (Linux/Mac)

```bash
bash setup.sh
```

#### Manual Setup

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Configuration

1. **Create `.env` file** in `server/` directory:

```env
DATABASE_URL=your_neon_db_url
GEMINI_API_KEY=your_gemini_key
CLIPDROP_API_KEY=your_clipdrop_key
CLERK_SECRET_KEY=your_clerk_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=3000
```

2. **Run Database Migrations**:
   Execute the SQL file at `server/migrations/001_init_database.sql` in your Neon DB

3. **Set Admin User** (via Clerk Dashboard):
   - Edit user publicMetadata
   - Add: `{ "isAdmin": true }`

### Development

**Terminal 1 - Backend:**

```bash
cd server
npm run server
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

Backend runs on: `http://localhost:5000`
Frontend runs on: `http://localhost:5173`

---

## 📚 API Endpoints

### User Endpoints

```
GET    /api/user/get-user-creations
GET    /api/user/get-published-creations
POST   /api/user/toggle-like-creation
```

### AI/Content Endpoints

```
POST   /api/ai/generate-article
POST   /api/ai/generate-blog-title
POST   /api/ai/generate-image
POST   /api/ai/remove-image-background
POST   /api/ai/remove-image-object
```

### Pack Management

```
GET    /api/packs/get-all-packs
GET    /api/packs/get-pack/:id
POST   /api/packs/create-pack (Admin)
PUT    /api/packs/update-pack/:id (Admin)
DELETE /api/packs/delete-pack/:id (Admin)
```

### Video Features

```
POST   /api/videos/generate-script
POST   /api/videos/generate-from-assets
POST   /api/videos/share-to-social
GET    /api/videos/get-videos
GET    /api/videos/get-stats
DELETE /api/videos/delete-video/:id
```

### Support System

```
GET    /api/support/get-faqs
POST   /api/support/create-complaint
GET    /api/support/get-my-complaints
GET    /api/support/get-all-complaints (Admin)
PUT    /api/support/update-complaint/:id (Admin)
```

### Admin Dashboard

```
GET    /api/admin/dashboard-stats
GET    /api/admin/get-all-users
PUT    /api/admin/toggle-user-status/:id
DELETE /api/admin/delete-user/:id
GET    /api/admin/daily-stats
GET    /api/admin/feature-usage-stats
```

---

## 📄 Pages & Routes

### Public Pages

- `/` - Landing page
- `/plan` - Pricing & plans
- `/faq` - FAQ section

### User Pages

- `/write-article` - Article generator
- `/blog-titles` - Title generator
- `/generate-images` - Image creator
- `/remove-background` - BG remover
- `/remove-object` - Object remover
- `/generate-videos` - Video generator
- `/dashboard` - User dashboard
- `/community` - Community hub
- `/support` - Support & complaints

### Admin Pages

- `/admin-dashboard` - Admin panel (restricted)

---

## 🔄 Workflow Examples

### Create and Share Video

1. Visit `/generate-videos`
2. Enter topic and select duration
3. AI generates video script
4. Share to Instagram/TikTok/Facebook
5. View statistics

### Submit Complaint

1. Visit `/support`
2. Fill complaint form
3. Submit issue
4. Track status in "My Complaints"
5. Receive admin response

### Manage Users (Admin)

1. Visit `/admin-dashboard`
2. Go to "Users" tab
3. View all users with pagination
4. Block/delete users as needed
5. View user details and statistics

---

## 📊 Project Structure

```
NexAI/
├── server/
│   ├── controllers/       # Request handlers
│   ├── routes/           # API endpoints
│   ├── configs/          # Configuration files
│   ├── middlewares/      # Express middlewares
│   ├── migrations/       # Database schemas
│   └── server.js         # Main server file
├── client/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── config/       # Client configuration
│   │   └── assets/       # Static assets
│   └── vite.config.js    # Vite configuration
├── docs/                 # Documentation
└── README.md            # This file
```

---

## 🎨 UI/UX Design

- **Modern Dark Theme** - Gradient backgrounds
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG compliant
- **Loading States** - Smooth transitions
- **Error Handling** - User-friendly messages
- **Toast Notifications** - Real-time feedback

---

## 📋 Documentation

- **IMPLEMENTATION_GUIDE.md** - Complete feature documentation
- **SETUP_CHECKLIST.md** - Setup instructions & next steps
- **PROJECT_FILES.md** - File structure summary

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
# Deploy build/ folder to Vercel
```

### Backend (Any Node Host)

```bash
cd server
NODE_ENV=production npm start
```

---

## 🔄 Future Enhancements

- **Subscriptions** - Plan details and billing info

---

## ⚙️ Environment Variables

### Frontend (`client/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=http://localhost:5000
```

### Backend (`server/.env`)

```env
PORT=5000

# Database (Neon)
DATABASE_URL=your_neon_postgresql_url

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# GeminiAPI (Articles & Blog Titles)
GEMINI_API_KEY=your_gemini_api_key

# ClipDrop (Background & Object Removal)
CLIPDROP_API_KEY=your_clipdrop_api_key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## ▶️ Run Locally

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- PostgreSQL database (Neon account)
- API keys for Clerk, OpenAI, ClipDrop, and Cloudinary

### 1️. Clone the Repository

```bash
git clone https://github.com/jayvar03/nexai.git
cd nexai
```

### 2️. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3️. Set Up Environment Variables

- Create `.env` files in both `client/` and `server/` directories
- Copy the environment variables from the sections above
- Replace placeholder values with your actual API keys

### 4️. Start the Application

```bash
# Start backend (from server/ directory)
cd server
npm run server
# Backend runs on http://localhost:5000

# In a new terminal, start frontend (from client/ directory)
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Visit `http://localhost:5173` to see the application running!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the project's code style.

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

<div align="center">

**[⬆ back to top](#nexai-)**

Made with 💙 by oussama

</div>
