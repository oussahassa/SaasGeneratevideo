import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Hash, House, SquarePen, Image, Eraser, Scissors, FileText, Users, LogOut, Video, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { logoutUser, fetchUserPlan } from '../redux/slices/authSlice'

const Sidebar = ({ sidebar, setSidebar }) => {
  const { t } = useTranslation()
  const { user, plan, credits } = useSelector(state => state.auth);
  const dispatch = useDispatch();



  const navItems = [
    {to: '/ai', label: t('user.dashboard') || 'Dashboard', Icon: House},
    {to: '/ai/write-article', label: t('dashboard.articles') || 'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label: t('blogTitles.title') || 'Blog Titles', Icon: Hash},
    {to: '/ai/generate-images', label: t('dashboard.imagesGenerated') || 'Generate Images', Icon: Image},
    {to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser},
    {to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors},
    {to: '/ai/generate-videos', label: t('videos.generateVideo') || 'Generate Videos', Icon: Video},
    {to: '/ai/community', label: t('community.title') || 'Community', Icon: Users},
    {to: '/ai/my-complaints', label: t('user.myComplaints') || 'My Complaints', Icon: MessageSquare},
  ]

  const handleSignOut = () => {
    dispatch(logoutUser());
  };

  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className='my-7 w-full'>
        <img src={user?.profile_picture || 'https://via.placeholder.com/56'} alt="User avatar" className='w-14 rounded-full mx-auto'/>
        <h1 className='mt-1 text-center'>{user?.first_name} {user?.last_name}</h1>
        <div className='px-6 mt-5 text-sm text-gray-600 font-medium'>
          {navItems.map(({to, label, Icon})=> (
            <NavLink key={to} to={to} end={to === '/ai'} onClick={()=> setSidebar(false)} className={({isActive})=> `px-3.5 py-2.5 flex items.center gap-3 rounded ${isActive ? 'bg-linear-to-r from-[#E24A4A] to-[#B0001E] text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white' : ''}`}>
              {({ isActive })=>(
                <>
                <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white' : ''}`}/>
                {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
        <div className='flex gap-2 items-center cursor-pointer'>
          <img src={user?.profile_picture || 'https://via.placeholder.com/32'} className='w-8 rounded-full' alt="" />
          <div>
            <h1 className='text-sm font-medium'>{user?.first_name} {user?.last_name}</h1>
            <p className='text-xs text-gray-500'>{plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'} Plan</p>
            <p className='text-xs text-gray-400'>Credits: {credits ?? 0}</p>
          </div>
        </div>
        <LogOut onClick={handleSignOut} className='w-4.5 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-gray-700 transition cursor-pointer'/>
      </div>
    </div>
  )
}

export default Sidebar
