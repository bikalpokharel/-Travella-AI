import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  Download,
  Share2,
  Coffee,
  Camera,
  Utensils,
  Mountain,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

export function Planner() {
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    travelers: 2,
    budget: [1000],
    travelStyle: 'balanced'
  })
  const [showItinerary, setShowItinerary] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [itinerary, setItinerary] = useState<any>(null)

  const defaultItinerary = [
    {
      day: 1,
      title: "Arrival & City Exploration",
      activities: [
        {
          time: "09:00 AM",
          title: "Lakeside Walk",
          type: "sightseeing",
          icon: Mountain,
          description: "Peaceful morning walk along Phewa Lake with mountain views",
          duration: "2 hours",
          cost: "Free",
          rating: 4.8
        },
        {
          time: "12:00 PM",
          title: "Local Dal Bhat",
          type: "food",
          icon: Utensils,
          description: "Authentic Nepali meal at a local restaurant",
          duration: "1 hour",
          cost: "$5-8",
          rating: 4.6
        },
        {
          time: "03:00 PM",
          title: "World Peace Pagoda",
          type: "sightseeing",
          icon: Camera,
          description: "Stunning panoramic views of Pokhara valley",
          duration: "3 hours",
          cost: "$2 entry",
          rating: 4.9
        }
      ]
    },
    {
      day: 2,
      title: "Adventure & Culture",
      activities: [
        {
          time: "06:00 AM",
          title: "Sarangkot Sunrise",
          type: "sightseeing",
          icon: Mountain,
          description: "Breathtaking sunrise views over the Himalayas",
          duration: "4 hours",
          cost: "$15 transport",
          rating: 4.9
        },
        {
          time: "02:00 PM",
          title: "Paragliding",
          type: "adventure",
          icon: Camera,
          description: "Fly over Pokhara valley with professional guides",
          duration: "2 hours",
          cost: "$80-120",
          rating: 4.7
        },
        {
          time: "07:00 PM",
          title: "Lakeside Dinner",
          type: "food",
          icon: Utensils,
          description: "International cuisine with lake views",
          duration: "2 hours",
          cost: "$15-25",
          rating: 4.5
        }
      ]
    },
    {
      day: 3,
      title: "Relaxation & Departure",
      activities: [
        {
          time: "10:00 AM",
          title: "Begnas Lake",
          type: "sightseeing",
          icon: Mountain,
          description: "Peaceful lake perfect for reflection and photos",
          duration: "3 hours",
          cost: "$10 transport",
          rating: 4.4
        },
        {
          time: "02:00 PM",
          title: "Souvenir Shopping",
          type: "shopping",
          icon: Coffee,
          description: "Local handicrafts and traditional items",
          duration: "2 hours",
          cost: "$20-50",
          rating: 4.2
        }
      ]
    }
  ]

  const handleGenerateItinerary = async () => {
    if (!formData.destination.trim()) {
      toast.error('Please enter a destination')
      return
    }

    setIsLoading(true)
    
    try {
      const request = {
        city: formData.destination.toLowerCase(),
        days: formData.days,
        pax: formData.travelers,
        budget: formData.travelStyle,
        profile: formData.travelStyle
      }
      
      const response = await apiService.plan(request)
      setItinerary(response)
      setShowItinerary(true)
      toast.success('Itinerary generated successfully!')
    } catch (error) {
      console.error('Error generating itinerary:', error)
      // Fallback to default itinerary
      setItinerary({
        title: `Your ${formData.destination} Adventure`,
        days: defaultItinerary
      })
      setShowItinerary(true)
      toast.error('Using offline mode. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'food': return 'from-orange-500 to-red-500'
      case 'sightseeing': return 'from-blue-500 to-cyan-500'
      case 'adventure': return 'from-green-500 to-emerald-500'
      case 'shopping': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  if (showItinerary) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowItinerary(false)}
                className="mb-4"
              >
                ← Back to Planning
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{itinerary?.title || 'Your Adventure'}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formData.days} days
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {formData.travelers} travelers
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                ${formData.budget[0]} budget
              </div>
            </div>
          </motion.div>

          {/* Itinerary */}
          <div className="space-y-8">
            {(itinerary?.days || defaultItinerary).map((day: any, dayIndex: number) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {day.day}
                      </div>
                      Day {day.day}: {day.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {day.activities.map((activity: any, activityIndex: number) => (
                      <div key={activityIndex}>
                        <div className="p-6 hover:bg-muted/30 transition-colors">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityTypeColor(activity.type)} flex items-center justify-center`}>
                                <activity.icon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{activity.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {activity.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      {activity.rating}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="mb-1">
                                    {activity.cost}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">{activity.duration}</p>
                                </div>
                              </div>
                              <p className="text-muted-foreground">{activity.description}</p>
                            </div>
                          </div>
                        </div>
                        {activityIndex < day.activities.length - 1 && (
                          <Separator className="mx-6" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Trip Summary</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Activities</p>
                    <p className="font-semibold">8 experiences</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Cost</p>
                    <p className="font-semibold">$147-235 per person</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Best Time</p>
                    <p className="font-semibold">Oct-Dec, Mar-May</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Plan Your Perfect Trip</h1>
          <p className="text-muted-foreground">Tell us your preferences and let AI create your personalized itinerary</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Where do you want to go?</label>
                <Input
                  placeholder="Enter city or destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="h-12"
                />
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <label className="text-sm font-medium">How many days? ({formData.days} days)</label>
                <Slider
                  value={[formData.days]}
                  onValueChange={(value) => setFormData({...formData, days: value[0]})}
                  max={14}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 day</span>
                  <span>14 days</span>
                </div>
              </div>

              {/* Travelers */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of travelers</label>
                <Select value={formData.travelers.toString()} onValueChange={(value) => setFormData({...formData, travelers: parseInt(value)})}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 traveler</SelectItem>
                    <SelectItem value="2">2 travelers</SelectItem>
                    <SelectItem value="3">3 travelers</SelectItem>
                    <SelectItem value="4">4 travelers</SelectItem>
                    <SelectItem value="5">5+ travelers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Budget per person (${formData.budget[0]})</label>
                <Slider
                  value={formData.budget}
                  onValueChange={(value) => setFormData({...formData, budget: value})}
                  max={5000}
                  min={100}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$100</span>
                  <span>$5000+</span>
                </div>
              </div>

              {/* Travel Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Travel style</label>
                <Select 
                  value={formData.travelStyle} 
                  onValueChange={(value) => setFormData({...formData, travelStyle: value})}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget-friendly</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerateItinerary}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                disabled={!formData.destination || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate My Itinerary'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-2 gap-4"
        >
          <Card className="border-dashed">
            <CardContent className="p-4 text-center">
              <Coffee className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-medium mb-1">Local Experiences</h3>
              <p className="text-sm text-muted-foreground">Hidden gems and authentic local recommendations</p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardContent className="p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Personalized suggestions based on your preferences</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
