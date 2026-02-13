import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FAQ() {
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
      toast.error('Failed to load FAQs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'features', label: 'Features' },
    { value: 'technical', label: 'Technical' }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-400">
            Find answers to common questions about NexAI
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs */}
        {loading ? (
          <div className="text-center text-slate-400">Loading FAQs...</div>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-medium text-white text-lg">
                      {faq.question}
                    </span>
                    {expandedId === faq.id ? (
                      <ChevronUp className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {expandedId === faq.id && (
                    <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50">
                      <p className="text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400">
                No FAQs found in this category.
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Didn't find your answer?
          </h2>
          <p className="text-slate-400 mb-6">
            Don't worry! Our support team is here to help. Submit a complaint and we'll get back to you as soon as possible.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
