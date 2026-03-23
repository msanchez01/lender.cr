'use client'

import { createContext, useContext } from 'react'
import api from '@/lib/api-client'

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
  preferred_language: string
  email_verified: boolean
  kyc_verified: boolean
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (data: RegisterData) => Promise<AuthUser>
  logout: () => void
  refreshUser: () => Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role: 'borrower' | 'investor'
  preferred_language: string
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider not mounted') },
  register: async () => { throw new Error('AuthProvider not mounted') },
  logout: () => {},
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

// Token helpers
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Auth API calls
export async function authLogin(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function authRegister(registerData: RegisterData) {
  const { data } = await api.post('/auth/register', registerData)
  return data
}

export async function authGetMe(token: string) {
  const { data } = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function authRefreshToken(refreshToken: string) {
  const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
  return data
}

export async function authForgotPassword(email: string) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data
}

export async function authResetPassword(token: string, newPassword: string) {
  const { data } = await api.post('/auth/reset-password', { token, new_password: newPassword })
  return data
}

export async function authVerifyEmail(token: string) {
  const { data } = await api.post(`/auth/verify-email?token=${token}`)
  return data
}
