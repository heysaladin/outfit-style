'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with server default ('dark') — updated after mount to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sync to whatever the blocking script in layout.tsx already applied
    const actual = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setTheme(actual)
  }, [])

  function toggle() {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
