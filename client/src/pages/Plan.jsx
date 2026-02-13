import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function Plans() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/packs/get-all-packs');
      if (response.data.success) {
        setPacks(response.data.packs);
      }
    } catch (error) {
      toast.error('Failed to load plans');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (pack) => {
    try {
      // This would integrate with your payment system
      toast.success(`Selected ${pack.name} plan`);
      setSelectedPlan(pack.id);
      // Call your subscription endpoint
    } catch (error) {
      toast.error('Failed to select plan');
    }
  };

  const defaultFeatures = {
    free: [
      'Write Articles (AI-Powered)',
      'Generate Blog Titles',
      '10 Creations/Month',
      'Basic Dashboard',
      'Community Access',
      'Email Support'
    ],
    premium: [
      'Write Articles (AI-Powered)',
      'Generate Blog Titles',
      'Generate Images',
      'Remove Background',
      'Remove Objects',
      'Generate Videos',
      'Unlimited Creations',
      'Advanced Analytics',
      'Priority Support',
      'Social Media Sharing',
      'Export to Multiple Formats',
      'API Access'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pricing Plans
          </h1>
          <p className="text-xl text-slate-400 mb-4">
            Choose the perfect plan for your needs
          </p>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="text-center text-slate-400">Loading plans...</div>
        ) : packs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className={`rounded-lg border-2 transition-all duration-300 ${
                  selectedPlan === pack.id
                    ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20'
                    : 'border-slate-700 bg-slate-800 hover:border-blue-500/50'
                }`}
              >
                {/* Plan Badge */}
                {pack.name.toLowerCase() === 'premium' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-white mb-2 capitalize">
                    {pack.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white">
                      ${pack.price || 0}
                    </div>
                    {pack.price > 0 && (
                      <p className="text-slate-400 text-sm">per month</p>
                    )}
                  </div>

                  {/* Description */}
                  {pack.description && (
                    <p className="text-slate-400 text-sm mb-6">
                      {pack.description}
                    </p>
                  )}

                  {/* Limit */}
                  {pack.monthly_limit && (
                    <p className="text-blue-400 text-sm font-medium mb-6">
                      {pack.monthly_limit} creations/month
                    </p>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(pack)}
                    className={`w-full py-3 rounded-lg font-bold transition-all mb-8 ${
                      selectedPlan === pack.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {selectedPlan === pack.id ? '✓ Selected' : 'Get Started'}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white mb-4">
                      What's included:
                    </h4>
                    {pack.features && pack.features.length > 0 ? (
                      <ul className="space-y-3">
                        {pack.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">No features listed</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
            <p className="text-slate-400 mb-4">No plans available at the moment</p>
            <button
              onClick={fetchPacks}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Comparison Section */}
        {packs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full bg-slate-800 rounded-lg border border-slate-700">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-bold">Feature</th>
                    {packs.map(pack => (
                      <th key={pack.id} className="px-6 py-4 text-center text-white font-bold capitalize">
                        {pack.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Write Articles', 'Blog Titles', 'Images', 'Remove Background', 'Remove Objects', 'Generate Videos', 'Unlimited Creations', 'Analytics', 'Support'].map((feature, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-slate-300 font-medium">{feature}</td>
                      {packs.map(pack => (
                        <td key={pack.id} className="px-6 py-4 text-center">
                          {pack.features && pack.features.some(f => f.toLowerCase().includes(feature.toLowerCase())) ? (
                            <Check size={20} className="text-green-400 mx-auto" />
                          ) : (
                            <X size={20} className="text-slate-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Questions about plans?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Can I change my plan?</h4>
              <p className="text-slate-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Is there a free trial?</h4>
              <p className="text-slate-400 text-sm">
                Yes! Try our free plan with 10 creations per month to see if NexAI is right for you.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-slate-400 text-sm">
                If you're not satisfied within 30 days, we offer a full refund. No questions asked.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-400 text-sm">
                Absolutely! Cancel your subscription anytime. No hidden fees or long-term contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
