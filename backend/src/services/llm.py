import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
import json
from pathlib import Path

# Load environment variables
load_dotenv()

class LLMService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.use_openai = bool(self.openai_api_key)
        self.use_anthropic = bool(self.anthropic_api_key)
        
        # Load travel data for context
        self.travel_data = self._load_travel_data()
        
    def _load_travel_data(self) -> Dict:
        """Load all travel data for context"""
        data_dir = Path(__file__).parent.parent.parent / "data"
        
        data = {}
        try:
            # Load basic travel data
            with open(data_dir / "places.json", "r", encoding="utf-8") as f:
                data["places"] = json.load(f)
            with open(data_dir / "foods.json", "r", encoding="utf-8") as f:
                data["foods"] = json.load(f)
            with open(data_dir / "hidden_gems.json", "r", encoding="utf-8") as f:
                data["hidden_gems"] = json.load(f)
            with open(data_dir / "partners.json", "r", encoding="utf-8") as f:
                data["partners"] = json.load(f)
            
            # Load rich destination details
            with open(data_dir / "destination_details.json", "r", encoding="utf-8") as f:
                data["destination_details"] = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load travel data: {e}")
            data = {}
        
        return data
    
    def _create_travel_context(self, city: Optional[str] = None) -> str:
        """Create context string from travel data"""
        context = "You are a friendly and knowledgeable travel expert for Nepal. Be conversational, warm, and enthusiastic. Use emojis naturally and make travelers feel excited about their journey. Here's what you know:\n\n"
        
        # Use rich destination details if available
        if city and city.lower() in self.travel_data.get("destination_details", {}):
            city_data = self.travel_data["destination_details"][city.lower()]
            context += f"**{city_data['name']} - {city_data['description']}**\n\n"
            
            context += f"**🌟 Must-See Highlights:**\n"
            for highlight in city_data['highlights']:
                context += f"• {highlight}\n"
            
            # Add detailed itinerary if available
            if 'detailed_itinerary' in city_data:
                context += f"\n**📅 Perfect Day-by-Day Itinerary:**\n"
                for day, activities in city_data['detailed_itinerary'].items():
                    context += f"**{day.upper()}:**\n"
                    for time, activity in activities.items():
                        context += f"• {time.title()}: {activity}\n"
                    context += "\n"
            
            context += f"\n**🍽️ Delicious Local Foods:**\n"
            for food in city_data['local_food']:
                context += f"• {food}\n"
            
            context += f"\n**💎 Hidden Gems (Local Secrets):**\n"
            for gem in city_data['hidden_gems']:
                context += f"• {gem}\n"
            
            # Add cultural insights if available
            if 'cultural_insights' in city_data:
                context += f"\n**🎭 Cultural Insights:**\n"
                for insight in city_data['cultural_insights']:
                    context += f"• {insight}\n"
            
            # Add adventure activities if available
            if 'adventure_activities' in city_data:
                context += f"\n**🏔️ Adventure Activities:**\n"
                for activity in city_data['adventure_activities']:
                    context += f"• {activity}\n"
            
            # Add transportation info if available
            if 'transportation' in city_data:
                context += f"\n**🚗 Getting Around:**\n"
                for transport in city_data['transportation']:
                    context += f"• {transport}\n"
            
            context += f"\n**💡 Pro Travel Tips:**\n"
            for tip in city_data['tips']:
                context += f"• {tip}\n"
            
            context += f"\n**💰 Budget Guide:** {city_data['average_cost_per_day']}\n"
            
            # Add accommodation options if available
            if 'accommodation_options' in city_data:
                context += f"\n**🏨 Where to Stay:**\n"
                for budget, option in city_data['accommodation_options'].items():
                    context += f"• {budget.replace('_', ' ').title()}: {option}\n"
            
        # Fallback to basic data if rich details not available
        elif city and city.lower() in self.travel_data.get("places", {}):
            city_lower = city.lower()
            context += f"**{city.capitalize()} Attractions:**\n"
            for place in self.travel_data["places"][city_lower]:
                context += f"- {place}\n"
            
            if city_lower in self.travel_data.get("foods", {}):
                context += f"\n**{city.capitalize()} Local Foods:**\n"
                for food in self.travel_data["foods"][city_lower]:
                    context += f"- {food}\n"
            
            if city_lower in self.travel_data.get("hidden_gems", {}):
                context += f"\n**{city.capitalize()} Hidden Gems:**\n"
                for gem in self.travel_data["hidden_gems"][city_lower]:
                    context += f"- {gem}\n"
        
        context += "\n**🌍 General Nepal Travel Tips:**\n"
        context += "- Best time to visit: March-May (spring) and September-November (autumn)\n"
        context += "- Currency: Nepalese Rupee (NPR)\n"
        context += "- Language: Nepali, English widely spoken in tourist areas\n"
        context += "- Transportation: Domestic flights, buses, and private vehicles\n"
        context += "- Safety: Generally safe, but be cautious in remote areas\n"
        
        return context
    
    async def get_llm_response(self, 
                               query: str, 
                               intent: str, 
                               entities: Dict,
                               city: Optional[str] = None) -> str:
        """Get intelligent response from LLM"""
        
        if not (self.use_openai or self.use_anthropic):
            return self.get_fallback_response(intent, entities, city)
        
        # Create context
        context = self._create_travel_context(city)
        
        # Create prompt
        prompt = self._create_prompt(query, intent, entities, context)
        
        try:
            if self.use_openai:
                return await self._call_openai(prompt)
            elif self.use_anthropic:
                return await self._call_anthropic(prompt)
        except Exception as e:
            print(f"LLM call failed: {e}")
            return self.get_fallback_response(intent, entities, city)
    
    def _create_prompt(self, query: str, intent: str, entities: Dict, context: str) -> str:
        """Create a structured prompt for the LLM"""
        
        prompt = f"""You are an incredibly friendly, enthusiastic, and knowledgeable travel assistant for Nepal. You absolutely LOVE helping people discover the magic of Nepal and you're practically bursting with excitement to share your knowledge!

**Your Personality:**
- You're warm, conversational, and genuinely excited about Nepal
- You use emojis naturally and enthusiastically (🌟✨🎉🏔️🍽️💎🎭🚗💡💰🏨🌍)
- You're passionate about sharing local secrets and insider tips
- You make travelers feel excited and confident about their journey
- You're like a best friend who happens to be a Nepal travel expert

**Context Information:**
{context}

**User Query:** {query}
**Detected Intent:** {intent}
**Extracted Entities:** {json.dumps(entities, indent=2)}

**Response Guidelines:**
1. Be incredibly enthusiastic and excited about helping them plan their trip
2. Use the detailed context information to provide specific, actionable advice
3. Be conversational, warm, and make them feel special
4. Use emojis naturally to express your excitement
5. Focus on the specific city if mentioned, using all the rich details available
6. Include practical tips, costs, and local customs in a friendly way
7. Avoid repetition - use the detailed itinerary information instead of just listing highlights
8. Make them feel like they're getting insider information from a local friend
9. Keep responses engaging and informative (2-4 paragraphs max)
10. End with an enthusiastic question or invitation to ask more

**Remember:** You're not just providing information - you're helping someone plan the adventure of a lifetime! Make them feel excited and confident about their journey to Nepal! ✨

**Response:**"""
        
        return prompt
    
    async def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful travel assistant for Nepal."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except ImportError:
            return "OpenAI library not available"
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Generate a helpful fallback response when LLM APIs are unavailable"""
        # Extract basic info from prompt
        prompt_lower = prompt.lower()
        
        # Check for common travel intents
        if any(word in prompt_lower for word in ['plan', 'itinerary', 'schedule', 'days']):
            return "🌟 I'd love to help you plan your Nepal adventure! While I'm having some technical difficulties with my advanced AI, I can still provide you with amazing travel recommendations. Try asking about specific places like Kathmandu, Pokhara, or Chitwan, and I'll give you detailed suggestions!"
        
        elif any(word in prompt_lower for word in ['food', 'eat', 'restaurant', 'cuisine']):
            return "🍜 Food is one of the best parts of traveling in Nepal! I recommend trying momo (dumplings), dal bhat (lentil curry with rice), and Newari cuisine. Each region has its own specialties - Kathmandu for Newari food, Pokhara for fresh fish, and the mountains for hearty trekking meals!"
        
        elif any(word in prompt_lower for word in ['hotel', 'accommodation', 'stay', 'booking']):
            return "🏨 For accommodations in Nepal, you have amazing options! From budget-friendly guesthouses in Thamel (Kathmandu) to luxury resorts in Pokhara with mountain views. I can help you find the perfect place based on your budget and preferences!"
        
        elif any(word in prompt_lower for word in ['video', 'youtube', 'tiktok', 'instagram']):
            return "📹 I have access to amazing travel videos! Check out the video recommendations section where you can find YouTube Shorts, TikTok videos, and Instagram Reels about your destination. These will give you a real visual taste of what to expect!"
        
        else:
            return "🌟 Welcome to Nepal! I'm your travel assistant and I'm here to help you discover the incredible beauty of this Himalayan country. While I'm experiencing some technical hiccups, I can still provide you with travel tips, recommendations, and help you plan your adventure. What would you like to know about Nepal?"
    
    async def _call_anthropic(self, prompt: str) -> str:
        """Call Anthropic Claude API"""
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.anthropic_api_key)
            
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return response.content[0].text.strip()
            
        except ImportError:
            return "Anthropic library not available"
        except Exception as e:
            print(f"Anthropic API error: {e}")
            return self._get_fallback_response(prompt)
    
    def get_fallback_response(self, intent: str, entities: Dict, city: Optional[str] = None) -> str:
        """Fallback response when LLM is not available"""
        
        # Get rich destination data if available
        city_data = None
        if city and city.lower() in self.travel_data.get("destination_details", {}):
            city_data = self.travel_data["destination_details"][city.lower()]
        
        responses = {
            "itinerary_suggestion": self._get_itinerary_fallback(city, city_data, entities),
            "find_hidden": self._get_hidden_gems_fallback(city, city_data),
            "local_food": self._get_food_fallback(city, city_data),
            "book_hotel": self._get_hotel_fallback(city, city_data),
            "greet": "Namaste! 🙏✨ Oh my goodness, I'm so excited to meet you! I'm your friendly AI travel assistant for Nepal, and I absolutely love helping people discover the magic of this incredible country! 🌟 Nepal is absolutely breathtaking and I can't wait to help you plan the most amazing adventure! I can help you create perfect itineraries, discover secret hidden gems that most tourists never find, recommend the most delicious local food that will make your taste buds dance, and answer all your questions about traveling in this beautiful country. What would you like to explore today? I'm practically jumping with excitement to help you! 🎉",
            "default": f"🌟 Oh my goodness, I'm so excited to help you explore {city or 'Nepal'}! This place is absolutely magical and I can't wait to share all the amazing things you can discover here! I can provide incredible travel advice, create perfect itineraries that will make your trip unforgettable, recommend the most amazing places to visit, and share local insights that will make you feel like a true insider. What specific information are you most excited to learn about? I'm practically bursting with excitement to help you plan the most incredible adventure! ✨🎉"
        }
        
        return responses.get(intent, responses["default"])
    
    def _get_itinerary_fallback(self, city: Optional[str], city_data: Optional[Dict], entities: Dict) -> str:
        """Enhanced itinerary fallback response"""
        days = entities.get("days", 3) or 3  # Ensure days is not None
        pax = entities.get("pax", 2) or 2    # Ensure pax is not None
        
        if city_data and 'detailed_itinerary' in city_data:
            response = f"🌟 Amazing choice! I'm so excited to help you plan your {days}-day adventure in {city_data['name']}! This place is absolutely magical and perfect for {pax} people.\n\n"
            
            # Use the detailed itinerary instead of repeating highlights
            response += f"**📅 Here's your perfect {days}-day itinerary:**\n\n"
            
            # Show the detailed itinerary for the requested number of days
            for i, (day, activities) in enumerate(city_data['detailed_itinerary'].items(), 1):
                if i > days:
                    break
                response += f"**Day {i} - {day.upper()}:**\n"
                for time, activity in activities.items():
                    response += f"• {time.title()}: {activity}\n"
                response += "\n"
            
            # Add unique information without repetition
            if 'cultural_insights' in city_data:
                response += f"**🎭 Cultural Experience:** {city_data['cultural_insights'][0]}\n\n"
            
            if 'adventure_activities' in city_data:
                response += f"**🏔️ Adventure Option:** {city_data['adventure_activities'][0]}\n\n"
            
            response += f"**💰 Budget:** {city_data['average_cost_per_day']}\n\n"
            response += f"✨ This itinerary will give you the perfect mix of culture, adventure, and relaxation! Would you like me to add any specific activities or adjust the schedule?"
            return response
        elif city_data:
            # Fallback if no detailed itinerary
            response = f"🌟 Perfect! I'd love to help you plan your {days}-day adventure in {city_data['name']}! This place is absolutely magical and perfect for {pax} people.\n\n"
            response += f"**📅 Here's what I recommend for {days} days:**\n\n"
            
            # Use highlights but format them as daily activities
            highlights = city_data['highlights'][:min(days, len(city_data['highlights']))]
            for i, highlight in enumerate(highlights, 1):
                response += f"**Day {i}:** {highlight}\n"
            
            response += f"\n**💰 Budget:** {city_data['average_cost_per_day']}\n\n"
            response += f"✨ This will give you an amazing experience! Would you like me to create a more detailed schedule with specific timings?"
            return response
        else:
            return f"🌟 I'd be thrilled to help you plan your {days}-day trip to {city or 'Nepal'} for {pax} people! Nepal is absolutely magical and I can create the perfect itinerary for you. Would you like me to suggest a detailed day-by-day plan with specific attractions and activities?"
    
    def _get_hidden_gems_fallback(self, city: Optional[str], city_data: Optional[Dict]) -> str:
        """Enhanced hidden gems fallback response"""
        if city_data and city_data.get('hidden_gems'):
            gems = city_data['hidden_gems'][:3]
            response = f"💎 Oh my goodness, you're going to love this! {city_data['name']} has some absolutely incredible hidden gems that most tourists never discover! These are the local secrets that make this place truly special:\n\n"
            for gem in gems:
                response += f"• {gem}\n"
            response += f"\n✨ These are just the beginning of the magic! Each of these places has its own unique story and charm. Would you like me to share more details about any of these hidden treasures or suggest other amazing off-the-beaten-path locations that locals love?"
            return response
        else:
            return f"💎 Fantastic choice! {city or 'Nepal'} is absolutely full of amazing hidden gems that most tourists never discover! I can recommend incredible off-the-beaten-path locations, secret local markets, and authentic experiences that will make your trip truly unforgettable. What type of hidden gems are you most interested in discovering?"
    
    def _get_food_fallback(self, city: Optional[str], city_data: Optional[Dict]) -> str:
        """Enhanced food fallback response"""
        if city_data and city_data.get('local_food'):
            foods = city_data['local_food'][:4]
            response = f"🍽️ Oh my goodness, you're absolutely going to love the food in {city_data['name']}! The local cuisine here is absolutely incredible and will totally blow your taste buds away! Here are some must-try dishes that locals absolutely adore:\n\n"
            for food in foods:
                response += f"• {food}\n"
            response += f"\n✨ And that's just the tip of the culinary iceberg! The food culture here is so rich and diverse. Would you like me to recommend the best local restaurants, street food spots, or tell you more about the fascinating food traditions and where to find the most authentic experiences?"
            return response
        else:
            return f"🍽️ You're absolutely in for the most amazing treat! {city or 'Nepali'} cuisine is incredibly diverse, flavorful, and will totally surprise you with its deliciousness! I can suggest traditional dishes that will make your mouth water, incredible street food spots that locals love, and the best restaurants that serve authentic local flavors. What type of food experience are you most excited about?"
    
    def _get_hotel_fallback(self, city: Optional[str], city_data: Optional[Dict]) -> str:
        """Enhanced hotel fallback response"""
        if city_data:
            return f"🏨 Absolutely! I'd love to help you find the perfect place to stay in {city_data['name']}! This place has some absolutely amazing accommodation options that will make your trip even more special. Based on the typical budget of {city_data['average_cost_per_day']}, I have fantastic recommendations for every budget and travel style - from cozy local guesthouses to luxurious resorts. What's your preferred budget range and what kind of experience are you looking for?"
        else:
            return f"🏨 Of course! I'd be thrilled to help you find the perfect accommodation in {city or 'Nepal'}! Nepal has some absolutely incredible places to stay that will make your trip truly unforgettable. I have amazing recommendations for every budget and travel style - from charming local guesthouses to luxurious hotels. What's your preferred budget and what kind of experience are you dreaming of?"
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.use_openai or self.use_anthropic 