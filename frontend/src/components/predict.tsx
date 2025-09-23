import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Camera,
  Coffee,
  Mountain,
  Loader2
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

export function Predict() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your Travella AI assistant. Ask me anything about travel planning, destinations, or get personalized recommendations!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [detectedEntities, setDetectedEntities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const suggestions = [
    {
      icon: MapPin,
      text: "Best places to visit in Nepal",
      entities: ['Nepal', 'Places']
    },
    {
      icon: Calendar,
      text: "Plan a 5-day trip to Bali",
      entities: ['5 days', 'Bali', 'Trip planning']
    },
    {
      icon: DollarSign,
      text: "Budget travel tips for Southeast Asia",
      entities: ['Budget', 'Southeast Asia']
    },
    {
      icon: Coffee,
      text: "Local food recommendations in Tokyo",
      entities: ['Food', 'Tokyo', 'Local']
    }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await apiService.predict({ text: inputMessage })
      
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: response.llm_response || generateAIResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => [...prev, botResponse])
      
      // Extract entities from response
      const entities = Object.keys(response.entities).filter(key => response.entities[key])
      setDetectedEntities(entities)
      
      toast.success('AI response received!')
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback to local response
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => [...prev, botResponse])
      
      // Extract entities (simplified simulation)
      const entities = extractEntities(inputMessage)
      setDetectedEntities(entities)
      
      toast.error('Using offline mode. Please check your connection.')
    } finally {
      setIsLoading(false)
      setInputMessage('')
    }
  }

  const generateAIResponse = (message: string) => {
    const responses = {
      nepal: "Nepal is an incredible destination! Here are my top recommendations:\n\n🏔️ **Pokhara** - Perfect for adventure lovers with paragliding, trekking, and stunning lake views\n🏛️ **Kathmandu** - Rich cultural heritage with ancient temples and vibrant markets\n🌸 **Chitwan National Park** - Amazing wildlife safari experiences\n\nBest time to visit: October to December and March to May. Would you like a detailed itinerary for any of these places?",
      bali: "A 5-day Bali itinerary sounds amazing! Here's what I recommend:\n\n**Day 1-2: Ubud** - Rice terraces, monkey forest, traditional markets\n**Day 3-4: Seminyak** - Beautiful beaches, sunset bars, spa treatments\n**Day 5: Uluwatu** - Clifftop temple, kecak dance, beach clubs\n\nEstimated budget: $50-100/day per person. Should I create a detailed day-by-day plan for you?",
      budget: "Great question about budget travel in Southeast Asia! Here are my top money-saving tips:\n\n💰 **Accommodation**: Hostels ($5-15/night) or guesthouses ($10-25/night)\n🍜 **Food**: Street food ($1-3/meal) and local warungs ($3-8/meal)\n🚌 **Transport**: Local buses and trains instead of private cars\n🎯 **Activities**: Free walking tours, temples, markets, and beaches\n\nDaily budget: $20-40 per person. Which country interests you most?",
      default: "That's a great question! Based on what you're asking about, I can help you with:\n\n✈️ Destination recommendations\n📅 Itinerary planning\n💡 Local insights and hidden gems\n🍽️ Food and cultural experiences\n💰 Budget planning\n\nWhat specific aspect would you like to explore further?"
    }

    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('nepal')) return responses.nepal
    if (lowerMessage.includes('bali')) return responses.bali
    if (lowerMessage.includes('budget') || lowerMessage.includes('cheap')) return responses.budget
    return responses.default
  }

  const extractEntities = (message: string) => {
    const entities = []
    const lowerMessage = message.toLowerCase()
    
    // Location entities
    if (lowerMessage.includes('nepal')) entities.push('Nepal')
    if (lowerMessage.includes('bali')) entities.push('Bali')
    if (lowerMessage.includes('tokyo')) entities.push('Tokyo')
    
    // Time entities
    if (lowerMessage.includes('day')) entities.push('Duration')
    if (lowerMessage.includes('week')) entities.push('Duration')
    
    // Activity entities
    if (lowerMessage.includes('food')) entities.push('Food')
    if (lowerMessage.includes('budget')) entities.push('Budget')
    if (lowerMessage.includes('adventure')) entities.push('Adventure')
    
    return entities
  }

  const handleSuggestionClick = (suggestion: any) => {
    setInputMessage(suggestion.text)
    setDetectedEntities(suggestion.entities)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-6">
      {/* Header */}
      <div className="p-4 md:p-6 border-b bg-background/80 backdrop-blur-sm sticky top-16 md:top-20 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ask Travella AI</h1>
              <p className="text-muted-foreground">Get personalized travel recommendations</p>
            </div>
          </div>
          
          {/* Detected Entities */}
          {detectedEntities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2"
            >
              <span className="text-sm text-muted-foreground mr-2">Detected:</span>
              {detectedEntities.map((entity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {entity}
                </Badge>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-teal-500 text-white' 
                    : 'bg-muted/50'
                }`}>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {message.type === 'user' && (
                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 order-3">
                  <AvatarFallback className="bg-transparent">
                    <User className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="p-4 md:p-6 border-t bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-medium mb-4 text-center">Try asking about:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <suggestion.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{suggestion.text}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 md:p-6 border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask about destinations, planning, or get recommendations..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12 h-12"
              />
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
