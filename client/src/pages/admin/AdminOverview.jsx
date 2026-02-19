import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Video, Package, AlertCircle, BarChart3, TrendingUp } from 'lucide-react';

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

export default function AdminOverview() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dailyStats, setDailyStats] = useState([]);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  // Fetch Daily Stats
  const fetchDailyStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/daily-stats?days=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDailyStats(response.data.stats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchDailyStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('admin.overview.title')}</h1>
        <p className="text-gray-400">{t('admin.overview.title')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title={t('admin.overview.users')}
          value={stats?.totalUsers}
          subtitle={`${stats?.newToday || 0} ${t('admin.overview.newToday')}`}
          gradientColor="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FileText}
          title={t('admin.overview.creations')}
          value={stats?.totalCreations}
          subtitle={`${stats?.articles || 0} ${t('admin.overview.articles')}`}
          gradientColor="from-green-500 to-green-600"
        />
        <StatCard
          icon={Video}
          title={t('admin.overview.videos')}
          value={stats?.totalVideos}
          subtitle={`${stats?.completed || 0} ${t('admin.overview.completed')}`}
          gradientColor="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={AlertCircle}
          title={t('admin.overview.complaints')}
          value={stats?.totalComplaints}
          subtitle={`${stats?.openComplaints || 0} ${t('admin.overview.open')}`}
          gradientColor="from-red-500 to-red-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t('admin.overview.title')}
        </h2>

        {dailyStats.length > 0 ? (
          <div className="space-y-4">
            {dailyStats.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                <div className="text-gray-300">
                  {new Date(day.date).toLocaleDateString()}
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-blue-400">{day.users} {t('admin.overview.users')}</span>
                  <span className="text-green-400">{day.creations} {t('admin.overview.creations')}</span>
                  <span className="text-purple-400">{day.videos} {t('admin.overview.videos')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {t('common.loading')}
          </div>
        )}
      </div>
    </div>
  );
}