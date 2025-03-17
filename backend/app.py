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
    
    # Only check if it has at least one letter
    if not any(c.isalpha() for c in cleaned_text):
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
    """Analyze a single piece of text with high accuracy."""
    try:
        # Basic validation
        if not isinstance(text, str) or not text.strip():
            return {
                'sentiment': 'UNKNOWN',
                'score': 0.5,
                'emotion': 'neutral',
                'priority': 'Medium',
                'text': text[:100] + ('...' if len(text) > 100 else '')
            }
        
        # Clean the text
        cleaned_text = text.strip()
        
        # Rule-based sentiment detection (high precision for common patterns)
        # Strong negative patterns
        strong_negative_patterns = [
            'worst', 'terrible', 'horrible', 'awful', 'hate', 'disgusting', 
            'pathetic', 'kill', 'never', 'bad', 'poor', 'disappointed', 
            'waste', 'useless', 'annoying', 'frustrating', 'sucks', 'garbage'
        ]
        
        # Strong positive patterns
        strong_positive_patterns = [
            'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 
            'great', 'love', 'best', 'perfect', 'outstanding', 'superb',
            'brilliant', 'exceptional', 'delightful', 'impressive'
        ]
        
        # Count pattern matches
        text_lower = cleaned_text.lower()
        words = text_lower.split()
        
        # Check for negation words that flip sentiment
        negation_words = ['not', 'no', "don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "isn't", "aren't"]
        has_negation = any(neg in words for neg in negation_words)
        
        # Count matches considering word boundaries
        neg_count = 0
        pos_count = 0
        
        for word in words:
            # Remove punctuation from word
            clean_word = ''.join(c for c in word if c.isalnum())
            if clean_word in strong_negative_patterns:
                neg_count += 1
            if clean_word in strong_positive_patterns:
                pos_count += 1
        
        # Determine if there are explicit strong sentiments
        has_strong_negative = neg_count > 0
        has_strong_positive = pos_count > 0
        
        # Apply negation logic
        if has_negation:
            # Negation flips the sentiment
            if has_strong_positive and not has_strong_negative:
                # "Not good" becomes negative
                rule_based_sentiment = 'NEGATIVE'
                rule_based_score = 0.8
            elif has_strong_negative and not has_strong_positive:
                # "Not bad" becomes positive
                rule_based_sentiment = 'POSITIVE'
                rule_based_score = 0.7
            else:
                # Mixed or unclear with negation
                rule_based_sentiment = None
        else:
            # No negation
            if has_strong_negative and not has_strong_positive:
                rule_based_sentiment = 'NEGATIVE'
                rule_based_score = 0.9
            elif has_strong_positive and not has_strong_negative:
                rule_based_sentiment = 'POSITIVE'
                rule_based_score = 0.9
            elif has_strong_positive and has_strong_negative:
                rule_based_sentiment = 'MIXED'
                rule_based_score = 0.8
            else:
                rule_based_sentiment = None
        
        # If rule-based analysis is confident, use it
        if rule_based_sentiment and (neg_count + pos_count) > 0:
            sentiment_label = rule_based_sentiment
            sentiment_score = rule_based_score
        else:
            # Fall back to model-based analysis
            try:
                # Use the model for more nuanced analysis
                sentiment_result = sentiment_model(cleaned_text)[0]
                model_sentiment = sentiment_result['label']
                model_score = sentiment_result['score']
                
                # Convert model output to our format
                if model_sentiment == 'POSITIVE':
                    sentiment_label = 'POSITIVE'
                    sentiment_score = model_score
                else:
                    sentiment_label = 'NEGATIVE'
                    sentiment_score = model_score
            except Exception as e:
                logger.error(f"Model error: {str(e)}")
                # Fallback if model fails
                sentiment_label = 'MIXED'
                sentiment_score = 0.5
        
        # Emotion Analysis
        try:
            emotion_result = emotion_model(cleaned_text)[0]
            emotion = emotion_result['label'].lower()
        except Exception as e:
            logger.error(f"Emotion model error: {str(e)}")
            # Fallback emotion based on sentiment
            if sentiment_label == 'POSITIVE':
                emotion = 'joy'
            elif sentiment_label == 'NEGATIVE':
                emotion = 'anger'
            else:
                emotion = 'neutral'
        
        # Determine priority based on sentiment and emotion
        if sentiment_label == 'NEGATIVE':
            if emotion in ['anger', 'sadness', 'fear']:
                priority = "High"
            else:
                priority = "Medium"
        elif sentiment_label == 'MIXED':
            if emotion in ['anger', 'sadness', 'fear']:
                priority = "High"
            else:
                priority = "Medium"
        else:  # POSITIVE
            priority = "Low"
        
        # Return the final analysis
        return {
            'sentiment': sentiment_label,
            'score': round(sentiment_score, 2),
            'emotion': emotion,
            'priority': priority,
            'text': cleaned_text[:100] + ('...' if len(cleaned_text) > 100 else '')
        }
    
    except Exception as e:
        logger.error(f"Error in analyze_text: {str(e)}")
        # Provide a safe fallback
        return {
            'sentiment': 'UNKNOWN',
            'score': 0.5,
            'emotion': 'neutral',
            'priority': 'Medium',
            'text': text[:100] + ('...' if len(text) > 100 else ''),
            'error': str(e)
        }

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
