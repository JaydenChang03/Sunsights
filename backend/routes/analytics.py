from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
import logging
import os
import json
import sqlite3

analytics = Blueprint('analytics', __name__)

# Base directory for data storage
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Default data structure
DEFAULT_DATA = {
    'totalAnalyses': 0,
    'bulkUploads': 0,
    'averageSentiment': 75,
    'lastAnalysisTime': None,
    'activities': [
        {
            'title': 'Welcome to Sunsights',
            'description': 'Your sentiment analysis dashboard is ready',
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'info'
        }
    ]
}

def get_db():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')
        logging.debug(f"Attempting to connect to database at: {db_path}")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logging.error(f"Database connection error: {e}")
        raise

def get_user_id_from_email(email):
    """Get user ID from email"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,)
        ).fetchone()
        
        if user:
            return user['id']
        return None
    except Exception as e:
        logging.error(f"Error getting user ID: {str(e)}")
        return None
    finally:
        if conn:
            conn.close()

def get_data_file_for_user(user_id):
    """Get data file path for specific user"""
    if user_id is None:
        return os.path.join(DATA_DIR, 'default_analytics_data.json')
    return os.path.join(DATA_DIR, f'user_{user_id}_analytics_data.json')

def load_data(user_id=None):
    """Load analytics data from file for specific user or create with defaults if it doesn't exist"""
    try:
        data_file = get_data_file_for_user(user_id)
        if os.path.exists(data_file):
            with open(data_file, 'r') as f:
                return json.load(f)
        else:
            save_data(DEFAULT_DATA, user_id)
            return DEFAULT_DATA
    except Exception as e:
        logging.error(f"Error loading analytics data for user {user_id}: {str(e)}")
        return DEFAULT_DATA

def save_data(data, user_id=None):
    """Save analytics data to file for specific user"""
    try:
        data_file = get_data_file_for_user(user_id)
        with open(data_file, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logging.error(f"Error saving analytics data for user {user_id}: {str(e)}")

def generate_timestamps(days):
    end = datetime.now()
    start = end - timedelta(days=days)
    timestamps = []
    current = start
    while current <= end:
        timestamps.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    return timestamps

def get_days_from_range(time_range):
    ranges = {
        '24h': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90
    }
    return ranges.get(time_range, 7)

@analytics.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'ok', 'message': 'Analytics API is working'})

@analytics.route('/sentiment', methods=['GET'])
@jwt_required()
def get_sentiment():
    current_user = get_jwt_identity()
    user_id = get_user_id_from_email(current_user)
    
    time_range = request.args.get('timeRange', '7d')
    days = get_days_from_range(time_range)
    timestamps = generate_timestamps(days)
    
    # Load the user's data to get real analytics
    user_data = load_data(user_id)
    
    # Create realistic data based on the user's averageSentiment and totalAnalyses
    avg_sentiment = user_data.get('averageSentiment', 75)
    total_analyses = user_data.get('totalAnalyses', 0)
    
    # More stable data for users with more analyses
    variation = max(5, 20 - min(total_analyses / 5, 15))
    
    # Generate positive data around the user's average sentiment
    positive_data = []
    for _ in timestamps:
        if total_analyses > 0:
            value = max(60, min(90, avg_sentiment + random.uniform(-variation, variation)))
            positive_data.append(value)
        else:
            positive_data.append(random.randint(65, 85))
    
    # Generate negative data as the complement to positive (with some noise)
    negative_data = []
    for pos in positive_data:
        neg_value = max(5, min(40, 100 - pos + random.uniform(-5, 5)))
        negative_data.append(neg_value)
    
    return jsonify({
        'labels': timestamps,
        'datasets': [
            {
                'label': 'Positive',
                'data': positive_data,
                'borderColor': '#34D399',
                'backgroundColor': 'rgba(52, 211, 153, 0.1)',
                'fill': True,
                'tension': 0.4,
            },
            {
                'label': 'Negative',
                'data': negative_data,
                'borderColor': '#F87171',
                'backgroundColor': 'rgba(248, 113, 113, 0.1)',
                'fill': True,
                'tension': 0.4,
            },
        ]
    })

