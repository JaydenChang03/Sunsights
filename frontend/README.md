# Sunsights: AI-Powered Customer Feedback Analysis Platform

Sunsights is a full-stack web application that revolutionizes customer service operations through AI-powered sentiment analysis. It helps customer service teams automatically analyze, prioritize, and respond to customer feedback with precision and speed.

## 🚀 Overview

In today's high-volume customer service environment, manually processing feedback is inefficient and prone to human error. Sunsights solves this by providing automated text analysis that detects emotions, sentiment, and priority levels from customer communications, enabling teams to respond faster and more effectively.

### Key Problems Solved
- **Manual Triage Bottlenecks**: Automatically prioritize urgent customer issues
- **Emotional Context Loss**: AI detection of customer emotions beyond just positive/negative
- **Response Consistency**: Generate contextual response suggestions
- **Trend Blindness**: Visual analytics to spot patterns in customer sentiment over time

## ✨ Core Features

### 🔍 Single Text Analysis
- **Real-time Analysis**: Paste any customer message for instant sentiment and emotion detection
- **Multi-dimensional Insights**: Get sentiment polarity, specific emotions (joy, anger, sadness, fear, surprise, love), and priority levels
- **Smart Response Suggestions**: Receive contextually appropriate response templates
- **Priority Classification**: Automatic categorization into High, Medium, or Low priority

### 📊 Bulk Data Processing
- **File Upload Support**: Process CSV, XLS, and XLSX files containing multiple customer comments
- **Scalable Analysis**: Handle hundreds of customer feedback entries simultaneously
- **Batch Insights**: Comprehensive summary with sentiment distribution and priority breakdown
- **Export Ready**: Results formatted for easy integration into existing workflows

### 📈 Advanced Analytics Dashboard
- **Sentiment Trends**: Time-series visualization of positive/negative sentiment patterns
- **Emotion Distribution**: Pie charts showing the emotional makeup of customer feedback
- **Priority Analytics**: Bar charts displaying urgent vs. routine case distribution
- **Activity Timeline**: Chronological feed of all analysis activities
- **Filtering & Drilldown**: Interactive charts with date range filtering and detailed breakdowns

### 👤 User Management System
- **Secure Authentication**: JWT-based login with password validation
- **Personal Profiles**: Customizable user profiles with avatar support
- **Analysis History**: Complete record of all user analyses and activities
- **Personal Notes**: Built-in notepad for tracking insights and action items
- **Password Recovery**: Secure password reset functionality

## 🛠 Technology Stack

### Frontend Architecture
- **Framework**: React 18.2.0 with modern hooks and functional components
- **Build Tool**: Vite for lightning-fast development and optimized production builds
- **Styling**: Tailwind CSS for responsive, utility-first design
- **Charts**: Chart.js with React wrapper for interactive data visualization
- **Animations**: Framer Motion for smooth, professional transitions
- **Routing**: React Router DOM for seamless single-page application navigation
- **HTTP Client**: Axios with pre-configured interceptors and error handling
- **Notifications**: React Hot Toast for user-friendly alerts and confirmations

### Backend Infrastructure
- **Framework**: Flask with modular blueprint architecture
- **Authentication**: Flask-JWT-Extended for secure token-based auth
- **Database**: SQLite with optimized schema and connection pooling
- **AI Models**: 
  - DistilBERT for sentiment analysis (Hugging Face Transformers)
  - Emotion classification with fine-tuned models
- **Security**: CORS protection, rate limiting, input validation
- **File Processing**: Pandas integration for Excel/CSV parsing
- **Logging**: Comprehensive error tracking and performance monitoring

### AI & Machine Learning
- **Sentiment Analysis**: DistilBERT base model fine-tuned on SST-2 dataset
- **Emotion Detection**: Custom emotion classifier for 6 core emotions plus neutral
- **Priority Algorithms**: Rule-based system combining sentiment scores and emotion intensity
- **Response Generation**: Template-based system with contextual awareness
- **Batch Processing**: Optimized pipeline for handling large datasets

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher
- **Git**: For version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Sunsights
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r ../requirements.txt

# Initialize the database
python init_db.py

# Verify installation
python app.py
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### 4. Start the Application
```bash
# Terminal 1: Start backend server
python run.py

# Terminal 2: Start frontend development server (in frontend/)
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

## 🔧 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality checks
```

### Backend Scripts
```bash
python run.py        # Start development server
python init_db.py    # Initialize/reset database
python view_db.py    # View database contents (debugging)
```

## 🌐 API Documentation

### Authentication Endpoints

POST /api/auth/register
POST /api/auth/login
GET /api/auth/user
POST /api/auth/forgot-password
POST /api/auth/reset-password

