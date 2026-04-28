import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { decodeFromBase64 } from '../../utils/security';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users, TrendingUp, Video, Share2, DollarSign, Activity,
  Download, Calendar, Filter, RefreshCw, Globe, Zap, Clock,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

// Custom colors for charts
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  orange: '#F97316'
};

const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/dashboard?days=${timeRange}`);

      if (response.data.success) {
        // Decode Base64 data if present
        let data = response.data;
        if (response.data.encodedData) {
          data = decodeFromBase64(response.data.encodedData);
        }
        setAnalyticsData(data);
      }
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time data
  const fetchRealTimeData = async () => {
    try {
      const response = await api.get('/analytics/realtime');

      if (response.data.success) {
        let data = response.data;
        if (response.data.encodedData) {
          data = decodeFromBase64(response.data.encodedData);
        }
        setRealTimeData(data);
      }
    } catch (error) {
      console.error('Real-time analytics error:', error);
    }
  };

  // Fetch performance metrics
  const fetchPerformanceData = async () => {
    try {
      const response = await api.get('/analytics/performance');

      if (response.data.success) {
        let data = response.data;
        if (response.data.encodedData) {
          data = decodeFromBase64(response.data.encodedData);
        }
        setPerformanceData(data);
      }
    } catch (error) {
      console.error('Performance metrics error:', error);
    }
  };

  // Export data
  const handleExport = async (format = 'json') => {
    try {
      const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const response = await api.get(`/analytics/export?format=${format}&startDate=${startDate}&endDate=${endDate}`);

      if (response.data.success) {
        let data = response.data;
        if (response.data.encodedData) {
          data = decodeFromBase64(response.data.encodedData);
        }

        // Create download
        const blob = new Blob([data.encodedData], { type: data.contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Data exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  // Initial load and refresh
  useEffect(() => {
    fetchAnalyticsData();
    fetchRealTimeData();
    fetchPerformanceData();
  }, [timeRange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Format date for charts
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      {subtitle && <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg border ${autoRefresh ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {analyticsData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            title="Total Users"
            value={analyticsData.summary.totalUsers}
            subtitle="Active users"
            color="blue"
            trend={12}
          />
          <StatCard
            icon={Video}
            title="Videos Generated"
            value={analyticsData.summary.totalVideos}
            subtitle="This period"
            color="purple"
            trend={8}
          />
          <StatCard
            icon={Share2}
            title="Social Shares"
            value={analyticsData.summary.totalShares}
            subtitle="Across platforms"
            color="green"
            trend={15}
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${analyticsData.summary.totalRevenue.toFixed(2)}`}
            subtitle="This period"
            color="orange"
            trend={22}
          />
        </div>
      )}

      {/* Real-time Stats */}
      {realTimeData && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Activity
            </h3>
            <span className="text-sm opacity-75">Last 15 minutes</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm opacity-75">Online Users</p>
              <p className="text-2xl font-bold">{realTimeData.onlineUsers}</p>
            </div>
            {realTimeData.recentActivity?.map((activity, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4">
                <p className="text-sm opacity-75 capitalize">{activity.activity_type}s</p>
                <p className="text-2xl font-bold">{activity.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {analyticsData?.userGrowth && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey="new_users"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.6}
                  name="New Users"
                />
                <Area
                  type="monotone"
                  dataKey="total_users"
                  stroke={CHART_COLORS.secondary}
                  fill={CHART_COLORS.secondary}
                  fillOpacity={0.4}
                  name="Total Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Feature Usage Chart */}
        {analyticsData?.featureUsage && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Feature Usage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.featureUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Bar dataKey="usage_count" fill={CHART_COLORS.primary} name="Usage Count" />
                <Bar dataKey="unique_users" fill={CHART_COLORS.secondary} name="Unique Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Video Statistics Chart */}
        {analyticsData?.videoStats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              Video Statistics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.videoStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_videos"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  name="Total Videos"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="processing"
                  stroke={CHART_COLORS.tertiary}
                  strokeWidth={2}
                  name="Processing"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Social Media Shares Chart */}
        {analyticsData?.socialShares && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-500" />
              Social Media Shares
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.socialShares}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Bar dataKey="share_count" fill={CHART_COLORS.pink} name="Shares" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {performanceData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* API Performance */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">API Response Times</h4>
              <div className="space-y-2">
                {performanceData.apiPerformance?.map((api, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{api.endpoint}</span>
                    <span className="font-medium">{api.avgResponseTime}ms</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Database Performance */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Database Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Avg Query Time</span>
                  <span className="font-medium">{performanceData.dbPerformance?.avgQueryTime}ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Slow Queries</span>
                  <span className="font-medium">{performanceData.dbPerformance?.slowQueries}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Connection Pool</span>
                  <span className="font-medium">{performanceData.dbPerformance?.connectionPoolUsage}%</span>
                </div>
              </div>
            </div>

            {/* Server Performance */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Server Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">CPU Usage</span>
                  <span className="font-medium">{performanceData.serverPerformance?.cpuUsage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Memory Usage</span>
                  <span className="font-medium">{performanceData.serverPerformance?.memoryUsage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Requests/min</span>
                  <span className="font-medium">{performanceData.serverPerformance?.requestsPerMinute}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Engagement Table */}
      {analyticsData?.userEngagement && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Top Engaged Users
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">User ID</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Active Days</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Total Actions</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.userEngagement.slice(0, 10).map((user, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{user.user_id}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.active_days}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.total_actions}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {new Date(user.last_activity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;