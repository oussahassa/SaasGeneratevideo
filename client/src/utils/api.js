import axios from 'axios'
import { getAuthToken, getRefreshToken, setAuthToken, clearAuthAll } from './authCookies'
import { encodeToBase64, decodeFromBase64, createSecureHeaders } from './security'

export const baseURL = import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
})

let isRefreshing = false
let pendingRequests = []

const processQueue = (error, token = null) => {
  pendingRequests.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  pendingRequests = []
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    // Add secure headers
    const secureHeaders = createSecureHeaders(token)
    Object.assign(config.headers, secureHeaders)
  }

  // Encode request body for sensitive endpoints
  if (config.data && config.secure) {
    config.data = { encodedData: encodeToBase64(config.data) }
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    // Decode response data if it's encoded
    if (response.data && response.data.encodedData) {
      try {
        response.data.data = decodeFromBase64(response.data.encodedData)
        delete response.data.encodedData
      } catch (error) {
        console.error('Failed to decode response data:', error)
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          pendingRequests.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        const resp = await axios.post(`${baseURL}/auth/refresh`, { token: refreshToken })
        const newToken = resp.data.token
        setAuthToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearAuthAll()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
