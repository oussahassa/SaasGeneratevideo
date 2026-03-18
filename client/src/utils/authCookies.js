// client/src/utils/authCookies.js

const isSecure = window.location.protocol === 'https:'

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict${isSecure ? '; Secure' : ''}`
}

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict${isSecure ? '; Secure' : ''}`
}

export const setAuthToken = (token) => setCookie('auth_token', token)
export const getAuthToken = () => getCookie('auth_token')
export const clearAuthToken = () => deleteCookie('auth_token')

export const setRefreshToken = (token) => setCookie('refresh_token', token)
export const getRefreshToken = () => getCookie('refresh_token')
export const clearRefreshToken = () => deleteCookie('refresh_token')

export const setAuthUser = (user) => {
  try {
    setCookie('auth_user', JSON.stringify(user))
  } catch (error) {
    console.error('Failed to set auth_user cookie', error)
  }
}
export const getAuthUser = () => {
  const cookie = getCookie('auth_user')
  if (!cookie) return null
  try {
    return JSON.parse(cookie)
  } catch (error) {
    console.error('Failed to parse auth_user cookie', error)
    return null
  }
}
export const clearAuthUser = () => deleteCookie('auth_user')

export const clearAuthAll = () => {
  clearAuthToken()
  clearRefreshToken()
  clearAuthUser()
}
