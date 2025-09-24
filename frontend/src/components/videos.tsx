import { useState, useEffect } from 'react'
import { createElement } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Heart, 
  Share2, 
  Filter,
  MapPin,
  Eye,
  Bookmark,
  Instagram,
  Youtube,
  Music,
  Loader2
} from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

export function Videos() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlace, setCurrentPlace] = useState('pokhara')

  const defaultVideos = [
    {
      id: 1,
      title: "Hidden Waterfalls in Pokhara",
      creator: "@nepalwanderer",
      duration: "0:45",
      views: "124K",
      likes: "8.2K",
      location: "Pokhara, Nepal",
      platform: "tiktok",
      thumbnail: "https://images.unsplash.com/photo-1552207311-2d6d6e8f1bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU3ODE4NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "nature"
    },
    {
      id: 2,
      title: "Street Food Tour Bangkok",
      creator: "@foodietravels",
      duration: "1:20",
      views: "89K",
      likes: "5.7K",
      location: "Bangkok, Thailand",
      platform: "instagram",
      thumbnail: "https://images.unsplash.com/photo-1645813931787-74f5249fd3a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwdHJhdmVsfGVufDF8fHx8MTc1NzgxODQyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "food"
    },
    {
      id: 3,
      title: "Tokyo Neon Nights",
      creator: "@citylights_jp",
      duration: "0:38",
      views: "256K",
      likes: "15.3K",
      location: "Tokyo, Japan",
      platform: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1652176862396-99e525e9f87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFuJTIwdHJhdmVsfGVufDF8fHx8MTc1Nzc1Mzg3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "city"
    },
    {
      id: 4,
      title: "Bali Beach Sunrise",
      creator: "@tropicalvibes",
      duration: "1:05",
      views: "187K",
      likes: "12.1K",
      location: "Bali, Indonesia",
      platform: "tiktok",
      thumbnail: "https://images.unsplash.com/photo-1683188687217-edec620b5b5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2UlMjB0cmF2ZWx8ZW58MXx8fHwxNzU3Nzc3NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "nature"
    },
    {
      id: 5,
      title: "Budget Backpacking Tips",
      creator: "@backpackbudget",
      duration: "2:15",
      views: "94K",
      likes: "7.8K",
      location: "Southeast Asia",
      platform: "youtube",
      thumbnail: "https://images.unsplash.com/photo-1605446994677-9b99e0d6647f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjB2aWRlbyUyMGNvbnRlbnQlMjBjcmVhdG9yfGVufDF8fHx8MTc1NzgxODU4OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "tips"
    },
    {
      id: 6,
      title: "Himalayan Tea Gardens",
      creator: "@mountaineer_stories",
      duration: "1:42",
      views: "156K",
      likes: "9.4K",
      location: "Darjeeling, India",
      platform: "instagram",
      thumbnail: "https://images.unsplash.com/photo-1552207311-2d6d6e8f1bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU3ODE4NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "culture"
    }
  ]

  // Load videos on component mount
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getVideos({ place: currentPlace })
      
      if (response.videos && response.videos.length > 0) {
        setVideos(response.videos)
      } else {
        setVideos(defaultVideos)
      }
      toast.success('Videos loaded successfully!')
    } catch (error) {
      console.error('Error loading videos:', error)
      setVideos(defaultVideos)
      toast.error('Using offline mode. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const response = await apiService.getVideos({ place: searchQuery.toLowerCase() })
      
      if (response.videos && response.videos.length > 0) {
        setVideos(response.videos)
        setCurrentPlace(searchQuery.toLowerCase())
      } else {
        toast.error('No videos found for this destination')
      }
    } catch (error) {
      console.error('Error searching videos:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filters = [
    { value: 'all', label: 'All Videos' },
    { value: 'nature', label: 'Nature' },
    { value: 'food', label: 'Food' },
    { value: 'city', label: 'City' },
    { value: 'culture', label: 'Culture' },
    { value: 'tips', label: 'Tips' }
  ]

  const filteredVideos = (videos.length > 0 ? videos : defaultVideos).filter(video => {
    const matchesFilter = selectedFilter === 'all' || video.category === selectedFilter
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return Music
      case 'instagram': return Instagram
      case 'youtube': return Youtube
      default: return Play
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok': return 'from-pink-500 to-red-500'
      case 'instagram': return 'from-purple-500 to-pink-500'
      case 'youtube': return 'from-red-500 to-red-600'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Header */}
      <div className="p-4 md:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-16 md:top-20 z-40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2">Travel Videos</h1>
            <p className="text-muted-foreground">Discover amazing places through short videos from creators worldwide</p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by place or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="h-10 px-4 bg-gradient-to-r from-blue-600 to-teal-500"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[9/16] bg-gradient-to-br from-muted to-muted/50">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Platform Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getPlatformColor(video.platform)} flex items-center justify-center`}>
                        {createElement(getPlatformIcon(video.platform), { className: "w-4 h-4 text-white" })}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/70 text-white border-0 text-xs">
                        {video.duration}
                      </Badge>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                      >
                        <Play className="w-8 h-8 text-white ml-1" />
                      </motion.div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{video.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/70 text-xs">
                        <span>{video.creator}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{video.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{video.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Button variant="outline" className="px-8">
              Load More Videos
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 md:bottom-6 right-4 flex flex-col gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Button size="icon" className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Bookmark className="w-5 h-5" />
          </Button>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Button size="icon" className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <Share2 className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
