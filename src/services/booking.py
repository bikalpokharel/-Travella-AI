import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class BookingService:
    def __init__(self):
        self.booking_partners = self._load_booking_partners()
        # Simple city base-cost heuristics (USD)
        self.city_cost_index = {
            "kathmandu": {"hotel": {"budget": 20, "mid": 45, "luxury": 120}, "meal": 6, "local_transport": 8},
            "pokhara":   {"hotel": {"budget": 22, "mid": 50, "luxury": 140}, "meal": 7, "local_transport": 7},
            "chitwan":   {"hotel": {"budget": 18, "mid": 40, "luxury": 110}, "meal": 6, "local_transport": 6},
            "lumbini":   {"hotel": {"budget": 16, "mid": 38, "luxury": 100}, "meal": 5, "local_transport": 6},
            "bhaktapur": {"hotel": {"budget": 18, "mid": 42, "luxury": 115}, "meal": 6, "local_transport": 6},
        }
    
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

    def plan_by_budget(
        self,
        city: str,
        days: int,
        pax: int = 2,
        budget_level: str = "mid",
        origin: Optional[str] = None,
    ) -> Dict:
        """Create a budget-sorted journey plan with estimated costs and booking options.

        budget_level: one of ["budget", "mid", "luxury"]
        Returns a structured breakdown with hotel costs, transport estimates, meals, activities, and deeplinks.
        """
        city_key = city.lower()
        ci = self.city_cost_index.get(city_key) or {"hotel": {"budget": 20, "mid": 45, "luxury": 120}, "meal": 6, "local_transport": 7}

        # Nights = days - 1, but ensure at least 1 night if days >= 1
        nights = max(1, max(0, days - 1))

        # Hotel estimate per room per night; assume 1 room for up to 2 pax, else ceil(pax/2)
        rooms = (pax + 1) // 2
        hotel_ppn = ci["hotel"].get(budget_level, ci["hotel"]["mid"])  # per room per night
        hotel_total = hotel_ppn * nights * rooms

        # Meals estimate per person per day
        meals_total = ci["meal"] * pax * days

        # Local transport per day (shared)
        local_transport_total = ci["local_transport"] * days

        # Intercity/arrival transport (very rough): if origin present and different city, add a bucket
        arrival_transport = 0
        if origin and origin.lower() != city_key:
            # Heuristic: domestic flight vs bus depending on budget level
            if budget_level == "luxury":
                arrival_transport = 120 * pax  # domestic flight approx
            elif budget_level == "mid":
                arrival_transport = 60 * pax   # mix (bus + upgrades)
            else:
                arrival_transport = 30 * pax   # tourist bus

        # Activities bucket by budget level
        activities_per_day = {"budget": 8, "mid": 20, "luxury": 45}
        activities_total = activities_per_day.get(budget_level, 20) * days * pax

        # Compute grand total
        grand_total = hotel_total + meals_total + local_transport_total + arrival_transport + activities_total

        # Compose booking deeplinks for hotels
        hotel_recs = self.get_hotel_recommendations(city=city, pax=pax, budget=budget_level)

        # Optional flight deeplink (only if origin provided)
        flight_recs = None
        if origin:
            from datetime import datetime, timedelta
            date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            try:
                flight_recs = self.get_flight_recommendations(origin=origin, destination=city_key, date=date, pax=pax)
            except Exception:
                flight_recs = None

        # Suggested hotel packages (synthetic based on tier)
        package_map = {
            "budget": [
                {"name": "Budget Saver", "includes": ["Room only", "Free Wi‑Fi"], "avg_price_per_night": hotel_ppn, "cancellable": True},
                {"name": "Value Breakfast", "includes": ["Room + Breakfast"], "avg_price_per_night": round(hotel_ppn * 1.15, 2), "cancellable": True},
            ],
            "mid": [
                {"name": "Comfort Plus", "includes": ["Room + Breakfast"], "avg_price_per_night": hotel_ppn, "cancellable": True},
                {"name": "Half Board", "includes": ["Room + Breakfast + Dinner"], "avg_price_per_night": round(hotel_ppn * 1.35, 2), "cancellable": True},
            ],
            "luxury": [
                {"name": "Executive", "includes": ["Suite", "Breakfast", "Airport pickup"], "avg_price_per_night": hotel_ppn, "cancellable": True},
                {"name": "All Inclusive", "includes": ["All meals", "Spa credit"], "avg_price_per_night": round(hotel_ppn * 1.8, 2), "cancellable": True},
            ],
        }

        return {
            "city": city_key,
            "days": days,
            "nights": nights,
            "pax": pax,
            "budget_level": budget_level,
            "rooms": rooms,
            "estimates": {
                "hotel_total": round(hotel_total, 2),
                "meals_total": round(meals_total, 2),
                "local_transport_total": round(local_transport_total, 2),
                "arrival_transport_total": round(arrival_transport, 2),
                "activities_total": round(activities_total, 2),
                "grand_total": round(grand_total, 2)
            },
            "daily_average_per_person": round(grand_total / max(1, days) / max(1, pax), 2),
            "hotel_packages": package_map.get(budget_level, []),
            "hotel_options": hotel_recs,
            "flight_options": flight_recs,
        }
    
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
