import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/theme-provider'
import { Navigation } from './components/navigation'
import { LandingPage } from './components/landing-page'
import { Planner } from './components/planner'
import { Predict } from './components/predict'
import { Videos } from './components/videos'
import { Booking } from './components/booking'
import { Profile } from './components/profile'
import { AdminLogin } from './components/admin-login'
import { AdminDashboard } from './components/admin-dashboard'
import { Toaster } from './components/ui/sonner'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)

  useEffect(() => {
    // Check for existing admin token
    const token = localStorage.getItem('admin_token')
    if (token) {
      setAdminToken(token)
      setIsAdminMode(true)
    }
  }, [])

  const handleAdminLogin = (token: string) => {
    setAdminToken(token)
    setIsAdminMode(true)
  }

  const handleAdminLogout = () => {
    setAdminToken(null)
    setIsAdminMode(false)
    localStorage.removeItem('admin_token')
  }

  const renderScreen = () => {
    if (isAdminMode) {
      if (!adminToken) {
        return <AdminLogin onLoginSuccess={handleAdminLogin} />
      }
      return <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />
    }

    switch (currentScreen) {
      case 'home':
        return <LandingPage onScreenChange={setCurrentScreen} />
      case 'planner':
        return <Planner />
      case 'predict':
        return <Predict />
      case 'videos':
        return <Videos />
      case 'booking':
        return <Booking />
      case 'profile':
        return <Profile />
      default:
        return <LandingPage onScreenChange={setCurrentScreen} />
    }
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="travella-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        {!isAdminMode && (
          <Navigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            onAdminMode={() => setIsAdminMode(true)}
          />
        )}
        
        <AnimatePresence mode="wait">
          <motion.main
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.main>
        </AnimatePresence>

        {/* System Status Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-2 left-2 z-50"
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700 dark:text-green-400">All systems operational</span>
          </div>
        </motion.div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
