import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Users
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/get-all-users?page=${page}&limit=10&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error(t('admin.users.failedToLoad'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm]);

  // Handle user actions
  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/block-user/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.users.userBlocked'));
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('admin.users.failedToUpdate'));
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/unblock-user/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.users.userUnblocked'));
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('admin.users.failedToUpdate'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.users.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.users.userDeleted'));
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(t('admin.users.failedToDelete'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('admin.users.title')}</h1>
        <p className="text-gray-400">{t('admin.users.title')}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.users.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.users.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.users.joined')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    {t('admin.users.noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.is_blocked ? (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title={t('admin.users.unblock')}
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1"
                            title={t('admin.users.block')}
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title={t('admin.users.delete')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            {t('admin.users.page')} {pagination.page} {t('admin.users.of')} {pagination.pages} ({pagination.total} {t('admin.users.total')})
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}