// Configuration des routes de l'application
// À intégrer dans votre App.jsx

export const routes = [
  // Pages publiques
  { path: '/', element: 'Home', component: 'Home' },
  { path: '/plan', element: 'Plans', component: 'Plan' },
  { path: '/faq', element: 'FAQ', component: 'FAQ' },
  { path: '/support', element: 'Support', component: 'Support' },

  // Pages utilisateur
  { path: '/write-article', element: 'Write Article', component: 'WriteArticle', protected: true },
  { path: '/blog-titles', element: 'Blog Titles', component: 'BlogTitles', protected: true },
  { path: '/generate-images', element: 'Generate Images', component: 'GenerateImages', protected: true },
  { path: '/remove-background', element: 'Remove Background', component: 'RemoveBackground', protected: true },
  { path: '/remove-object', element: 'Remove Object', component: 'RemoveObject', protected: true },
  { path: '/generate-videos', element: 'Generate Videos', component: 'GenerateVideos', protected: true },
  { path: '/dashboard', element: 'Dashboard', component: 'Dashboard', protected: true },
  { path: '/community', element: 'Community', component: 'Community', protected: true },

  // Pages admin
  { path: '/admin-dashboard', element: 'Admin Dashboard', component: 'AdminDashboard', protected: true, admin: true },
];

// Composants et pages à importer
export const componentMap = {
  Home: () => import('../pages/Home').then(m => m.default),
  Plan: () => import('../pages/Plan').then(m => m.default),
  FAQ: () => import('../pages/FAQ').then(m => m.default),
  Support: () => import('../pages/Support').then(m => m.default),
  WriteArticle: () => import('../pages/WriteArticle').then(m => m.default),
  BlogTitles: () => import('../pages/BlogTitles').then(m => m.default),
  GenerateImages: () => import('../pages/GenerateImages').then(m => m.default),
  RemoveBackground: () => import('../pages/RemoveBackground').then(m => m.default),
  RemoveObject: () => import('../pages/RemoveObject').then(m => m.default),
  GenerateVideos: () => import('../pages/GenerateVideos').then(m => m.default),
  Dashboard: () => import('../pages/Dashboard').then(m => m.default),
  Community: () => import('../pages/Community').then(m => m.default),
  AdminDashboard: () => import('../pages/AdminDashboard').then(m => m.default),
};
