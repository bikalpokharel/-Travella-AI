import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  MapPin,
  Bot,
  Play,
  Building,
  User,
  Menu,
  X,
  Shield,
  LogIn,
  LogOut
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationProps {
  currentScreen: string
  onScreenChange: (screen: string) => void
  onAdminMode?: () => void
  isAuthenticated?: boolean
  onAuthClick?: () => void
}

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'planner', label: 'Planner', icon: MapPin },
  { id: 'predict', label: 'AI Chat', icon: Bot },
  { id: 'videos', label: 'Videos', icon: Play },
  { id: 'booking', label: 'Booking', icon: Building },
  { id: 'profile', label: 'Profile', icon: User },
]

export function Navigation({ currentScreen, onScreenChange, onAdminMode, isAuthenticated, onAuthClick }: NavigationProps) {
  const { user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Travella AI
              </span>
            </motion.div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={currentScreen === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onScreenChange(item.id)}
                    className={cn(
                      "flex items-center gap-2",
                      currentScreen === item.id && "bg-gradient-to-r from-blue-600 to-teal-500"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </motion.div>
              ))}
              {/* Authentication Button */}
              {isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-muted-foreground hidden lg:inline">
                    Welcome, {user?.username}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAuthClick}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Button>
                </motion.div>
              )}

              {isAdmin && onAdminMode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navigationItems.length + 1) * 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAdminMode}
                    className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Travella AI
              </span>
            </motion.div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentScreen === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onScreenChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-2 justify-start",
                      currentScreen === item.id && "bg-gradient-to-r from-blue-600 to-teal-500"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
                
                {/* Mobile Auth Button */}
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAuthClick?.()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 justify-start"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                )}

                {isAdmin && onAdminMode && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onAdminMode()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 justify-start border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:h-16" />
    </>
  )
}
