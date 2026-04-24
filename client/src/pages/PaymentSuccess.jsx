import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { fetchUserPlan } from '../redux/slices/userSlice';
import api from '../utils/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const payerId = searchParams.get('PayerID');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // Verify Stripe payment
        if (sessionId) {
          const response = await api.get(`/payments/stripe/verify?session_id=${sessionId}`);
          if (response.data.success) {
            setVerified(true);
            dispatch(fetchUserPlan());
            toast.success(t('payment.paymentSuccessful', 'Payment successful! Your plan has been upgraded.'));
          } else {
            setError(response.data.message || t('payment.verificationFailed'));
          }
        }
        // Verify PayPal payment
        else if (paymentId && payerId) {
          const response = await api.get(`/payments/paypal/verify?payment_id=${paymentId}&payer_id=${payerId}`);
          if (response.data.success) {
            setVerified(true);
            dispatch(fetchUserPlan());
            toast.success(t('payment.paymentSuccessful', 'Payment successful! Your plan has been upgraded.'));
          } else {
            setError(response.data.message || t('payment.verificationFailed'));
          }
        } else {
          setError(t('payment.noPaymentData', 'No payment information found'));
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.message || t('payment.verificationError', 'Failed to verify payment'));
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentId, payerId, dispatch, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {loading ? (
          /* Loading State */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-xl text-center">
            <div className="flex justify-center mb-6">
              <div className="animate-spin">
                <CheckCircle className="w-16 h-16 text-blue-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('payment.verifyingPayment', 'Verifying your payment...')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('payment.pleasWait', 'Please wait while we confirm your payment and upgrade your plan.')}
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-red-200 dark:border-red-700 shadow-xl text-center">
            <div className="relative z-10 mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              {t('payment.paymentFailed', 'Payment Verification Failed')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {error}
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {t('payment.tryAgain', 'Try Again')}
            </button>
          </div>
        ) : verified ? (
          /* Success State */
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-xl text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

            {/* Icon */}
            <div className="relative z-10 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {t('payment.paymentSuccessfulTitle', 'Payment Successful!')}
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {t('payment.congratulations', 'Congratulations! Your subscription has been activated successfully. You now have access to all premium features.')}
            </p>

            {/* Features */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{t('payment.whatsIncluded', "What's included:")}</span>
              </div>
              <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('payment.unlimitedGenerations', 'Unlimited AI generations')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('payment.advancedAnalytics', 'Advanced analytics dashboard')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('payment.prioritySupport', 'Priority support')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {t('payment.exportFormats', 'Export to multiple formats')}
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/ai')}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              {t('payment.startCreating', 'Start Creating')}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Additional info */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {t('payment.confirmationEmail', 'A confirmation email has been sent to your inbox with your subscription details.')}
            </p>
          </div>
        ) : null}

        {/* Additional actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/plan')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
          >
            {t('payment.viewAllPlans', 'View all plans →')}
          </button>
        </div>
      </div>
    </div>
  );
}