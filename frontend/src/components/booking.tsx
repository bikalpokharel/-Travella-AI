import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Building, 
  Star, 
  Wifi, 
  Coffee, 
  Car,
  MapPin,
  Clock,
  Shield,
  Filter,
  Heart,
  Loader2,
  CheckCircle,
  CreditCard
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import type { BookingCreateRequest, BookingCreateResponse } from '@/types'

export function Booking() {
  const [activeTab, setActiveTab] = useState('flights')
  const [searchData, setSearchData] = useState({
    from: 'Kathmandu (KTM)',
    to: 'Pokhara (PKR)',
    date: '',
    travelers: 2
  })
  const [flights, setFlights] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userBookings, setUserBookings] = useState<BookingCreateResponse[]>([])
  const [showBookings, setShowBookings] = useState(false)
  const { isAuthenticated, token } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token) {
      loadUserBookings()
    }
  }, [isAuthenticated, token])

  const loadUserBookings = async () => {
    if (!token) return
    
    try {
      const bookings = await apiService.getUserBookings(token)
      setUserBookings(bookings)
    } catch (error) {
      console.error('Failed to load user bookings:', error)
    }
  }

  const handleBooking = async (item: any, type: 'flight' | 'hotel') => {
    if (!isAuthenticated || !token) {
      toast.error('Please sign in to make a booking')
      return
    }

    setIsLoading(true)
    try {
      const bookingData: BookingCreateRequest = {
        type,
        destination: searchData.to,
        check_in: searchData.date || new Date().toISOString().split('T')[0],
        travelers: searchData.travelers,
        budget: item.price
      }

      const booking = await apiService.createBooking(token, bookingData)
      setUserBookings(prev => [booking, ...prev])
      toast.success(`${type === 'flight' ? 'Flight' : 'Hotel'} booking confirmed!`)
    } catch (error) {
      console.error('Booking failed:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const defaultFlights = [
    {
      id: 1,
      airline: "Nepal Airlines",
      logo: "✈️",
      route: "KTM → PKR",
      departure: "08:30",
      arrival: "09:15",
      duration: "45m",
      price: 89,
      class: "Economy",
      stops: "Direct",
      partner: "Expedia"
    },
    {
      id: 2,
      airline: "Buddha Air",
      logo: "🛩️",
      route: "KTM → PKR",
      departure: "14:20",
      arrival: "15:05",
      duration: "45m",
      price: 95,
      class: "Economy",
      stops: "Direct",
      partner: "Booking.com"
    },
    {
      id: 3,
      airline: "Yeti Airlines",
      logo: "🏔️",
      route: "KTM → PKR",
      departure: "16:45",
      arrival: "17:30",
      duration: "45m",
      price: 92,
      class: "Economy",
      stops: "Direct",
      partner: "Kayak"
    }
  ]

  const defaultHotels = [
    {
      id: 1,
      name: "Mountain View Resort",
      rating: 4.8,
      reviews: 2847,
      location: "Lakeside, Pokhara",
      image: "https://images.unsplash.com/photo-1563418536438-e08af0d644ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU3Nzg1MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 85,
      originalPrice: 120,
      amenities: [Wifi, Coffee, Car],
      partner: "Hotels.com",
      deal: "20% OFF"
    },
    {
      id: 2,
      name: "Lakeside Paradise Hotel",
      rating: 4.6,
      reviews: 1923,
      location: "Phewa Lake, Pokhara",
      image: "https://images.unsplash.com/photo-1563418536438-e08af0d644ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU3Nzg1MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 65,
      originalPrice: 85,
      amenities: [Wifi, Coffee],
      partner: "Agoda",
      deal: "Free Breakfast"
    },
    {
      id: 3,
      name: "Himalayan Boutique Lodge",
      rating: 4.9,
      reviews: 856,
      location: "Old Bazaar, Pokhara",
      image: "https://images.unsplash.com/photo-1563418536438-e08af0d644ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU3Nzg1MjY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      price: 125,
      originalPrice: 150,
      amenities: [Wifi, Coffee, Car],
      partner: "Booking.com",
      deal: "Luxury Experience"
    }
  ]

  const handleSearch = async () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      toast.error('Please fill in all search fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Extract city names from the search data
      const fromCity = searchData.from.split(' ')[0].toLowerCase()
      const toCity = searchData.to.split(' ')[0].toLowerCase()
      
      if (activeTab === 'flights') {
        const response = await apiService.getEnhancedFlightRecommendations(
          fromCity, 
          toCity, 
          searchData.date, 
          searchData.travelers
        ) as any
        
        if (response.flights && response.flights.length > 0) {
          setFlights(response.flights)
        } else {
          setFlights(defaultFlights)
        }
      } else {
        const request = {
          city: toCity,
          pax: searchData.travelers,
          date: searchData.date
        }
        
        const response = await apiService.getHotelRecommendations(request) as any
        
        if (response.hotels && response.hotels.length > 0) {
          setHotels(response.hotels)
        } else {
          setHotels(defaultHotels)
        }
      }
      
      toast.success('Search completed successfully!')
    } catch (error) {
      console.error('Error searching:', error)
      
      // Fallback to default data
      if (activeTab === 'flights') {
        setFlights(defaultFlights)
      } else {
        setHotels(defaultHotels)
      }
      
      toast.error('Using offline mode. Please check your connection.')
    } finally {
      setIsLoading(false)
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
            <h1 className="text-3xl font-bold mb-2">Book Your Journey</h1>
            <p className="text-muted-foreground">Compare prices and book flights, hotels, and more with our trusted partners</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/30 rounded-2xl p-6"
          >
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From</label>
                <Input 
                  placeholder="Kathmandu (KTM)" 
                  value={searchData.from}
                  onChange={(e) => setSearchData({...searchData, from: e.target.value})}
                  className="h-10" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To</label>
                <Input 
                  placeholder="Pokhara (PKR)" 
                  value={searchData.to}
                  onChange={(e) => setSearchData({...searchData, to: e.target.value})}
                  className="h-10" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input 
                  type="date" 
                  value={searchData.date}
                  onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                  className="h-10" 
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-teal-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* User Bookings Section */}
          {isAuthenticated && userBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  My Bookings
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookings(!showBookings)}
                >
                  {showBookings ? 'Hide' : 'Show'} Bookings
                </Button>
              </div>
              
              {showBookings && (
                <div className="grid gap-4">
                  {userBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                              {booking.type === 'flight' ? (
                                <Plane className="w-6 h-6 text-white" />
                              ) : (
                                <Building className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {booking.type === 'flight' ? 'Flight' : 'Hotel'} to {booking.destination}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Booked on {new Date(booking.created_at).toLocaleDateString()}
                              </p>
                              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">${booking.price}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.type === 'flight' ? 'per person' : 'per night'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="flights" className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Hotels
              </TabsTrigger>
            </TabsList>

            {/* Flights Tab */}
            <TabsContent value="flights">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">{(flights.length > 0 ? flights : defaultFlights).length} flights found</p>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {(flights.length > 0 ? flights : defaultFlights).map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{flight.logo}</div>
                            <div>
                              <h3 className="font-semibold">{flight.airline}</h3>
                              <p className="text-sm text-muted-foreground">{flight.class} • {flight.stops}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="text-center">
                              <p className="text-lg font-semibold">{flight.departure}</p>
                              <p className="text-sm text-muted-foreground">KTM</p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <div className="w-16 h-px bg-border"></div>
                                <Plane className="w-4 h-4 text-primary" />
                                <div className="w-16 h-px bg-border"></div>
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              </div>
                              <p className="text-xs text-muted-foreground">{flight.duration}</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-lg font-semibold">{flight.arrival}</p>
                              <p className="text-sm text-muted-foreground">PKR</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">${flight.price}</p>
                            <p className="text-xs text-muted-foreground mb-2">via {flight.partner}</p>
                            <Button 
                              className="bg-gradient-to-r from-blue-600 to-teal-500"
                              onClick={() => handleBooking(flight, 'flight')}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Booking...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Book Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Hotels Tab */}
            <TabsContent value="hotels">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">{(hotels.length > 0 ? hotels : defaultHotels).length} hotels found</p>
                  <div className="flex gap-2">
                    <Select defaultValue="price-low">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                {(hotels.length > 0 ? hotels : defaultHotels).map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="md:flex">
                        <div className="md:w-80 h-48 md:h-auto relative">
                          <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Button size="icon" variant="outline" className="w-8 h-8 bg-white/80 backdrop-blur-sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          {hotel.deal && (
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-red-500 text-white">{hotel.deal}</Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="text-sm font-medium ml-1">{hotel.rating}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{hotel.location}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {hotel.amenities.map((Amenity: any, i: number) => (
                                  <div key={i} className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                                    <Amenity className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="mb-2">
                                {hotel.originalPrice && (
                                  <p className="text-sm text-muted-foreground line-through">${hotel.originalPrice}</p>
                                )}
                                <p className="text-2xl font-bold text-primary">${hotel.price}</p>
                                <p className="text-sm text-muted-foreground">per night</p>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">via {hotel.partner}</p>
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-teal-500"
                                onClick={() => handleBooking(hotel, 'hotel')}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Booking...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Book Now
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t bg-muted/30 p-4 md:p-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-semibold mb-4">Trusted by millions of travelers</h3>
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure Booking</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">24/7 Support</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">Best Price Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
