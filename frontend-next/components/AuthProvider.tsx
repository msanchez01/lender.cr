'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AuthContext,
  type AuthUser,
  type RegisterData,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  authLogin,
  authRegister,
  authGetMe,
  authRefreshToken,
} from '@/lib/auth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await authGetMe(token)
      setUser(userData)
    } catch {
      // Token might be expired — try refresh
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const { access_token } = await authRefreshToken(refreshToken)
          setTokens(access_token, refreshToken)
          const userData = await authGetMe(access_token)
          setUser(userData)
        } catch {
          clearTokens()
          setUser(null)
        }
      } else {
        clearTokens()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const response = await authLogin(email, password)
    setTokens(response.access_token, response.refresh_token)
    setUser(response.user)
    return response.user
  }

  const register = async (data: RegisterData): Promise<AuthUser> => {
    const response = await authRegister(data)
    setTokens(response.access_token, response.refresh_token)
    setUser(response.user)
    return response.user
  }

  const logout = () => {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
