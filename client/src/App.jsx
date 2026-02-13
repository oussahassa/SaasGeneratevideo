import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import BlogTitles from './pages/BlogTitles'
import GenerateImages from './pages/GenerateImages'
import RemoveBackground from './pages/RemoveBackground'
import RemoveObject from './pages/RemoveObject'
import Community from './pages/Community'
import Plan from './pages/Plan'
import GenerateVideos from './pages/GenerateVideos'
import FAQ from './pages/FAQ'
import Support from './pages/Support'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EmailVerification from './pages/EmailVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import {Toaster} from 'react-hot-toast'
import { verifyToken } from './redux/slices/authSlice'
import './i18n/i18n'

const App = () => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()

  useEffect(() => {
    // Set document direction based on language
    if (i18n.language === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = i18n.language
    }
  }, [i18n.language])

  useEffect(() => {
    // Verify token on app load
    dispatch(verifyToken())
  }, [dispatch])

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/verify-email' element={<EmailVerification />}/>
        <Route path='/forgot-password' element={<ForgotPassword />}/>
        <Route path='/reset-password' element={<ResetPassword />}/>
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />}/>
          <Route path='write-article' element={<WriteArticle />}/>
          <Route path='blog-titles' element={<BlogTitles />}/>
          <Route path='generate-images' element={<GenerateImages />}/>
          <Route path='remove-background' element={<RemoveBackground />}/>
          <Route path='remove-object' element={<RemoveObject />}/>
          <Route path='community' element={<Community />}/>
        </Route>
        <Route path='/plan' element={<Plan />}/>
        <Route path='/generate-videos' element={<GenerateVideos />}/>
        <Route path='/faq' element={<FAQ />}/>
        <Route path='/support' element={<Support />}/>
        <Route path='/admin-dashboard' element={<AdminDashboard />}/>
      </Routes>
    </div>
  )
}

export default App
