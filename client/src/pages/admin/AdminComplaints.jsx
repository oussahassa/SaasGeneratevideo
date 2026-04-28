import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle, MessageSquare, Trash2, Send, X, Check, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { fetchAllComplaints, respondComplaint, deleteComplaint } from '../../redux/slices/supportSlice';

export default function AdminComplaints() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { complaints, isLoading, error } = useSelector((state) => state.support);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [open, setOpen] = useState(false);

  // Fetch Complaints
  useEffect(() => {
    dispatch(fetchAllComplaints());
  }, [dispatch]);

  // Handle response to complaint
  const handleRespond = async (complaintId) => {
    if (!responseText.trim()) {
      toast.error(t('common.error'));
      return;
    }

    try {
      await dispatch(respondComplaint({ id: complaintId, response: responseText })).unwrap();
      toast.success(t('admin.complaints.complaintUpdated'));
      setOpen(false);
      setResponseText('');
      setSelectedComplaint(null);
    } catch (err) {
      toast.error(t('admin.complaints.failedToUpdate'));
    }
  };

  // Handle delete complaint
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm(t('admin.complaints.confirmDelete'))) return;

    try {
      await dispatch(deleteComplaint(complaintId)).unwrap();
      toast.success(t('admin.complaints.complaintDeleted'));
    } catch (err) {
      toast.error(t('admin.complaints.failedToDelete'));
    }
  };

  // Open response modal
  const openResponseModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.admin_response || '');
    setOpen(true);
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return '↓';
      case 'medium': return '→';
      case 'high': return '↑';
      case 'critical': return '↑↑';
      default: return '•';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      {console.log('Rendering complaints:', complaints)}
      <div className="p-6">
          <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-500 mb-2">{t('admin.complaints.title')}</h1>
        <p className="text-gray-400">{t('admin.complaints.title')}</p>
      </div>


        {/* Complaints List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : !complaints || complaints.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('admin.complaints.noComplaints')}</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div 
                key={complaint.id} 
                className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {complaint.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {t(`admin.complaints.${complaint.status}`)}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                        {getPriorityIcon(complaint.priority)} {t(`admin.complaints.${complaint.priority}`)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t('admin.complaints.from')}: <span className="font-medium">{complaint.user_name}</span> ({complaint.user_email})
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      {t('admin.complaints.date')}: {formatDate(complaint.created_at)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{complaint.description}</p>

                    {complaint.admin_response && (
                      <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-3 mb-3 border border-blue-500/30">
                        <div className="text-sm font-medium text-blue-400 mb-1">{t('support.adminResponse')}:</div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{complaint.admin_response}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => openResponseModal(complaint)}
                          className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content 
                          className="bg-slate-800 text-white text-xs px-2 py-1 rounded mt-1"
                          sideOffset={5}
                        >
                          {t('admin.complaints.respond')}
                          <Tooltip.Arrow className="fill-slate-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>

                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => handleDeleteComplaint(complaint.id)}
                          className="p-2 text-red-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content 
                          className="bg-slate-800 text-white text-xs px-2 py-1 rounded mt-1"
                          sideOffset={5}
                        >
                          {t('admin.complaints.delete')}
                          <Tooltip.Arrow className="fill-slate-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Response Modal - Radix UI Dialog */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('admin.complaints.respond')}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              {selectedComplaint && (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('admin.complaints.from')}: <span className="font-medium">{selectedComplaint.user_name}</span> ({selectedComplaint.user_email})
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('admin.complaints.subject')}: <span className="font-medium">{selectedComplaint.title}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 dark:text-gray-300">{selectedComplaint.description}</p>
                    </div>
                  </div>


                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('support.adminResponse')}
                    </label>
                    <ScrollArea.Root className="w-full rounded-lg border border-gray-200 dark:border-slate-600">
                      <ScrollArea.Viewport className="w-full h-[150px]">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
                          placeholder={t('support.adminResponsePlaceholder')}
                        />
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar orientation="vertical" className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-slate-700 transition-colors duration-150 ease-out hover:bg-gray-200 dark:hover:bg-slate-600">
                        <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-slate-500 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                        {t('common.cancel')}
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={() => handleRespond(selectedComplaint.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      {t('admin.complaints.sendResponse')}
                    </button>
                  </div>
                </>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Tooltip.Provider>
  );
}