import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserPlan, upgradePlan } from '../redux/slices/userSlice'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const Plan = () => {
  const dispatch = useDispatch()
  const { plan, isLoading, error } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)
  const { t } = useTranslation()

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserPlan())
    }
  }, [isAuthenticated, dispatch])

  const handleUpgrade = (planType) => {
    if (!isAuthenticated) {
      toast.error(t('planDetails.pleasLogin'))
      return
    }
    dispatch(upgradePlan(planType))
      .unwrap()
      .then(() => {
        toast.success(t('planDetails.upgradedSuccess'))
      })
      .catch((error) => {
        toast.error(error || t('planDetails.upgradeFailed'))
      })
  }

  return (
    <div className='max-w-6xl mx-auto z-20 my-30 px-4'>
      <div className='text-center mb-16'>
        <h2 className='text-slate-700 text-[42px] font-semibold mb-4'>{t('planDetails.choosePlan')}</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>{t('planDetails.description')}</p>
        {plan.exists && (
          <div className='mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg'>
            <p className='font-semibold'>{t('planDetails.currentPlan')} <span className='uppercase'>{plan.type}</span></p>
            <p className='text-sm'>{t('planDetails.credits')}: {plan.credits}</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>{t('planDetails.loading')}</p>
        </div>
      )}

      {error && (
        <div className='text-center py-12'>
          <p className='text-red-500'>{t('planDetails.error')} {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className='mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-sm:mx-8'>
          {/* Free Plan */}
          <div className='border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition'>
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>{t('planDetails.free')}</h3>
            <p className='text-gray-500 mb-6'>{t('planDetails.freeDesc')}</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$0<span className='text-lg text-gray-500'>{t('planDetails.perMonth')}</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.free5')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.basicAI')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.communityAccess')}
              </li>
            </ul>
            <button 
              disabled={plan.type === 'free'}
              className='w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'free' ? t('planDetails.currentPlanBtn') : t('planDetails.downgrade')}
            </button>
          </div>

          {/* Pro Plan */}
          <div className='border-2 border-blue-500 rounded-xl p-8 relative transform scale-105'>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
              <span className='bg-blue-500 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white px-4 py-1 rounded-full text-sm font-semibold'>{t('planDetails.mostPopular')}</span>
            </div>
            <h3 className='text-2xl font-bold text-slate-800 mb-2 mt-4'>{t('planDetails.pro')}</h3>
            <p className='text-gray-500 mb-6'>{t('planDetails.proDesc')}</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$9.99<span className='text-lg text-gray-500'>{t('planDetails.perMonth')}</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.unlimited')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.allAI')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.prioritySupport')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.videoGen')}
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={plan.type === 'pro' || isLoading}
              className='w-full py-3 px-6 bg-blue-500 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'pro' ? t('planDetails.currentPlanBtn') : t('planDetails.upgradeTooltip', { plan: 'Pro' })}
            </button>
          </div>

          {/* Premium Plan */}
          <div className='border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition'>
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>{t('planDetails.premium')}</h3>
            <p className='text-gray-500 mb-6'>{t('planDetails.premiumDesc')}</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$19.99<span className='text-lg text-gray-500'>{t('planDetails.perMonth')}</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.everythingPro')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.customAPI')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.dedicatedSupport')}
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                {t('planDetails.advancedAnalytics')}
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('premium')}
              disabled={plan.type === 'premium' || isLoading}
              className='w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'premium' ? t('planDetails.currentPlanBtn') : t('planDetails.upgradeTooltip', { plan: 'Premium' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plan
       
            