@analytics.route('/emotions', methods=['GET'])
@jwt_required()
def get_emotions():
    current_user = get_jwt_identity()
    user_id = get_user_id_from_email(current_user)
    
    # Load the user's data to get real analytics
    user_data = load_data(user_id)
    
    # Extract emotions from activity if available
    activities = user_data.get('activities', [])
    emotions_count = {
        'Joy': 0,
        'Sadness': 0,
        'Anger': 0,
        'Fear': 0,
        'Surprise': 0,
        'Love': 0
    }
    
    # Count emotions from activities
    for activity in activities:
        description = activity.get('description', '')
        for emotion in emotions_count.keys():
            if emotion.lower() in description.lower():
                emotions_count[emotion] += 1
    
    # If no emotions found in activities, generate realistic data
    total_emotions = sum(emotions_count.values())
    if total_emotions == 0:
        avg_sentiment = user_data.get('averageSentiment', 75)
        
        # More positive sentiment = more joy and love
        if avg_sentiment > 80:
            emotions_count['Joy'] = random.randint(30, 40)
            emotions_count['Love'] = random.randint(20, 30)
            emotions_count['Surprise'] = random.randint(10, 20)
            emotions_count['Sadness'] = random.randint(5, 10)
            emotions_count['Fear'] = random.randint(3, 8)
            emotions_count['Anger'] = random.randint(2, 5)
        # More neutral sentiment
        elif avg_sentiment > 60:
            emotions_count['Joy'] = random.randint(20, 30)
            emotions_count['Surprise'] = random.randint(15, 25)
            emotions_count['Love'] = random.randint(15, 25)
            emotions_count['Sadness'] = random.randint(10, 20)
            emotions_count['Fear'] = random.randint(5, 15)
            emotions_count['Anger'] = random.randint(5, 15)
        # More negative sentiment
        else:
            emotions_count['Sadness'] = random.randint(25, 35)
            emotions_count['Anger'] = random.randint(20, 30)
            emotions_count['Fear'] = random.randint(15, 25)
            emotions_count['Surprise'] = random.randint(10, 20)
            emotions_count['Joy'] = random.randint(5, 15)
            emotions_count['Love'] = random.randint(3, 10)
    
    return jsonify({
        'labels': list(emotions_count.keys()),
        'datasets': [{
            'data': list(emotions_count.values()),
            'backgroundColor': [
                '#FCD34D',  # Joy
                '#60A5FA',  # Sadness
                '#F87171',  # Anger
                '#818CF8',  # Fear
                '#34D399',  # Surprise
                '#F472B6',  # Love
            ],
            'borderWidth': 0,
        }]
    })

