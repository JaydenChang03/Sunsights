import os
import logging
from datetime import timedelta
from flask import jsonify, Flask, request, session
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.analytics import analytics
from routes.auth import auth
from routes.profile import profile
from transformers import pipeline
import torch
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Basic configuration
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)  # Increased from 1 day to 30 days
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Add permanent session configuration to prevent database shutdown
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=31)  # Set session lifetime to 31 days
app.config['SESSION_PERMANENT'] = True  # Make sessions permanent

# Add database keepalive configuration
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280  # Recycle connections before MySQL's default timeout of 300 seconds
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20  # Wait 20 seconds for a connection before timing out
app.config['SQLALCHEMY_POOL_PRE_PING'] = True  # Test connections with a ping before using them

jwt = JWTManager(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize models
logger.info("Loading sentiment analysis model...")
sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=0 if torch.cuda.is_available() else -1
)

logger.info("Loading emotion classification model...")
emotion_model = pipeline(
    "text-classification",
    model="bhadresh-savani/distilbert-base-uncased-emotion",
    device=0 if torch.cuda.is_available() else -1
)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_comment(text):
    """
    Determine if a text is valid for sentiment analysis.
    
    Args:
        text (str): The text to validate
        
    Returns:
        bool: True if the text is valid for sentiment analysis, False otherwise
    """
    if not isinstance(text, str):
        return False
        
    # Remove whitespace
    cleaned_text = text.strip()
    
    # Check if text is empty
    if not cleaned_text:
        return False
        
    # Check if text is too short (less than 3 words)
    if len(cleaned_text.split()) < 3:
        return False
        
    # Check if text contains at least one letter
    if not any(c.isalpha() for c in cleaned_text):
        return False
        
    # Check if text appears to be just a name or simple identifier
    # Names typically don't have punctuation or multiple words
    if len(cleaned_text.split()) <= 2 and all(word[0].isupper() for word in cleaned_text.split()):
        return False
        
    return True

def get_priority_level(sentiment_score, emotion):
    """Determine priority level based on sentiment and emotion."""
    # More nuanced priority determination
    if sentiment_score < 0.25:  # Very negative sentiment
        return "High"
    elif emotion in ['anger', 'sadness', 'fear'] and sentiment_score < 0.45:
        return "High"
    elif sentiment_score < 0.35 or emotion in ['anger', 'sadness']:
        return "Medium"
    elif emotion in ['fear', 'surprise'] and sentiment_score < 0.6:
        return "Medium"
    else:
        return "Low"

def analyze_text(text):
    """Analyze a single piece of text."""
    try:
        # First check if the text is valid for analysis
        if not is_valid_comment(text):
            return None
            
        # Sentiment Analysis
        sentiment_result = sentiment_model(text)[0]
        
        # Emotion Analysis
        emotion_result = emotion_model(text)[0]
        
        # Calculate priority
        sentiment_score = sentiment_result['score'] if sentiment_result['label'] == 'POSITIVE' else 1 - sentiment_result['score']
        priority = get_priority_level(sentiment_score, emotion_result['label'].lower())
        
        return {
            'sentiment': sentiment_result['label'],
            'score': sentiment_result['score'],
            'emotion': emotion_result['label'].lower(),
            'priority': priority,
            'text': text[:100] + ('...' if len(text) > 100 else '')  # Include truncated text for reference
        }
    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}")
        raise

# Register blueprints
app.register_blueprint(analytics, url_prefix='/api/analytics')
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(profile, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Sunsights API!"})

# Session test route
@app.route('/api/session-test')
def session_test():
    if 'visits' in session:
        session['visits'] = session.get('visits') + 1
    else:
        session['visits'] = 1
    return jsonify({
        "message": "Session is working",
        "visits": session.get('visits', 0),
        "session_lifetime_days": app.config['PERMANENT_SESSION_LIFETIME'].days
    })

# Handle OPTIONS requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = app.make_default_options_response()
    # Check the origin and allow either port
    origin = request.headers.get('Origin', '')
    if origin in ['http://localhost:3000', 'http://localhost:3001']:
        response.headers.add('Access-Control-Allow-Origin', origin)
    else:
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3001')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
