import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useSelector } from 'react-redux'
import ThemeToggle from '../components/ThemeToggle'

const Layout = () => {

  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const auth = useSelector(state => state.auth) || {}
  const { isAuthenticated } = auth

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  return (
    <div className='fixed inset-0 flex flex-col bg-white dark:bg-slate-900'>

      <nav className='w-full px-8 h-14 flex items-center justify-between border-b shrink-0 bg-white dark:bg-slate-900 dark:border-slate-700 border-gray-200 z-10'>
        <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={()=> navigate('/')}/>
        {
          sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden'/> : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/> 
        }
        <div className='flex items-center gap-3'>
          <ThemeToggle />
        </div>
      </nav>
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
        <div className='flex-1 bg-[#F4F7FB] dark:bg-slate-900 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )

}

export default Layout