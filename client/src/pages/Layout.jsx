import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {

  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='fixed inset-0 flex flex-col'>

      <nav className='w-full px-8 h-14 flex items-center justify-between border-b border-gray-200 shrink-0 bg-white z-10'>
        <img className='cursor-pointer w-32 sm:w-44' src={assets.logo} alt="" onClick={()=> navigate('/')}/>
        {
          sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden'/> : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/> 
        }
      </nav>
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
        <div className='flex-1 bg-[#F4F7FB] overflow-y-auto'>
          <Outlet />
        </div>
      </div>

    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout