import type {
  PredictRequest,
  PredictResponse,
  PlanRequest,
  PlanResponse,
  VideoRequest,
  VideoResponse,
  BookingRequest,
  BookingResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  DashboardStats,
  UserLoginResponse,
  UserVerifyResponse,
  UserProfileResponse,
  UserProfile,
  BookingCreateRequest,
  BookingCreateResponse
} from '@/types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8002'

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Health check
  async getHealth() {
    return this.request('/health')
  }

  // Predict intent and get AI response
  async predict(data: PredictRequest, language?: string): Promise<PredictResponse> {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request<PredictResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  }

  // Generate travel plan
  async plan(data: PlanRequest, language?: string): Promise<PlanResponse> {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request<PlanResponse>('/plan', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  }

  // Get videos for a destination
  async getVideos(data: VideoRequest, language?: string): Promise<VideoResponse> {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request<VideoResponse>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  }

  // Get booking suggestions
  async getBookingSuggestions(data: BookingRequest, language?: string): Promise<BookingResponse> {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request<BookingResponse>('/book/suggest', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  }

  // Get flight suggestions
  async getFlightSuggestions(origin: string, destination: string, date: string, pax: number = 1) {
    return this.request('/book/flight', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, date, pax }),
    })
  }

  // Get enhanced hotel recommendations
  async getHotelRecommendations(data: BookingRequest, language?: string) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/book/hotels/enhanced', {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    })
  }

  // Get enhanced flight recommendations
  async getEnhancedFlightRecommendations(
    origin: string, 
    destination: string, 
    date: string, 
    pax: number = 1, 
    language?: string
  ) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/book/flights/enhanced', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, date, pax }),
      headers,
    })
  }

  // Get activity recommendations
  async getActivityRecommendations(city: string, category?: string, language?: string) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify({ city, category }),
      headers,
    })
  }

  // Get videos by category
  async getVideosByCategory(place: string, category: string, language?: string) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/videos/category', {
      method: 'POST',
      body: JSON.stringify({ place, category }),
      headers,
    })
  }

  // Get trending videos
  async getTrendingVideos(place: string, language?: string) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/videos/trending', {
      method: 'POST',
      body: JSON.stringify({ place }),
      headers,
    })
  }

  // Get budget plan
  async getBudgetPlan(
    city: string, 
    days: number, 
    pax: number = 2, 
    budgetLevel: string = 'mid', 
    origin?: string, 
    language?: string
  ) {
    const headers: Record<string, string> = {}
    if (language) {
      headers['X-Lang'] = language
    }

    return this.request('/budget/plan', {
      method: 'POST',
      body: JSON.stringify({ city, days, pax, budget_level: budgetLevel, origin }),
      headers,
    })
  }

  // Admin authentication methods
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async adminLogout(token: string): Promise<{ message: string }> {
    return this.request('/admin/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async verifyAdmin(token: string): Promise<{ message: string; username: string }> {
    return this.request('/admin/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getDashboardStats(token: string): Promise<DashboardStats> {
    return this.request('/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // User authentication methods
  async userLogin(credentials: { username: string; password: string }): Promise<UserLoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async userRegister(userData: { username: string; email: string; password: string }): Promise<UserLoginResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async verifyUser(token: string): Promise<UserVerifyResponse> {
    return this.request('/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async getUserProfile(token: string): Promise<UserProfileResponse> {
    return this.request('/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async updateUserProfile(token: string, profileData: Partial<UserProfile>): Promise<{ message: string; profile: UserProfile }> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async createBooking(token: string, bookingData: BookingCreateRequest): Promise<BookingCreateResponse> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async getUserActivityStats(token: string): Promise<{
    total_searches: number
    total_plans: number
    total_videos: number
    total_bookings: number
    recent_activities: Array<{
      timestamp: string
      action: string
      details: string
      user_ip: string
      user?: string
    }>
  }> {
    return this.request('/user/activity-stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }
}

export const apiService = new ApiService()
export default apiService
