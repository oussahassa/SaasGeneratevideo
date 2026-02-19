import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Mail, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email
      })

      if (response.data.success) {
        setSubmitted(true)
        toast.success('Reset link sent to your email')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 pt-24">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-2xl mb-3">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-6">
              We've sent a password reset link to <span className="font-semibold text-blue-400">{email}</span>
            </p>
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300">
                ⏱️ {t('auth.linkExpires')} 30 {t('auth.minutes')}
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm mb-6">
              The link will open a page where you can create a new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 pt-24">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white" />
            </div>
            <h1 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-2xl mb-2">{t('auth.forgotPassword')}</h1>
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
            >
              {loading ? `${t('common.loading')}...` : t('auth.sendResetLink')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">
              {t('auth.remembered')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {t('auth.loginHere')}
              </button>
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          {t('auth.secureEmail')}
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
