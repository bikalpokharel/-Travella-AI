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
import { AuthModal } from './components/auth-modal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from './components/ui/sonner'

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

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

  const handleScreenChange = (screen: string) => {
    // Check if user needs to be authenticated for certain screens
    const protectedScreens = ['booking', 'profile']
    if (protectedScreens.includes(screen) && !isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    setCurrentScreen(screen)
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
        return <LandingPage onScreenChange={handleScreenChange} />
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
        return <LandingPage onScreenChange={handleScreenChange} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Travella AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {!isAdminMode && (
        <Navigation
          currentScreen={currentScreen}
          onScreenChange={handleScreenChange}
          onAdminMode={() => setIsAdminMode(true)}
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthModal(true)}
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
        className="fixed bottom-4 right-4 z-40"
      >
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs text-green-600 dark:text-green-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Travella AI Online</span>
          </div>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false)
              // Optionally navigate to the intended screen
            }}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="travella-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}