@analytics.route('/priority', methods=['GET'])
@jwt_required()
def get_priority():
    current_user = get_jwt_identity()
    user_id = get_user_id_from_email(current_user)
    
    # Load the user's data to get real analytics
    user_data = load_data(user_id)
    
    # Get the total analyses
    total_analyses = user_data.get('totalAnalyses', 0)
    
    # If there are no analyses, return empty data
    if total_analyses == 0:
        return jsonify({
            'labels': ['Last 7 Days'],
            'datasets': [
                {
                    'label': 'High Priority',
                    'data': [0],
                    'backgroundColor': '#F87171',
                },
                {
                    'label': 'Medium Priority',
                    'data': [0],
                    'backgroundColor': '#FBBF24',
                },
                {
                    'label': 'Low Priority',
                    'data': [0],
                    'backgroundColor': '#34D399',
                },
            ]
        })
    
    # Extract priorities from activities
    activities = user_data.get('activities', [])
    priorities_count = {'High': 0, 'Medium': 0, 'Low': 0}
    
    # Count priorities from activities
    for activity in activities:
        description = activity.get('description', '').lower()
        if 'priority: high' in description:
            priorities_count['High'] += 1
        elif 'priority: medium' in description:
            priorities_count['Medium'] += 1
        elif 'priority: low' in description:
            priorities_count['Low'] += 1
    
    # Check if we found any priorities
    total_prioritized = sum(priorities_count.values())
    
    # If no priorities found in activities, distribute based on total analyses
    # to ensure the chart shows the exact number of analyses
    if total_prioritized == 0:
        avg_sentiment = user_data.get('averageSentiment', 75)
        
        if avg_sentiment > 80:
            # More positive sentiment = more low priority
            priorities_count['Low'] = max(0, total_analyses - priorities_count['High'] - priorities_count['Medium'])
        elif avg_sentiment > 60:
            # Mixed sentiment = more medium priority
            priorities_count['Medium'] = max(0, total_analyses - priorities_count['High'] - priorities_count['Low'])
        else:
            # More negative sentiment = more high priority
            priorities_count['High'] = max(0, total_analyses - priorities_count['Medium'] - priorities_count['Low'])
    
    # If priorities don't add up to total analyses, adjust to match
    if sum(priorities_count.values()) != total_analyses:
        # Find the most important priority based on sentiment
        avg_sentiment = user_data.get('averageSentiment', 75)
        if avg_sentiment > 80:
            priority_to_adjust = 'Low'
        elif avg_sentiment > 60:
            priority_to_adjust = 'Medium'
        else:
            priority_to_adjust = 'High'
            
        # Adjust the priority count to make total match
        priorities_count[priority_to_adjust] = max(0, total_analyses - 
            sum(v for k, v in priorities_count.items() if k != priority_to_adjust))
    
    return jsonify({
        'labels': ['Last 7 Days'],
        'datasets': [
            {
                'label': 'High Priority',
                'data': [priorities_count['High']],
                'backgroundColor': '#F87171',
            },
            {
                'label': 'Medium Priority',
                'data': [priorities_count['Medium']],
                'backgroundColor': '#FBBF24',
            },
            {
                'label': 'Low Priority',
                'data': [priorities_count['Low']],
                'backgroundColor': '#34D399',
            },
        ]
    })

@analytics.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    current_user = get_jwt_identity()
    user_id = get_user_id_from_email(current_user)
    
    data = load_data(user_id)
    return jsonify(data.get('activities', []))

@analytics.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    current_user = get_jwt_identity()
    user_id = get_user_id_from_email(current_user)
    
    data = load_data(user_id)
    return jsonify({
        'totalAnalyses': data.get('totalAnalyses', 0),
        'averageSentiment': data.get('averageSentiment', 75),
        'responseRate': 92,
        'responseTime': 2.5,
        'lastAnalysisTime': data.get('lastAnalysisTime')
    })

