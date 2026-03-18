import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Video, Package, AlertCircle, BarChart3, Plus, Trash2, Edit2, TrendingUp, CheckCircle, Clock } from 'lucide-react';

// Reusable StatCard Component
const StatCard = ({ icon: Icon, title, value, subtitle, gradientColor }) => (
  <div className={`bg-gradient-to-br ${gradientColor} rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/70 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-4xl font-bold">{value || 0}</h3>
        {subtitle && <p className="text-white/60 text-xs mt-2">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// Tab Component
const Tab = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
      active
        ? 'text-blue-400 border-blue-400'
        : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default function AdminDashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [packs, setPacks] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });
  const [dailyStats, setDailyStats] = useState([]);

  // Modals
  const [showPackModal, setShowPackModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);

  // Form states
  const [packForm, setPackForm] = useState({ name: '', description: '', price: 0, monthly_limit: 0 });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general' });
  const [complaintResponse, setComplaintResponse] = useState('');

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error(t('admin.overview.failedToLoad'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/get-all-users?page=${page}&limit=10`);
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(t('admin.users.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/get-all-complaints');
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
      }
    } catch (error) {
      toast.error(t('admin.complaints.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Packs
  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/packs/get-all-packs');
      if (response.data.success) {
        setPacks(response.data.packs || []);
      }
    } catch (error) {
      toast.error(t('admin.packs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/support/get-faqs');
      if (response.data.success) {
        setFaqs(response.data.faqs || []);
      }
    } catch (error) {
      toast.error(t('admin.faqs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Daily Stats
  const fetchDailyStats = async () => {
    try {
      const response = await api.get('/admin/daily-stats?days=30');
      if (response.data.success) {
        setDailyStats(response.data.stats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const relative = location.pathname.replace('/admin-dashboard', '').replace(/^\//, '');
    const section = relative || 'overview';
    if (section !== activeTab) {
      setActiveTab(section);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1);
    else if (activeTab === 'complaints') fetchComplaints();
    else if (activeTab === 'packs') fetchPacks();
    else if (activeTab === 'faqs') fetchFaqs();
    else if (activeTab === 'analytics') fetchDailyStats();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    const path = tab === 'overview' ? '/admin-dashboard' : `/admin-dashboard/${tab}`;
    setActiveTab(tab);
    navigate(path);
  }

  // Pack operations
  const handleSavePack = async () => {
    if (!packForm.name || packForm.price === null) {
      toast.error(t('common.error'));
      return;
    }
    try {
      if (editingPack) {
        await api.put(`/packs/update-pack/${editingPack.id}`, packForm);
        toast.success(t('admin.packs.packUpdated'));
      } else {
        await api.post('/packs/create-pack', packForm);
        toast.success(t('admin.packs.packCreated'));
      }
      setShowPackModal(false);
      setEditingPack(null);
      setPackForm({ name: '', description: '', price: 0, monthly_limit: 0 });
      fetchPacks();
    } catch (error) {
      toast.error(editingPack ? t('admin.packs.failedToUpdate') : t('admin.packs.failedToCreate'));
    }
  };

  const handleDeletePack = async (packId) => {
    if (!window.confirm(t('admin.packs.confirmDelete'))) return;
    try {
      await api.delete(`/packs/delete-pack/${packId}`);
      toast.success(t('admin.packs.packDeleted'));
      fetchPacks();
    } catch (error) {
      toast.error(t('admin.packs.failedToDelete'));
    }
  };

  // FAQ operations
  const handleSaveFaq = async () => {
    if (!faqForm.question || !faqForm.answer) {
      toast.error(t('common.error'));
      return;
    }
    try {
      if (editingFaq) {
        await api.put(`/support/update-faq/${editingFaq.id}`, faqForm);
        toast.success(t('admin.faqs.faqUpdated'));
      } else {
        await api.post('/support/create-faq', faqForm);
        toast.success(t('admin.faqs.faqCreated'));
      }
      setShowFaqModal(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', category: 'general' });
      fetchFaqs();
    } catch (error) {
      toast.error(editingFaq ? t('admin.faqs.failedToUpdate') : t('admin.faqs.failedToCreate'));
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm(t('admin.faqs.confirmDelete'))) return;
    try {
      await api.delete(`/support/delete-faq/${faqId}`);
      toast.success(t('admin.faqs.faqDeleted'));
      fetchFaqs();
    } catch (error) {
      toast.error(t('admin.faqs.failedToDelete'));
    }
  };

  // Complaint operations
  const handleRespondComplaint = async (complaintId) => {
    if (!complaintResponse.trim()) {
      toast.error(t('common.error'));
      return;
    }
    try {
      await api.put(`/support/update-complaint/${complaintId}`, {
        status: 'resolved',
        response: complaintResponse
      });
      toast.success(t('admin.complaints.complaintUpdated'));
      setShowComplaintModal(null);
      setComplaintResponse('');
      fetchComplaints();
    } catch (error) {
      toast.error(t('admin.complaints.failedToUpdate'));
    }
  };

  // User operations
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/toggle-user-status/${userId}`, {
        isBlocked: !currentStatus
      });
      toast.success(currentStatus ? t('admin.users.userUnblocked') : t('admin.users.userBlocked'));
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('admin.users.failedToUpdate'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.users.confirmDelete'))) return;
    try {
      await api.delete(`/admin/delete-user/${userId}`);
      toast.success(t('admin.users.userDeleted'));
      fetchUsers(1);
    } catch (error) {
      toast.error(t('admin.users.failedToDelete'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pt-8 pb-12 shadow-xl">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{t('admin.dashboard')}</h1>
          <p className="text-blue-100">{t('admin.description')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-slate-700 overflow-x-auto">
          <Tab label={t('admin.tabs.overview')} active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={BarChart3} />
          <Tab label={t('admin.tabs.users')} active={activeTab === 'users'} onClick={() => handleTabChange('users')} icon={Users} />
          <Tab label={t('admin.tabs.packs')} active={activeTab === 'packs'} onClick={() => handleTabChange('packs')} icon={Package} />
          <Tab label={t('admin.tabs.faqs')} active={activeTab === 'faqs'} onClick={() => handleTabChange('faqs')} icon={FileText} />
          <Tab label={t('admin.tabs.complaints')} active={activeTab === 'complaints'} onClick={() => handleTabChange('complaints')} icon={AlertCircle} />
          <Tab label={t('admin.tabs.analytics')} active={activeTab === 'analytics'} onClick={() => handleTabChange('analytics')} icon={TrendingUp} />
        </div>

        {/* Overview Tab*/}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="text-center text-slate-400 py-12">{t('common.loading')}</div>
            ) : stats ? (
              <>
                {/* Users Stats */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    {t('admin.overview.users')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                      icon={Users}
                      title={t('admin.overview.totalUsers')}
                      value={stats.users?.total_users}
                      gradientColor="from-blue-500 to-blue-600"
                    />
                    <StatCard
                      icon={Plus}
                      title={t('admin.overview.newToday')}
                      value={stats.users?.new_today}
                      subtitle="Last 24h"
                      gradientColor="from-green-500 to-green-600"
                    />
                    <StatCard
                      icon={TrendingUp}
                      title={t('admin.overview.newThisWeek')}
                      value={stats.users?.new_this_week}
                      subtitle="Last 7 days"
                      gradientColor="from-purple-500 to-purple-600"
                    />
                  </div>
                </div>

                {/* Creations Stats */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-cyan-400" />
                    {t('admin.overview.creations')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <StatCard icon={FileText} title={t('admin.overview.totalCreations')} value={stats.creations?.total_creations} gradientColor="from-indigo-500 to-indigo-600" />
                    <StatCard icon={FileText} title={t('admin.overview.articles')} value={stats.creations?.articles} gradientColor="from-blue-500 to-blue-600" />
                    <StatCard icon={FileText} title={t('admin.overview.blogTitles')} value={stats.creations?.blog_titles} gradientColor="from-cyan-500 to-cyan-600" />
                    <StatCard icon={FileText} title={t('admin.overview.images')} value={stats.creations?.images} gradientColor="from-pink-500 to-pink-600" />
                    <StatCard icon={FileText} title={t('admin.overview.published')} value={stats.creations?.published} gradientColor="from-green-500 to-green-600" />
                  </div>
                </div>

                {/* Videos Stats */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Video className="w-6 h-6 text-red-400" />
                    {t('admin.overview.videos')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Video} title={t('admin.overview.totalVideos')} value={stats.videos?.total_videos} gradientColor="from-red-500 to-red-600" />
                    <StatCard icon={CheckCircle} title={t('admin.overview.completed')} value={stats.videos?.completed} gradientColor="from-green-500 to-green-600" />
                    <StatCard icon={Clock} title={t('admin.overview.processing')} value={stats.videos?.processing} gradientColor="from-yellow-500 to-yellow-600" />
                  </div>
                </div>

                {/* Complaints Stats */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                    {t('admin.tabs.complaints')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={AlertCircle} title={t('admin.overview.open')} value={stats.complaints?.open_complaints} gradientColor="from-red-500 to-red-600" />
                    <StatCard icon={Clock} title={t('admin.overview.inProgress')} value={stats.complaints?.in_progress} gradientColor="from-yellow-500 to-yellow-600" />
                    <StatCard icon={CheckCircle} title={t('admin.overview.resolved')} value={stats.complaints?.resolved} gradientColor="from-green-500 to-green-600" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400">{t('common.loading')}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-white font-semibold">{t('admin.users.email')}</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">{t('admin.users.name')}</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">{t('admin.users.joined')}</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">{t('admin.users.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-white">{user.email}</td>
                          <td className="px-6 py-4 text-slate-300">{user.first_name} {user.last_name}</td>
                          <td className="px-6 py-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.is_blocked)}
                                className="px-3 py-1 rounded font-medium text-sm bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                              >
                                {user.is_blocked ? t('admin.users.unblock') : t('admin.users.block')}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 rounded font-medium text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
                  <p className="text-slate-400 text-sm">{t('admin.users.page')} {pagination.page} of {pagination.pages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchUsers(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => fetchUsers(Math.min(pagination.pages, pagination.page + 1))}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Packs Tab */}
        {activeTab === 'packs' && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setEditingPack(null);
                setPackForm({ name: '', description: '', price: 0, monthly_limit: 0 });
                setShowPackModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              {t('admin.packs.create')}
            </button>

            {loading ? (
              <div className="text-center text-slate-400 py-12">{t('common.loading')}</div>
            ) : packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packs.map(pack => (
                  <div key={pack.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors shadow-lg">
                    <h3 className="text-white font-bold text-xl mb-2">{pack.name}</h3>
                    <p className="text-3xl font-bold text-blue-400 mb-4">${pack.price}</p>
                    <p className="text-slate-400 text-sm mb-4">{pack.description}</p>
                    <p className="text-slate-500 text-xs mb-6">Monthly limit: {pack.monthly_limit}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPack(pack);
                          setPackForm(pack);
                          setShowPackModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">{t('admin.packs.noPacks')}</div>
            )}
          </div>
        )}

        {/* Modals - Pack Modal */}
        {showPackModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
              <h3 className="text-white font-bold text-2xl mb-6">
                {editingPack ? t('admin.packs.edit') : t('admin.packs.create')}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('admin.packs.name')}
                  value={packForm.name}
                  onChange={(e) => setPackForm({...packForm, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder={t('admin.packs.description')}
                  value={packForm.description}
                  onChange={(e) => setPackForm({...packForm, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder={t('admin.packs.price')}
                  value={packForm.price}
                  onChange={(e) => setPackForm({...packForm, price: parseFloat(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder={t('admin.packs.limit')}
                  value={packForm.monthly_limit}
                  onChange={(e) => setPackForm({...packForm, monthly_limit: parseInt(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 outline-none"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPackModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSavePack}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}