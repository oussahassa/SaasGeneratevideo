import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Lock, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(null)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    // Validate token exists
    if (!token || !email) {
      setTokenValid(false)
      toast.error(t('auth.invalidLink') || 'Invalid reset link')
    } else {
      setTokenValid(true)
    }
  }, [token, email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      toast.error(t('auth.fillAllFields') || 'Please fill in all fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.passwordWeak') || 'Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch') || 'Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        email,
        token,
        newPassword: formData.password
      })

      if (response.data.success) {
        setSuccess(true)
        toast.success(t('auth.resetSuccess') || 'Password reset successfully')
        setTimeout(() => navigate('/login'), 3000)
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(t('auth.tokenExpired') || 'Reset link has expired. Please request a new one.')
        setTimeout(() => navigate('/forgot-password'), 2000)
      } else {
        toast.error(error.response?.data?.message || 'Failed to reset password')
      }
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center max-w-md">
          <h2 className="text-white font-bold text-xl mb-4">{t('auth.invalidLink') || 'Invalid Reset Link'}</h2>
          <p className="text-gray-300 mb-6">{t('auth.linkInvalidExpired') || 'This password reset link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full"
          >
            {t('auth.requestNewLink') || 'Request New Link'}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 pt-24">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-white font-bold text-2xl mb-3">{t('auth.passwordResetSuccess') || 'Password Reset Success!'}</h2>
            <p className="text-gray-400 mb-6">
              {t('auth.passwordResetSuccessMsg') || 'Your password has been reset successfully. You can now log in with your new password.'}
            </p>
            <p className="text-gray-500 text-sm mb-6">{t('auth.redirecting') || 'Redirecting to login page...'}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              {t('auth.goToLogin') || 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 pt-24">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-white font-bold text-2xl mb-2">{t('auth.resetPassword')}</h1>
            <p className="text-gray-400">
              {t('auth.enterNewPassword') || 'Enter your new password below'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-white font-medium mb-2">{t('auth.newPassword')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">{t('auth.minCharacters') || 'At least 6 characters'}</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white font-medium mb-2">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Validation Message */}
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{t('auth.passwordMismatch') || 'Passwords do not match'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {loading ? `${t('common.loading')}...` : t('auth.resetPassword')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.rememberedPassword')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {t('auth.loginHere')}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-xs">
                ⏱️ {t('auth.linkExpiresTime') || 'Link expires in 30 minutes from when it was sent'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
