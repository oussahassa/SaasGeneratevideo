import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { fetchUsers, toggleUserStatus, deleteUser } from '../../redux/slices/adminSlice';

export default function AdminUsers() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { users, pagination, isLoading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: 10, search: searchTerm }));
  }, [dispatch, page, searchTerm]);

  const refetchUsers = () => {
    dispatch(fetchUsers({ page, limit: 10, search: searchTerm }));
  };

  // Handle user actions
  const handleToggleUser = async (userItem) => {
    try {
      await dispatch(toggleUserStatus({ userId: userItem.id, isBlocked: !userItem.is_blocked })).unwrap();
      toast.success(userItem.is_blocked ? t('admin.users.userUnblocked') : t('admin.users.userBlocked'));
      refetchUsers();
    } catch (error) {
      toast.error(t('admin.users.failedToUpdate'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.users.confirmDelete'))) return;

    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success(t('admin.users.userDeleted'));
      refetchUsers();
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-2">{t('admin.users.title')}</h1>
        <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('admin.users.title')}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 w-5 h-5" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white    dark:bg-slate-800 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white    dark:bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.joined')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
                    {t('admin.users.noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-semibold mr-3">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
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
          <div className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
            {t('admin.users.page')} {pagination.page} {t('admin.users.of')} {pagination.pages} ({pagination.total} {t('admin.users.total')})
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((old) => Math.min(old + 1, pagination.pages))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}