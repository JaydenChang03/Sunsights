from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import sqlite3
import datetime
import re
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth = Blueprint('auth', __name__)

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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reset_token TEXT
            )
        ''')
        conn.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

# Initialize the database when the module is imported
init_db()

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

@auth.route('/register', methods=['POST'])
def register():
    try:
        logger.info("Received registration request")
        data = request.get_json()
        logger.debug(f"Registration data: {data}")
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({"error": "No data provided"}), 400
            
        # Validate required fields
        if not all(k in data for k in ["email", "password"]):
            logger.error("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400
        
        email = data['email']
        password = data['password']
        name = data.get('name', '')
        
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            logger.error("Invalid email format")
            return jsonify({"error": "Invalid email format"}), 400
        
        # Validate password
        is_valid, msg = validate_password(password)
        if not is_valid:
            logger.error(f"Password validation failed: {msg}")
            return jsonify({"error": msg}), 400
        
        # Hash the password
        hashed_password = generate_password_hash(password)
        
        conn = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                (email, hashed_password, name)
            )
            conn.commit()
            logger.info(f"User registered successfully: {email}")
            
            # Create access token
            access_token = create_access_token(identity=email)
            
            return jsonify({
                "message": "User registered successfully",
                "token": access_token,
                "user": {
                    "email": email,
                    "name": name
                }
            }), 201
            
        except sqlite3.IntegrityError:
            logger.error(f"Email already exists: {email}")
            return jsonify({"error": "Email already exists"}), 409
        except Exception as e:
            logger.error(f"Database error during registration: {e}")
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        logger.info("Received login request")
        data = request.get_json()
        logger.debug(f"Login data: {data}")
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({"error": "No data provided"}), 400
            
        if not all(k in data for k in ["email", "password"]):
            logger.error("Missing email or password")
            return jsonify({"error": "Missing email or password"}), 400
            
        email = data['email']
        password = data['password']
        
        conn = get_db()
        try:
            cursor = conn.cursor()
            user = cursor.execute(
                "SELECT * FROM users WHERE email = ?", (email,)
            ).fetchone()
            
            if user is None:
                logger.error(f"User not found: {email}")
                return jsonify({"error": "Invalid email or password"}), 401
                
            if not check_password_hash(user['password'], password):
                logger.error(f"Invalid password for user: {email}")
                return jsonify({"error": "Invalid email or password"}), 401
                
            access_token = create_access_token(identity=email)
            logger.info(f"User logged in successfully: {email}")
            
            return jsonify({
                "token": access_token,
                "user": {
                    "email": user['email'],
                    "name": user['name']
                }
            }), 200
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        current_user = get_jwt_identity()
        conn = get_db()
        try:
            cursor = conn.cursor()
            user = cursor.execute(
                "SELECT email, name FROM users WHERE email = ?",
                (current_user,)
            ).fetchone()
            
            if user is None:
                logger.error(f"User not found: {current_user}")
                return jsonify({"error": "User not found"}), 404
                
            return jsonify({
                "user": dict(user)
            }), 200
            
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            logger.error("Email is required")
            return jsonify({'error': 'Email is required'}), 400
            
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        
        if not user:
            logger.info(f"User not found: {email}")
            return jsonify({'message': 'If an account exists with this email, you will receive a password reset link'}), 200
            
        # Generate reset token
        reset_token = create_access_token(
            identity=email,
            expires_delta=datetime.timedelta(hours=1),
            additional_claims={'reset_password': True}
        )
        
        # Store reset token in database
        conn.execute('UPDATE users SET reset_token = ? WHERE email = ?', (reset_token, email))
        conn.commit()
        logger.info(f"Password reset token generated for user: {email}")
        
        # Send reset email (implement your email sending logic here)
        # For now, we'll just return the token in the response
        return jsonify({
            'message': 'Password reset instructions sent',
            'reset_token': reset_token  # In production, this should be sent via email
        }), 200
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@auth.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        reset_token = data.get('token')
        new_password = data.get('password')
        
        if not reset_token or not new_password:
            logger.error("Token and new password are required")
            return jsonify({'error': 'Token and new password are required'}), 400
            
        # Verify reset token
        token_data = decode_token(reset_token)
        if not token_data:
            logger.error("Invalid or expired token")
            return jsonify({'error': 'Invalid or expired token'}), 400
            
        email = token_data.get('sub')
        
        # Validate new password
        is_valid, error_message = validate_password(new_password)
        if not is_valid:
            logger.error(f"Password validation failed: {error_message}")
            return jsonify({'error': error_message}), 400
            
        # Update password
        conn = get_db()
        hashed_password = generate_password_hash(new_password)
        conn.execute('UPDATE users SET password = ?, reset_token = NULL WHERE email = ?',
                    (hashed_password, email))
        conn.commit()
        logger.info(f"Password updated successfully for user: {email}")
        
        return jsonify({'message': 'Password updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({'error': str(e)}), 500

def verify_reset_token(token):
    try:
        data = decode_token(token)
        if not data.get('reset_password'):
            return None
        return data
    except:
        return None
