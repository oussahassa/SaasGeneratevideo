import React, { useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import Home from './pages/Home'
import Layout from './pages/Layout'
import AdminLayout from './pages/admin/AdminLayout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Dashboard from './pages/client/Dashboard'
import WriteArticle from './pages/client/WriteArticle'
import BlogTitles from './pages/client/BlogTitles'
import GenerateImages from './pages/client/GenerateImages'
import RemoveBackground from './pages/client/RemoveBackground'
import RemoveObject from './pages/client/RemoveObject'
import Community from './pages/client/Community'
import MyComplaints from './pages/client/MyComplaints'
import Plan from './pages/Plan'
import GenerateVideos from './pages/client/GenerateVideos'
import FAQ from './pages/FAQ'
import Support from './pages/client/Support'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPacks from './pages/admin/AdminPacks'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminFAQs from './pages/admin/AdminFAQs'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import EmailVerification from './pages/auth/EmailVerification'
import ForgotPassword from './pages/auth/ForgotPassword'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import { verifyToken } from './redux/slices/authSlice'
import './i18n/i18n'
import { useState } from 'react'
import ThemeToggle from './components/ThemeToggle'
import ResetPassword from './pages/auth/ResetPassword'
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
        {/* Theme toggle (desktop fixed) - also present in headers */}
        <div className="fixed top-4 right-4 z-50 hidden md:block">
          <ThemeToggle />
        </div>

    <div>
    {/*  <Toaster />*/ } 
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/verify-email' element={<EmailVerification />}/>
        <Route path='/forgot-password' element={<ForgotPassword />}/>
        <Route path='/reset-password' element={<ResetPassword />}/>
        <Route path='/plan' element={<Plan />}/>
        <Route path='/faq' element={<FAQ />}/>
        <Route path='/payment/success' element={<PaymentSuccess />}/>
        <Route path='/payment/cancel' element={<PaymentCancel />}/>

        {/* Client Protected Routes */}
        <Route path='/ai' element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />}/>
          <Route path='write-article' element={<WriteArticle />}/>
          <Route path='blog-titles' element={<BlogTitles />}/>
          <Route path='generate-images' element={<GenerateImages />}/>
          <Route path='remove-background' element={<RemoveBackground />}/>
          <Route path='remove-object' element={<RemoveObject />}/>
          <Route path='community' element={<Community />}/>
          <Route path='generate-videos' element={<GenerateVideos />}/>
          <Route path='my-complaints' element={<MyComplaints />}/>
          <Route path='support' element={<Support />}/>

        </Route>

        <Route path='/support' element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Support />}/>
        </Route>

        {/* Admin Protected Routes */}
        <Route path='/admin-dashboard' element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminOverview />}/>
          <Route path='users' element={<AdminUsers />}/>
          <Route path='packs' element={<AdminPacks />}/>
          <Route path='complaints' element={<AdminComplaints />}/>
          <Route path='faqs' element={<AdminFAQs />}/>
          <Route path='analytics' element={<AdminOverview />}/>
        </Route>
      </Routes>
      </div>
      </div>
  )
}

export default App
