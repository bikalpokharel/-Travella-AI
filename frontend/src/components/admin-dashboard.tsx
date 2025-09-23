import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LogOut, 
  Users, 
  BarChart3, 
  Settings, 
  Video, 
  Plane, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Shield, 
  Bell,
  Search,
  Calendar,
  Clock,
  Database,
  Cpu,
  Wifi,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import { apiService } from '@/services/api'
import type { DashboardStats } from '@/types'

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [adminInfo, setAdminInfo] = useState<{ username: string } | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    verifyAdmin()
    loadDashboardStats()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [token])

  const verifyAdmin = async () => {
    try {
      const response = await apiService.verifyAdmin(token)
      setAdminInfo({ username: response.username })
    } catch (error) {
      console.error('Admin verification failed:', error)
      toast.error('Session expired. Please login again.')
      onLogout()
    }
  }

  const loadDashboardStats = async () => {
    try {
      const dashboardStats = await apiService.getDashboardStats(token)
      setStats(dashboardStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.adminLogout(token)
      localStorage.removeItem('admin_token')
      toast.success('Logged out successfully')
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('admin_token')
      onLogout()
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    loadDashboardStats()
  }

  const getSystemHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Travella AI Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {adminInfo?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {adminInfo?.username}
                </span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {adminInfo?.username}!
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your Travella AI platform today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Searches
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_searches.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Search className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">
                      Real-time
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Trip Plans
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_plans.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      Generated
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Videos Viewed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_videos.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Video className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">
                      Watched
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Bookings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.total_bookings.toLocaleString() || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Plane className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Popular Destinations */}
        {stats?.popular_destinations && stats.popular_destinations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.popular_destinations.map((destination, index) => (
                <Card key={destination.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{destination.name}</h4>
                        <p className="text-sm text-gray-600">{destination.searches} searches</p>
                      </div>
                    </div>
                    <Badge className={destination.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {destination.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                      {destination.trend}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* System Health & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <Card className="p-6">
              <div className="space-y-4">
                {stats?.system_health && Object.entries(stats.system_health).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {service === 'database' && <Database className="w-5 h-5 text-gray-500" />}
                      {service === 'llm_service' && <Cpu className="w-5 h-5 text-gray-500" />}
                      {service === 'video_service' && <Video className="w-5 h-5 text-gray-500" />}
                      {service === 'prediction_model' && <BarChart3 className="w-5 h-5 text-gray-500" />}
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {service.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge className={getSystemHealthColor(status)}>
                      {getSystemHealthIcon(status)}
                      <span className="ml-1 capitalize">{status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <Card className="p-6">
              <div className="space-y-3">
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  stats.recent_activity.slice(-5).reverse().map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.details}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">User Analytics</h4>
                  <p className="text-sm text-gray-600">View user engagement metrics</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">System Reports</h4>
                  <p className="text-sm text-gray-600">Generate detailed reports</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Content Management</h4>
                  <p className="text-sm text-gray-600">Manage videos and content</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">System Settings</h4>
                  <p className="text-sm text-gray-600">Configure system parameters</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}