import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  Youtube,
  Building,
  MapPin,
  Utensils,
  Filter,
  RefreshCw,
  Upload,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { dataCollectionService, type DataCollectionItem, type CollectionStats } from '@/services/data-collection'
import { toast } from 'sonner'

export function DataCollectionPanel() {
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [items, setItems] = useState<DataCollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadStats()
    loadItems()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await dataCollectionService.getCollectionStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Failed to load collection statistics')
    }
  }

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const itemsData = await dataCollectionService.getCollectedItems(
        filterType === 'all' ? undefined : filterType,
        filterStatus === 'all' ? undefined : filterStatus
      )
      setItems(itemsData)
    } catch (error) {
      console.error('Error loading items:', error)
      toast.error('Failed to load collected items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (itemId: string) => {
    try {
      await dataCollectionService.approveItem(itemId)
      toast.success('Item approved successfully')
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error approving item:', error)
      toast.error('Failed to approve item')
    }
  }

  const handleReject = async (itemId: string) => {
    try {
      await dataCollectionService.rejectItem(itemId, 'Manual rejection')
      toast.success('Item rejected successfully')
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error rejecting item:', error)
      toast.error('Failed to reject item')
    }
  }

  const handleCollectFromYouTube = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsLoading(true)
    try {
      const newItems = await dataCollectionService.collectFromYouTube(searchQuery)
      toast.success(`Found ${newItems.length} videos`)
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error collecting from YouTube:', error)
      toast.error('Failed to collect from YouTube')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCollectFromBooking = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a destination')
      return
    }

    setIsLoading(true)
    try {
      const newItems = await dataCollectionService.collectFromBookingAPI(searchQuery)
      toast.success(`Found ${newItems.length} hotels`)
      loadItems()
      loadStats()
    } catch (error) {
      console.error('Error collecting from booking API:', error)
      toast.error('Failed to collect from booking API')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'destination': return <MapPin className="w-4 h-4" />
      case 'video': return <Youtube className="w-4 h-4" />
      case 'food': return <Utensils className="w-4 h-4" />
      case 'partner': return <Building className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Collected Items</TabsTrigger>
          <TabsTrigger value="collect">Collect Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Collected</p>
                      <p className="text-2xl font-bold">{stats.total_collected}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending_review}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Collection by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.by_type).map(([type, count]) => (
                    <div key={type} className="text-center p-4 border rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getTypeIcon(type)}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{type}s</p>
                      <p className="text-xl font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="items">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="destination">Destinations</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadItems} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(item.type)}
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Source: {item.source}</span>
                          <span>Collected: {new Date(item.collected_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleApprove(item.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReject(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collect">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-5 h-5" />
                  Collect from YouTube
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="youtube-query">Search Query</Label>
                  <Input
                    id="youtube-query"
                    placeholder="e.g., Nepal travel guide"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCollectFromYouTube}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Collecting...
                    </>
                  ) : (
                    <>
                      <Youtube className="w-4 h-4 mr-2" />
                      Collect Videos
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Collect from Booking APIs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="booking-destination">Destination</Label>
                  <Input
                    id="booking-destination"
                    placeholder="e.g., Pokhara, Nepal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCollectFromBooking}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Collecting...
                    </>
                  ) : (
                    <>
                      <Building className="w-4 h-4 mr-2" />
                      Collect Hotels
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
