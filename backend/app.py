import os
import logging
from datetime import timedelta
from flask import jsonify, Flask, request, session, send_from_directory
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from routes.analytics import analytics
from routes.auth import auth
from routes.profile import profile
from routes.notes import notes
from transformers import pipeline
import torch
from tqdm import tqdm

# configure logging
logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# create flask app
app = Flask(__name__)

# initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per day", "300 per hour"]
)

# enable cors
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# basic configuration
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'your-secret-key'  # change this in production

# jwt configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)  # increased from 1 day to 30 days
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# add permanent session configuration to prevent database shutdown
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=31)  # set session lifetime to 31 days
app.config['SESSION_PERMANENT'] = True  # make sessions permanent

# add database keepalive configuration
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280  # recycle connections before mysql default timeout of 300 seconds
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20  # wait 20 seconds for a connection before timing out
app.config['SQLALCHEMY_POOL_PRE_PING'] = True  # test connections with a ping before using them

jwt = JWTManager(app)

# configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# initialize models

sentiment_model = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=0 if torch.cuda.is_available() else -1
)


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
        
    # remove whitespace
    cleaned_text = text.strip()
    
    # check if text is empty
    if not cleaned_text:
        return False
    
    # only check if it has at least one letter
    if not any(c.isalpha() for c in cleaned_text):
        return False
        
    return True

def get_priority_level(sentiment_score, emotion):
    """Determine priority level based on sentiment and emotion."""
    # anger and strong negative emotions are always high priority
    if emotion == 'anger' or emotion == 'fear':
        return "High"
    # very negative sentiment is high priority
    elif sentiment_score < 0.3:
        return "High"
    # moderately negative sentiment with negative emotions are high priority
    elif sentiment_score < 0.4 and emotion in ['sadness', 'disgust']:
        return "High"
    # moderately negative sentiment or certain emotions are medium priority
    elif sentiment_score < 0.5 or emotion in ['sadness']:
        return "Medium"
    # neutral sentiment with surprise is medium priority
    elif emotion == 'surprise' and 0.4 <= sentiment_score <= 0.6:
        return "Medium"
    # everything else is low priority
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
    
    # general templates based on sentiment
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
    else:  # unknown
        suggestions.append("Thank you for your feedback.")
        suggestions.append("We appreciate you taking the time to share your thoughts.")
    
    # emotion-specific responses
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
    
    # add a follow-up question based on sentiment
    if sentiment == 'MIXED':
        suggestions.append("Which aspects would you like us to prioritize improving?")
    else:
        suggestions.append("Is there anything specific we can help you with?")
    
    # return 3 suggestions at most
    return suggestions[:3]

