import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from '../../redux/slices/supportSlice';

export default function AdminFAQs() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { faqs, isLoading, error, success } = useSelector((state) => state.support);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general'
  });

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  const refetchFaqs = () => {
    dispatch(fetchFaqs());
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error(t('common.error'));
      return;
    }

    try {
      if (editingFaq) {
        await dispatch(updateFaq({ id: editingFaq.id, faqData: formData })).unwrap();
        toast.success(t('admin.faqs.faqUpdated'));
      } else {
        await dispatch(createFaq(formData)).unwrap();
        toast.success(t('admin.faqs.faqCreated'));
      }

      setShowModal(false);
      setEditingFaq(null);
      resetForm();
      refetchFaqs();
    } catch (error) {
      toast.error(editingFaq ? t('admin.faqs.failedToUpdate') : t('admin.faqs.failedToCreate'));
    }
  };

  // Handle delete FAQ
  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm(t('admin.faqs.confirmDelete'))) return;

    try {
      await dispatch(deleteFaq(faqId)).unwrap();
      toast.success(t('admin.faqs.faqDeleted'));
      refetchFaqs();
    } catch (error) {
      toast.error(t('admin.faqs.failedToDelete'));
    }
  };

  // Open modal for editing
  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setShowModal(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingFaq(null);
    resetForm();
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-2">{t('admin.faqs.title')}</h1>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('admin.faqs.title')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('admin.faqs.create')}
        </button>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('admin.faqs.noFAQs')}</div>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 hover:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white">{faq.question}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded"
                    title={t('admin.faqs.edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 rounded"
                    title={t('admin.faqs.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white">
                {editingFaq ? t('admin.faqs.edit') : t('admin.faqs.create')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-1">
                  {t('admin.faqs.question')}
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-1">
                  {t('admin.faqs.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="account">Account</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="features">Features</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-1">
                  {t('admin.faqs.answer')}
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingFaq ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}