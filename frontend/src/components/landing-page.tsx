import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Users, 
  Building, 
  Briefcase, 
  Heart,
  Star,
  ChevronRight,
  Plane,
  Camera,
  Coffee,
  Loader2
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

interface LandingPageProps {
  onScreenChange: (screen: string) => void
}

export function LandingPage({ onScreenChange }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsSearching(true)
    setShowSuggestions(false)
    
    try {
      // Try to get AI response for the search query
      const response = await apiService.predict({ text: searchQuery })
      
      if (response.llm_response) {
        toast.success('AI found relevant information!')
        // Navigate to predict screen with the search query
        onScreenChange('predict')
      } else {
        // Navigate to planner for general planning
        onScreenChange('planner')
      }
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to planner
      onScreenChange('planner')
      toast.error('Using offline mode. Please check your connection.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.length > 2) {
      // Generate suggestions based on input
      const newSuggestions = [
        `Plan 3 days in ${value}`,
        `Best places to visit in ${value}`,
        `Things to do in ${value}`,
        `Hotels in ${value}`,
        `Weather in ${value}`
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    handleSearch()
  }

  const categories = [
    { 
      id: 'solo', 
      label: 'Solo Travel', 
      icon: Users, 
      color: 'from-purple-500 to-pink-500',
      description: 'Discover yourself'
    },
    { 
      id: 'family', 
      label: 'Family', 
      icon: Heart, 
      color: 'from-green-500 to-emerald-500',
      description: 'Create memories'
    },
    { 
      id: 'business', 
      label: 'Business', 
      icon: Briefcase, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Work & travel'
    },
    { 
      id: 'nomads', 
      label: 'Digital Nomads', 
      icon: Building, 
      color: 'from-orange-500 to-yellow-500',
      description: 'Remote work'
    }
  ]

  const destinations = [
    {
      name: 'Pokhara',
      country: 'Nepal',
      image: 'https://images.unsplash.com/photo-1552207311-2d6d6e8f1bd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmF2ZWwlMjBhZHZlbnR1cmUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzU3ODE4NDE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      activities: 12
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1683188687217-edec620b5b5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2UlMjB0cmF2ZWx8ZW58MXx8fHwxNzU3Nzc3NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.9,
      activities: 18
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1652176862396-99e525e9f87b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFuJTIwdHJhdmVsfGVufDF8fHx8MTc1Nzc1Mzg3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.7,
      activities: 25
    }
  ]

  const foods = [
    {
      name: 'Momo',
      location: 'Kathmandu, Nepal',
      image: 'https://images.unsplash.com/photo-1645813931787-74f5249fd3a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwdHJhdmVsfGVufDF8fHx8MTc1NzgxODQyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      price: '$2-5'
    },
    {
      name: 'Pad Thai',
      location: 'Bangkok, Thailand',
      image: 'https://images.unsplash.com/photo-1645813931787-74f5249fd3a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwdHJhdmVsfGVufDF8fHx8MTc1NzgxODQyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      price: '$1-3'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-teal-500/20 to-cyan-400/20" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
                Plan • Discover • Book
              </span>
              <br />
              <span className="text-foreground">Travel Smarter with</span>
              <br />
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Travella AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your intelligent travel companion for discovering hidden gems, planning perfect itineraries, and booking seamlessly
            </p>

            {/* Animated Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Plan 3 days in Pokhara..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 pr-16 py-4 text-lg rounded-2xl border-2 bg-background/80 backdrop-blur-sm"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Button variant="outline" className="rounded-full" onClick={() => onScreenChange('predict')}>
                <Camera className="w-4 h-4 mr-2" />
                Ask AI
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => onScreenChange('videos')}>
                <Plane className="w-4 h-4 mr-2" />
                Watch Videos
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => onScreenChange('booking')}>
                <Coffee className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Travel Your Way</h2>
            <p className="text-muted-foreground">Choose your travel style and let AI personalize your journey</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
              >
                <Card className="border-2 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/30">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.label}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold mb-4">Trending Destinations</h2>
              <p className="text-muted-foreground">Discover amazing places recommended by AI and travelers</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/70 text-white border-0">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {destination.rating}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{destination.country}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                    <p className="text-muted-foreground">{destination.activities} activities available</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Food & Hidden Gems */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Local Food & Hidden Gems</h2>
            <p className="text-muted-foreground">Authentic experiences curated by locals and AI recommendations</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {foods.map((food, index) => (
              <motion.div
                key={food.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-4 group cursor-pointer"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{food.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{food.location}</p>
                  <Badge variant="secondary">{food.price}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 via-teal-500 to-cyan-400">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Explore?
            </h2>
            <p className="text-white/90 mb-8">
              Start planning your next adventure with AI-powered recommendations
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-white/90 rounded-xl"
              onClick={() => onScreenChange('planner')}
            >
              Start Planning Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
