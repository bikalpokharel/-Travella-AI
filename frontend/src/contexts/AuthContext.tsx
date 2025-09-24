import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '@/services/api'
import type { UserLoginResponse, UserProfile } from '@/types'
import { toast } from 'sonner'

interface AuthContextType {
  user: UserLoginResponse['user'] | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserLoginResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('user_token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await apiService.verifyUser(tokenToVerify)
      setUser(response.user)
      setToken(tokenToVerify)
      localStorage.setItem('user_token', tokenToVerify)
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('user_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiService.userLogin({ username, password })
      
      setUser(response.user)
      setToken(response.access_token)
      localStorage.setItem('user_token', response.access_token)
      
      toast.success(`Welcome back, ${response.user.username}!`)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiService.userRegister({ username, email, password })
      
      setUser(response.user)
      setToken(response.access_token)
      localStorage.setItem('user_token', response.access_token)
      
      toast.success(`Welcome to Travella AI, ${response.user.username}!`)
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Username might already exist.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user_token')
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false
    
    try {
      const response = await apiService.updateUserProfile(token, profileData)
      
      // Update user state with new profile data
      setUser(prev => prev ? { ...prev, profile: response.profile } : null)
      
      toast.success('Profile updated successfully')
      return true
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile')
      return false
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
