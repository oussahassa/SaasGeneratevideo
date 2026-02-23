import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify payment with backend
      toast.success('Payment successful! Your subscription is now active.');
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          {/* Icon */}
          <div className="relative z-10 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Payment Successful!
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Congratulations! Your subscription has been activated successfully.
            You now have access to all premium features and unlimited AI generations.
          </p>

          {/* Features */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-800">What's included:</span>
            </div>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Unlimited AI generations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Advanced analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Export to multiple formats
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/ai')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Additional info */}
          <p className="text-xs text-gray-500 mt-4">
            A confirmation email has been sent to your inbox with your subscription details.
          </p>
        </div>

        {/* Additional actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/plan')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View all plans →
          </button>
        </div>
      </div>
    </div>
  );
}