import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class BookingService:
    def __init__(self):
        self.booking_partners = self._load_booking_partners()
    
    def _load_booking_partners(self) -> Dict:
        """Load booking partner data"""
        return {
            "hotels": {
                "booking_com": {
                    "name": "Booking.com",
                    "logo": "https://example.com/booking-logo.png",
                    "deeplink_template": "https://www.booking.com/searchresults.html?ss={city}&checkin={checkin}&checkout={checkout}&group_adults={pax}",
                    "commission": 0.15
                },
                "agoda": {
                    "name": "Agoda",
                    "logo": "https://example.com/agoda-logo.png",
                    "deeplink_template": "https://www.agoda.com/search?city={city}&checkIn={checkin}&checkOut={checkout}&adults={pax}",
                    "commission": 0.12
                },
                "hotels_com": {
                    "name": "Hotels.com",
                    "logo": "https://example.com/hotels-logo.png",
                    "deeplink_template": "https://hotels.com/search?destination={city}&check-in={checkin}&check-out={checkout}&adults={pax}",
                    "commission": 0.10
                },
                "airbnb": {
                    "name": "Airbnb",
                    "logo": "https://example.com/airbnb-logo.png",
                    "deeplink_template": "https://www.airbnb.com/s/{city}/homes?checkin={checkin}&checkout={checkout}&adults={pax}",
                    "commission": 0.20
                }
            },
            "flights": {
                "skyscanner": {
                    "name": "Skyscanner",
                    "logo": "https://example.com/skyscanner-logo.png",
                    "deeplink_template": "https://www.skyscanner.com/transport/flights/{origin}/{destination}/{date}/",
                    "commission": 0.08
                },
                "kayak": {
                    "name": "Kayak",
                    "logo": "https://example.com/kayak-logo.png",
                    "deeplink_template": "https://www.kayak.com/flights/{origin}-{destination}/{date}",
                    "commission": 0.07
                },
                "google_flights": {
                    "name": "Google Flights",
                    "logo": "https://example.com/google-flights-logo.png",
                    "deeplink_template": "https://www.google.com/travel/flights?q=Flights%20from%20{origin}%20to%20{destination}%20on%20{date}",
                    "commission": 0.05
                }
            },
            "activities": {
                "viator": {
                    "name": "Viator",
                    "logo": "https://example.com/viator-logo.png",
                    "deeplink_template": "https://www.viator.com/{city}/activities",
                    "commission": 0.25
                },
                "getyourguide": {
                    "name": "GetYourGuide",
                    "logo": "https://example.com/getyourguide-logo.png",
                    "deeplink_template": "https://www.getyourguide.com/{city}/",
                    "commission": 0.22
                },
                "klook": {
                    "name": "Klook",
                    "logo": "https://example.com/klook-logo.png",
                    "deeplink_template": "https://www.klook.com/activity/{city}/",
                    "commission": 0.20
                }
            }
        }
    
    def get_hotel_recommendations(self, city: str, checkin: Optional[str] = None, 
                                 checkout: Optional[str] = None, pax: int = 2, 
                                 budget: Optional[str] = None) -> Dict:
        """Get hotel booking recommendations"""
        if not checkin:
            checkin = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        if not checkout:
            checkout = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        
        hotels = self.booking_partners["hotels"]
        recommendations = []
        
        for platform, data in hotels.items():
            deeplink = data["deeplink_template"].format(
                city=city,
                checkin=checkin,
                checkout=checkout,
                pax=pax
            )
            
            recommendations.append({
                "platform": data["name"],
                "logo": data["logo"],
                "deeplink": deeplink,
                "commission": data["commission"],
                "features": self._get_hotel_features(platform, budget)
            })
        
        return {
            "city": city,
            "checkin": checkin,
            "checkout": checkout,
            "pax": pax,
            "budget": budget,
            "recommendations": recommendations,
            "total_platforms": len(recommendations)
        }
    
    def get_flight_recommendations(self, origin: str, destination: str, 
                                  date: str, pax: int = 1) -> Dict:
        """Get flight booking recommendations"""
        flights = self.booking_partners["flights"]
        recommendations = []
        
        for platform, data in flights.items():
            deeplink = data["deeplink_template"].format(
                origin=origin,
                destination=destination,
                date=date
            )
            
            recommendations.append({
                "platform": data["name"],
                "logo": data["logo"],
                "deeplink": deeplink,
                "commission": data["commission"],
                "features": self._get_flight_features(platform)
            })
        
        return {
            "origin": origin,
            "destination": destination,
            "date": date,
            "pax": pax,
            "recommendations": recommendations,
            "total_platforms": len(recommendations)
        }
    
    def get_activity_recommendations(self, city: str, category: Optional[str] = None) -> Dict:
        """Get activity booking recommendations"""
        activities = self.booking_partners["activities"]
        recommendations = []
        
        for platform, data in activities.items():
            deeplink = data["deeplink_template"].format(city=city)
            
            recommendations.append({
                "platform": data["name"],
                "logo": data["logo"],
                "deeplink": deeplink,
                "commission": data["commission"],
                "features": self._get_activity_features(platform, category)
            })
        
        return {
            "city": city,
            "category": category,
            "recommendations": recommendations,
            "total_platforms": len(recommendations)
        }
    
    def _get_hotel_features(self, platform: str, budget: Optional[str]) -> List[str]:
        """Get hotel platform features"""
        features = {
            "booking_com": ["Free cancellation", "Best price guarantee", "24/7 support"],
            "agoda": ["Agoda VIP deals", "Price match guarantee", "Instant confirmation"],
            "hotels_com": ["Hotels.com Rewards", "Price guarantee", "Free night after 10 stays"],
            "airbnb": ["Unique stays", "Local hosts", "Flexible cancellation"]
        }
        return features.get(platform, ["Competitive prices", "Easy booking"])
    
    def _get_flight_features(self, platform: str) -> List[str]:
        """Get flight platform features"""
        features = {
            "skyscanner": ["Price alerts", "Everywhere search", "Best time to book"],
            "kayak": ["Price forecast", "Hacker fares", "Multi-city search"],
            "google_flights": ["Price tracking", "Explore destinations", "Flexible dates"]
        }
        return features.get(platform, ["Competitive prices", "Easy booking"])
    
    def _get_activity_features(self, platform: str, category: Optional[str]) -> List[str]:
        """Get activity platform features"""
        features = {
            "viator": ["Skip-the-line access", "Free cancellation", "Local guides"],
            "getyourguide": ["Instant confirmation", "Mobile tickets", "24/7 support"],
            "klook": ["Klook credits", "Best price guarantee", "Easy refund"]
        }
        return features.get(platform, ["Competitive prices", "Easy booking"])

# Legacy function for backward compatibility
def suggest_hotels(city: str) -> Dict:
    """Legacy function for backward compatibility"""
    booking_service = BookingService()
    return booking_service.get_hotel_recommendations(city)
