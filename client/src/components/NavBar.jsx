import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ArrowRight, LogOut, User, Menu, X } from 'lucide-react'
import { logoutUser } from '../redux/slices/authSlice'
import LanguageSwitcher from './LanguageSwitcher'

const NavBar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const { isAuthenticated, user } = useSelector(state => state.auth)

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
            <span className='text-white font-bold text-lg'>N</span>
          </div>
          <span className='text-white font-bold text-xl hidden sm:inline'>NexAI</span>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-6'>
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className='text-gray-300 hover:text-white transition-colors font-medium'
              >
                {t('nav.dashboard')}
              </button>
              <button
                onClick={() => navigate('/plan')}
                className='text-gray-300 hover:text-white transition-colors font-medium'
              >
                {t('nav.plans')}
              </button>
              <button
                onClick={() => navigate('/faq')}
                className='text-gray-300 hover:text-white transition-colors font-medium'
              >
                {t('nav.faq')}
              </button>
            </>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/faq')}
              className='text-gray-300 hover:text-white transition-colors font-medium'
            >
              {t('nav.faq')}
            </button>
          )}
        </div>

        {/* Right Side - Desktop */}
        <div className='hidden md:flex items-center gap-4'>
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <div className='flex items-center gap-3 pl-4 border-l border-white/10'>
              <div className='text-right'>
                <p className='text-white font-medium text-sm'>{user?.firstName} {user?.lastName}</p>
                <p className='text-gray-400 text-xs'>{user?.email}</p>
              </div>
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg'>
                <User className='w-5 h-5 text-white' />
              </div>
              <button
                onClick={handleLogout}
                className='ml-2 p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all'
                title='Logout'
              >
                <LogOut className='w-5 h-5' />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGetStarted}
              className='flex items-center gap-2 rounded-lg text-sm font-medium cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 transition-all hover:shadow-lg active:scale-95'
            >
              {t('nav.getStarted')}
              <ArrowRight className='w-4 h-4' />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className='md:hidden flex items-center gap-4'>
          <LanguageSwitcher />
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className='p-2 rounded-lg hover:bg-white/10 text-white transition-colors'
          >
            {showMobileMenu ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className='md:hidden bg-gradient-to-b from-white/10 to-white/5 border-b border-white/10 backdrop-blur-md'>
          <div className='px-4 py-4 space-y-3'>
            {isAuthenticated ? (
              <>
                <div className='bg-white/5 rounded-lg p-4 mb-4 border border-white/10'>
                  <p className='text-white font-medium'>{user?.firstName} {user?.lastName}</p>
                  <p className='text-gray-400 text-sm'>{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/dashboard')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
                >
                  {t('nav.dashboard')}
                </button>
                <button
                  onClick={() => {
                    navigate('/plan')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
                >
                  {t('nav.plans')}
                </button>
                <button
                  onClick={() => {
                    navigate('/faq')
                    setShowMobileMenu(false)
                  }}
                  className='block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
                >
                  {t('nav.faq')}
                </button>
                <button
                  onClick={handleLogout}
                  className='block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded-lg transition-colors flex items-center gap-2'
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
                  className='block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
                >
                  {t('nav.faq')}
                </button>
                <button
                  onClick={handleGetStarted}
                  className='block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all'
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
