import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUserPlan, upgradePlan } from '../redux/slices/userSlice'
import { fetchClientPacks } from '../redux/slices/packSlice'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { CreditCard, Loader } from 'lucide-react'
import api from '../utils/api'
import { API_ENDPOINTS } from '../config/api'

const Plan = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { plan, isLoading, error } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)
  const { packs, isLoading: packsLoading, error: packsError } = useSelector(state => state.pack)
  const { t } = useTranslation()
  
  const [selectedPackForPayment, setSelectedPackForPayment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    // Fetch available plans
    dispatch(fetchClientPacks())
    
    // Fetch user's current plan if authenticated
    console.log('User authenticated:', isAuthenticated)
    if (isAuthenticated) {
      dispatch(fetchUserPlan())
    }
  }, [isAuthenticated, dispatch])

  const initiatePayment = async (paymentMethod) => {
    if (!selectedPackForPayment) {
      toast.error(t('planDetails.selectPlan'))
      return
    }

    try {
      setPaymentLoading(true)
      const packPrice = selectedPackForPayment.price || 0

      if (packPrice === 0) {
        // Free plan - no payment needed
        dispatch(upgradePlan(selectedPackForPayment.id))
          .unwrap()
          .then(() => {
            toast.success(t('planDetails.upgradedSuccess'))
            dispatch(fetchUserPlan())
            setShowPaymentModal(false)
            setSelectedPackForPayment(null)
          })
          .catch((error) => {
            toast.error(error || t('planDetails.upgradeFailed'))
          })
      } else if (paymentMethod === 'stripe') {
        // Stripe payment
        const response = await api.post(API_ENDPOINTS.PAYMENTS.STRIPE_CREATE, {
          packId: selectedPackForPayment.id,
          amount: packPrice,
        })

        if (response.data.success) {
          window.location.href = response.data.url
        } else {
          toast.error(response.data.message || t('planDetails.paymentFailed'))
        }
      } else if (paymentMethod === 'paypal') {
        // PayPal payment
        const response = await api.post(API_ENDPOINTS.PAYMENTS.PAYPAL_CREATE, {
          packId: selectedPackForPayment.id,
          amount: packPrice,
        })

        if (response.data.success && response.data.approvalUrl) {
          window.location.href = response.data.approvalUrl
        } else {
          toast.error(response.data.message || t('planDetails.paymentFailed'))
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || t('planDetails.paymentFailed'))
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleUpgrade = (pack) => {
    if (!isAuthenticated) {
      toast.error(t('planDetails.pleasLogin'))
      navigate('/login')
      return
    }

    // Check if user already has this plan
    if (plan?.type === pack.name.toLowerCase()) {
      toast.info(t('planDetails.alreadyHavePlan'))
      return
    }

    setSelectedPackForPayment(pack)
    setShowPaymentModal(true)
  }

  // Determine if this is the most popular plan
  const getMostPopularPlan = () => {
    if (!packs || packs.length === 0) return null
    return packs.find(p => p.name.toLowerCase() === 'pro') || packs[1]
  }

  const mostPopularPlan = getMostPopularPlan()

  return (
    <div className='max-w-6xl mx-auto z-20 my-30 px-4'>
      <div className='text-center mb-16'>
        <h2 className='text-slate-700 text-[42px] font-semibold mb-4'>{t('planDetails.choosePlan')}</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>{t('planDetails.description')}</p>
        {plan?.exists && (
          <div className='mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg'>
            <p className='font-semibold'>{t('planDetails.currentPlan')} <span className='uppercase'>{plan.type}</span></p>
            <p className='text-sm'>{t('planDetails.credits')}: {plan.credits}</p>
          </div>
        )}
      </div>

      {(isLoading || packsLoading) && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>{t('planDetails.loading')}</p>
        </div>
      )}

      {(error || packsError) && (
        <div className='text-center py-12'>
          <p className='text-red-500'>{t('planDetails.error')} {error || packsError}</p>
        </div>
      )}

      {!isLoading && !packsLoading && !error && !packsError && packs && packs.length > 0 && (
        <div className='mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-sm:mx-8'>
          {packs.map((pack) => (
            <div 
              key={pack.id}
              className={`border-2 rounded-xl p-8 transition ${
                mostPopularPlan?.id === pack.id 
                  ? 'border-blue-500 relative transform scale-105' 
                  : 'border-gray-200 hover:border-blue-500'
              }`}
            >
              {/* Most Popular Badge */}
              {mostPopularPlan?.id === pack.id && (
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                  <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold'>
                    {t('planDetails.mostPopular')}
                  </span>
                </div>
              )}

              <h3 className={`text-2xl font-bold ${mostPopularPlan?.id === pack.id ? 'mt-4' : ''} text-slate-800 mb-2 capitalize`}>
                {pack.name}
              </h3>
              
              <p className='text-gray-500 mb-6'>
                {pack.description || t('planDetails.freeDesc')}
              </p>
              
              <div className='mb-6'>
                <p className='text-4xl font-bold text-slate-800'>
                  ${pack.price || 0}
                  <span className='text-lg text-gray-500'>{t('planDetails.perMonth')}</span>
                </p>
              </div>

              {pack.monthly_limit && (
                <p className='text-blue-600 font-medium mb-6'>
                  {pack.monthly_limit} {t('planDetails.creationsMonth')}
                </p>
              )}

              <ul className='space-y-4 mb-8'>
                {pack.features && pack.features.length > 0 ? (
                  pack.features.map((feature, idx) => (
                    <li key={idx} className='flex items-center text-gray-700'>
                      <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                      </svg>
                      {feature}
                    </li>
                  ))
                ) : (
                  <li className='text-gray-500 text-sm'>{t('planDetails.noFeatures')}</li>
                )}
              </ul>

              <button 
                onClick={() => handleUpgrade(pack)}
                disabled={plan?.type === pack.name.toLowerCase() || isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                  mostPopularPlan?.id === pack.id
                    ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50'
                } disabled:cursor-not-allowed`}
              >
                {plan?.type === pack.name.toLowerCase() 
                  ? t('planDetails.currentPlanBtn') 
                  : t('planDetails.upgradeTooltip', { plan: pack.name })}
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !packsLoading && (!packs || packs.length === 0) && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>{t('planDetails.noPlans')}</p>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && selectedPackForPayment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-8 dark:bg-slate-800'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              {t('planDetails.selectPaymentMethod')}
            </h2>
            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              {t('planDetails.upgradeTooltip', { plan: selectedPackForPayment.name })} - ${selectedPackForPayment.price}
            </p>

            {selectedPackForPayment.price === 0 ? (
              // Free plan - just ask for confirmation
              <div className='space-y-4'>
                <p className='text-center text-green-600 font-semibold'>
                  {t('planDetails.noPaymentRequired')}
                </p>
                <button
                  onClick={() => initiatePayment('free')}
                  disabled={paymentLoading}
                  className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {paymentLoading && <Loader className='w-5 h-5 animate-spin' />}
                  {t('planDetails.upgradeFree', 'Upgrade to Free')}
                </button>
              </div>
            ) : (
              // Paid plans - show payment method options
              <div className='space-y-4'>
                {/* Stripe Option */}
                <button
                  onClick={() => initiatePayment('stripe')}
                  disabled={paymentLoading}
                  className='w-full border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                >
                  {paymentLoading && <Loader className='w-5 h-5 animate-spin' />}
                  <CreditCard className='w-5 h-5' />
                  Stripe
                </button>

                {/* PayPal Option */}
                <button
                  onClick={() => initiatePayment('paypal')}
                  disabled={paymentLoading}
                  className='w-full border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
                >
                  {paymentLoading && <Loader className='w-5 h-5 animate-spin' />}
                  <CreditCard className='w-5 h-5' />
                  PayPal
                </button>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => {
                setShowPaymentModal(false)
                setSelectedPackForPayment(null)
              }}
              disabled={paymentLoading}
              className='w-full mt-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plan
       
            