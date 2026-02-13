import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();

  const isAdmin = user?.publicMetadata?.isAdmin;

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
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-50">
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
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="hidden md:flex">
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <UserButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
