import { apiService } from './api'

export interface DataCollectionItem {
  id: string
  type: 'destination' | 'video' | 'food' | 'partner'
  title: string
  description: string
  metadata: Record<string, any>
  source: string
  collected_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface CollectionStats {
  total_collected: number
  pending_review: number
  approved: number
  rejected: number
  by_type: Record<string, number>
}

class DataCollectionService {
  private baseUrl = '/admin/data-collection'

  async getCollectionStats(): Promise<CollectionStats> {
    try {
      // In a real app, this would be an API call
      return {
        total_collected: 156,
        pending_review: 23,
        approved: 120,
        rejected: 13,
        by_type: {
          destination: 45,
          video: 67,
          food: 28,
          partner: 16
        }
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error)
      throw error
    }
  }

  async getCollectedItems(type?: string, status?: string): Promise<DataCollectionItem[]> {
    try {
      // In a real app, this would be an API call
      const mockData: DataCollectionItem[] = [
        {
          id: '1',
          type: 'destination',
          title: 'Pokhara Lakeside',
          description: 'Beautiful lakeside area with mountain views',
          metadata: {
            location: 'Pokhara, Nepal',
            coordinates: { lat: 28.2096, lng: 83.9856 },
            category: 'nature',
            rating: 4.8
          },
          source: 'user_submission',
          collected_at: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'video',
          title: 'Pokhara Travel Vlog',
          description: 'Amazing travel vlog showcasing Pokhara attractions',
          metadata: {
            url: 'https://youtube.com/watch?v=example',
            duration: '12:34',
            views: 15000,
            creator: 'TravelNepal'
          },
          source: 'youtube_api',
          collected_at: new Date().toISOString(),
          status: 'approved'
        },
        {
          id: '3',
          type: 'food',
          title: 'Traditional Momo',
          description: 'Authentic Nepali dumplings',
          metadata: {
            cuisine: 'Nepali',
            price_range: '$',
            rating: 4.9,
            location: 'Kathmandu'
          },
          source: 'user_submission',
          collected_at: new Date().toISOString(),
          status: 'approved'
        },
        {
          id: '4',
          type: 'partner',
          title: 'Hotel Annapurna',
          description: 'Luxury hotel in Kathmandu',
          metadata: {
            type: 'hotel',
            rating: 4.5,
            price_range: '$$$',
            amenities: ['wifi', 'pool', 'restaurant']
          },
          source: 'booking_api',
          collected_at: new Date().toISOString(),
          status: 'pending'
        }
      ]

      let filteredData = mockData

      if (type) {
        filteredData = filteredData.filter(item => item.type === type)
      }

      if (status) {
        filteredData = filteredData.filter(item => item.status === status)
      }

      return filteredData
    } catch (error) {
      console.error('Error fetching collected items:', error)
      throw error
    }
  }

  async approveItem(itemId: string): Promise<void> {
    try {
      // In a real app, this would be an API call
      console.log(`Approving item ${itemId}`)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error approving item:', error)
      throw error
    }
  }

  async rejectItem(itemId: string, reason?: string): Promise<void> {
    try {
      // In a real app, this would be an API call
      console.log(`Rejecting item ${itemId}, reason: ${reason}`)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error rejecting item:', error)
      throw error
    }
  }

  async collectFromYouTube(query: string): Promise<DataCollectionItem[]> {
    try {
      // In a real app, this would integrate with YouTube API
      console.log(`Collecting videos for query: ${query}`)
      
      // Simulate YouTube API response
      const mockVideos: DataCollectionItem[] = [
        {
          id: `yt_${Date.now()}_1`,
          type: 'video',
          title: `${query} Travel Guide`,
          description: `Comprehensive travel guide for ${query}`,
          metadata: {
            url: `https://youtube.com/watch?v=${Math.random().toString(36).substr(2, 9)}`,
            duration: '15:30',
            views: Math.floor(Math.random() * 100000),
            creator: 'TravelChannel',
            thumbnail: `https://img.youtube.com/vi/example/maxresdefault.jpg`
          },
          source: 'youtube_api',
          collected_at: new Date().toISOString(),
          status: 'pending'
        }
      ]

      return mockVideos
    } catch (error) {
      console.error('Error collecting from YouTube:', error)
      throw error
    }
  }

  async collectFromBookingAPI(destination: string): Promise<DataCollectionItem[]> {
    try {
      // In a real app, this would integrate with booking APIs
      console.log(`Collecting hotels for destination: ${destination}`)
      
      // Simulate booking API response
      const mockHotels: DataCollectionItem[] = [
        {
          id: `booking_${Date.now()}_1`,
          type: 'partner',
          title: `Hotel ${destination}`,
          description: `Quality accommodation in ${destination}`,
          metadata: {
            type: 'hotel',
            rating: 4.2,
            price_range: '$$',
            amenities: ['wifi', 'breakfast'],
            location: destination
          },
          source: 'booking_api',
          collected_at: new Date().toISOString(),
          status: 'pending'
        }
      ]

      return mockHotels
    } catch (error) {
      console.error('Error collecting from booking API:', error)
      throw error
    }
  }

  async collectFromUserSubmission(data: Partial<DataCollectionItem>): Promise<DataCollectionItem> {
    try {
      // In a real app, this would save user submissions
      const newItem: DataCollectionItem = {
        id: `user_${Date.now()}`,
        type: data.type || 'destination',
        title: data.title || 'Untitled',
        description: data.description || '',
        metadata: data.metadata || {},
        source: 'user_submission',
        collected_at: new Date().toISOString(),
        status: 'pending'
      }

      console.log('User submission collected:', newItem)
      return newItem
    } catch (error) {
      console.error('Error collecting user submission:', error)
      throw error
    }
  }
}

export const dataCollectionService = new DataCollectionService()
export default dataCollectionService
