import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserPlan, upgradePlan } from '../redux/slices/userSlice'
import toast from 'react-hot-toast'

const Plan = () => {
  const dispatch = useDispatch()
  const { plan, isLoading, error } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserPlan())
    }
  }, [isAuthenticated, dispatch])

  const handleUpgrade = (planType) => {
    if (!isAuthenticated) {
      toast.error('Please login to upgrade your plan')
      return
    }
    dispatch(upgradePlan(planType))
      .unwrap()
      .then(() => {
        toast.success('Plan upgraded successfully!')
      })
      .catch((error) => {
        toast.error(error || 'Failed to upgrade plan')
      })
  }

  return (
    <div className='max-w-6xl mx-auto z-20 my-30 px-4'>
      <div className='text-center mb-16'>
        <h2 className='text-slate-700 text-[42px] font-semibold mb-4'>Choose your plan</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale up as you grow. Find the perfect plan for your content creation needs.</p>
        {plan.exists && (
          <div className='mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg'>
            <p className='font-semibold'>Current Plan: <span className='uppercase'>{plan.type}</span></p>
            <p className='text-sm'>Credits: {plan.credits}</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Loading plans...</p>
        </div>
      )}

      {error && (
        <div className='text-center py-12'>
          <p className='text-red-500'>Error loading plans: {error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className='mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-sm:mx-8'>
          {/* Free Plan */}
          <div className='border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition'>
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>Free</h3>
            <p className='text-gray-500 mb-6'>Perfect for getting started</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$0<span className='text-lg text-gray-500'>/month</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                5 creations per month
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Basic AI tools
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Community access
              </li>
            </ul>
            <button 
              disabled={plan.type === 'free'}
              className='w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className='border-2 border-blue-500 rounded-xl p-8 relative transform scale-105'>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
              <span className='bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold'>Most Popular</span>
            </div>
            <h3 className='text-2xl font-bold text-slate-800 mb-2 mt-4'>Pro</h3>
            <p className='text-gray-500 mb-6'>For growing creators</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$9.99<span className='text-lg text-gray-500'>/month</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Unlimited creations
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                All AI tools
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Priority support
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Video generation
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={plan.type === 'pro' || isLoading}
              className='w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className='border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 transition'>
            <h3 className='text-2xl font-bold text-slate-800 mb-2'>Premium</h3>
            <p className='text-gray-500 mb-6'>For professional creators</p>
            <div className='mb-6'>
              <p className='text-4xl font-bold text-slate-800'>$19.99<span className='text-lg text-gray-500'>/month</span></p>
            </div>
            <ul className='space-y-4 mb-8'>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Everything in Pro
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Custom API access
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Dedicated support
              </li>
              <li className='flex items-center text-gray-700'>
                <svg className='w-5 h-5 text-green-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                </svg>
                Advanced analytics
              </li>
            </ul>
            <button 
              onClick={() => handleUpgrade('premium')}
              disabled={plan.type === 'premium' || isLoading}
              className='w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
            >
              {plan.type === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Plan
