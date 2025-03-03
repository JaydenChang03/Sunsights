from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import sqlite3
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

profile = Blueprint('profile', __name__)

def get_db():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')
        logger.debug(f"Attempting to connect to database at: {db_path}")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

def init_db():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Create profiles table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS profiles (
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
            )
        ''')
        conn.commit()
        logger.info("Profiles table initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

@profile.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user = get_jwt_identity()
        logger.info(f"Getting profile for user: {current_user}")
        conn = get_db()
        cursor = conn.cursor()
        
        # Get user ID from email
        user = cursor.execute(
            "SELECT id, name FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            logger.error(f"User not found: {current_user}")
            return jsonify({"error": "User not found"}), 404
            
        # Get profile data
        profile = cursor.execute(
            "SELECT * FROM profiles WHERE user_id = ?",
            (user['id'],)
        ).fetchone()
        
        if not profile:
            logger.info(f"Creating default profile for user: {current_user}")
            # Create default profile if none exists
            default_profile = {
                'name': user['name'] or 'New User',
                'title': 'Photography Enthusiast',
                'location': 'Not specified',
                'bio': 'Tell us about yourself...',
                'avatar_url': 'https://via.placeholder.com/150',
                'cover_url': None,
                'stats': {
                    'photos': 0,
                    'followers': 0,
                    'following': 0
                },
                'recentActivity': [
                    {
                        'description': 'Joined Sunsights',
                        'time': 'Just now'
                    }
                ]
            }
            
            cursor.execute(
                """INSERT INTO profiles 
                   (user_id, name, title, location, bio, avatar_url, cover_url, stats, recent_activity) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (user['id'], default_profile['name'], default_profile['title'],
                 default_profile['location'], default_profile['bio'],
                 default_profile['avatar_url'], default_profile['cover_url'],
                 str(default_profile['stats']), str(default_profile['recentActivity']))
            )
            conn.commit()
            return jsonify(default_profile)
            
        # Return existing profile
        return jsonify({
            'name': profile['name'],
            'title': profile['title'],
            'location': profile['location'],
            'bio': profile['bio'],
            'avatar_url': profile['avatar_url'],
            'cover_url': profile['cover_url'],
            'stats': profile['stats'],
            'recentActivity': profile['recent_activity']
        })
        
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@profile.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        
        # Get user ID from email
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Update profile
        cursor.execute(
            """UPDATE profiles 
               SET name = ?, title = ?, location = ?, bio = ?, 
                   avatar_url = ?, cover_url = ?, stats = ?, recent_activity = ?
               WHERE user_id = ?""",
            (data.get('name'), data.get('title'), data.get('location'),
             data.get('bio'), data.get('avatar_url'), data.get('cover_url'),
             str(data.get('stats')), str(data.get('recentActivity')), user['id'])
        )
        conn.commit()
        
        return jsonify({"message": "Profile updated successfully"})
        
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# Initialize the database when the module is imported
init_db()
