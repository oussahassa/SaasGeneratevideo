import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const parseSaved = (val) => {
    if (!val) return null
    const v = String(val).toLowerCase()
    if (v === 'dark' || v === 'light') return v
    if (v === 'true') return 'dark'
    if (v === 'false') return 'light'
    return null
  }

  const getSystem = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      const normalized = parseSaved(saved)
      return normalized || 'light'
    } catch (e) {
      return 'light'
    }
  })

  // Apply class + persist
  useEffect(() => {
    const root = document.documentElement
    // add temporary smooth-transition helper class
    root.classList.add('theme-transition')
    const t = setTimeout(() => root.classList.remove('theme-transition'), 300)

    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')

    try { localStorage.setItem('theme', theme) } catch (e) {}
    return () => clearTimeout(t)
  }, [theme])

  // Listen to system preference changes and update only when no explicit user choice
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      try {
        const saved = parseSaved(localStorage.getItem('theme'))
        if (!saved) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      } catch (err) {
        // ignore
      }
    }
    if (mq && mq.addEventListener) mq.addEventListener('change', handler)
    else if (mq && mq.addListener) mq.addListener(handler)
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', handler)
      else if (mq && mq.removeListener) mq.removeListener(handler)
    }
  }, [])

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
