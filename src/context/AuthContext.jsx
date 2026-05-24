import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [mustChangePassword, setMustChangePassword] = useState(() => localStorage.getItem('mustChangePassword') === 'true')

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    localStorage.setItem('mustChangePassword', mustChangePassword)
  }, [mustChangePassword])

  const login = (userData, jwtToken, changePassword = false) => {
    setUser(userData)
    setToken(jwtToken)
    setMustChangePassword(changePassword)
  }

  const clearMustChangePassword = () => setMustChangePassword(false)

  const logout = () => {
    setUser(null)
    setToken(null)
    setMustChangePassword(false)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, mustChangePassword, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