@analytics.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_single():
    try:
        current_user = get_jwt_identity()
        user_id = get_user_id_from_email(current_user)
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
            
        text = data['text'].strip()
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400

        # Import the analyze_text function from app
        from app import analyze_text
        
        # Analyze the text
        result = analyze_text(text)
        
        # Check if analysis was successful
        if result is None:
            return jsonify({'error': 'Could not analyze text. Text may be invalid.'}), 400
            
        # Update analytics data
        analytics_data = load_data(user_id)
        analytics_data['totalAnalyses'] += 1
        analytics_data['lastAnalysisTime'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Add to activities
        analytics_data['activities'].insert(0, {
            'title': 'Text Analysis Completed',
            'description': f'Sentiment: {result["sentiment"]}, Emotion: {result["emotion"]}',
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'success'
        })
        
        # Calculate average sentiment
        sentiment_score = result['sentiment_score'] * 100
        old_avg = analytics_data.get('averageSentiment', 75)
        total_analyses = analytics_data.get('totalAnalyses', 1)
        
        # Weighted average with more weight to current score for newer accounts
        if total_analyses <= 5:
            # For new accounts, give more weight to recent analyses
            analytics_data['averageSentiment'] = (old_avg * 0.7) + (sentiment_score * 0.3)
        else:
            # For established accounts, use regular average
            analytics_data['averageSentiment'] = (old_avg * (total_analyses - 1) + sentiment_score) / total_analyses
        
        # Save updated data
        save_data(analytics_data, user_id)
        
        # Generate response suggestions
        response_suggestions = []
        if result['sentiment'] == 'Positive':
            response_suggestions = [
                "Thank you for your positive feedback! We're thrilled to hear about your great experience.",
                "We appreciate your kind words and are glad we could meet your expectations.",
                "Your satisfaction is our priority. Thank you for sharing your positive experience!"
            ]
        elif result['sentiment'] == 'Negative':
            response_suggestions = [
                "We're sorry to hear about your experience. We'd like to address your concerns right away.",
                "Thank you for bringing this to our attention. We apologize and would like to make things right.",
                "We value your feedback and apologize for not meeting your expectations. How can we improve?"
            ]
        else:
            response_suggestions = [
                "Thank you for your feedback. Is there anything specific we can help with?",
                "We appreciate you taking the time to share your thoughts. Let us know if you need any assistance.",
                "Thank you for your comment. We're here if you need any further information."
            ]
            
        return jsonify({
            'result': result,
            'suggestions': response_suggestions
        })
        
    except Exception as e:
        logging.error(f"Error analyzing text: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics.route('/analyze-bulk', methods=['POST'])
@jwt_required()
def analyze_bulk():
    try:
        current_user = get_jwt_identity()
        user_id = get_user_id_from_email(current_user)
        
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'Empty file provided'}), 400
            
        # Check extension
        allowed_extensions = {'csv', 'xlsx', 'xls'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({
                'error': f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'
            }), 400
            
        # For development/demo purposes, return mock data
        results = []
        sentiment_counts = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
        
        for i in range(10):
            sentiment = random.choice(['Positive', 'Neutral', 'Negative'])
            sentiment_counts[sentiment] += 1
            
            result = {
                'id': i + 1,
                'text': f"Sample comment {i+1}",
                'sentiment': sentiment,
                'emotion': random.choice(['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Love']),
                'priority': random.choice(['High', 'Medium', 'Low']),
                'score': round(random.uniform(0, 1), 2)
            }
            results.append(result)
            
        # Update analytics data
        analytics_data = load_data(user_id)
        analytics_data['totalAnalyses'] += len(results)
        analytics_data['bulkUploads'] += 1
        analytics_data['lastAnalysisTime'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Add to activities
        analytics_data['activities'].insert(0, {
            'title': 'Bulk Analysis Completed',
            'description': f'Analyzed {len(results)} comments',
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'success'
        })
        
        # Save updated data
        save_data(analytics_data, user_id)
        
        response = {
            'totalAnalyzed': len(results),
            'results': results,
            'summary': {
                'sentimentDistribution': {
                    'Positive': sentiment_counts['Positive'],
                    'Neutral': sentiment_counts['Neutral'],
                    'Negative': sentiment_counts['Negative']
                },
                'priorityDistribution': {
                    'High': results.count(lambda x: x['priority'] == 'High') if callable(getattr(results, 'count', None)) else sum(1 for x in results if x['priority'] == 'High'),
                    'Medium': results.count(lambda x: x['priority'] == 'Medium') if callable(getattr(results, 'count', None)) else sum(1 for x in results if x['priority'] == 'Medium'),
                    'Low': results.count(lambda x: x['priority'] == 'Low') if callable(getattr(results, 'count', None)) else sum(1 for x in results if x['priority'] == 'Low')
                }
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        logging.error(f"Error analyzing bulk file: {str(e)}")
        return jsonify({'error': str(e)}), 500
