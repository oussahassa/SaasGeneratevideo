import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchMyComplaints, clearError } from '../../redux/slices/supportSlice';

export default function MyComplaints() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { complaints, isLoading, error } = useSelector(state => state.support);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchMyComplaints());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = filter === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          {t('support.myComplaints')}
        </h1>
        <p className='text-gray-500'>
          {t('support.subtitle')}
        </p>
      </div>

      {/* Action Button */}
      <div className='mb-6'>
        <button
          onClick={() => navigate('/support')}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition'
        >
          <Plus className='w-5 h-5' />
          {t('support.submitComplaint')}
        </button>
      </div>

      {/* Filters */}
      <div className='mb-6 flex gap-2 flex-wrap'>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('support.all') || 'All'}
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'open'
              ? 'bg-yellow-500 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('support.open') || 'Open'}
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'in_progress'
              ? 'bg-blue-500 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('support.inProgress') || 'In Progress'}
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'resolved'
              ? 'bg-green-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t('support.resolved') || 'Resolved'}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className='text-center py-12 text-gray-500'>
          {t('common.loading')}
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className='grid gap-4'>
          {filteredComplaints.map(complaint => (
            <div
              key={complaint.id}
              className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-800'>
                    {complaint.title}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {getStatusIcon(complaint.status)}
                </div>
              </div>

              <p className='text-gray-600 mb-4'>
                {complaint.description}
              </p>

              <div className='flex flex-wrap gap-2 mb-4'>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                  {t(`support.${complaint.status}`) || complaint.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                  {t(`support.priorities.${complaint.priority}`) || complaint.priority}
                </span>
              </div>

              {complaint.admin_response && (
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <p className='text-sm font-medium text-gray-700 mb-2'>
                    {t('support.adminResponse')}:
                  </p>
                  <p className='text-gray-600'>
                    {complaint.admin_response}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <AlertCircle className='w-16 h-16 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 mb-4'>
            {t('support.noComplaints')}
          </p>
          <button
            onClick={() => navigate('/support')}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            {t('support.submitComplaint')}
          </button>
        </div>
      )}
    </div>
  );
}
