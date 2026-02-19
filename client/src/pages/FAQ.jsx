import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/support/get-faqs');
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      toast.error(t('faq.failedToLoad', 'Failed to load FAQs'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: t('faq.all') },
    { value: 'general', label: t('faq.general') },
    { value: 'subscription', label: t('faq.subscription') },
    { value: 'features', label: t('faq.features') },
    { value: 'technical', label: t('faq.technical') }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen   dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">{t('common.loading')}</div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white    dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 hover:border-blue-600 transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white text-lg">
                      {faq.question}
                    </span>
                    {expandedId === faq.id ? (
                      <ChevronUp className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {expandedId === faq.id && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 bg-white    dark:bg-slate-900/50">
                      <p className="text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
                {t('faq.noFaqs', 'No FAQs found in this category.')}
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-white    dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">
            {t('faq.didntFind')}
          </h2>
          <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-6">
            {t('faq.support')}
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold py-3 px-8 rounded-lg transition-colors">
            {t('faq.contactSupport')}
          </button>
        </div>
      </div>
    </div>
  );
}
