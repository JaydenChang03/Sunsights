from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import random
import logging
import os
import json

analytics = Blueprint('analytics', __name__)

# File to store persistent analytics data
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'analytics_data.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

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

def load_data():
    """Load analytics data from file or create with defaults if it doesn't exist"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        else:
            save_data(DEFAULT_DATA)
            return DEFAULT_DATA
    except Exception as e:
        logging.error(f"Error loading analytics data: {str(e)}")
        return DEFAULT_DATA

def save_data(data):
    """Save analytics data to file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logging.error(f"Error saving analytics data: {str(e)}")

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
def get_sentiment():
    time_range = request.args.get('timeRange', '7d')
    days = get_days_from_range(time_range)
    timestamps = generate_timestamps(days)
    
    return jsonify({
        'labels': timestamps,
        'datasets': [
            {
                'label': 'Positive',
                'data': [random.randint(65, 85) for _ in timestamps],
                'borderColor': '#34D399',
                'backgroundColor': 'rgba(52, 211, 153, 0.1)',
                'fill': True,
                'tension': 0.4,
            },
            {
                'label': 'Negative',
                'data': [random.randint(15, 35) for _ in timestamps],
                'borderColor': '#F87171',
                'backgroundColor': 'rgba(248, 113, 113, 0.1)',
                'fill': True,
                'tension': 0.4,
            },
        ]
    })

