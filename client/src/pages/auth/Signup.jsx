import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { signupUser } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast'

const Signup = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const [confirmPassword, setConfirmPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector(state => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.firstName) {
      toast.error(t('auth.fillAllFields') || 'Please fill in all required fields')
      return
    }

    if (formData.password !== confirmPassword) {
      toast.error(t('auth.passwordMismatch') || 'Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.passwordWeak') || 'Password must be at least 6 characters')
      return
    }

    try {
      const result = await dispatch(signupUser(formData)).unwrap()
      toast.success(t('auth.accountCreated') || 'Account created successfully!')
      // Redirect to email verification
      navigate('/verify-email', { state: { email: formData.email } })
    } catch (err) {
      toast.error(err || 'Signup failed')
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-lg shadow-lg p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-gray-800 mb-2'>{t('auth.createAccount') || 'Create Account'}</h2>
            <p className='text-gray-500'>{t('auth.joinMessage') || 'Join NexAI and start creating amazing content'}</p>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label htmlFor='firstName' className='block text-sm font-semibold text-gray-700 mb-2'>
                  {t('auth.firstName') || 'First Name'}
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder='John'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label htmlFor='lastName' className='block text-sm font-semibold text-gray-700 mb-2'>
                  {t('auth.lastName') || 'Last Name'}
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder='Doe'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2'>
                {t('auth.email') || 'Email Address'}
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='you@example.com'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2'>
                {t('auth.password') || 'Password'}
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label htmlFor='confirmPassword' className='block text-sm font-semibold text-gray-700 mb-2'>
                {t('auth.confirmPassword') || 'Confirm Password'}
              </label>
              <input
                type='password'
                id='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {isLoading ? `${t('common.loading')}...` : t('auth.createAccount') || 'Create Account'}
            </button>
          </form>

          <div className='mt-6'>
            <p className='text-center text-gray-600 text-sm'>
              {t('auth.haveAccount') || 'Already have an account?'}{' '}
              <Link to='/login' className='text-blue-500 hover:text-blue-600 font-semibold'>
                {t('auth.signIn') || 'Sign in'}
              </Link>
            </p>
          </div>

          <div className='mt-6 pt-6 border-t border-gray-200'>
            <Link to='/' className='text-center block text-gray-500 hover:text-gray-700 text-sm'>
              ← {t('auth.backHome') || 'Back to home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
