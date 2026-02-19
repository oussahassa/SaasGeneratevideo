import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ArrowRight, LogOut, User, Menu, X } from 'lucide-react'
import { logoutUser } from '../redux/slices/authSlice'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

const NavBar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const auth = useSelector(state => state.auth) || {}
  const { isAuthenticated, user } = auth

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
    setShowMobileMenu(false)
  }

  const handleGetStarted = () => {
    navigate('/signup')
    setShowMobileMenu(false)
  }

  return (
    <nav className='fixed z-50 w-full backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg'>


      <div className='flex justify-between items-center py-4 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full'>
        {/* Logo */}
        <div 
          onClick={() => {
            navigate('/')
            setShowMobileMenu(false)
          }}
          className='cursor-pointer flex items-center gap-2 group'
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
            <span className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg'>N</span>
          </div>
          <span className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-xl hidden sm:inline'>NexAI</span>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-6'>
          {isAuthenticated && (
            <>
              <button
                    onClick={() => {
              if (!isAuthenticated) {
                navigate('/signup')
              } else if (user?.role === 'admin') {
                navigate('/admin-dashboard')
              } else {
                navigate('/ai')
              }
            }}
                className='text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors font-medium'
              >
                {t('nav.dashboard')}
              </button>
              <button
                onClick={() => navigate('/plan')}
                className='text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors font-medium'
              >
                {t('nav.plans')}
              </button>
              <button
                onClick={() => navigate('/faq')}
                className='text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors font-medium'
              >
                {t('nav.faq')}
              </button>
            </>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/faq')}
              className='text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors font-medium'
            >
              {t('nav.faq')}
            </button>
          )}
        </div>

        {/* Right Side - Desktop */}
        <div className='hidden md:flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className='flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700'>
              <div className='text-right'>
                <p className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium text-sm'>{user?.firstName} {user?.lastName}</p>
                <p className='text-gray-500 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-xs'>{user?.email}</p>
              </div>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg'>
                <User className='w-5 h-5 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white' />
              </div>
              <button
                onClick={handleLogout}
                className='ml-2 p-2 rounded-lg bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-300 transition-all'
                title='Logout'
              >
                <LogOut className='w-5 h-5' />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGetStarted}
              className='flex items-center gap-2 rounded-lg text-sm font-medium cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-6 py-2.5 transition-all hover:shadow-lg active:scale-95'
            >
              {t('nav.getStarted')}
              <ArrowRight className='w-4 h-4' />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white    dark:bg-slate-800 text-gray-700 dark:text-gray-200 transition-colors'
          >
            {showMobileMenu ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className='md:hidden bg-white     dark:bg-slate-800 border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700'>
          <div className='px-4 py-4 space-y-3'>
            {isAuthenticated ? (
              <>
                <div className='bg-gray-50     dark:bg-slate-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700'>
                  <p className='text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium'>{user?.firstName} {user?.lastName}</p>
                  <p className='text-gray-500 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm'>{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/dashboard')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors'
                >
                  {t('nav.dashboard')}
                </button>
                <button
                  onClick={() => {
                    navigate('/plan')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors'
                >
                  {t('nav.plans')}
                </button>
                <button
                  onClick={() => {
                    navigate('/faq')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors'
                >
                  {t('nav.faq')}
                </button>
                <button
                  onClick={handleLogout}
                  className='block w-full text-left px-4 py-2 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-800/20 rounded-lg transition-colors flex items-center gap-2'
                >
                  <LogOut className='w-4 h-4' />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/faq')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded-lg transition-colors'
                >
                  {t('nav.faq')}
                </button>
                <button
                  onClick={handleGetStarted}
                  className='block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg font-medium transition-all'
                >
                  {t('nav.getStarted')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