### Analytics Endpoints
POST /api/analytics/analyze # Single text analysis
POST /api/analytics/analyze-bulk # Bulk file upload analysis
GET /api/analytics/sentiment # Sentiment trend data
GET /api/analytics/emotions # Emotion distribution data
GET /api/analytics/priority # Priority breakdown data
GET /api/analytics/activity # User activity timeline
GET /api/analytics/summary # Dashboard summary statistics

### User Management Endpoints
GET /api/profile # Get user profile
PUT /api/profile # Update user profile
GET /api/notes # Get user notes
POST /api/notes # Create new note
PUT /api/notes/:id # Update existing note
DELETE /api/notes/:id # Delete note

### Example API Usage

#### Single Text Analysis
```javascript
POST /api/analytics/analyze
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "text": "I'm extremely disappointed with the delayed delivery and poor customer service."
}

Response:
{
  "result": {
    "sentiment": "NEGATIVE",
    "sentiment_score": 0.15,
    "emotion": "anger", 
    "priority": "High",
    "response_suggestions": [
      "We're sorry to hear about your experience...",
      "We understand your frustration and would like to resolve this issue...",
      "Please let us know what we can do to address your concerns."
    ]
  }
}
```

#### Bulk File Analysis
```javascript
POST /api/analytics/analyze-bulk
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

FormData: file=<csv/xlsx file>

Response:
{
  "totalAnalyzed": 150,
  "results": [...],
  "summary": {
    "sentimentDistribution": {"Positive": 45, "Negative": 30, "Neutral": 75},
    "priorityDistribution": {"High": 15, "Medium": 60, "Low": 75},
    "averageSentiment": 62.5
  }
}
```

## 📁 Project Structure
Sunsights/
├── frontend/ # React application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ │ ├── analytics/ # Analytics-specific components
│ │ │ ├── Auth.jsx # Authentication forms
│ │ │ ├── Dashboard.jsx # Main dashboard
│ │ │ ├── Analytics.jsx # Analytics visualizations
│ │ │ ├── BulkAnalysis.jsx # Bulk upload interface
│ │ │ ├── SingleAnalysis.jsx # Single text analysis
│ │ │ ├── Profile.jsx # User profile management
│ │ │ └── Navbar.jsx # Navigation component
│ │ ├── hooks/ # Custom React hooks
│ │ ├── config/ # Configuration files
│ │ └── assets/ # Static assets
│ ├── public/ # Public assets
│ └── package.json # Dependencies and scripts
├── backend/ # Flask application
│ ├── routes/ # API route definitions
│ │ ├── analytics.py # Analytics endpoints
│ │ ├── auth.py # Authentication endpoints
│ │ ├── profile.py # Profile management
│ │ └── notes.py # Notes CRUD operations
│ ├── data/ # User analytics data storage
│ ├── uploads/ # Temporary file storage
│ ├── app.py # Main Flask application
│ ├── init_db.py # Database initialization
│ └── database.db # SQLite database
├── requirements.txt # Python dependencies
└── run.py # Application entry point

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token TEXT
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    title TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    stats JSON,
    recent_activity JSON,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Notes Table
```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication with 30-day expiration
- **Password Security**: Enforced complexity requirements and secure hashing
- **Rate Limiting**: API protection against abuse (1000/day, 300/hour per IP)
- **CORS Protection**: Configured for specific origins only
- **Input Validation**: Comprehensive sanitization of user inputs
- **SQL Injection Prevention**: Parameterized queries throughout
- **File Upload Security**: Type validation and size limits for uploads

## 🎯 Usage Examples

### Customer Service Team Workflow
1. **Morning Triage**: Upload overnight customer emails via bulk analysis
2. **Priority Queue**: Sort results by priority to handle urgent issues first
3. **Response Drafting**: Use AI-generated suggestions as response templates
4. **Trend Monitoring**: Check dashboard for emerging sentiment patterns
5. **Team Notes**: Document insights and action items in personal notes

### Supported File Formats
- **CSV**: Comma-separated values with header row
- **Excel**: .xlsx and .xls formats
- **Column Detection**: Automatic identification of text columns (comment, feedback, review, etc.)

## 🚀 Deployment

### Environment Variables
```bash
# Backend (.env)
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///database.db
FLASK_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com
```

### Production Build
```bash
# Frontend production build
cd frontend
npm run build

# Backend production setup
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure Python 3.8+ is installed
- Run `pip install -r requirements.txt`
- Check if port 5000 is available

**Frontend connection errors:**
- Verify backend is running on port 5000
- Check CORS settings in app.py
- Ensure frontend is accessing correct API URL

**Database errors:**
- Run `python init_db.py` to reset database
- Check file permissions in backend directory
- Verify SQLite is properly installed

**AI Model loading issues:**
- Ensure stable internet connection for initial model download
- Check available disk space (models are ~500MB)
- Verify PyTorch installation compatibility

### Performance Optimization
- For large bulk uploads (>1000 rows), consider processing in batches
- Monitor memory usage during AI model inference
- Use production database (PostgreSQL) for better concurrent access