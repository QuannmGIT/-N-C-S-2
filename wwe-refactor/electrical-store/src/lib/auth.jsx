/* eslint-disable react-refresh/only-export-components -- provider, hook and context are one unit, same shape as toast.jsx */

import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

/**
 * Replaces the missing js/auth-nav.js: fetches /api/me once for the whole app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // ready only after the initial /api/auth/me check has settled — pages that
  // need auth (e.g. /account) must not redirect on a hard reload before this.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api('/api/auth/me').then((res) => {
      if (res.ok && res.data.loggedIn) {
        setUser({ username: res.data.username, email: res.data.email })
      }
    }).catch(() => {}).finally(() => setReady(true))
  }, [])

  const logout = async () => {
    await api('/api/auth/logout', {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
