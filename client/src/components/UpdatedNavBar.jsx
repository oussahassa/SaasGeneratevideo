import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice';

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.is_admin;

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/plan', label: 'Plans' },
    { path: '/write-article', label: 'Write Article' },
    { path: '/blog-titles', label: 'Blog Titles' },
    { path: '/generate-images', label: 'Generate Images' },
    { path: '/remove-background', label: 'Remove BG' },
    { path: '/remove-object', label: 'Remove Object' },
    { path: '/generate-videos', label: 'Videos' },
    { path: '/faq', label: 'FAQ' },
    { path: '/support', label: 'Support' },
    ...(isAdmin ? [{ path: '/admin-dashboard', label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400">
            NexAI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
                    : 'text-slate-300 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-slate-300 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-slate-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition">Login</Link>
              <Link to="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg transition">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
    
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
                    : 'text-slate-300 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 mt-2 flex items-center justify-between">
                <span className="text-slate-300 text-sm">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className='border-t border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 mt-2 py-2 space-y-2'>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-slate-300 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded-lg">Login</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg">Sign Up</Link>
              </div>
            )}
            </div>
        )}
        
        </div>
    </nav>
  );
}