@analytics.route('/emotions', methods=['GET'])
def get_emotions():
    return jsonify({
        'labels': ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Love'],
        'datasets': [{
            'data': [
                random.randint(25, 35),
                random.randint(10, 20),
                random.randint(5, 15),
                random.randint(5, 10),
                random.randint(10, 15),
                random.randint(20, 30)
            ],
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
def get_priority():
    return jsonify({
        'labels': ['Last 7 Days'],
        'datasets': [
            {
                'label': 'High Priority',
                'data': [random.randint(20, 30)],
                'backgroundColor': '#F87171',
            },
            {
                'label': 'Medium Priority',
                'data': [random.randint(40, 50)],
                'backgroundColor': '#FBBF24',
            },
            {
                'label': 'Low Priority',
                'data': [random.randint(25, 35)],
                'backgroundColor': '#34D399',
            },
        ]
    })

@analytics.route('/activity', methods=['GET'])
def get_activity():
    data = load_data()
    return jsonify(data.get('activities', []))

@analytics.route('/summary', methods=['GET'])
def get_summary():
    data = load_data()
    return jsonify({
        'totalAnalyses': data.get('totalAnalyses', 0),
        'averageSentiment': data.get('averageSentiment', 75),
        'responseRate': 92,
        'responseTime': 2.5,
        'lastAnalysisTime': data.get('lastAnalysisTime')
    })

@analytics.route('/analyze', methods=['POST'])
def analyze_single():
    try:
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
        analytics_data = load_data()
        analytics_data['totalAnalyses'] += 1
        analytics_data['lastAnalysisTime'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Add to activities
        analytics_data['activities'].insert(0, {
            'title': 'Text Analysis Completed',
            'description': f'Sentiment: {result["sentiment"]}, Emotion: {result["emotion"]}',
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'success'
        })
        
        # Keep only the most recent 10 activities
        analytics_data['activities'] = analytics_data['activities'][:10]
        
        # Save updated data
        save_data(analytics_data)
        
        return jsonify({
            'success': True,
            'analysis': {
                'text': text,
                'sentiment': result['sentiment'],
                'sentiment_score': result.get('sentiment_score', 0.5),
                'emotion': result['emotion'],
                'priority': result.get('priority', 'Medium')
            }
        })
    except Exception as e:
        logging.error(f"Error in analyze_single: {str(e)}")
        
        # Add error to activities
        try:
            analytics_data = load_data()
            analytics_data['activities'].insert(0, {
                'title': 'Analysis Error',
                'description': str(e)[:50] + ('...' if len(str(e)) > 50 else ''),
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'type': 'error'
            })
            analytics_data['activities'] = analytics_data['activities'][:10]
            save_data(analytics_data)
        except:
            pass
            
        return jsonify({'error': 'Analysis failed', 'message': str(e)}), 500

@analytics.route('/analyze-bulk', methods=['POST'])
def analyze_bulk():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Check if the file is allowed
        from app import allowed_file
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Please upload CSV or Excel file'}), 400
            
        # Import analyze_text function
        from app import analyze_text
        
        # Process the uploaded file
        import pandas as pd
        import tempfile
        import os
        
        logging.info(f"Received file: {file.filename} for bulk analysis")
        
        # Save the file to a temporary location
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        logging.info(f"Saved file to temporary location: {temp_path}")
        
        # Read the file based on its extension
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(temp_path)
                logging.info(f"Read CSV file with {len(df)} rows")
            else:  # Excel file
                df = pd.read_excel(temp_path)
                logging.info(f"Read Excel file with {len(df)} rows")
        except Exception as e:
            # Clean up the temporary file
            os.remove(temp_path)
            os.rmdir(temp_dir)
            return jsonify({'error': f'Failed to read file: {str(e)}'}), 400
            
        # Clean up the temporary file
        os.remove(temp_path)
        os.rmdir(temp_dir)
        
        # Look for a column that might contain comments
        comment_column = None
        possible_columns = ['comment', 'comments', 'text', 'feedback', 'review', 'message', 'description']
        
        for col in df.columns:
            if any(possible_name in col.lower() for possible_name in possible_columns):
                comment_column = col
                break
                
        if comment_column is None and len(df.columns) > 0:
            # If no matching column name found, use the first column
            comment_column = df.columns[0]
            
        if comment_column is None:
            return jsonify({'error': 'No valid comment column found in the file'}), 400
            
        # Extract comments from the dataframe
        comments = df[comment_column].dropna().astype(str).tolist()
        
        # Get the total number of comments
        total_comments = len(comments)
        logging.info(f"Processing {total_comments} comments from file: {file.filename}")
        
        if total_comments == 0:
            return jsonify({'error': 'No comments found in the file'}), 400
            
        # Analyze each comment
        results = []
        valid_results = []
        invalid_comments = []
        high_priority = 0
        medium_priority = 0
        low_priority = 0
        total_sentiment_score = 0
        total_valid_comments = 0
        
        for comment in comments:
            if comment and len(comment.strip()) > 0:
                try:
                    analysis = analyze_text(comment)
                    
                    if analysis is None:
                        # Comment was deemed invalid for analysis
                        invalid_comments.append(comment[:100] + ('...' if len(comment) > 100 else ''))
                        continue
                        
                    # Add the original text to the analysis result
                    analysis['text'] = comment
                        
                    results.append(analysis)
                    valid_results.append(analysis)
                    total_valid_comments += 1
                    
                    # Update priority counts
                    if analysis['priority'] == 'High':
                        high_priority += 1
                    elif analysis['priority'] == 'Medium':
                        medium_priority += 1
                    else:
                        low_priority += 1
                        
                    # Update sentiment score
                    sentiment_score = analysis.get('sentiment_score', 0.5)
                    total_sentiment_score += sentiment_score
                except Exception as e:
                    logging.error(f"Error analyzing comment: {str(e)}")
                    invalid_comments.append(comment[:100] + ('...' if len(comment) > 100 else ''))
        
        # Check if we have any valid comments
        if total_valid_comments == 0:
            return jsonify({
                'error': 'No valid comments for sentiment analysis found in the file',
                'details': 'The file appears to contain irrelevant content that cannot be analyzed for sentiment.',
                'invalid_examples': invalid_comments[:5]  # Show a few examples of invalid content
            }), 400
        
        # Calculate average sentiment
        average_sentiment = round((total_sentiment_score / total_valid_comments) * 100) if total_valid_comments > 0 else 0
        
        # Ensure diverse sample results by selecting from different emotions and priorities
        diverse_samples = []
        emotion_priorities = {}
        
        # Group results by emotion and priority
        for result in valid_results:
            # Create a standardized result object structure
            standard_result = {
                'text': result.get('text', ''),
                'sentiment': result.get('sentiment', 'NEUTRAL'),
                'emotion': result.get('emotion', 'neutral'),
                'priority': result.get('priority', 'Medium')
            }
            
            key = f"{standard_result['emotion']}_{standard_result['priority']}"
            if key not in emotion_priorities:
                emotion_priorities[key] = []
            emotion_priorities[key].append(standard_result)
        
        # Select one from each group if available
        for key, items in emotion_priorities.items():
            if items:  
                diverse_samples.append(items[0])
        
        # If we have very few groups, add more samples from each group
        if len(diverse_samples) < len(valid_results):
            # Add remaining items from each group
            for key, items in emotion_priorities.items():
                if len(items) > 1:  
                    diverse_samples.extend(items[1:])
            
            # Format remaining results with standard structure
            for r in valid_results:
                if not any(d.get('text') == r.get('text') for d in diverse_samples):
                    diverse_samples.append({
                        'text': r.get('text', ''),
                        'sentiment': r.get('sentiment', 'NEUTRAL'),
                        'emotion': r.get('emotion', 'neutral'),
                        'priority': r.get('priority', 'Medium')
                    })
        
        # If we still don't have samples, create dummy ones
        if not diverse_samples:
            diverse_samples = [
                {
                    'text': 'Great product, I love it!',
                    'sentiment': 'POSITIVE',
                    'emotion': 'joy',
                    'priority': 'Low'
                },
                {
                    'text': 'I would like a refund immediately.',
                    'sentiment': 'NEGATIVE',
                    'emotion': 'anger',
                    'priority': 'High'
                },
                {
                    'text': 'The product is okay but could be better.',
                    'sentiment': 'NEGATIVE',
                    'emotion': 'disappointment',
                    'priority': 'Medium'
                }
            ]
        
        # Update analytics data
        analytics_data = load_data()
        analytics_data['totalAnalyses'] += total_valid_comments
        analytics_data['bulkUploads'] += 1
        analytics_data['lastAnalysisTime'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Add to activities
        analytics_data['activities'].insert(0, {
            'title': 'Bulk Analysis Completed',
            'description': f'Processed {total_valid_comments} valid comments from {file.filename}',
            'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'type': 'success'
        })
        
        # Keep only the most recent 10 activities
        analytics_data['activities'] = analytics_data['activities'][:10]
        
        # Save updated data
        save_data(analytics_data)
        
        # Return results
        return jsonify({
            'total_comments': total_comments,
            'valid_comments': total_valid_comments,
            'invalid_comments': len(invalid_comments),
            'average_sentiment': f'{average_sentiment}%',
            'priority_distribution': {
                'high': high_priority,
                'medium': medium_priority,
                'low': low_priority
            },
            'invalid_examples': invalid_comments[:5] if invalid_comments else [],
            'sample_results': diverse_samples if diverse_samples else []
        })
    except Exception as e:
        logging.error(f"Error in analyze_bulk: {str(e)}")
        
        # Add error to activities
        try:
            analytics_data = load_data()
            analytics_data['activities'].insert(0, {
                'title': 'Bulk Analysis Error',
                'description': str(e)[:50] + ('...' if len(str(e)) > 50 else ''),
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'type': 'error'
            })
            analytics_data['activities'] = analytics_data['activities'][:10]
            save_data(analytics_data)
        except:
            pass
            
        return jsonify({'error': 'Bulk analysis failed', 'message': str(e)}), 500
