from fastapi import FastAPI, Header, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import jwt
import hashlib
import json
from datetime import datetime, timedelta
from src.predict import Predictor
from src.entities import load_cities, parse_entities
from src.config import CITIES_TXT, MODEL_PATH
from src.services import recommend, booking, videos, i18n
from src.db import init_db
from src.services.llm import LLMService
from src.services.video_collector import VideoCollector

app = FastAPI(title="Travella AI — v1", version="1.1.0")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://localhost:3002", 
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080", 
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication
SECRET_KEY = "travella-ai-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = hashlib.sha256("admin123".encode()).hexdigest()

# User database (in production, use a proper database)
users_db = {
    "user1": {
        "username": "user1",
        "email": "user1@example.com",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "role": "user",
        "created_at": "2024-01-01T00:00:00Z",
        "profile": {
            "first_name": "John",
            "last_name": "Doe",
            "phone": "+977-1234567890",
            "preferences": {
                "travel_style": "adventure",
                "budget_range": "medium",
                "interests": ["mountains", "culture", "food"]
            }
        }
    },
    "demo": {
        "username": "demo",
        "email": "demo@example.com", 
        "password_hash": hashlib.sha256("demo123".encode()).hexdigest(),
        "role": "user",
        "created_at": "2024-01-01T00:00:00Z",
        "profile": {
            "first_name": "Demo",
            "last_name": "User",
            "phone": "+977-9876543210",
            "preferences": {
                "travel_style": "relaxed",
                "budget_range": "low",
                "interests": ["beaches", "nature", "photography"]
            }
        }
    }
}

# Activity log for tracking user actions
activity_log = []

security = HTTPBearer()

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    phone: str
    preferences: dict

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    preferences: Optional[dict] = None

class BookingRequest(BaseModel):
    type: str  # "flight" or "hotel"
    destination: str
    check_in: str
    check_out: Optional[str] = None
    travelers: int = 1
    budget: Optional[float] = None

class BookingResponse(BaseModel):
    id: str
    type: str
    destination: str
    status: str
    price: float
    details: dict
    created_at: str

class DashboardStats(BaseModel):
    total_searches: int
    total_plans: int
    total_videos: int
    total_bookings: int
    popular_destinations: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    system_health: Dict[str, Any]

class UserActivity(BaseModel):
    timestamp: str
    action: str
    details: str
    user_ip: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Initialize services
predictor = Predictor()
llm_service = LLMService()
video_collector = VideoCollector()

# Initialize database
init_db()

# In-memory storage for demo (in production, use a proper database)
user_activities = []
search_count = 0
plan_count = 0
video_count = 0
booking_count = 0

def log_activity(action: str, details: str, user_ip: str = "127.0.0.1"):
    global user_activities
    activity = UserActivity(
        timestamp=datetime.now().isoformat(),
        action=action,
        details=details,
        user_ip=user_ip
    )
    user_activities.append(activity)
    # Keep only last 100 activities
    if len(user_activities) > 100:
        user_activities = user_activities[-100:]

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Travella AI Backend is running"}

# Admin authentication endpoints
@app.post("/admin/login", response_model=AdminResponse)
async def admin_login(login_data: AdminLogin):
    if login_data.username != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    password_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
    if password_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": login_data.username}, expires_delta=access_token_expires
    )
    
    log_activity("admin_login", f"Admin {login_data.username} logged in")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.post("/admin/logout")
async def admin_logout(current_user: str = Depends(verify_token)):
    log_activity("admin_logout", f"Admin {current_user} logged out")
    return {"message": "Successfully logged out"}

@app.get("/admin/verify")
async def verify_admin(current_user: str = Depends(verify_token)):
    return {"message": "Admin verified", "username": current_user}

# User authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserRegister):
    if user_data.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create new user
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    new_user = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": password_hash,
        "role": "user",
        "created_at": datetime.now().isoformat(),
        "profile": {
            "first_name": "",
            "last_name": "",
            "phone": "",
            "preferences": {
                "travel_style": "balanced",
                "budget_range": "medium",
                "interests": []
            }
        }
    }
    users_db[user_data.username] = new_user
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username, "role": "user"}, 
        expires_delta=access_token_expires
    )
    
    log_activity("user_register", f"New user registered: {user_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "username": new_user["username"],
            "email": new_user["email"],
            "role": new_user["role"],
            "profile": new_user["profile"]
        }
    }

