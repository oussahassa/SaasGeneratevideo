import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import ThemeToggle from '../../components/ThemeToggle'
import { useSelector } from 'react-redux'

const AdminLayout = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const auth = useSelector(state => state.auth) || {}
  const { user } = auth

  return (
    <div className='fixed inset-0 flex flex-col bg-gray-900'>
      {/* Admin Header */}
      <nav className='h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0 z-40'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='p-2 hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors md:hidden'
          >
            {sidebarOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
          <div 
            onClick={() => navigate('/')}
            className='cursor-pointer flex items-center gap-2 group'
          >
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
              <span className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg'>N</span>
            </div>
            <span className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg hidden sm:inline'>NexAI Admin</span>
          </div>
        </div>

        {/* Admin User Info */}
        <div className='flex items-center gap-4'>
          <ThemeToggle />
          <div className='text-right hidden sm:block'>
            <p className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium text-sm'>{user?.firstName} {user?.lastName}</p>
            <p className='text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-xs'>Administrator</p>
          </div>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
            <span className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold'>{user?.firstName?.charAt(0)}</span>
          </div>
        </div>
      </nav>

      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className='flex-1  overflow-y-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
