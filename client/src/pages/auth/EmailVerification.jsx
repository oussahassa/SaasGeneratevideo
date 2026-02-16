import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import axios from 'axios'

const EmailVerification = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [timer, setTimer] = useState(0)

  // Get email from location state
  const email = location.state?.email

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
          <h2 className="text-white font-bold text-xl mb-4">{t('common.error')}</h2>
          <p className="text-gray-300 mb-6">{t('auth.noEmailFound') || 'No email found. Please sign up again.'}</p>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t('auth.backToSignup') || 'Back to Signup'}
          </button>
        </div>
      </div>
    )
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!code || code.length !== 6) {
      toast.error(t('auth.invalidCode') || 'Please enter a valid 6-digit code')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
        email,
        verificationCode: code
      })

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.token)
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken)
        if (response.data.user) dispatch({ type: 'auth/setUser', payload: response.data.user })
        
        toast.success(t('auth.emailVerified') || 'Email verified successfully!')
        navigate('/ai')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setResendLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        email
      })

      if (response.data.success) {
        toast.success(t('auth.codeSent') || 'Verification code sent to your email')
        // Start cooldown timer
        setResendDisabled(true)
        setTimer(60)
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setResendDisabled(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 pt-24">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="text-white font-bold text-2xl mb-2">{t('auth.verifyEmail')}</h1>
            <p className="text-gray-400">
              {t('auth.codeSentTo') || "We've sent a 6-digit code to"}<br />
              <span className="font-semibold text-blue-400">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">{t('auth.verificationCode')}</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
              />
              <p className="text-gray-400 text-xs mt-2">
                {t('auth.codeExpires')} 10 {t('auth.minutes')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {loading ? `${t('common.loading')}...` : t('auth.verify')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-gray-400 text-sm text-center mb-4">{t('auth.noCodeReceived')}</p>
            <button
              onClick={handleResend}
              disabled={resendDisabled || resendLoading}
              className="w-full px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {resendLoading ? `${t('common.loading')}...` : 
               resendDisabled ? `${t('auth.resendIn')} ${timer}s` : 
               t('auth.resendCode')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {t('auth.wrongEmail')}{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {t('auth.signUpAgain')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
