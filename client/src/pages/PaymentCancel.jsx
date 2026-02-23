import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          {/* Icon */}
          <div className="relative z-10 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            No worries! Your payment was cancelled and no charges were made to your account.
            You can try again whenever you're ready.
          </p>

          {/* Info box */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-100">
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-gray-800">What happened:</span>
            </div>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                Payment process was interrupted
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                No charges were made
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                Your account remains unchanged
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/plan')}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-gray-500 mt-6">
            Need help? Contact our support team for assistance with your payment.
          </p>
        </div>

        {/* Back to plans link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}