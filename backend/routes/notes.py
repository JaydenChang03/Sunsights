from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import sqlite3
import os
import json
from datetime import datetime

# configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

notes = Blueprint('notes', __name__)

def get_db():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')

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
        
        # create notes table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.commit()
    
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

@notes.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    try:
        current_user = get_jwt_identity()
    
        conn = get_db()
        cursor = conn.cursor()
        
        # get user ID from email
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            logger.error(f"User not found: {current_user}")
            return jsonify({"error": "User not found"}), 404
            
        # get notes data
        notes = cursor.execute(
            "SELECT id, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
            (user['id'],)
        ).fetchall()
        
        # convert to list of dicts
        notes_list = []
        for note in notes:
            notes_list.append({
                'id': note['id'],
                'content': note['content'],
                'createdAt': note['created_at'],
                'updatedAt': note['updated_at']
            })
        
        return jsonify(notes_list)
        
    except Exception as e:
        logger.error(f"Error getting notes: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@notes.route('/api/notes', methods=['POST'])
@jwt_required()
def create_note():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({"error": "No content provided"}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        
        # get user ID from email
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # create note
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO notes (user_id, content, created_at) VALUES (?, ?, ?)",
            (user['id'], data['content'], now)
        )
        conn.commit()
        
        # get the ID of the new note
        note_id = cursor.lastrowid
        
        # update user's stats to increment the notes count
        cursor.execute(
            "SELECT stats FROM profiles WHERE user_id = ?",
            (user['id'],)
        )
        stats_row = cursor.fetchone()
        
        if stats_row and stats_row['stats']:
            try:
                stats = json.loads(stats_row['stats'])
                if isinstance(stats, dict):
                    # Increment followers which we're using for notes count
                    stats['followers'] = stats.get('followers', 0) + 1
                    
                    cursor.execute(
                        "UPDATE profiles SET stats = ? WHERE user_id = ?",
                        (json.dumps(stats), user['id'])
                    )
                    conn.commit()
            except json.JSONDecodeError:
                logger.error(f"Error decoding stats JSON for user {user['id']}")
        
        # add to recent activity
        cursor.execute(
            "SELECT recent_activity FROM profiles WHERE user_id = ?",
            (user['id'],)
        )
        activity_row = cursor.fetchone()
        
        if activity_row and activity_row['recent_activity']:
            try:
                activities = json.loads(activity_row['recent_activity'])
                if isinstance(activities, list):
                    # add new activity
                    new_activity = {
                        'description': f"Added a new note",
                        'time': now
                    }
                    activities.insert(0, new_activity)
                    
                    # keep only the most recent 10 activities
                    if len(activities) > 10:
                        activities = activities[:10]
                    
                    cursor.execute(
                        "UPDATE profiles SET recent_activity = ? WHERE user_id = ?",
                        (json.dumps(activities), user['id'])
                    )
                    conn.commit()
            except json.JSONDecodeError:
                logger.error(f"Error decoding recent_activity JSON for user {user['id']}")
        
        return jsonify({
            "id": note_id,
            "content": data['content'],
            "createdAt": now,
            "updatedAt": None
        })
        
    except Exception as e:
        logger.error(f"Error creating note: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@notes.route('/api/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({"error": "No content provided"}), 400
            
        conn = get_db()
        cursor = conn.cursor()
        
        # get user ID from email
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # check if note exists and belongs to user
        note = cursor.execute(
            "SELECT id FROM notes WHERE id = ? AND user_id = ?",
            (note_id, user['id'])
        ).fetchone()
        
        if not note:
            return jsonify({"error": "Note not found or access denied"}), 404
            
        # update note
        now = datetime.now().isoformat()
        cursor.execute(
            "UPDATE notes SET content = ?, updated_at = ? WHERE id = ?",
            (data['content'], now, note_id)
        )
        conn.commit()
        
        return jsonify({
            "id": note_id,
            "content": data['content'],
            "updatedAt": now
        })
        
    except Exception as e:
        logger.error(f"Error updating note: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@notes.route('/api/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    try:
        current_user = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        
        # get user ID from email
        user = cursor.execute(
            "SELECT id FROM users WHERE email = ?",
            (current_user,)
        ).fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # check if note exists and belongs to user
        note = cursor.execute(
            "SELECT id FROM notes WHERE id = ? AND user_id = ?",
            (note_id, user['id'])
        ).fetchone()
        
        if not note:
            return jsonify({"error": "Note not found or access denied"}), 404
            
        # delete note
        cursor.execute(
            "DELETE FROM notes WHERE id = ?",
            (note_id,)
        )
        conn.commit()
        
        # update user's stats to decrement the notes count
        cursor.execute(
            "SELECT stats FROM profiles WHERE user_id = ?",
            (user['id'],)
        )
        stats_row = cursor.fetchone()
        
        if stats_row and stats_row['stats']:
            try:
                stats = json.loads(stats_row['stats'])
                if isinstance(stats, dict) and stats.get('followers', 0) > 0:
                    # Decrement followers which we're using for notes count
                    stats['followers'] = stats.get('followers', 0) - 1
                    
                    cursor.execute(
                        "UPDATE profiles SET stats = ? WHERE user_id = ?",
                        (json.dumps(stats), user['id'])
                    )
                    conn.commit()
            except json.JSONDecodeError:
                logger.error(f"Error decoding stats JSON for user {user['id']}")
        
        return jsonify({"message": "Note deleted successfully"})
        
    except Exception as e:
        logger.error(f"Error deleting note: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# initialize the database when the module is imported
init_db()
