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
    'emotionCounts': {
        'Joy': 0,
        'Sadness': 0,
        'Anger': 0,
        'Fear': 0,
        'Surprise': 0,
        'Love': 0,
        'neutral': 0
    },
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
    
    # Use the accumulated emotion counts instead of parsing activities
    emotions_count = user_data.get('emotionCounts', {
        'Joy': 0,
        'Sadness': 0,
        'Anger': 0,
        'Fear': 0,
        'Surprise': 0,
        'Love': 0,
        'neutral': 0
    })
    
    # Filter out 'neutral' if we want to focus on the main emotions
    if 'neutral' in emotions_count and sum(v for k, v in emotions_count.items() if k != 'neutral') > 0:
        emotions_count = {k: v for k, v in emotions_count.items() if k != 'neutral'}
    
    # Calculate total emotions counted
    total_emotions = sum(emotions_count.values())
    total_analyses = user_data.get('totalAnalyses', 0)
    
    # If we have analyses but very few emotions recorded, distribute the missing emotions
    if total_analyses > 0 and total_emotions < total_analyses * 0.5:
        # Calculate how many emotions we're missing
        missing_emotions = total_analyses - total_emotions
        
        # Get the average sentiment to determine how to distribute missing emotions
        avg_sentiment = user_data.get('averageSentiment', 75)
        
        # Distribute missing emotions based on sentiment
        if avg_sentiment > 80:  # Mostly positive
            emotions_count['Joy'] += int(missing_emotions * 0.4)
            emotions_count['Love'] += int(missing_emotions * 0.3)
            emotions_count['Surprise'] += int(missing_emotions * 0.15)
            emotions_count['Sadness'] += int(missing_emotions * 0.05)
            emotions_count['Fear'] += int(missing_emotions * 0.05)
            emotions_count['Anger'] += int(missing_emotions * 0.05)
        elif avg_sentiment > 60:  # Somewhat positive
            emotions_count['Joy'] += int(missing_emotions * 0.3)
            emotions_count['Surprise'] += int(missing_emotions * 0.2)
            emotions_count['Love'] += int(missing_emotions * 0.2)
            emotions_count['Sadness'] += int(missing_emotions * 0.15)
            emotions_count['Fear'] += int(missing_emotions * 0.1)
            emotions_count['Anger'] += int(missing_emotions * 0.05)
        else:  # More negative
            emotions_count['Sadness'] += int(missing_emotions * 0.3)
            emotions_count['Anger'] += int(missing_emotions * 0.25)
            emotions_count['Fear'] += int(missing_emotions * 0.2)
            emotions_count['Surprise'] += int(missing_emotions * 0.15)
            emotions_count['Joy'] += int(missing_emotions * 0.07)
            emotions_count['Love'] += int(missing_emotions * 0.03)
            
        # Save the updated emotion counts
        user_data['emotionCounts'] = emotions_count
        save_data(user_data, user_id)
    
    # If no emotions found, use fixed values based on sentiment
    elif total_emotions == 0:
        avg_sentiment = user_data.get('averageSentiment', 75)
        
        # Instead of using random values, use fixed values based on sentiment
        # This ensures consistent results between refreshes
        if avg_sentiment > 80:
            emotions_count['Joy'] = 35
            emotions_count['Love'] = 25
            emotions_count['Surprise'] = 15
            emotions_count['Sadness'] = 8
            emotions_count['Fear'] = 5
            emotions_count['Anger'] = 3
        # More neutral sentiment
        elif avg_sentiment > 60:
            emotions_count['Joy'] = 25
            emotions_count['Surprise'] = 20
            emotions_count['Love'] = 20
            emotions_count['Sadness'] = 15
            emotions_count['Fear'] = 10
            emotions_count['Anger'] = 10
        # More negative sentiment
        else:
            emotions_count['Sadness'] = 30
            emotions_count['Anger'] = 25
            emotions_count['Fear'] = 20
            emotions_count['Surprise'] = 15
            emotions_count['Joy'] = 10
            emotions_count['Love'] = 5
    
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
        
        # Track emotion counts
        emotion = result['emotion']
        if emotion:
            # Normalize emotion name to match our categories
            emotion_key = emotion.capitalize()
            if emotion_key not in analytics_data.get('emotionCounts', {}):
                # If it's not one of our standard emotions, default to neutral
                emotion_key = 'neutral'
            
            # Initialize emotionCounts if it doesn't exist
            if 'emotionCounts' not in analytics_data:
                analytics_data['emotionCounts'] = {
                    'Joy': 0,
                    'Sadness': 0,
                    'Anger': 0,
                    'Fear': 0,
                    'Surprise': 0,
                    'Love': 0,
                    'neutral': 0
                }
            
            # Increment the emotion count
            analytics_data['emotionCounts'][emotion_key] = analytics_data['emotionCounts'].get(emotion_key, 0) + 1
        
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
            
        # Process the file based on its extension
        try:
            import pandas as pd
            import io
            
            # Save the file to a temporary location
            file_stream = io.BytesIO(file.read())
            
            # Read the file with pandas based on its extension
            if file_ext == 'csv':
                df = pd.read_csv(file_stream)
            else:  # xlsx or xls
                df = pd.read_excel(file_stream)
                
            # Check if the dataframe has any data
            if df.empty:
                return jsonify({'error': 'The uploaded file is empty'}), 400
                
            # Get the comment column (try common column names)
            comment_col = None
            possible_cols = ['comment', 'comments', 'text', 'feedback', 'review', 'message', 'content']
            
            for col in possible_cols:
                if col in df.columns:
                    comment_col = col
                    break
                    
            # If no matching column found, use the first text column
            if comment_col is None:
                for col in df.columns:
                    if df[col].dtype == 'object':  # String/object type
                        comment_col = col
                        break
                        
            # If still no column found, return error
            if comment_col is None:
                return jsonify({'error': 'Could not identify a text column in your file'}), 400
                
            # Process each comment
            results = []
            sentiment_counts = {'Positive': 0, 'Negative': 0, 'Neutral': 0}
            priority_counts = {'High': 0, 'Medium': 0, 'Low': 0}
            total_sentiment = 0
            valid_count = 0
            
            # Get analytics data once to update bulk uploads count
            analytics_data = load_data(user_id)
            analytics_data['bulkUploads'] = analytics_data.get('bulkUploads', 0) + 1
            save_data(analytics_data, user_id)
            
            # Process each comment
            for comment in df[comment_col].dropna():
                if isinstance(comment, str) and comment.strip():
                    try:
                        result = analyze_text(comment.strip())
                        
                        # Add to results
                        results.append({
                            'text': comment[:100] + '...' if len(comment) > 100 else comment,
                            'sentiment': result['sentiment'],
                            'sentiment_score': result['sentiment_score'],
                            'emotion': result['emotion'],
                            'priority': result['priority']
                        })
                        
                        # Update counts
                        sentiment_counts[result['sentiment']] = sentiment_counts.get(result['sentiment'], 0) + 1
                        priority_counts[result['priority']] = priority_counts.get(result['priority'], 0) + 1
                        
                        # Update total sentiment
                        total_sentiment += result['sentiment_score'] * 100
                        valid_count += 1
                    except Exception as e:
                        logging.error(f"Error analyzing comment: {str(e)}")
            
            # Calculate average sentiment
            average_sentiment = total_sentiment / valid_count if valid_count > 0 else 50
            
            # Record individual analyses for each comment to ensure they appear in analytics
            for result in results:
                # Add each comment as an individual analysis in the user's data
                # This ensures bulk analyses are included in sentiment trends and emotion distribution
                analytics_data = load_data(user_id)
                
                # Update total analyses count
                analytics_data['totalAnalyses'] += 1
                
                # Add activity for this analysis
                analytics_data['activities'].insert(0, {
                    'title': f"Analyzed comment from bulk upload",
                    'description': f"Sentiment: {result['sentiment']}, Priority: {result['priority']}",
                    'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'type': 'analysis'
                })
                
                # Track emotion counts
                emotion = result.get('emotion', '')
                if emotion:
                    # Normalize emotion name to match our categories
                    emotion_key = emotion.capitalize()
                    if emotion_key not in analytics_data.get('emotionCounts', {}):
                        # If it's not one of our standard emotions, default to neutral
                        emotion_key = 'neutral'
                    
                    # Initialize emotionCounts if it doesn't exist
                    if 'emotionCounts' not in analytics_data:
                        analytics_data['emotionCounts'] = {
                            'Joy': 0,
                            'Sadness': 0,
                            'Anger': 0,
                            'Fear': 0,
                            'Surprise': 0,
                            'Love': 0,
                            'neutral': 0
                        }
                    
                    # Increment the emotion count
                    analytics_data['emotionCounts'][emotion_key] = analytics_data['emotionCounts'].get(emotion_key, 0) + 1
                
                # Keep activities list manageable
                if len(analytics_data['activities']) > 100:
                    analytics_data['activities'] = analytics_data['activities'][:100]
                
                # Save the updated data
                save_data(analytics_data, user_id)
            
            # Return all results to the frontend, don't limit to 100
            response = {
                'totalAnalyzed': len(results),
                'results': results,
                'summary': {
                    'sentimentDistribution': sentiment_counts,
                    'priorityDistribution': priority_counts,
                    'averageSentiment': average_sentiment
                }
            }
            
            return jsonify(response)
            
        except Exception as e:
            logging.error(f"Error processing file: {str(e)}")
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
            
    except Exception as e:
        logging.error(f"Error analyzing bulk file: {str(e)}")
        return jsonify({'error': f'Error analyzing bulk file: {str(e)}'}), 500
