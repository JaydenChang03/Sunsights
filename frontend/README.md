# Sunsights - Text-based Emotion Detection for Customer Service Improvement

![Sunsights Logo](src/assets/logo.png)

## Overview

Sunsights is an AI-powered platform designed to help customer service teams better prioritize and respond to communications by automatically detecting the emotional tone of customer messages. The system analyzes text data to identify emotions, prioritize urgent cases, and suggest appropriate responses, ultimately improving response efficiency and customer satisfaction.

## Features

### 1. Single Comment Analysis
- **Real-time Emotion Detection**: Instantly analyze and categorize the emotional tone of individual customer comments.
- **Emotion Score/Category**: Visual representation of detected emotions with confidence scores.
- **Response Suggestions**: AI-generated response recommendations based on the detected emotion.
- **Interactive Interface**: User-friendly input box for easy comment submission and analysis.

### 2. Bulk Analysis
- **File Upload Capability**: Process multiple comments simultaneously via Excel/CSV file upload.
- **Batch Processing**: Efficiently analyze large datasets of customer feedback.
- **Summary Statistics**: Automatically generate overview statistics of emotional distributions.
- **Priority Case Identification**: Highlight high-priority cases requiring immediate attention.

### 3. User System
- **Secure Authentication**: Registration and login system with extended session management (30-day token expiration).
- **Analysis History**: Save and access previous analyses for reference and comparison.
- **Personalized Dashboard**: Custom view of recent activities and important metrics.
- **Profile Management**: Update profile information, avatar, and cover photos.

### 4. Analytics Dashboard
- **Visual Insights**: Interactive charts displaying emotion distribution across customer interactions.
- **Trend Analysis**: Timeline visualization of sentiment changes over time.
- **Topic Extraction**: Identify common phrases and topics in customer communications.
- **Word Clouds**: Visual representation of frequently occurring terms.
- **Priority Queue**: Organized list of cases requiring immediate attention.
- **Custom Filtering**: Dark green-themed filter bar for data segmentation by various parameters.

### 5. Report Generation
- **PDF Reports**: Generate comprehensive PDF reports with detailed analysis.
- **Excel Export**: Download analysis results in Excel format for further processing.
- **Visual Elements**: Include charts and graphs in exported reports.
- **Sharing Options**: Email reports directly to team members or stakeholders.

## System Architecture

Sunsights follows a client-server architecture with:

### Frontend
- React.js application with modular component structure
- Responsive design for desktop and mobile devices
- State management using React hooks
- Axios for API communication
- Interactive data visualization using chart libraries

### Backend
- Flask-based Python server
- RESTful API endpoints with appropriate URL prefixing
- Blueprint organization for modularity:
  - Authentication (/api/auth)
  - Profile management (/api)
  - Analytics processing (/api)
- Machine learning models for emotion detection
- Database connection pooling with keepalive configuration

### Data Processing
- Natural Language Processing for text analysis
- Emotion classification algorithms
- Statistical analysis for trend identification
- Pandas for data manipulation and processing

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- pip (Python package manager)
- npm or yarn (Node.js package manager)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the Flask server:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

## Usage

### User Authentication
1. Register for a new account or use the test account:
   - Email: test@example.com
   - Password: Password123!

2. Log in with your credentials.

### Single Comment Analysis
1. Navigate to the Single Analysis tab.
2. Enter or paste a customer comment in the text box.
3. Click "Analyze" to process the comment.
4. View the results showing emotion categories, confidence scores, and suggested responses.

### Bulk Analysis
1. Navigate to the Bulk Analysis tab.
2. Prepare an Excel or CSV file with customer comments (follow the provided template).
3. Upload the file using the file uploader.
4. Wait for processing to complete.
5. Review the summary statistics and individual results.
6. Download the complete analysis report if needed.

### Analytics Dashboard
1. Navigate to the Analytics tab.
2. Use the filter bar to segment data by date range, emotion categories, or other parameters.
3. Explore the various charts and visualizations.
4. Check the priority cases list for urgent matters.
5. Click on specific data points for more detailed information.

### Profile Management
1. Navigate to the Profile tab.
2. Update your personal information, avatar, or cover photo.
3. View your recent activity and usage statistics.
4. Manage your saved analyses and reports.

## API Endpoints

### Authentication
- `POST /api/auth/register`: Create a new user account
- `POST /api/auth/login`: Authenticate a user and receive a token
- `GET /api/auth/verify`: Verify a user's authentication token
- `POST /api/auth/logout`: Invalidate the current session

### Profile
- `GET /api/profile`: Retrieve user profile information
- `PUT /api/profile`: Update user profile information
- `POST /api/profile/avatar`: Upload a new avatar image
- `POST /api/profile/cover`: Upload a new cover image

### Analytics
- `POST /api/analyze/comment`: Analyze a single comment
- `POST /api/analyze/bulk`: Process a batch of comments from a file
- `GET /api/analytics/summary`: Get summary statistics of past analyses
- `GET /api/analytics/activity`: Get recent user activity
- `GET /api/analytics/trends`: Get emotion trend data over time
- `GET /api/analytics/priority`: Get list of priority cases
- `GET /api/session-test`: Test endpoint for session verification

## Troubleshooting

### Authentication Issues
- Ensure you're using the correct credentials
- Check that cookies are enabled in your browser
- Try clearing browser cache and cookies
- For development, use the test account provided

### Dashboard Loading Issues
- Verify that the backend server is running
- Check network requests for any API errors
- Ensure you have an active internet connection
- If analytics don't load, try refreshing the page

### Bulk Analysis Errors
- Ensure your file format matches the expected template
- Check that the file size is within the allowed limit
- Verify that the file contains valid data in the correct columns
- If the first attempt fails, try again after a brief pause

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Axios
- Chart.js / D3.js
- React Router

### Backend
- Flask
- SQLAlchemy
- JWT Authentication
- Pandas
- Scikit-learn / TensorFlow

### Database
- SQLite (development)
- PostgreSQL (production)

### Machine Learning
- Natural Language Processing (NLP)
- Sentiment Analysis
- Text Classification
- Entity Recognition

## Development and Testing

### Development Mode
The application includes development mode features to facilitate testing:
- Option to bypass authentication
- Mock data responses for API endpoints
- Detailed console logging
- Fallback to dummy data when backend services are unavailable

### Running Tests
```
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```


## Contact
For any inquiries, please contact [jaydenchang50@gmail.com]