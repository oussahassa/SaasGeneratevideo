import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import CreationItem from '../components/CreationItem'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { setUser } from '../redux/slices/authSlice'

const Dashboard = () => {

  const { t } = useTranslation()
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ videos: 0, images: 0, articles: 0, creations: 0 })
  const [sessions, setSessions] = useState([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' })

  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Fetch user creations
      const resCre = await api.get('/user/get-user-creations')
      if (resCre.data?.success) setCreations(resCre.data.creations || [])

      // Fetch dashboard stats
      const resStats = await api.get('/user/dashboard-stats')
      if (resStats.data?.success) setStats(resStats.data.stats || {})

      // Fetch sessions
      const resSessions = await api.get('/user/sessions')
      if (resSessions.data?.success) setSessions(resSessions.data.sessions || [])

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Prefill profile form from user
    if (user) {
      setProfileForm({ firstName: user.first_name || '', lastName: user.last_name || '', email: user.email || '' })
    }
    fetchAll()
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/api/user/update-profile', profileForm)
      if (res.data?.success) {
        // update stored user
        const updatedUser = res.data.user
        dispatch(setUser(updatedUser))
        toast.success(t('dashboard.profileUpdated') || 'Profile updated')
        setProfileOpen(false)
      } else {
        toast.error(res.data?.message || 'Update failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed')
    }
  }

  const handleRevokeSession = async (id) => {
    try {
      const res = await api.post('/api/user/revoke-session', { id })
      if (res.data?.success) {
        toast.success(t('dashboard.sessionRevoked') || 'Session revoked')
        setSessions(prev => prev.filter(s => s.id !== id))
      } else {
        toast.error(res.data?.message || 'Failed to revoke')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to revoke')
    }
  }

  const handleRefreshToken = async () => {
    try {
      const resp = await api.post('/auth/refresh', { token: localStorage.getItem('refreshToken') })
      if (resp.data?.token) {
        localStorage.setItem('token', resp.data.token)
        if (resp.data.refreshToken) localStorage.setItem('refreshToken', resp.data.refreshToken)
        toast.success(t('dashboard.tokenRefreshed') || 'Token refreshed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to refresh token')
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex flex-wrap gap-4'>
        {/* Creations + stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
          <div className='p-4 bg-white rounded-xl border border-gray-200'>
            <p className='text-sm text-slate-600'>{t('dashboard.totalCreations') || 'Total Creations'}</p>
            <h2 className='text-2xl font-semibold'>{stats.creations ?? creations.length}</h2>
          </div>

          <div className='p-4 bg-white rounded-xl border border-gray-200'>
            <p className='text-sm text-slate-600'>{t('dashboard.videos') || 'Videos generated'}</p>
            <h2 className='text-2xl font-semibold'>{stats.videos ?? 0}</h2>
          </div>

          <div className='p-4 bg-white rounded-xl border border-gray-200'>
            <p className='text-sm text-slate-600'>{t('dashboard.images') || 'Images generated'}</p>
            <h2 className='text-2xl font-semibold'>{stats.images ?? 0}</h2>
          </div>

          <div className='p-4 bg-white rounded-xl border border-gray-200'>
            <p className='text-sm text-slate-600'>{t('dashboard.articles') || 'Articles generated'}</p>
            <h2 className='text-2xl font-semibold'>{stats.articles ?? 0}</h2>
          </div>
        </div>

        <div className='mt-4 w-full flex gap-4'>
          <button onClick={() => setProfileOpen(true)} className='px-4 py-2 bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg'>
            {t('dashboard.updateProfile') || 'Update Profile'}
          </button>
          <button onClick={handleRefreshToken} className='px-4 py-2 bg-emerald-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg'>
            {t('dashboard.refreshToken') || 'Refresh Token'}
          </button>
          <button onClick={fetchAll} className='px-4 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg'>
            {t('dashboard.refresh') || 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-3/4 mt-8'>
          <div className='animate-spin rounded-full h-11 w-11 border-3 border-ppurple-500 border-t-transparent'></div>
        </div>
      ) : (
        <div className='mt-6 space-y-4'>
          <div>
            <p className='mt-2 mb-3 text-lg font-medium'>{t('dashboard.recentCreations') || 'Recent Creations'}</p>
            <div className='grid gap-3'>
              {creations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div>
            <p className='mb-3 text-lg font-medium'>{t('dashboard.sessions') || 'Active Sessions'}</p>
            <div className='space-y-2'>
              {sessions.length === 0 && <p className='text-sm text-gray-500'>{t('dashboard.noSessions') || 'No active sessions'}</p>}
              {sessions.map(s => (
                <div key={s.id} className='flex items-center justify-between p-3 bg-white border rounded-lg'>
                  <div>
                    <p className='text-sm font-medium'>{s.device || s.userAgent || 'Unknown device'}</p>
                    <p className='text-xs text-gray-500'>{s.ip || 'Unknown IP'} • {new Date(s.lastActive).toLocaleString()}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button onClick={() => handleRevokeSession(s.id)} className='px-3 py-1 bg-red-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded'>
                      {t('dashboard.revoke') || 'Revoke'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold mb-4'>{t('dashboard.updateProfile') || 'Update Profile'}</h3>
            <form onSubmit={handleUpdateProfile} className='space-y-4'>
              <div>
                <label className='block text-sm'>First name</label>
                <input name='firstName' value={profileForm.firstName} onChange={handleProfileChange} className='w-full px-3 py-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm'>Last name</label>
                <input name='lastName' value={profileForm.lastName} onChange={handleProfileChange} className='w-full px-3 py-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm'>Email</label>
                <input name='email' value={profileForm.email} onChange={handleProfileChange} className='w-full px-3 py-2 border rounded' />
              </div>
              <div className='flex justify-end gap-3'>
                <button type='button' onClick={() => setProfileOpen(false)} className='px-4 py-2 rounded border'>Cancel</button>
                <button type='submit' className='px-4 py-2 bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded'>{t('dashboard.save') || 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
