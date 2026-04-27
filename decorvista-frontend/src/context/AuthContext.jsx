import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('decorvista_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('decorvista_token')

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await getMe()
        const resolvedUser = response.user ?? response.data ?? response
        setUser(resolvedUser)
        setToken(storedToken)
      } catch {
        localStorage.removeItem('decorvista_token')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (nextToken, nextUser) => {
    localStorage.setItem('decorvista_token', nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem('decorvista_token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      logout,
      setUser,
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
