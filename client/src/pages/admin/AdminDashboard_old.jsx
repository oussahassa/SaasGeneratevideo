import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Video, Package, AlertCircle, BarChart3, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [packs, setPacks] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // Modal states
  const [showPackModal, setShowPackModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(null);

  // Form states
  const [packForm, setPackForm] = useState({ name: '', description: '', price: 0, monthly_limit: 0, features: [] });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general' });
  const [complaintResponse, setComplaintResponse] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'complaints') {
      fetchComplaints();
    } else if (activeTab === 'packs') {
      fetchPacks();
    } else if (activeTab === 'faqs') {
      fetchFaqs();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error(t('admin.overview.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/get-all-users?page=${pagination.page}&limit=${pagination.limit}`);
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

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/support/get-all-complaints');
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
      }
    } catch (error) {
      toast.error(t('admin.complaints.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/packs/get-all-packs');
      if (response.data.success) {
        setPacks(response.data.packs);
      }
    } catch (error) {
      toast.error(t('admin.packs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/support/get-faqs');
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      toast.error(t('admin.faqs.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // Pack operations
  const handleSavePack = async () => {
    if (!packForm.name || packForm.price === null) {
      toast.error(t('common.error'));
      return;
    }

    try {
      if (editingPack) {
        await axios.put(`/api/packs/update-pack/${editingPack.id}`, packForm);
        toast.success(t('admin.packs.packUpdated'));
      } else {
        await axios.post('/api/packs/create-pack', packForm);
        toast.success(t('admin.packs.packCreated'));
      }
      setShowPackModal(false);
      setEditingPack(null);
      setPackForm({ name: '', description: '', price: 0, monthly_limit: 0, features: [] });
      fetchPacks();
    } catch (error) {
      toast.error(editingPack ? t('admin.packs.failedToUpdate') : t('admin.packs.failedToCreate'));
    }
  };

  const handleDeletePack = async (packId) => {
    if (!window.confirm(t('admin.packs.confirmDelete'))) return;
    try {
      await axios.delete(`/api/packs/delete-pack/${packId}`);
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
        await axios.put(`/api/support/update-faq/${editingFaq.id}`, faqForm);
        toast.success(t('admin.faqs.faqUpdated'));
      } else {
        await axios.post('/api/support/create-faq', faqForm);
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
      await axios.delete(`/api/support/delete-faq/${faqId}`);
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
      await axios.put(`/api/support/update-complaint/${complaintId}`, {
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

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/toggle-user-status/${userId}`, {
        isBlocked: !currentStatus
      });
      toast.success(currentStatus ? t('admin.users.userUnblocked') : t('admin.users.userBlocked'));
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.users.failedToUpdate'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.users.confirmDelete'))) return;
    try {
      await axios.delete(`/api/admin/delete-user/${userId}`);
      toast.success(t('admin.users.userDeleted'));
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.users.failedToDelete'));
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value || 0}</p>
        </div>
        <Icon className={`${color} opacity-20`} size={40} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-2">
            {t('admin.dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
            {t('admin.description')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 overflow-x-auto">
          {['overview', 'users', 'packs', 'faqs', 'complaints', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-slate-300'
              }`}
            >
              {t(`admin.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
            ) : stats ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">{t('admin.tabs.users')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Users} label={t('admin.overview.totalUsers')} value={stats.users?.total_users} color="text-blue-400" />
                    <StatCard icon={Users} label={t('admin.overview.newToday')} value={stats.users?.new_today} color="text-green-400" />
                    <StatCard icon={Users} label={t('admin.overview.newThisWeek')} value={stats.users?.new_this_week} color="text-purple-400" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">{t('admin.overview.creations')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <StatCard icon={FileText} label={t('admin.overview.totalCreations')} value={stats.creations?.total_creations} color="text-blue-400" />
                    <StatCard icon={FileText} label={t('admin.overview.articles')} value={stats.creations?.articles} color="text-indigo-400" />
                    <StatCard icon={FileText} label={t('admin.overview.blogTitles')} value={stats.creations?.blog_titles} color="text-cyan-400" />
                    <StatCard icon={FileText} label={t('admin.overview.images')} value={stats.creations?.images} color="text-pink-400" />
                    <StatCard icon={FileText} label={t('admin.overview.published')} value={stats.creations?.published} color="text-green-400" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">{t('admin.overview.videos')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={Video} label={t('admin.overview.totalVideos')} value={stats.videos?.total_videos} color="text-red-400" />
                    <StatCard icon={Video} label={t('admin.overview.completed')} value={stats.videos?.completed} color="text-green-400" />
                    <StatCard icon={Video} label={t('admin.overview.processing')} value={stats.videos?.processing} color="text-yellow-400" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">{t('admin.tabs.complaints')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard icon={AlertCircle} label={t('admin.overview.open')} value={stats.complaints?.open_complaints} color="text-yellow-400" />
                    <StatCard icon={AlertCircle} label={t('admin.overview.inProgress')} value={stats.complaints?.in_progress} color="text-blue-400" />
                    <StatCard icon={AlertCircle} label={t('admin.overview.resolved')} value={stats.complaints?.resolved} color="text-green-400" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white    dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white    dark:bg-slate-900 border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium">{t('admin.users.email')}</th>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium">{t('admin.users.name')}</th>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium">{t('admin.users.joined')}</th>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium">{t('admin.users.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700/50">
                          <td className="px-6 py-3 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white">{user.email}</td>
                          <td className="px-6 py-3 text-slate-300">{user.first_name} {user.last_name}</td>
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.is_blocked)}
                                className="px-3 py-1 rounded text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors"
                              >
                                {user.is_blocked ? t('admin.users.unblock') : t('admin.users.block')}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors"
                              >
                                {t('admin.users.delete')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">
                    {t('admin.users.page')} {pagination.page} {t('admin.users.of')} {pagination.pages} ({pagination.total} {t('admin.users.total')})
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }));
                        fetchUsers();
                      }}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 rounded bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
                    >
                      {t('admin.users.previous')}
                    </button>
                    <button
                      onClick={() => {
                        setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }));
                        fetchUsers();
                      }}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 rounded bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
                    >
                      {t('admin.users.next')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Packs Tab */}
        {activeTab === 'packs' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingPack(null);
                setPackForm({ name: '', description: '', price: 0, monthly_limit: 0, features: [] });
                setShowPackModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              {t('admin.packs.create')}
            </button>

            {loading ? (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
            ) : packs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map(pack => (
                  <div key={pack.id} className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg mb-2">{pack.name}</h3>
                    <p className="text-blue-400 font-bold mb-4">${pack.price} {t('admin.packs.perMonth')}</p>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm mb-4">{pack.description}</p>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm mb-4">{pack.monthly_limit} {t('admin.packs.limit')}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPack(pack);
                          setPackForm(pack);
                          setShowPackModal(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit2 size={16} />
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 size={16} />
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 py-12">{t('admin.packs.noPacks')}</div>
            )}
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ question: '', answer: '', category: 'general' });
                setShowFaqModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              {t('admin.faqs.create')}
            </button>

            {loading ? (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
            ) : faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                    <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold mb-2">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm mb-4">{faq.answer}</p>
                    <p className="text-slate-500 text-xs mb-4">{faq.category}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setFaqForm(faq);
                          setShowFaqModal(true);
                        }}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Edit2 size={14} />
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Trash2 size={14} />
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 py-12">{t('admin.faqs.noFAQs')}</div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
            ) : complaints.length > 0 ? (
              complaints.map(complaint => (
                <div key={complaint.id} className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold">{complaint.title}</h3>
                      <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">{t('admin.complaints.from')}: {complaint.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      complaint.status === 'open' ? 'bg-red-900 text-red-300' :
                      complaint.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {t(`admin.complaints.${complaint.status}`)}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-4">{complaint.description}</p>
                  {complaint.admin_response && (
                    <p className="text-blue-300 mb-4 text-sm"><strong>{t('support.adminResponse')}:</strong> {complaint.admin_response}</p>
                  )}
                  <button
                    onClick={() => {
                      setShowComplaintModal(complaint.id);
                      setComplaintResponse(complaint.admin_response || '');
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {complaint.status === 'resolved' ? t('admin.complaints.details') : t('admin.complaints.respond')} →
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 py-12">{t('admin.complaints.noComplaints')}</div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white    dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 text-center">
            <BarChart3 size={64} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold mb-2">{t('admin.tabs.analytics')}</h3>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Pack Modal */}
      {showPackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg mb-4">
              {editingPack ? t('admin.packs.edit') : t('admin.packs.create')}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('admin.packs.name')}
                value={packForm.name}
                onChange={(e) => setPackForm({...packForm, name: e.target.value})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder={t('admin.packs.description')}
                value={packForm.description}
                onChange={(e) => setPackForm({...packForm, description: e.target.value})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder={t('admin.packs.price')}
                value={packForm.price}
                onChange={(e) => setPackForm({...packForm, price: parseFloat(e.target.value)})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder={t('admin.packs.limit')}
                value={packForm.monthly_limit}
                onChange={(e) => setPackForm({...packForm, monthly_limit: parseInt(e.target.value)})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPackModal(false)}
                  className="flex-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSavePack}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg mb-4">
              {editingFaq ? t('admin.faqs.edit') : t('admin.faqs.create')}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t('admin.faqs.question')}
                value={faqForm.question}
                onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              />
              <textarea
                placeholder={t('admin.faqs.answer')}
                value={faqForm.answer}
                onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                rows="4"
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white resize-none"
              />
              <select
                value={faqForm.category}
                onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
                className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              >
                <option value="general">General</option>
                <option value="subscription">Subscription</option>
                <option value="features">Features</option>
                <option value="technical">Technical</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="flex-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSaveFaq}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Response Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg mb-4">{t('admin.complaints.respond')}</h3>
            <textarea
              placeholder={t('admin.complaints.respond')}
              value={complaintResponse}
              onChange={(e) => setComplaintResponse(e.target.value)}
              rows="4"
              className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowComplaintModal(null)}
                className="flex-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleRespondComplaint(showComplaintModal)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
