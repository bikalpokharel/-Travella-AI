// API Types
export interface PredictRequest {
  text: string
}

export interface PredictResponse {
  intent: string
  confidence: number
  entities: Record<string, any>
  suggestions: Record<string, any>
  llm_response?: string
  llm_available: boolean
}

export interface PlanRequest {
  city?: string
  days: number
  profile?: string
  pax: number
  budget: string
}

export interface PlanResponse {
  title: string
  days: Array<{
    day: number
    title: string
    activities: Array<{
      time: string
      title: string
      type: string
      description: string
      duration: string
      cost: string
      rating: number
    }>
  }>
}

export interface VideoRequest {
  place: string
}

export interface VideoResponse {
  title: string
  videos: Array<{
    id: string
    title: string
    url: string
    thumbnail: string
    duration: string
    platform: string
    views: string
    likes: string
    creator: string
    location: string
    category: string
  }>
}

export interface BookingRequest {
  city: string
  checkin?: string
  nights?: number
  pax: number
  origin?: string
  date?: string
  budget?: string
}

export interface BookingResponse {
  title: string
  hotels: Array<{
    id: string
    name: string
    rating: number
    reviews: number
    location: string
    image: string
    price: number
    originalPrice?: number
    amenities: string[]
    partner: string
    deal?: string
  }>
  flights: Array<{
    id: string
    airline: string
    logo: string
    route: string
    departure: string
    arrival: string
    duration: string
    price: number
    class: string
    stops: string
    partner: string
  }>
}

// UI Types
export interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
}

export interface SearchFilters {
  category?: string
  priceRange?: [number, number]
  rating?: number
  location?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences?: {
    theme: 'light' | 'dark'
    language: string
    currency: string
  }
}

// Component Props
export interface PageProps {
  className?: string
}

export interface CardProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

// Admin authentication types
export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AdminUser {
  username: string
  isAuthenticated: boolean
}

export interface DashboardStats {
  total_searches: number
  total_plans: number
  total_videos: number
  total_bookings: number
  popular_destinations: Array<{
    name: string
    searches: number
    trend: string
  }>
  recent_activity: Array<{
    timestamp: string
    action: string
    details: string
    user_ip: string
  }>
  system_health: {
    database: string
    llm_service: string
    video_service: string
    prediction_model: string
  }
}

// User authentication types
export interface UserLoginRequest {
  username: string
  password: string
}

export interface UserRegisterRequest {
  username: string
  email: string
  password: string
}

export interface UserLoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: {
    username: string
    email: string
    role: string
    profile: UserProfile
  }
}

export interface UserVerifyResponse {
  message: string
  user: {
    username: string
    email: string
    role: string
    profile: UserProfile
  }
}

export interface UserProfile {
  first_name: string
  last_name: string
  phone: string
  preferences: {
    travel_style: string
    budget_range: string
    interests: string[]
  }
}

export interface UserProfileResponse {
  username: string
  email: string
  profile: UserProfile
}

// Enhanced booking types
export interface BookingCreateRequest {
  type: 'flight' | 'hotel'
  destination: string
  check_in: string
  check_out?: string
  travelers: number
  budget?: number
}

export interface BookingCreateResponse {
  id: string
  type: string
  destination: string
  status: string
  price: number
  details: Record<string, any>
  created_at: string
}
