import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle, MessageSquare, Eye, Trash2, Send } from 'lucide-react';

export default function AdminComplaints() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Fetch Complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/support/get-all-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
      }
    } catch (error) {
      toast.error(t('admin.complaints.failedToLoad'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle response to complaint
  const handleRespond = async (complaintId) => {
    if (!responseText.trim()) {
      toast.error(t('common.error'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/support/respond-complaint/${complaintId}`, {
        response: responseText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(t('admin.complaints.complaintUpdated'));
      setShowResponseModal(false);
      setResponseText('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error(t('admin.complaints.failedToUpdate'));
    }
  };

  // Handle delete complaint
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm(t('admin.complaints.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/support/delete-complaint/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.complaints.complaintDeleted'));
      fetchComplaints();
    } catch (error) {
      toast.error(t('admin.complaints.failedToDelete'));
    }
  };

  // Open response modal
  const openResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.admin_response || '');
    setShowResponseModal(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('admin.complaints.title')}</h1>
        <p className="text-gray-400">{t('admin.complaints.title')}</p>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">{t('common.loading')}</div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400">{t('admin.complaints.noComplaints')}</div>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                      {t(`admin.complaints.${complaint.status}`)}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                      {t(`admin.complaints.${complaint.priority}`)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {t('admin.complaints.from')}: {complaint.user_name} ({complaint.user_email})
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    {t('admin.complaints.date')}: {formatDate(complaint.created_at)}
                  </div>
                  <p className="text-gray-300 mb-3">{complaint.description}</p>

                  {complaint.admin_response && (
                    <div className="bg-slate-700 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-blue-400 mb-1">{t('support.adminResponse')}:</div>
                      <p className="text-gray-300 text-sm">{complaint.admin_response}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openResponseModal(complaint)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded"
                    title={t('admin.complaints.respond')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteComplaint(complaint.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                    title={t('admin.complaints.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">{t('admin.complaints.respond')}</h2>
              <div className="text-sm text-gray-400">
                {t('admin.complaints.from')}: {selectedComplaint.user_name} ({selectedComplaint.user_email})
              </div>
              <div className="text-sm text-gray-400 mb-4">
                {t('admin.complaints.subject')}: {selectedComplaint.title}
              </div>
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <p className="text-gray-300">{selectedComplaint.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('support.adminResponse')}
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder={t('support.adminResponse')}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleRespond(selectedComplaint.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {t('admin.complaints.respond')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}