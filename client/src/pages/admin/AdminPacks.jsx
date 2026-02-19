import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function AdminPacks() {
  const { t } = useTranslation();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    monthly_limit: 0,
    features: ['']
  });

  // Fetch Packs
  const fetchPacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/packs/get-all-packs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPacks(response.data.packs || []);
      }
    } catch (error) {
      toast.error(t('admin.packs.failedToLoad'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0) {
      toast.error(t('common.error'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const cleanFeatures = formData.features.filter(f => f.trim() !== '');

      if (editingPack) {
        await axios.put(`${import.meta.env.VITE_API_URL}/packs/update-pack/${editingPack.id}`, {
          ...formData,
          features: cleanFeatures
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('admin.packs.packUpdated'));
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/packs/create-pack`, {
          ...formData,
          features: cleanFeatures
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('admin.packs.packCreated'));
      }

      setShowModal(false);
      setEditingPack(null);
      resetForm();
      fetchPacks();
    } catch (error) {
      toast.error(editingPack ? t('admin.packs.failedToUpdate') : t('admin.packs.failedToCreate'));
    }
  };

  // Handle delete pack
  const handleDeletePack = async (packId) => {
    if (!window.confirm(t('admin.packs.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/packs/delete-pack/${packId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.packs.packDeleted'));
      fetchPacks();
    } catch (error) {
      toast.error(t('admin.packs.failedToDelete'));
    }
  };

  // Open modal for editing
  const openEditModal = (pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name,
      description: pack.description,
      price: pack.price,
      monthly_limit: pack.monthly_limit,
      features: pack.features || ['']
    });
    setShowModal(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingPack(null);
    resetForm();
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      monthly_limit: 0,
      features: ['']
    });
  };

  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  // Add feature
  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  // Remove feature
  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('admin.packs.title')}</h1>
          <p className="text-gray-400">{t('admin.packs.title')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('admin.packs.create')}
        </button>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400">{t('common.loading')}</div>
          </div>
        ) : packs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400">{t('admin.packs.noPacks')}</div>
          </div>
        ) : (
          packs.map((pack) => (
            <div key={pack.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{pack.name}</h3>
                  <p className="text-gray-400 text-sm">{pack.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(pack)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded"
                    title={t('admin.packs.edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePack(pack.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                    title={t('admin.packs.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('admin.packs.price')}:</span>
                  <span className="text-white font-semibold">${pack.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('admin.packs.limit')}:</span>
                  <span className="text-white">
                    {pack.monthly_limit === 0 ? t('admin.packs.unlimited') : pack.monthly_limit}
                  </span>
                </div>
              </div>

              {pack.features && pack.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">{t('admin.packs.features')}:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {pack.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingPack ? t('admin.packs.edit') : t('admin.packs.create')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('admin.packs.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('admin.packs.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('admin.packs.price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('admin.packs.limit')}
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_limit}
                    onChange={(e) => setFormData({ ...formData, monthly_limit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {t('admin.packs.features')}
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + {t('common.add')}
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder={`${t('admin.packs.features')} ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingPack ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}