@app.post("/auth/login", response_model=UserResponse)
async def login_user(user_data: UserLogin):
    if user_data.username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    user = users_db[user_data.username]
    password_hash = hashlib.sha256(user_data.password.encode()).hexdigest()
    
    if password_hash != user["password_hash"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username, "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    log_activity("user_login", f"User logged in: {user_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "profile": user.get("profile", {})
        }
    }

@app.get("/auth/verify")
async def verify_user(current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user = users_db[current_user]
    return {
        "message": "User verified",
        "user": {
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "profile": user.get("profile", {})
        }
    }

# User profile management endpoints
@app.get("/user/profile")
async def get_user_profile(current_user: str = Depends(verify_token)):
    if current_user not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user = users_db[current_user]
    return {
        "username": user["username"],
        "email": user["email"],
        "profile": user.get("profile", {})
    }

@app.put("/user/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: str = Depends(verify_token)
):
    if current_user not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user = users_db[current_user]
    if "profile" not in user:
        user["profile"] = {}
    
    # Update profile fields
    if profile_data.first_name is not None:
        user["profile"]["first_name"] = profile_data.first_name
    if profile_data.last_name is not None:
        user["profile"]["last_name"] = profile_data.last_name
    if profile_data.phone is not None:
        user["profile"]["phone"] = profile_data.phone
    if profile_data.preferences is not None:
        user["profile"]["preferences"] = profile_data.preferences
    
    log_activity("profile_update", f"User {current_user} updated profile")
    
    return {
        "message": "Profile updated successfully",
        "profile": user["profile"]
    }

# Booking endpoints
@app.post("/bookings", response_model=BookingResponse)
async def create_booking(
    booking_data: BookingRequest,
    current_user: str = Depends(verify_token)
):
    import uuid
    
    booking_id = str(uuid.uuid4())
    
    # Simulate booking creation with real data
    if booking_data.type == "flight":
        booking_details = {
            "airline": "Nepal Airlines",
            "flight_number": f"RA{booking_data.travelers}{hash(booking_data.destination) % 1000:03d}",
            "departure_time": "08:30",
            "arrival_time": "09:15",
            "duration": "45m",
            "class": "Economy"
        }
        price = 89.0 * booking_data.travelers
    else:  # hotel
        booking_details = {
            "hotel_name": f"Hotel {booking_data.destination}",
            "room_type": "Standard Room",
            "amenities": ["WiFi", "Breakfast", "Parking"],
            "rating": 4.2
        }
        price = 45.0 * booking_data.travelers
    
    booking = {
        "id": booking_id,
        "type": booking_data.type,
        "destination": booking_data.destination,
        "status": "confirmed",
        "price": price,
        "details": booking_details,
        "created_at": datetime.now().isoformat(),
        "user": current_user
    }
    
    # Store booking (in production, use a proper database)
    if "bookings" not in globals():
        globals()["bookings"] = {}
    globals()["bookings"][booking_id] = booking
    
    log_activity("booking_created", f"User {current_user} created {booking_data.type} booking to {booking_data.destination}")
    
    return booking

@app.get("/bookings")
async def get_user_bookings(current_user: str = Depends(verify_token)):
    if "bookings" not in globals():
        return []
    
    user_bookings = [
        booking for booking in globals()["bookings"].values()
        if booking["user"] == current_user
    ]
    
    return user_bookings

# New admin dashboard endpoint
@app.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: str = Depends(verify_token)):
    global search_count, plan_count, video_count, booking_count
    
    # Get popular destinations from recent searches
    popular_destinations = []
    destination_counts = {}
    
    for activity in user_activities:
        if activity.action == "search" and "destination" in activity.details.lower():
            # Extract destination from search details
            details = activity.details.lower()
            if "pokhara" in details:
                destination_counts["Pokhara"] = destination_counts.get("Pokhara", 0) + 1
            elif "kathmandu" in details:
                destination_counts["Kathmandu"] = destination_counts.get("Kathmandu", 0) + 1
            elif "chitwan" in details:
                destination_counts["Chitwan"] = destination_counts.get("Chitwan", 0) + 1
            elif "lumbini" in details:
                destination_counts["Lumbini"] = destination_counts.get("Lumbini", 0) + 1
    
    # Sort and format popular destinations
    for dest, count in sorted(destination_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        popular_destinations.append({
            "name": dest,
            "searches": count,
            "trend": "up" if count > 5 else "stable"
        })
    
    # Get recent activity (last 10)
    recent_activity = []
    for activity in user_activities[-10:]:
        recent_activity.append({
            "timestamp": activity.timestamp,
            "action": activity.action,
            "details": activity.details,
            "user_ip": activity.user_ip
        })
    
    # System health check
    system_health = {
        "database": "healthy",
        "llm_service": "healthy" if llm_service else "degraded",
        "video_service": "healthy" if video_collector else "degraded",
        "prediction_model": "healthy" if predictor else "degraded"
    }
    
    return DashboardStats(
        total_searches=search_count,
        total_plans=plan_count,
        total_videos=video_count,
        total_bookings=booking_count,
        popular_destinations=popular_destinations,
        recent_activity=recent_activity,
        system_health=system_health
    )

# Prediction endpoint
@app.post("/predict")
async def predict(
    request: Dict[str, Any],
    x_lang: Optional[str] = Header(None)
):
    global search_count
    search_count += 1
    
    text = request.get("text", "")
    log_activity("search", f"User searched: {text}")
    
    try:
        # Get prediction from the model
        prediction = predictor.predict(text)
        
        # Parse entities from the text
        entities = parse_entities(text)
        
        # Get LLM response if available
        llm_response = None
        if llm_service:
            try:
                llm_response = llm_service.get_response(text)
            except Exception as e:
                print(f"LLM service error: {e}")
        
        # Generate suggestions based on entities
        suggestions = {}
        if entities.get("destination"):
            suggestions["places"] = recommend.get_places(entities["destination"])
        if entities.get("activity"):
            suggestions["activities"] = recommend.get_activities(entities["activity"])
        
        return {
            "intent": prediction.get("intent", "general"),
            "confidence": prediction.get("confidence", 0.8),
            "entities": entities,
            "suggestions": suggestions,
            "llm_response": llm_response,
            "llm_available": llm_service is not None
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {
            "intent": "general",
            "confidence": 0.5,
            "entities": {},
            "suggestions": {},
            "llm_response": None,
            "llm_available": False
        }

# Plan endpoint
@app.post("/plan")
async def plan(request: Dict[str, Any]):
    global plan_count
    plan_count += 1
    
    city = request.get("city", "").lower()
    days = request.get("days", 3)
    pax = request.get("pax", 2)
    budget = request.get("budget", "balanced")
    profile = request.get("profile", "balanced")
    
    log_activity("plan", f"User planned trip to {city} for {days} days, {pax} people")
    
    try:
        # Get itinerary from the recommendation service
        itinerary = recommend.get_itinerary(city, days, pax, budget, profile)
        
        return {
            "title": f"Your {city.title()} Adventure",
            "days": itinerary
        }
    except Exception as e:
        print(f"Planning error: {e}")
        # Return a default itinerary
        return {
            "title": f"Your {city.title()} Adventure",
            "days": [
                {
                    "day": 1,
                    "title": f"Welcome to {city.title()}",
                    "activities": [
                        {
                            "time": "09:00",
                            "title": "Arrival & Check-in",
                            "type": "transport",
                            "icon": "🏨",
                            "description": "Check into your accommodation",
                            "duration": "1 hour",
                            "cost": "Included",
                            "rating": 4.5
                        }
                    ]
                }
            ]
        }

# Videos endpoint
@app.post("/videos")
async def get_videos(request: Dict[str, Any]):
    global video_count
    video_count += 1
    
    place = request.get("place", "pokhara").lower()
    log_activity("videos", f"User searched videos for {place}")
    
    try:
        # Get videos from the video service
        video_data = videos.get_videos(place)
        
        return {
            "title": f"Travel Videos for {place.title()}",
            "videos": video_data
        }
    except Exception as e:
        print(f"Video error: {e}")
        # Return default videos
        return {
            "title": f"Travel Videos for {place.title()}",
            "videos": [
                {
                    "id": 1,
                    "title": f"Amazing {place.title()} Experience",
                    "creator": "Travel Vlogger",
                    "duration": "5:30",
                    "views": "1.2M",
                    "likes": "45K",
                    "location": place.title(),
                    "platform": "YouTube",
                    "thumbnail": "https://via.placeholder.com/300x200",
                    "category": "travel"
                }
            ]
        }

# Booking endpoints
@app.post("/book/suggest")
async def suggest_booking(request: Dict[str, Any]):
    global booking_count
    booking_count += 1
    
    city = request.get("city", "").lower()
    checkin = request.get("checkin", "")
    nights = request.get("nights", 1)
    pax = request.get("pax", 2)
    
    log_activity("booking", f"User searched booking for {city}, {nights} nights, {pax} people")
    
    try:
        # Get booking suggestions
        suggestions = booking.get_suggestions(city, checkin, nights, pax)
        return suggestions
    except Exception as e:
        print(f"Booking error: {e}")
        return {"message": "Booking service temporarily unavailable"}

@app.post("/book/hotels/enhanced")
async def get_enhanced_hotel_recommendations(request: Dict[str, Any]):
    global booking_count
    booking_count += 1
    
    city = request.get("city", "").lower()
    pax = request.get("pax", 2)
    date = request.get("date", "")
    
    log_activity("hotel_booking", f"User searched hotels in {city} for {pax} people")
    
    try:
        # Get enhanced hotel recommendations
        hotels = booking.get_enhanced_hotels(city, pax, date)
        return {
            "title": f"Hotels in {city.title()}",
            "hotels": hotels
        }
    except Exception as e:
        print(f"Hotel booking error: {e}")
        # Return default hotels
        return {
            "title": f"Hotels in {city.title()}",
            "hotels": [
                {
                    "id": 1,
                    "name": f"Grand {city.title()} Hotel",
                    "rating": 4.5,
                    "reviews": 1200,
                    "location": f"Downtown {city.title()}",
                    "image": "https://via.placeholder.com/300x200",
                    "price": 150,
                    "originalPrice": 200,
                    "amenities": ["wifi", "pool", "gym", "restaurant"],
                    "partner": "Booking.com",
                    "deal": "20% off"
                }
            ]
        }

@app.post("/book/flights/enhanced")
async def get_enhanced_flight_recommendations(
    origin: str,
    destination: str,
    date: str,
    pax: int
):
    global booking_count
    booking_count += 1
    
    log_activity("flight_booking", f"User searched flights from {origin} to {destination}")
    
    try:
        # Get enhanced flight recommendations
        flights = booking.get_enhanced_flights(origin, destination, date, pax)
        return {"flights": flights}
    except Exception as e:
        print(f"Flight booking error: {e}")
        # Return default flights
        return {
            "flights": [
                {
                    "id": 1,
                    "airline": "Nepal Airlines",
                    "logo": "🇳🇵",
                    "route": f"{origin.upper()} → {destination.upper()}",
                    "departure": "08:00",
                    "arrival": "09:30",
                    "duration": "1h 30m",
                    "price": 250,
                    "class": "Economy",
                    "stops": "Direct",
                    "partner": "Nepal Airlines"
                }
            ]
        }

# Activities endpoint
@app.post("/activities")
async def get_activities(request: Dict[str, Any]):
    city = request.get("city", "").lower()
    activity_type = request.get("type", "all")
    
    log_activity("activities", f"User searched {activity_type} activities in {city}")
    
    try:
        # Get activities from the recommendation service
        activities = recommend.get_activities(city, activity_type)
        return {"activities": activities}
    except Exception as e:
        print(f"Activities error: {e}")
        return {"activities": []}

# Budget planning endpoint
@app.post("/budget/plan")
async def plan_budget(request: Dict[str, Any]):
    city = request.get("city", "").lower()
    days = request.get("days", 3)
    pax = request.get("pax", 2)
    budget_type = request.get("budget_type", "balanced")
    
    log_activity("budget_plan", f"User planned budget for {city}, {days} days, {pax} people")
    
    try:
        # Get budget plan from the recommendation service
        budget_plan = recommend.get_budget_plan(city, days, pax, budget_type)
        return budget_plan
    except Exception as e:
        print(f"Budget planning error: {e}")
        return {
            "total_budget": 1000,
            "breakdown": {
                "accommodation": 400,
                "food": 300,
                "transportation": 200,
                "activities": 100
            },
            "recommendations": ["Book accommodation in advance", "Try local street food"]
        }

# Data collection and management endpoints
@app.get("/data/destinations")
async def get_destinations():
    """Get all available destinations"""
    try:
        with open("data/places.json", "r") as f:
            places = json.load(f)
        return {"destinations": places}
    except Exception as e:
        print(f"Error loading destinations: {e}")
        return {"destinations": []}

@app.get("/data/foods")
async def get_foods():
    """Get trending foods data"""
    try:
        with open("data/foods.json", "r") as f:
            foods = json.load(f)
        return {"foods": foods}
    except Exception as e:
        print(f"Error loading foods: {e}")
        return {"foods": []}

@app.get("/data/hidden-gems")
async def get_hidden_gems():
    """Get hidden gems data"""
    try:
        with open("data/hidden_gems.json", "r") as f:
            gems = json.load(f)
        return {"hidden_gems": gems}
    except Exception as e:
        print(f"Error loading hidden gems: {e}")
        return {"hidden_gems": []}

@app.get("/data/partners")
async def get_partners():
    """Get travel partners data"""
    try:
        with open("data/partners.json", "r") as f:
            partners = json.load(f)
        return {"partners": partners}
    except Exception as e:
        print(f"Error loading partners: {e}")
        return {"partners": []}

# Admin content management endpoints
@app.post("/admin/content/destinations")
async def add_destination(
    destination_data: dict,
    current_user: str = Depends(verify_token)
):
    """Add new destination (admin only)"""
    # Verify admin role
    if current_user != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        with open("data/places.json", "r") as f:
            places = json.load(f)
        
        places.append(destination_data)
        
        with open("data/places.json", "w") as f:
            json.dump(places, f, indent=2)
        
        log_activity("admin_add_destination", f"Admin added destination: {destination_data.get('name', 'Unknown')}")
        return {"message": "Destination added successfully"}
    except Exception as e:
        print(f"Error adding destination: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add destination"
        )

@app.post("/admin/content/videos")
async def add_video(
    video_data: dict,
    current_user: str = Depends(verify_token)
):
    """Add new video (admin only)"""
    # Verify admin role
    if current_user != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        with open("data/video_links.json", "r") as f:
            videos = json.load(f)
        
        videos.append(video_data)
        
        with open("data/video_links.json", "w") as f:
            json.dump(videos, f, indent=2)
        
        log_activity("admin_add_video", f"Admin added video: {video_data.get('title', 'Unknown')}")
        return {"message": "Video added successfully"}
    except Exception as e:
        print(f"Error adding video: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add video"
        )

@app.get("/admin/content/stats")
async def get_content_stats(current_user: str = Depends(verify_token)):
    """Get content statistics (admin only)"""
    # Verify admin role
    if current_user != ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        stats = {}
        
        # Count destinations
        with open("data/places.json", "r") as f:
            places = json.load(f)
        stats["destinations"] = len(places)
        
        # Count videos
        with open("data/video_links.json", "r") as f:
            videos = json.load(f)
        stats["videos"] = len(videos)
        
        # Count foods
        with open("data/foods.json", "r") as f:
            foods = json.load(f)
        stats["foods"] = len(foods)
        
        # Count hidden gems
        with open("data/hidden_gems.json", "r") as f:
            gems = json.load(f)
        stats["hidden_gems"] = len(gems)
        
        return {"content_stats": stats}
    except Exception as e:
        print(f"Error getting content stats: {e}")
        return {"content_stats": {"destinations": 0, "videos": 0, "foods": 0, "hidden_gems": 0}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)