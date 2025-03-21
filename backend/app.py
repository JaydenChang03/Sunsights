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
    default_limits=["1000 per day", "300 per hour"]
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
    # Anger and strong negative emotions are always High priority
    if emotion == 'anger' or emotion == 'fear':
        return "High"
    # Very negative sentiment is High priority
    elif sentiment_score < 0.3:
        return "High"
    # Moderately negative sentiment with negative emotions are High priority
    elif sentiment_score < 0.4 and emotion in ['sadness', 'disgust']:
        return "High"
    # Moderately negative sentiment or certain emotions are Medium priority
    elif sentiment_score < 0.5 or emotion in ['sadness', 'fear']:
        return "Medium"
    # Neutral sentiment with surprise is Medium priority
    elif emotion == 'surprise' and 0.4 <= sentiment_score <= 0.6:
        return "Medium"
    # Everything else is Low priority
    else:
        return "Low"

def generate_response_suggestions(sentiment, emotion):
    """
    Generate response suggestions based on sentiment and emotion.
    
    Args:
        sentiment (str): The sentiment label ('POSITIVE', 'NEGATIVE', or 'MIXED')
        emotion (str): The emotion label ('joy', 'sadness', 'anger', 'fear', 'surprise', 'love')
        
    Returns:
        list: A list of response suggestions
    """
    suggestions = []
    
    # General templates based on sentiment
    if sentiment == 'POSITIVE':
        suggestions.append("Thank you for your positive feedback!")
        suggestions.append("We're glad to hear you had a good experience.")
    elif sentiment == 'NEGATIVE':
        suggestions.append("We're sorry to hear about your experience.")
        suggestions.append("Thank you for bringing this to our attention.")
    elif sentiment == 'MIXED':
        suggestions.append("Thank you for your balanced feedback.")
        suggestions.append("We appreciate your thoughtful assessment.")
        suggestions.append("Thank you for sharing both the positives and areas for improvement.")
    else:  # UNKNOWN
        suggestions.append("Thank you for your feedback.")
        suggestions.append("We appreciate you taking the time to share your thoughts.")
    
    # Emotion-specific responses
    if emotion == 'joy':
        suggestions.append("We're delighted that you're happy with our service!")
        suggestions.append("Your satisfaction is our priority.")
    elif emotion == 'sadness':
        suggestions.append("We understand this is disappointing and we'd like to help.")
        suggestions.append("How can we make this right for you?")
    elif emotion == 'anger':
        suggestions.append("We understand your frustration and would like to resolve this issue.")
        suggestions.append("Please let us know what we can do to address your concerns.")
    elif emotion == 'fear':
        suggestions.append("We want to assure you that your concerns are being taken seriously.")
        suggestions.append("We're here to help address any worries you might have.")
    elif emotion == 'surprise':
        suggestions.append("We're glad we could exceed your expectations!")
        suggestions.append("Thank you for noticing our efforts.")
    elif emotion == 'love':
        suggestions.append("We're thrilled that you love our service!")
        suggestions.append("Your enthusiasm means a lot to us.")
    elif emotion == 'neutral' and sentiment == 'MIXED':
        suggestions.append("We'd love to hear more about what aspects you liked and what could be improved.")
        suggestions.append("Your balanced perspective helps us improve our service.")
        suggestions.append("Could you tell us more about which aspects met your expectations and which didn't?")
    
    # Add a follow-up question based on sentiment
    if sentiment == 'MIXED':
        suggestions.append("Which aspects would you like us to prioritize improving?")
    else:
        suggestions.append("Is there anything specific we can help you with?")
    
    # Return 3 suggestions at most
    return suggestions[:3]

