import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Heart, 
  MapPin, 
  Calendar,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Edit,
  Camera,
  Plane,
  Star,
  ChevronRight,
  Upload,
  Search,
  Video,
  Clock,
  Activity,
  Save,
  X
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import type { UserProfile } from '@/types'

export function Profile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [userStats, setUserStats] = useState({
    totalSearches: 0,
    totalPlans: 0,
    totalVideos: 0,
    totalBookings: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [profileData, setProfileData] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    phone: '',
    preferences: {
      travel_style: 'balanced',
      budget_range: 'medium',
      interests: []
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const { user, updateProfile } = useAuth()

  useEffect(() => {
    if (user?.profile) {
      setProfileData(user.profile)
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const success = await updateProfile(profileData)
      if (success) {
        setEditMode(false)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Simulate loading user stats (in a real app, this would come from the backend)
    const mockStats = {
      totalSearches: Math.floor(Math.random() * 50) + 10,
      totalPlans: Math.floor(Math.random() * 20) + 5,
      totalVideos: Math.floor(Math.random() * 100) + 20,
      totalBookings: Math.floor(Math.random() * 15) + 3
    }
    setUserStats(mockStats)

    // Mock recent activity
    const mockActivity = [
      { type: 'search', description: 'Searched for "Pokhara hotels"', time: '2 hours ago', icon: Search },
      { type: 'plan', description: 'Created 3-day Pokhara itinerary', time: '1 day ago', icon: Calendar },
      { type: 'video', description: 'Watched "Pokhara travel guide"', time: '2 days ago', icon: Video },
      { type: 'booking', description: 'Booked flight to Pokhara', time: '3 days ago', icon: Plane }
    ]
    setRecentActivity(mockActivity)
  }, [])

  const stats = [
    { label: 'Searches Made', value: userStats.totalSearches, icon: Search },
    { label: 'Trips Planned', value: userStats.totalPlans, icon: Calendar },
    { label: 'Videos Watched', value: userStats.totalVideos, icon: Video },
    { label: 'Bookings Made', value: userStats.totalBookings, icon: Plane }
  ]

  const recentTrips = [
    {
      id: 1,
      destination: 'Pokhara, Nepal',
      date: 'Dec 2024',
      image: '🏔️',
      status: 'Completed',
      rating: 5
    },
    {
      id: 2,
      destination: 'Bali, Indonesia',
      date: 'Nov 2024',
      image: '🏝️',
      status: 'Completed',
      rating: 4
    },
    {
      id: 3,
      destination: 'Tokyo, Japan',
      date: 'Jan 2025',
      image: '🗼',
      status: 'Upcoming',
      rating: null
    }
  ]

  const wishlist = [
    { id: 1, name: 'Santorini, Greece', image: '🇬🇷', type: 'destination' },
    { id: 2, name: 'Machu Picchu, Peru', image: '🏛️', type: 'destination' },
    { id: 3, name: 'Aurora Chasing, Iceland', image: '🌌', type: 'experience' }
  ]

  const menuItems = [
    { icon: Settings, label: 'Account Settings', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: CreditCard, label: 'Payment Methods', action: () => {} },
    { icon: Shield, label: 'Privacy & Security', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
    { icon: LogOut, label: 'Sign Out', action: () => {}, danger: true }
  ]

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Activity</h2>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Real-time
                </Badge>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <activity.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                          JS
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      {editMode ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input 
                              id="first_name"
                              value={profileData.first_name}
                              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input 
                              id="last_name"
                              value={profileData.last_name}
                              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                              placeholder="Enter last name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input 
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h1 className="text-2xl font-bold">
                            {profileData.first_name && profileData.last_name 
                              ? `${profileData.first_name} ${profileData.last_name}`
                              : user?.username || 'User'
                            }
                          </h1>
                          <p className="text-muted-foreground">{user?.email}</p>
                          {profileData.phone && (
                            <p className="text-sm mt-2">📞 {profileData.phone}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800">
                              {profileData.preferences.travel_style} Traveler
                            </Badge>
                            <Badge variant="outline">{profileData.preferences.budget_range} Budget</Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {editMode ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setEditMode(false)}
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setEditMode(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Reviewed Mountain View Resort</p>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Planned trip to Tokyo</p>
                        <p className="text-sm text-muted-foreground">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Added Santorini to wishlist</p>
                        <p className="text-sm text-muted-foreground">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Trips</h2>
                <Button className="bg-gradient-to-r from-blue-600 to-teal-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Plan New Trip
                </Button>
              </div>

              <div className="space-y-4">
                {recentTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{trip.image}</div>
                            <div>
                              <h3 className="font-semibold text-lg">{trip.destination}</h3>
                              <p className="text-muted-foreground">{trip.date}</p>
                              {trip.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < trip.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={trip.status === 'Completed' ? 'default' : 'secondary'}
                              className={trip.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {trip.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Wishlist</h2>
                <p className="text-muted-foreground">{wishlist.length} saved items</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {wishlist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl">{item.image}</div>
                          <Button variant="outline" size="icon">
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <Badge variant="secondary" className="mb-4">
                          {item.type}
                        </Badge>
                        <Button variant="outline" className="w-full">
                          Plan Trip
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Settings</h2>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified about trip updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Marketing</Label>
                      <p className="text-sm text-muted-foreground">Receive travel deals and tips</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Items */}
              <Card>
                <CardContent className="p-0">
                  {menuItems.map((item, index) => (
                    <div key={index}>
                      <button
                        onClick={item.action}
                        className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                          item.danger ? 'text-red-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {index < menuItems.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agency Features */}
              <Card className="border-dashed border-2">
                <CardContent className="p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Agency Features</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your logo and create white-label itineraries for your clients
                  </p>
                  <Button variant="outline">
                    Upgrade to Agency
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
