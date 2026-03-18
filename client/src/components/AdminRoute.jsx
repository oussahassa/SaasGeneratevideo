import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = ({ children, roles = ['admin'] }) => {
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth)

  // Show a spinner while auth state is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !roles.includes(user.role)) {
    // If non-admin user tried to reach admin URL, send to regular dashboard path.
    return <Navigate to="/ai" replace />
  }

  return children
}

export default AdminRoute
