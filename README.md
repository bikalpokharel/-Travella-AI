# Travella AI - Intelligent Travel Assistant

A modern, AI-powered travel planning platform that helps users discover destinations, plan itineraries, and book travel services with intelligent recommendations.

## 🚀 Features

- **AI-Powered Chat**: Get personalized travel recommendations through natural language conversations
- **Smart Trip Planning**: Generate detailed itineraries based on preferences, budget, and travel style
- **Video Discovery**: Explore destinations through curated travel videos from creators worldwide
- **Booking Integration**: Compare and book flights and hotels with trusted partners
- **Multi-language Support**: Available in English and Nepali
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Sonner** for toast notifications

### Backend (`/backend`)
- **FastAPI** for high-performance API
- **SQLite** for data storage
- **Machine Learning** for intent classification
- **LLM Integration** for AI responses
- **CORS** enabled for frontend integration

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python run.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
travella-ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI backend application
│   ├── src/                 # Source code
│   │   ├── api.py          # Main API endpoints
│   │   ├── services/       # Business logic services
│   │   └── models/         # Data models
│   ├── data/               # Static data files
│   ├── main.py             # FastAPI application
│   └── run.py              # Server runner
└── README.md
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /predict` - Get AI predictions and responses
- `POST /plan` - Generate travel itineraries
- `POST /videos` - Get destination videos
- `POST /book/suggest` - Get booking suggestions
- `GET /health` - Health check

### Enhanced Endpoints
- `POST /book/hotels/enhanced` - Enhanced hotel recommendations
- `POST /book/flights/enhanced` - Enhanced flight recommendations
- `POST /activities` - Activity recommendations
- `POST /budget/plan` - Budget planning

## 🌐 Environment Variables

Create a `.env` file in the backend directory:

```env
# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=sqlite:///./travella.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment
```bash
cd backend
pip install -r requirements.txt
python run.py
# Or use gunicorn for production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from modern travel platforms
- AI models and services for intelligent recommendations
- Open source libraries and frameworks used in this project

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Travella AI** - Your intelligent travel companion for discovering, planning, and booking amazing journeys around the world.# -Travella-AI
