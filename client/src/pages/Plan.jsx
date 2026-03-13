import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, X, CreditCard, DollarSign, Smartphone } from 'lucide-react';

export default function Plans() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackForPayment, setSelectedPackForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL+'/without-auth/get-packs-clients');
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
    // If it's the free plan, upgrade directly
    if (pack.price === 0 || pack.name.toLowerCase() === 'free') {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL + '/user/upgrade-plan', {
          packId: pack.id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          toast.success('Successfully upgraded to ' + pack.name + ' plan!');
          // Refresh user data or redirect to dashboard
          setTimeout(() => {
            window.location.href = '/ai';
          }, 2000);
        } else {
          toast.error(response.data.message || 'Upgrade failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to upgrade plan');
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      // For paid plans, show payment modal
      setSelectedPackForPayment(pack);
      setShowPaymentModal(true);
    }
  };

  const handlePayment = async (paymentMethod) => {
    if (!selectedPackForPayment) return;

    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL+`/payments/${paymentMethod}/create`, {
        packId: selectedPackForPayment.id,
        amount: selectedPackForPayment.price,
        currency: paymentMethod === 'paymee' ? 'TND' : 'USD'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        if (paymentMethod === 'stripe') {
          // Redirect to Stripe Checkout
          window.location.href = response.data.url;
        } else if (paymentMethod === 'paypal') {
          // Redirect to PayPal approval
          window.location.href = response.data.approvalUrl;
        } else if (paymentMethod === 'paymee') {
          // Redirect to Paymee payment page
          window.location.href = response.data.paymentUrl;
        }
      }
    } catch (error) {
      toast.error('Payment initialization failed');
      console.error(error);
    } finally {
      setPaymentLoading(false);
      setShowPaymentModal(false);
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPackForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Payment Method
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Subscribe to {selectedPackForPayment.name} plan for ${selectedPackForPayment.price}/month
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handlePayment('stripe')}
                disabled={paymentLoading}
                className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Stripe</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Credit/Debit Card</div>
                </div>
              </button>

              <button
                onClick={() => handlePayment('paypal')}
                disabled={paymentLoading}
                className="w-full flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors disabled:opacity-50"
              >
                <DollarSign className="w-6 h-6 text-yellow-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">PayPal</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">PayPal Account</div>
                </div>
              </button>

              <button
                onClick={() => handlePayment('paymee')}
                disabled={paymentLoading}
                className="w-full flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors disabled:opacity-50"
              >
                <Smartphone className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Paymee</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tunisian Payment</div>
                </div>
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