def analyze_text(text):
    if not text or not text.strip():
        return {
            'sentiment': 'UNKNOWN',
            'sentiment_score': 0,
            'emotion': 'neutral',
            'priority': 'low',
            'response_suggestions': []
        }
    
    # clean the text
    cleaned_text = text.strip()
    
    # check if text contains only numbers or symbols
    if not any(c.isalpha() for c in cleaned_text):
        return {
            'sentiment': 'UNKNOWN',
            'sentiment_score': 0,
            'emotion': 'neutral',
            'priority': 'low',
            'response_suggestions': ["I notice your message contains only numbers or symbols. Could you please provide more details?"]
        }
    
    # initialize variables
    sentiment_label = 'UNKNOWN'
    sentiment_score = 0
    emotion = 'neutral'
    
    # convert to lowercase for pattern matching
    text_lower = cleaned_text.lower()
    
    # check for direct negative phrases
    has_negative = any(phrase in text_lower for phrase in [
        'not good', 'not great', 'bad', 'terrible', 'awful', 'poor', 'horrible', 
        'disappointing', 'worse', 'worst', 'could be better', 'needs improvement',
        'should improve', 'not happy', 'not satisfied', 'dislike', 'hate',
        'frustrated', 'annoyed', 'angry', 'upset', 'sad', 'unhappy'
    ])
    
    # check for direct positive phrases
    has_positive = any(phrase in text_lower for phrase in [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding',
        'exceptional', 'perfect', 'brilliant', 'superb', 'happy', 'glad', 'pleased',
        'delighted', 'satisfied', 'enjoy', 'love', 'like', 'appreciate'
    ])
    
    # check for double negatives (which are actually positive)
    has_double_negative = any(phrase in text_lower for phrase in [
        'not bad', "isn't bad", "aren't bad", "wasn't bad", "weren't bad",
        'not terrible', "isn't terrible", 'not awful', "isn't awful",
        'not the worst', "isn't the worst"
    ])
    
    # check for surprise phrases
    has_surprise = any(phrase in text_lower for phrase in [
        'wow', 'whoa', 'omg', 'oh my god', 'oh my', 'unexpected', 'surprise', 'surprised',
        'unbelievable', 'astonishing', 'shocking', "didn't expect", 'shocked',
        'mind blown', 'jaw dropped', 'astounding'
    ])
    
    # special pattern matching for specific phrases
    
    # check for expressions of surprise
    is_surprise_expression = False
    surprise_patterns = [
        "wow", "didn't expect", "unexpected", "surprised", "amazing results", 
        "can't believe", "incredible", "unbelievable", "astonishing"
    ]
    if any(pattern in text_lower for pattern in surprise_patterns):
        is_surprise_expression = True
    
    # check for expressions of love
    is_love_expression = False
    love_patterns = [
        "adore", "love", "can't live without", "obsessed with", "favorite", 
        "best ever", "absolutely love", "absolutely adore"
    ]
    if any(pattern in text_lower for pattern in love_patterns):
        is_love_expression = True
    
    # check for expressions of anger
    is_anger_expression = False
    anger_patterns = [
        "furious", "angry", "mad", "outraged", "terrible service", "awful service", 
        "horrible service", "unacceptable", "ridiculous", "infuriating", "frustrated",
        "annoyed", "irritated", "upset", "appalling", "terrible", "horrible", "awful",
        "worst", "hate", "disgusting", "pathetic", "useless", "waste", "poor service",
        "bad service", "poor quality", "bad quality",
        "complaint", "complain", "unsatisfied", "dissatisfied", "not happy", "unhappy",
        "never again", "never use", "never buy", "never shop", "never return", "never recommend"
    ]
    # check if any anger pattern is in the text
    if any(pattern in text_lower for pattern in anger_patterns):
        is_anger_expression = True
    # also check for exclamation marks with negative words as a sign of anger
    if "!" in text and has_negative:
        is_anger_expression = True
    


    # check for functionality issues (these should be high priority)
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
    
    # check for expressions of sadness/disappointment
    is_sadness_expression = False
    sadness_patterns = [
        "disappointed", "disappointing", "disappointment", "sad", "unhappy", "regret", "let down", "letdown",
        "not as expected", "not what i expected", "dissatisfied", "unsatisfied"
    ]
    if any(pattern in text_lower for pattern in sadness_patterns):
        is_sadness_expression = True
    


    # check for mixed sentiment expressions
    is_mixed_sentiment = False
    mixed_patterns = [
        "mixed feelings", "pros and cons", "good and bad", "like and dislike",
        "partly", "somewhat", "kind of", "sort of", "not sure if", "conflicted",
        "on one hand", "on the other hand", "however", "although", "but", 
        "nevertheless", "nonetheless", "despite", "in spite of", "while", "whereas",
        "concerned", "concern", "worried", "worry", "issue", "issues", "problem",
        "problems", "drawback", "drawbacks", "downside", "downsides"
    ]
    
    # check for sentences with both positive and negative elements
    has_both_positive_and_negative = has_positive and has_negative
    
    # special "but" detection
    has_but = "but" in text_lower
    
    # detect mixed sentiment if there are mixed patterns or both positive and negative elements
    if any(pattern in text_lower for pattern in mixed_patterns) or has_both_positive_and_negative:
        is_mixed_sentiment = True
    
    # determine sentiment
    
    # always run ml models first to get baseline
    ml_sentiment_label = 'UNKNOWN'
    ml_sentiment_score = 0.5
    ml_emotion = 'neutral'
    
    try:
        # use sentiment model
        sentiment_result = sentiment_model(cleaned_text)[0]
        ml_sentiment_label = sentiment_result['label']
        ml_sentiment_score = sentiment_result['score']
        
        # use emotion model
        emotion_result = emotion_model(cleaned_text)[0]
        ml_emotion = emotion_result['label'].lower()
        emotion_score = emotion_result['score']
        

    except Exception as e:
        logger.error(f"ML Model error: {str(e)}")
    
    # now apply rule-based logic with ml model as foundation
    
    # special case for double negatives - fix the logic
    if has_double_negative:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.6  # mild positive
        emotion = ml_emotion if ml_emotion in ['joy', 'love', 'surprise'] else 'joy'
    # priority rule: special "but" rule - this must trigger mixed sentiment as requested
    elif has_but:
        sentiment_label = 'MIXED'
        sentiment_score = 0.45  # slightly negative bias for mixed
        emotion = 'neutral'  # default to neutral for mixed sentiment
    # special case for very clear negative expressions with high ml confidence
    elif ml_sentiment_label == 'NEGATIVE' and ml_sentiment_score > 0.95:
        sentiment_label = 'NEGATIVE'
        sentiment_score = ml_sentiment_score
        
        # use ml emotion but with some rule-based overrides for specific cases
        if is_anger_expression or 'hate' in text_lower:
            emotion = 'anger'
            sentiment_score = max(sentiment_score, 0.85)  # ensure anger gets high score

        elif is_sadness_expression or any(word in text_lower for word in ['disappointed', 'let down', 'sad']):
            emotion = 'sadness'

        elif 'worried' in text_lower or 'worry' in text_lower or "won't work" in text_lower:
            emotion = 'fear'

        # new: override for "not good" type patterns that shouldnt be joy
        elif any(pattern in text_lower for pattern in ['not good', 'not great', 'not bad but', 'bad', 'awful', 'terrible', 'horrible']) and ml_emotion == 'joy':
            emotion = 'sadness'

        else:
            emotion = ml_emotion

    # special case for very clear positive expressions with high ml confidence
    elif ml_sentiment_label == 'POSITIVE' and ml_sentiment_score > 0.95:
        sentiment_label = 'POSITIVE'
        sentiment_score = ml_sentiment_score
        
        if is_love_expression:
            emotion = 'love'
        elif is_surprise_expression:
            emotion = 'surprise'
        else:
            emotion = ml_emotion if ml_emotion in ['joy', 'love', 'surprise'] else 'joy'
    # check for problematic mixed sentiment cases where ml is very confident
    elif is_mixed_sentiment and has_positive and has_negative and ml_sentiment_score > 0.9:
        sentiment_label = ml_sentiment_label
        sentiment_score = ml_sentiment_score
        emotion = ml_emotion
    # special case for mixed sentiment
    elif is_mixed_sentiment:
        sentiment_label = 'MIXED'
        # calculate sentiment score based on balance of positive/negative
        if has_positive and has_negative:
            # if both present, use a middle score with slight bias toward negative
            sentiment_score = 0.45
        else:
            sentiment_score = 0.5
        # for mixed sentiment, emotion depends on which aspect is stronger
        if 'but overall good' in text_lower or 'but i like' in text_lower:
            emotion = 'joy'
        elif 'but overall bad' in text_lower or 'but i dislike' in text_lower or 'concern' in text_lower or 'worried' in text_lower or 'issue' in text_lower or 'problem' in text_lower:
            emotion = 'sadness'
        else:
            emotion = 'neutral'
    # special case for expressions of surprise
    elif is_surprise_expression:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.9
        emotion = 'surprise'
    # special case for expressions of love
    elif is_love_expression:
        sentiment_label = 'POSITIVE'
        sentiment_score = 0.95
        emotion = 'love'
    # fallback to ml models for everything else
    else:
        sentiment_label = ml_sentiment_label
        sentiment_score = ml_sentiment_score
        emotion = ml_emotion
        
        # apply some emotion-specific overrides
        if 'worried' in text_lower or 'worry' in text_lower:
            emotion = 'fear'
        elif 'disappointed' in text_lower or 'let down' in text_lower:
            emotion = 'sadness'
        elif 'hate' in text_lower or 'furious' in text_lower:
            emotion = 'anger'
        # additional override: if sentiment is clearly negative but emotion is joy, change to appropriate emotion
        elif sentiment_label == 'NEGATIVE' and emotion == 'joy' and any(word in text_lower for word in ['not good', 'bad', 'awful', 'terrible', 'horrible']):
            emotion = 'sadness'
    

    
    # convert sentiment_score to percentage for display
    final_sentiment_score = int(sentiment_score * 100)
    

    
    # determine priority based on sentiment and emotion
    priority = get_priority_level(sentiment_score, emotion)
    
    # special case override: if mixed sentiment with concerns, ensure medium priority
    if is_mixed_sentiment and any(word in text_lower for word in ["concern", "concerned", "worry", "worried", "issue", "issues", "problem", "problems", "reliability", "unreliable"]):
        priority = "Medium"
    
    # special case override: if functionality issue, ensure high priority
    if has_functionality_issue:
        priority = "High"
    
    # generate response suggestions based on sentiment and emotion
    response_suggestions = generate_response_suggestions(sentiment_label, emotion)
    
    result = {
        'sentiment': sentiment_label,
        'sentiment_score': final_sentiment_score,
        'emotion': emotion,
        'priority': priority,
        'response_suggestions': response_suggestions
    }
    
    return result

# register blueprints
app.register_blueprint(analytics, url_prefix='/api/analytics')
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(profile)
app.register_blueprint(notes)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Sunsights API!"})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    try:
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        return send_from_directory(uploads_dir, filename)
    except Exception as e:
        logger.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404

# session test route
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

# handle options requests
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = app.make_default_options_response()
    # check the origin and allow either port
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
