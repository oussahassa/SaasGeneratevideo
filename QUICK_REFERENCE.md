# Quick Reference Guide - NexAI Updates

## 🎯 What Was Changed?

### 1. **FAQ Navigation**

- FAQ link now visible in navbar for all users
- Accessible via `/faq` route
- Available in desktop and mobile menus

### 2. **Private Routes Protection**

```javascript
// Any route requiring login should be wrapped like this:
<PrivateRoute>
  <YourComponent />
</PrivateRoute>

// Any route requiring admin access should be wrapped like this:
<AdminRoute>
  <YourComponent />
</AdminRoute>
```

### 3. **Two Layouts**

- **Client Layout** (`/ai/*`) - For regular users with AI tools
- **Admin Layout** (`/admin-dashboard/*`) - For administrators with dark theme

### 4. **Admin Sidebar**

Automatically displayed in `/admin-dashboard/*` pages with options to manage:

- Users
- Plans
- Complaints/Reclamations
- FAQs
- Analytics

### 5. **Translations**

All pages and components have full translations in:

- English ✅
- French ✅
- Arabic ✅

---

## 📁 New Files

```
client/src/
├── components/
│   ├── PrivateRoute.jsx (NEW)
│   ├── AdminRoute.jsx (NEW)
│   └── AdminSidebar.jsx (NEW)
└── pages/admin/
    └── AdminLayout.jsx (NEW)
```

---

## 🔐 Route Security

| Route                | Public | Requires Auth | Requires Admin | Redirect     |
| -------------------- | ------ | ------------- | -------------- | ------------ |
| `/`                  | ✅     | ❌            | ❌             | -            |
| `/login`, `/signup`  | ✅     | ❌            | ❌             | -            |
| `/faq`, `/plan`      | ✅     | ❌            | ❌             | -            |
| `/ai/*`, `/support`  | ❌     | ✅            | ❌             | `/login`     |
| `/admin-dashboard/*` | ❌     | ✅            | ✅             | `/dashboard` |

---

## 🌐 Language Support

### Current Languages:

- **EN** - English (Default)
- **FR** - Français
- **AR** - العربية (Right-to-Left)

### Key Translations:

```
Common Keys:
- nav.faq = "FAQ" | "FAQ" | "الأسئلة الشائعة"
- admin.tabs.complaints = "Complaints" | "Réclamations" | "الشكاوى"
- admin.tabs.packs = "Plans" | "Plans" | "الخطط"
```

---

## 📊 Admin Dashboard Features

### Available Tabs in Admin Sidebar:

1. **Overview** - Platform statistics and metrics
2. **Users** - Manage users (block/unblock/delete)
3. **Plans** - Create/edit/delete subscription plans
4. **Complaints** - Manage user complaints with responses
5. **FAQs** - Create/edit/delete frequently asked questions
6. **Analytics** - View platform analytics

---

## 🛠️ How to Use Private Routes

### For Client Routes:

```jsx
<Route
  path="/ai"
  element={
    <PrivateRoute>
      <Layout />
    </PrivateRoute>
  }
>
  {/* Nested routes */}
</Route>
```

### For Admin Routes:

```jsx
<Route
  path="/admin-dashboard"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  {/* Nested admin routes */}
</Route>
```

---

## 🎨 Admin Dashboard Styling

- **Theme**: Dark mode (Tailwind CSS)
- **Colors**: Gray-900 background, Blue-600 to Purple-600 gradients
- **Responsive**: Full mobile support with hamburger menu
- **Icons**: Lucide React icons throughout

---

## 🔄 User Flow

### New User Path:

1. Land on `/` (Home)
2. Click "Get Started" → `/signup`
3. Verify email → `/verify-email`
4. Login → `/login`
5. Access dashboard → `/ai` (Protected)
6. Can view FAQ → `/faq` (Public)

### Admin Path:

1. Admin login → `/login`
2. Redirected to `/ai` (has auth)
3. Click admin link (if role = 'admin') → `/admin-dashboard` (Protected)
4. Access admin features through sidebar

---

## ⚙️ Configuration Requirements

### User Model Must Include:

```json
{
  "role": "admin" | "user"  // Required for AdminRoute
}
```

### Redux Store Must Include:

```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: {
      firstName: string,
      lastName: string,
      email: string,
      role: string,      // Important: "admin" or "user"
      profile_picture: string
    }
  }
}
```

---

## 📝 Common Tasks

### Adding a New Protected Route:

```jsx
<Route
  path="/new-protected-page"
  element={
    <PrivateRoute>
      <NewProtectedComponent />
    </PrivateRoute>
  }
/>
```

### Adding a New Admin Route:

```jsx
<Route path="/admin-dashboard/new-section" element={<NewAdminComponent />} />
// Automatically protected by parent AdminRoute wrapper
```

### Translating New Content:

1. Add key to `en.json`
2. Add same key with translation to `fr.json`
3. Add same key with translation to `ar.json`
4. Use: `const { t } = useTranslation(); t('key.subkey')`

---

## 🚀 Deployment Checklist

- [ ] User model includes `role` field
- [ ] Redux auth slice exports `verifyToken`
- [ ] i18n properly initialized
- [ ] All components imported correctly
- [ ] Routes in App.jsx properly structured
- [ ] Test all route protections
- [ ] Test language switching
- [ ] Build for production: `npm run build`

---

## 🐛 Troubleshooting

### Issue: Can't access admin dashboard

**Solution**: Ensure user has `role: "admin"` in database and redux state

### Issue: Private route redirects to login even after login

**Solution**: Check if `isAuthenticated` is true in redux store

### Issue: Translations not showing

**Solution**:

- Import useTranslation: `import { useTranslation } from 'react-i18next'`
- Use it: `const { t } = useTranslation()`
- Access: `t('namespace.key')`

### Issue: Admin sidebar not showing

**Solution**: Check if using AdminLayout component in parent route

---

## 📞 Support

For issues with:

- **Routes**: Check App.jsx route configuration
- **Translations**: Check i18n/locales/\*.json files
- **Admin features**: Check AdminDashboard component
- **Permissions**: Check user role in database

---

Last Updated: February 16, 2026
