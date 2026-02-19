import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Support() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('submit');
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'bug',
    priority: 'medium'
  });

  const categories = [
    { value: 'bug', label: t('support.categories.bug') },
    { value: 'feature', label: t('support.categories.feature') },
    { value: 'billing', label: t('support.categories.billing') },
    { value: 'account', label: t('support.categories.account') },
    { value: 'other', label: t('support.categories.other') }
  ];

  const priorities = [
    { value: 'low', label: t('support.priorities.low') },
    { value: 'medium', label: t('support.priorities.medium') },
    { value: 'high', label: t('support.priorities.high') },
    { value: 'critical', label: t('support.priorities.critical') }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error(t('support.submit') || 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/support/create-complaint`, formData);
      if (response.data.success) {
        toast.success(t('support.submitted') || 'Complaint submitted successfully');
        setFormData({
          title: '',
          description: '',
          category: 'bug',
          priority: 'medium'
        });
        setActiveTab('my-complaints');
        fetchMyComplaints();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('support.failedToSubmit') || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/support/get-my-complaints`);
  
      if (response.data.success) {
        setMyComplaints(response.data.complaints);
      }
    } catch (error) {
      toast.error(t('support.failedToLoad') || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="text-yellow-500" />;
      case 'in_progress':
        return <Clock className="text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="text-green-500" />;
      default:
        return <AlertCircle className="text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('support.title')}
          </h1>
          <p className="text-xl text-slate-400">
            {t('support.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => {
              setActiveTab('submit');
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'submit'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t('support.submitComplaint')}
          </button>
          <button
            onClick={() => {
              setActiveTab('my-complaints');
              fetchMyComplaints();
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'my-complaints'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t('support.myComplaints')}
          </button>
        </div>

        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  {t('support.complaintTitle')}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={t('support.complaintTitle')}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {t('support.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('support.description')}
                  rows="5"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('support.category')}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    {t('support.priority')}
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {priorities.map(pri => (
                      <option key={pri.value} value={pri.value}>
                        {pri.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? t('support.submitting') : t('support.submit')}
              </button>
            </form>
          </div>
        )}

        {/* My Complaints Tab */}
        {activeTab === 'my-complaints' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-slate-400">{t('common.loading')}</div>
            ) : myComplaints.length > 0 ? (
              myComplaints.map(complaint => (
                <div
                  key={complaint.id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {complaint.title}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      <span className="text-white font-medium capitalize">
                        {t(`support.${complaint.status}`) || complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 mb-4">
                    {complaint.description}
                  </p>

                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-400">
                      {t('support.category')}: <span className="text-white capitalize">{complaint.category}</span>
                    </span>
                    <span className="text-slate-400">
                      {t('support.priority')}: <span className="text-white capitalize">{complaint.priority}</span>
                    </span>
                  </div>

                  {complaint.admin_response && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-400 text-sm mb-2">{t('support.adminResponse')}:</p>
                      <p className="text-slate-300">
                        {complaint.admin_response}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">
                {t('support.noComplaints')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
