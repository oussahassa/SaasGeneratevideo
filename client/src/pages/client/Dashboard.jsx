import React, { useEffect, useState } from 'react'
import { Gem, Sparkles ,Images , Newspaper } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import CreationItem from '../../components/CreationItem'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const Dashboard = () => {

  const { t } = useTranslation()
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ videos: 0, images: 0, articles: 0, creations: 0 })
  const [sessions, setSessions] = useState([])
  const [profileForm, setProfileForm] = useState({})
  const [filterType, setFilterType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { user } = useSelector(state => state.auth)

  const fetchAll = async (queryOptions = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams();
      if (queryOptions.type && queryOptions.type !== 'all') params.append('type', queryOptions.type);
      if (queryOptions.startDate) params.append('startDate', queryOptions.startDate);
      if (queryOptions.endDate) params.append('endDate', queryOptions.endDate);

      // Fetch user creations
      const creationsUrl = `/user/get-user-creations${params.toString() ? `?${params.toString()}` : ''}`;
      const resCre = await api.get(creationsUrl)
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

  const handleFilterApply = () => {
    fetchAll({ type: filterType, startDate, endDate })
  }

  useEffect(() => {
    // Prefill profile form from user
    if (user) {
      setProfileForm({ firstName: user.first_name || '', lastName: user.last_name || '', email: user.email || '' })
    }
    fetchAll({ type: filterType, startDate, endDate })
  }, [user, filterType, startDate, endDate])



  

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



  return (
    <div className='h-full overflow-y-scroll p-6 bg-gradient-to-br from-blue-50 to-purple-50'>
      <div className='flex flex-wrap gap-6 justify-center'>
        {/* Creations + stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full'>
          <div className='p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col items-center'>
            <Gem className='text-blue-500 mb-2' size={32}/>
            <p className='text-sm text-slate-600'>{t('dashboard.totalCreations') || 'Total Creations'}</p>
            <h2 className='text-3xl font-bold mt-1'>{stats.creations ?? creations.length}</h2>
          </div>
          <div className='p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col items-center'>
            <Sparkles className='text-purple-500 mb-2' size={32}/>
            <p className='text-sm text-slate-600'>{t('dashboard.videos') || 'Videos generated'}</p>
            <h2 className='text-3xl font-bold mt-1'>{stats.videos ?? 0}</h2>
          </div>
          <div className='p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col items-center'>
             <Images className='text-red-500 mb-2' size={32}/>

            <p className='text-sm text-slate-600'>{t('dashboard.images') || 'Images generated'}</p>
            <h2 className='text-3xl font-bold mt-1'>{stats.images ?? 0}</h2>
          </div>
          <div className='p-6 bg-white shadow-lg rounded-2xl border border-gray-200 flex flex-col items-center'>
           <Newspaper className='text-bleu-500 mb-2' size={32}/> 
            <p className='text-sm text-slate-600'>{t('dashboard.articles') || 'Articles generated'}</p>
            <h2 className='text-3xl font-bold mt-1'>{stats.articles ?? 0}</h2>
          </div>
        </div>
        <div className='mt-6 w-full flex gap-4 justify-end'>
          <a href='/ai/update-profile' className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
            {t('dashboard.updateProfile') || 'Update Profile'}
          </a>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-3/4 mt-8'>
          <div className='animate-spin rounded-full h-11 w-11 border-3 border-ppurple-500 border-t-transparent'></div>
        </div>
      ) : (
        <div className='mt-6 space-y-4'>
          <div className='flex flex-wrap items-center gap-2 mb-2'>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className='p-2 border rounded-md text-sm'
            >
              <option value='all'>All</option>
              <option value='image'>Image</option>
              <option value='article'>Article</option>
              <option value='video'>Video</option>
            </select>
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='p-2 border rounded-md text-sm'
              placeholder='Start date'
            />
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='p-2 border rounded-md text-sm'
              placeholder='End date'
            />
            <button
              onClick={handleFilterApply}
              className='px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm'
            >
              Apply filters
            </button>
          </div>
          <div>
            <p className='mt-2 mb-3 text-lg font-semibold'>{t('dashboard.recentCreations') || 'Recent Creations'}</p>
            <div className='grid gap-3'>
              {creations.map((item) => (
                <CreationItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div>
            <p className='mb-3 text-lg font-semibold'>{t('dashboard.sessions') || 'Active Sessions'}</p>
            <div className='space-y-2'>
              {sessions.length === 0 && <p className='text-sm text-gray-500'>{t('dashboard.noSessions') || 'No active sessions'}</p>}
              {sessions.slice(0, 5).map(s => (
                <div key={s.id} className='flex items-center justify-between p-3 bg-white border rounded-lg shadow'>
                  <div>
                    <p className='text-sm font-medium'>{s.device || s.userAgent || 'Unknown device'}</p>
                    <p className='text-xs text-gray-500'>{s.ip || 'Unknown IP'} • {new Date(s.lastActive).toLocaleString()}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button onClick={() => handleRevokeSession(s.id)} className='px-3 py-1 bg-red-600 text-white rounded'>
                      {t('dashboard.revoke') || 'Revoke'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard