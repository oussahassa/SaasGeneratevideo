import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  HelpCircle,
  BarChart3,
  LogOut,
  X
} from 'lucide-react'
import { logoutUser } from '../redux/slices/authSlice'

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { user } = useSelector(state => state.auth)

  const menuItemsByRole = {
    admin: [
      { icon: LayoutDashboard, label: t('admin.tabs.overview'), path: '/admin-dashboard' },
      { icon: Users, label: t('admin.tabs.users'), path: '/admin-dashboard/users' },
      { icon: Package, label: t('admin.tabs.packs'), path: '/admin-dashboard/packs' },
      { icon: MessageSquare, label: t('admin.tabs.complaints'), path: '/admin-dashboard/complaints' },
      { icon: HelpCircle, label: t('admin.tabs.faqs'), path: '/admin-dashboard/faqs' },
      { icon: BarChart3, label: t('admin.tabs.analytics'), path: '/admin-dashboard/analytics' },
    ],
    manager: [
      { icon: LayoutDashboard, label: t('admin.tabs.overview'), path: '/admin-dashboard' },
      { icon: Users, label: t('admin.tabs.users'), path: '/admin-dashboard/users' },
      { icon: MessageSquare, label: t('admin.tabs.complaints'), path: '/admin-dashboard/complaints' },
      { icon: BarChart3, label: t('admin.tabs.analytics'), path: '/admin-dashboard/analytics' },
    ],
    support: [
      { icon: LayoutDashboard, label: t('admin.tabs.overview'), path: '/admin-dashboard' },
      { icon: MessageSquare, label: t('admin.tabs.complaints'), path: '/admin-dashboard/complaints' },
      { icon: HelpCircle, label: t('admin.tabs.faqs'), path: '/admin-dashboard/faqs' },
    ],
  }

  const menuItems = menuItemsByRole[user?.role] || menuItemsByRole.admin

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
  }

  const handleMenuClick = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-30 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative w-64 h-[calc(100vh-4rem)] bg-gray-800 border-r border-gray-700 
          flex flex-col overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Close Button for Mobile */}
        <div className='md:hidden flex justify-end p-4'>
          <button
            onClick={() => setSidebarOpen(false)}
            className='p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Menu Items */}
        <nav className='flex-1 px-4 py-6 space-y-2'>
          <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-4'>
            {t('admin.title')}
          </h3>

          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon className='w-5 h-5' />
                <span className='font-medium'>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className='border-t border-gray-700 p-4'>
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-all font-medium'
          >
            <LogOut className='w-5 h-5' />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
