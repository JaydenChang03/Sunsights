# Sunsights - Emotion and Sentiment Analysis Platform

Sunsights is a full-stack web application that helps teams understand emotions and sentiment in text data. Whether you have one comment or thousands, Sunsights gives you instant insights into what people are really feeling.

## What it does

This app takes any text - customer feedback, social media posts, survey responses, etc - and tells you the emotional tone behind it. It goes beyond just "positive" or "negative" to detect specific emotions like joy, anger, sadness, fear, surprise, and love. Plus it automatically figures out which items need urgent attention.

## Key features

### Single text analysis
- Paste any text and get instant results
- See sentiment (positive/negative/neutral) with confidence scores  
- Detect specific emotions with detailed breakdowns
- Get priority level (high/medium/low) for action planning
- Built-in response suggestions to help craft better replies

### Bulk file processing
- Upload CSV, Excel, or text files with multiple entries
- Process hundreds or thousands of items at once
- Get comprehensive summaries and breakdowns
- Export results for further analysis
- Smart column detection finds text data automatically

### Analytics dashboard
- Visual charts showing sentiment trends over time
- Emotion distribution breakdowns
- Priority level analytics
- Activity timeline of all your analyses
- Filter by date ranges and drill down into details

### User system
- Secure login and registration
- Personal profile with avatar upload
- Built-in notes system for tracking insights
- Complete history of all your analyses
- Personal dashboard with your stats

## Tech stack

### Frontend
- React 18 with modern hooks and functional components
- Vite for fast development and optimized builds
- Tailwind CSS for responsive design
- Chart.js for interactive data visualization
- React Router for navigation
- Axios for API communication
- React Hot Toast for notifications

### Backend
- Flask with blueprint architecture for organization
- JWT authentication for secure user sessions
- SQLite database with optimized connection handling
- Hugging Face Transformers for AI models
- Rate limiting and CORS protection
- Pandas for file processing
- Comprehensive error handling and logging

### AI models
- DistilBERT for sentiment analysis (fine-tuned on SST-2)
- Emotion classification model for 6 core emotions
- Priority scoring algorithms combining sentiment and emotion data
- Response suggestion system with contextual templates

## Getting started

### What you need
- Python 3.8 or newer
- Node.js 16 or newer
- Git for cloning the repo

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd Sunsights
```

2. Set up the backend
```bash
cd backend

# Install Python packages
pip install -r ../requirements.txt

# Set up the database
python init_db.py
```

3. Set up the frontend
```bash
cd frontend

# Install Node packages
npm install
```

4. Start everything up
```bash
# Terminal 1: Start the backend (from backend folder)
cd backend
npm run start

# Terminal 2: Start the frontend (from frontend folder) 
cd frontend
npm run dev
```

The app will be running at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

## Available commands

### Frontend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality

### Backend  
- `npm run start` - Start the server
- `npm run dev` - Start with auto-reload
- `python init_db.py` - Reset the database

## API endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/user` - Get current user info
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/upload-avatar` - Upload profile picture

### Analytics
- `POST /api/analytics/analyze` - Analyze single text
- `POST /api/analytics/analyze-bulk` - Upload and analyze files
- `POST /api/analytics/analyze/process` - Process uploaded files
- `GET /api/analytics/summary` - Get dashboard summary
- `GET /api/analytics/sentiment` - Get sentiment trend data
- `GET /api/analytics/emotions` - Get emotion distribution
- `GET /api/analytics/priority` - Get priority breakdowns
- `GET /api/analytics/activity` - Get analysis history

### Notes
- `GET /api/notes` - Get all user notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update existing note
- `DELETE /api/notes/:id` - Delete note

### Profile (legacy endpoints)
- `GET /api/profile` - Get profile data
- `PUT /api/profile` - Update profile

## Database structure

The app uses SQLite with these main tables:

### Users table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    bio TEXT,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token TEXT
);
```

### Notes table  
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

### Profiles table (legacy)
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


## Example usage

### Single text analysis
```javascript
// Send text for analysis
POST /api/analytics/analyze
{
  "text": "I absolutely love this new feature! It makes everything so much easier."
}

// Get back detailed results
{
  "result": {
    "sentiment": "POSITIVE",
    "sentiment_score": 0.89,
    "emotion": "joy",
    "priority": "Low",
    "response_suggestions": [
      "Thank you for the positive feedback!",
      "We're so glad you're enjoying the new feature!",
      "Your enthusiasm means a lot to our team!"
    ]
  }
}
```

### Bulk file analysis
Just upload a CSV or Excel file with text data, and the app will automatically:
- Detect which columns contain text to analyze
- Process all entries in batches
- Generate summary statistics
- Provide downloadable results

## Security features

- JWT token authentication with 30-day expiration
- Password hashing with werkzeug security
- Rate limiting (1000 requests per day, 300 per hour)
- CORS protection for specific origins only
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- File upload type and size restrictions

## Common issues and fixes

**Backend wont start:**
- Make sure Python 3.8+ is installed
- Run `pip install -r requirements.txt` to install dependencies
- Check that port 5000 is available

**Frontend connection errors:**
- Verify the backend is running on port 5000
- Check browser console for CORS errors
- Make sure both servers are running

**Database errors:**
- Run `python init_db.py` to reset the database
- Check file permissions in the backend directory
- Make sure SQLite is working properly

**AI model issues:**
- First run downloads models from Hugging Face (needs internet)
- Models are about 500MB total - make sure you have space
- Check that PyTorch installed correctly

## Performance tips

- For large files (1000+ rows), the app processes in batches automatically
- Monitor memory usage during AI analysis
- Consider using a proper database like PostgreSQL for production
- The app works best with text entries between 10-500 words each