def analyze_text(text):
    """
    Analyze text for sentiment and emotion.
    Returns a dictionary with sentiment, emotion, and priority.
    """
    if not text or not text.strip():
        return {
            'sentiment': 'UNKNOWN',
            'sentiment_score': 0,
            'emotion': 'neutral',
            'priority': 'low',
            'response_suggestions': []
        }
    
    # Clean the text
    cleaned_text = text.strip()
    
    # Check if text contains only numbers or symbols
    if not any(c.isalpha() for c in cleaned_text):
        return {
            'sentiment': 'UNKNOWN',
            'sentiment_score': 0,
            'emotion': 'neutral',
            'priority': 'low',
            'response_suggestions': ["I notice your message contains only numbers or symbols. Could you please provide more details?"]
        }
    
    # Initialize variables
    sentiment_label = 'UNKNOWN'
    sentiment_score = 0
    emotion = 'neutral'
    
    # Convert to lowercase for pattern matching
    text_lower = cleaned_text.lower()
    
    # Check for direct negative phrases
    has_negative = any(phrase in text_lower for phrase in [
        'not good', 'not great', 'bad', 'terrible', 'awful', 'poor', 'horrible', 
        'disappointing', 'worse', 'worst', 'could be better', 'needs improvement',
        'should improve', 'not happy', 'not satisfied', 'dislike', 'hate',
        'frustrated', 'annoyed', 'angry', 'upset', 'sad', 'unhappy'
    ])
    
    # Check for direct positive phrases
    has_positive = any(phrase in text_lower for phrase in [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding',
        'exceptional', 'perfect', 'brilliant', 'superb', 'happy', 'glad', 'pleased',
        'delighted', 'satisfied', 'enjoy', 'love', 'like', 'appreciate'
    ])
    
    # Check for double negatives (which are actually positive)
    has_double_negative = any(phrase in text_lower for phrase in [
        'not bad', "isn't bad", "aren't bad", "wasn't bad", "weren't bad",
        'not terrible', "isn't terrible", 'not awful', "isn't awful",
        'not the worst', "isn't the worst"
    ])
    
    # Check for surprise phrases
    has_surprise = any(phrase in text_lower for phrase in [
        'wow', 'whoa', 'omg', 'oh my god', 'oh my', 'unexpected', 'surprise', 'surprised',
        'unbelievable', 'astonishing', 'shocking', "didn't expect", 'shocked',
        'mind blown', 'jaw dropped', 'astounding'
    ])
    
    # SPECIAL PATTERN MATCHING FOR SPECIFIC PHRASES
    
    # Check for expressions of surprise
    is_surprise_expression = False
    surprise_patterns = [
        "wow", "didn't expect", "unexpected", "surprised", "amazing results", 
        "can't believe", "incredible", "unbelievable", "astonishing"
    ]
    if any(pattern in text_lower for pattern in surprise_patterns):
        is_surprise_expression = True
    
    # Check for expressions of love
    is_love_expression = False
    love_patterns = [
        "adore", "love", "can't live without", "obsessed with", "favorite", 
        "best ever", "absolutely love", "absolutely adore"
    ]
    if any(pattern in text_lower for pattern in love_patterns):
        is_love_expression = True
    
    # Check for expressions of anger
    is_anger_expression = False
    anger_patterns = [
        "furious", "angry", "mad", "outraged", "terrible service", "awful service", 
        "horrible service", "unacceptable", "ridiculous", "infuriating", "frustrated",
        "annoyed", "irritated", "upset", "appalling", "terrible", "horrible", "awful",
        "worst", "hate", "disgusting", "pathetic", "useless", "waste", "poor service",
        "bad service", "poor quality", "bad quality", "disappointed", "disappointing",
        "complaint", "complain", "unsatisfied", "dissatisfied", "not happy", "unhappy",
        "never again", "never use", "never buy", "never shop", "never return", "never recommend"
    ]
    # Check if any anger pattern is in the text
    if any(pattern in text_lower for pattern in anger_patterns):
        is_anger_expression = True
    # Also check for exclamation marks with negative words as a sign of anger
    if "!" in text and has_negative:
        is_anger_expression = True
        
    # Check for functionality issues (these should be high priority)
    has_functionality_issue = False
    functionality_issue_patterns = [
        "doesn't work", "does not work", "not working", "broken", "malfunction", 
        "error", "bug", "glitch", "crash", "freezes", "hangs", "stuck", 
        "failed", "failure", "unusable", "can't use", "cannot use",
        "not as advertised", "doesn't work as advertised", "does not work as advertised",
        "false advertising", "misleading", "misrepresented", "not as described",
        "not what I expected", "not what was promised", "promised", "advertised"
    ]
    if any(pattern in text_lower for pattern in functionality_issue_patterns):
        has_functionality_issue = True
    
    # Check for expressions of sadness/disappointment
    is_sadness_expression = False
    sadness_patterns = [
        "disappointed", "sad", "unhappy", "regret", "let down", "letdown",
        "not as expected", "not what i expected", "dissatisfied", "unsatisfied"
    ]
    if any(pattern in text_lower for pattern in sadness_patterns):
        is_sadness_expression = True
    
    # Check for mixed sentiment expressions
    is_mixed_sentiment = False
    mixed_patterns = [
        "mixed feelings", "pros and cons", "good and bad", "like and dislike",
        "partly", "somewhat", "kind of", "sort of", "not sure if", "conflicted",
        "on one hand", "on the other hand", "however", "although", "but", 
        "nevertheless", "nonetheless", "despite", "in spite of", "while", "whereas",
        "concerned", "concern", "worried", "worry", "issue", "issues", "problem",
        "problems", "drawback", "drawbacks", "downside", "downsides"
    ]
    
    # Check for sentences with both positive and negative elements
    has_both_positive_and_negative = has_positive and has_negative
    
    # Detect mixed sentiment if there are mixed patterns or both positive and negative elements
    if any(pattern in text_lower for pattern in mixed_patterns) or has_both_positive_and_negative:
        is_mixed_sentiment = True
    
    # DETERMINE SENTIMENT
    
    # Special case for mixed sentiment
    if is_mixed_sentiment:
        sentiment_label = 'MIXED'
        # Calculate sentiment score based on balance of positive/negative
        if has_positive and has_negative:
            # If both present, use a middle score with slight bias toward negative
            sentiment_score = 0.45
        else:
            sentiment_score = 0.5
        # For mixed sentiment, emotion depends on which aspect is stronger
        if 'but overall good' in text_lower or 'but i like' in text_lower:
            emotion = 'joy'
        elif 'but overall bad' in text_lower or 'but i dislike' in text_lower or 'concern' in text_lower or 'worried' in text_lower or 'issue' in text_lower or 'problem' in text_lower:
            emotion = 'sadness'
        else:
            emotion = 'neutral'
    # Special case for expressions of surprise
    elif is_surprise_expression:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.9
        emotion = 'surprise'
    # Special case for expressions of love
    elif is_love_expression:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.95
        emotion = 'love'
    # Special case for expressions of anger
    elif is_anger_expression:
        sentiment_label = 'NEGATIVE'
        sentiment_score = 0.1  # Very negative sentiment score for anger
        emotion = 'anger'
    # Special case for expressions of sadness/disappointment
    elif is_sadness_expression:
        sentiment_label = 'NEGATIVE'
        sentiment_score = 0.8
        emotion = 'sadness'
    # Special case for double negatives
    elif has_double_negative and not has_negative:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.6  # Mild positive
        emotion = 'neutral'
    # Negative phrases take precedence
    elif has_negative:
        sentiment_label = 'NEGATIVE'
        sentiment_score = 0.8
        emotion = 'sadness'  # Default negative emotion
    # Then check for positive phrases
    elif has_positive:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.8
        
        # Determine specific positive emotion
        if 'love' in text_lower or 'adore' in text_lower or 'cherish' in text_lower:
            emotion = 'love'
        elif 'happy' in text_lower or 'glad' in text_lower or 'joy' in text_lower:
            emotion = 'joy'
        else:
            emotion = 'joy'  # Default positive emotion
    # If we have surprise without clear sentiment, it's likely positive
    elif has_surprise:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.7
        emotion = 'surprise'
    # Fallback to model if no clear patterns
    else:
        try:
            # Use sentiment model
            sentiment_result = sentiment_model(cleaned_text)[0]
            model_sentiment = sentiment_result['label']
            model_score = sentiment_result['score']
            
            # Use emotion model
            emotion_result = emotion_model(cleaned_text)[0]
            model_emotion = emotion_result['label'].lower()
            
            # Convert model output to our format
            if model_sentiment == 'POSITIVE':
                sentiment_label = 'POSITIVE'
                sentiment_score = model_score
                # If model says positive but no clear emotion, default to joy
                emotion = model_emotion if model_emotion != 'neutral' else 'joy'
            else:
                sentiment_label = 'NEGATIVE'
                sentiment_score = model_score
                # If model says negative but no clear emotion, default to sadness
                emotion = model_emotion if model_emotion != 'neutral' else 'sadness'
        except Exception as e:
            logger.error(f"Model error: {str(e)}")
            # Fallback if model fails - make a best guess based on text
            if 'good' in text_lower or 'great' in text_lower or 'like' in text_lower:
                sentiment_label = 'POSITIVE'
                sentiment_score = 0.7
                emotion = 'joy'
            elif 'bad' in text_lower or 'not' in text_lower or 'could be better' in text_lower:
                sentiment_label = 'NEGATIVE'
                sentiment_score = 0.7
                emotion = 'sadness'
            else:
                # If all else fails, assume neutral
                sentiment_label = 'MIXED'
                sentiment_score = 0.5
                emotion = 'neutral'
    
    # Determine priority based on sentiment and emotion
    priority = get_priority_level(sentiment_score, emotion)
    
    # Special case override: If mixed sentiment with concerns, ensure Medium Priority
    if is_mixed_sentiment and any(word in text_lower for word in ["concern", "concerned", "worry", "worried", "issue", "issues", "problem", "problems", "reliability", "unreliable"]):
        priority = "Medium"
    
    # Special case override: If functionality issue, ensure High Priority
    if has_functionality_issue:
        priority = "High"
    
    # Generate response suggestions based on sentiment and emotion
    response_suggestions = generate_response_suggestions(sentiment_label, emotion)
    
    return {
        'sentiment': sentiment_label,
        'sentiment_score': sentiment_score,
        'emotion': emotion,
        'priority': priority,
        'response_suggestions': response_suggestions
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
