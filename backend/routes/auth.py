from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import jwt
import sqlite3
import datetime
import re
import logging
import os

# configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)



auth = Blueprint('auth', __name__)

def get_db():
    try:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database.db')

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

def validate_email(email):
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        from flask import current_app
        decoded = jwt.decode(
            token, 
            current_app.config['JWT_SECRET_KEY'], 
            algorithms=['HS256']
        )
        return decoded
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Token decode error: {e}")
        return None

# test database connection and table structure
def test_database():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # check if users table exists and get its structure
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        table_exists = cursor.fetchone()
        
        if table_exists:
            cursor.execute("PRAGMA table_info(users)")
            columns = cursor.fetchall()
                
            # count existing users
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
        else:
            logger.error("Users table does not exist!")
            
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        return False

# initialize database test
if test_database():
    pass

@auth.route('/test', methods=['GET'])
def test_route():
    """Test route to verify auth blueprint is working"""
    try:
    
        return jsonify({
            "message": "Auth routes are working!",
            "timestamp": datetime.datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Test route error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/register', methods=['POST'])
def register():
    try:

        data = request.get_json()

        
        if not data:
            logger.error("No JSON data received")
            return jsonify({"error": "No data provided"}), 400
            
        if not all(k in data for k in ["email", "password", "name"]):
            logger.error("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400
            
        email = data['email'].strip().lower()
        password = data['password']
        name = data['name'].strip()
        
        # validate email format
        if not validate_email(email):
            logger.error(f"Invalid email format: {email}")
            return jsonify({"error": "Invalid email format"}), 400
            
        # validate password
        is_valid, message = validate_password(password)
        if not is_valid:
            logger.error(f"Password validation failed: {message}")
            return jsonify({"error": message}), 400
            
        # check if user already exists
        conn = get_db()
        try:
            cursor = conn.cursor()
            existing_user = cursor.execute(
                "SELECT email FROM users WHERE email = ?", (email,)
            ).fetchone()
            
            if existing_user:
                logger.error(f"User already exists: {email}")
                return jsonify({"error": "User already exists"}), 409
                
            # create new user
            hashed_password = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                (email, hashed_password, name)
            )
            conn.commit()
            
            # create access token
            access_token = create_access_token(identity=email)
    
            
            return jsonify({
                "message": "User registered successfully",
                "token": access_token,
                "user": {
                    "email": email,
                    "name": name
                }
            }), 201
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:

        data = request.get_json()

        
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
        current_user_email = get_jwt_identity()

        
        conn = get_db()
        try:
            cursor = conn.cursor()
            user = cursor.execute(
                "SELECT email, name FROM users WHERE email = ?", (current_user_email,)
            ).fetchone()
            
            if user is None:
                logger.error(f"User not found: {current_user_email}")
                return jsonify({"error": "User not found"}), 404
                
            return jsonify({
                "user": {
                    "email": user['email'],
                    "name": user['name']
                }
            }), 200
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_email = get_jwt_identity()

        
        conn = get_db()
        try:
            cursor = conn.cursor()
            user = cursor.execute(
                "SELECT id, email, name, bio, avatar FROM users WHERE email = ?", (current_user_email,)
            ).fetchone()
            
            if user is None:
                logger.error(f"User not found: {current_user_email}")
                return jsonify({"error": "User not found"}), 404
            
            # return profile data
            profile_data = {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "bio": user['bio'] if user['bio'] else "",
                "avatar": user['avatar'] if user['avatar'] else None
            }
            
    
            return jsonify(profile_data), 200
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_email = get_jwt_identity()
        data = request.get_json()


        
        if not data:
            logger.error("No data provided for profile update")
            return jsonify({"error": "No data provided"}), 400
        
        conn = get_db()
        try:
            cursor = conn.cursor()
            
            # get current user
            user = cursor.execute(
                "SELECT id FROM users WHERE email = ?", (current_user_email,)
            ).fetchone()
            
            if user is None:
                logger.error(f"User not found: {current_user_email}")
                return jsonify({"error": "User not found"}), 404
            
            # update user profile
            update_fields = []
            update_values = []
            
            if 'name' in data:
                update_fields.append("name = ?")
                update_values.append(data['name'])
            
            if 'email' in data:
                update_fields.append("email = ?")
                update_values.append(data['email'])
            
            if 'bio' in data:
                update_fields.append("bio = ?")
                update_values.append(data['bio'])
            
            if update_fields:
                update_values.append(current_user_email)  # for where clause
                query = f"UPDATE users SET {', '.join(update_fields)} WHERE email = ?"
                cursor.execute(query, update_values)
                conn.commit()
        
            
            # get updated user data
            updated_user = cursor.execute(
                "SELECT id, email, name, bio, avatar FROM users WHERE email = ?", 
                (data.get('email', current_user_email),)  # Use new email if updated
            ).fetchone()
            
            if updated_user:
                response_data = {
                    "message": "Profile updated successfully",
                    "user": {
                        "id": updated_user['id'],
                        "email": updated_user['email'],
                        "name": updated_user['name'],
                        "bio": updated_user['bio'] if updated_user['bio'] else "",
                        "avatar": updated_user['avatar'] if updated_user['avatar'] else None
                    }
                }
                return jsonify(response_data), 200
            else:
                return jsonify({"error": "Failed to retrieve updated profile"}), 500
            
        finally:
            conn.close()
            
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({"error": str(e)}), 500

@auth.route('/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    try:
        current_user_email = get_jwt_identity()

        
        if 'avatar' not in request.files:
            logger.error("No avatar file in request")
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['avatar']
        if file.filename == '':
            logger.error("No file selected")
            return jsonify({"error": "No file selected"}), 400
        
        if file:
            import uuid
            import os
            from werkzeug.utils import secure_filename
            
            # generate unique filename
            file_extension = os.path.splitext(secure_filename(file.filename))[1]
            unique_filename = f"avatar_{uuid.uuid4().hex}{file_extension}"
            
            # save file
            upload_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            # update user avatar in database
            avatar_url = f"/uploads/{unique_filename}"
            
            conn = get_db()
            try:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET avatar = ? WHERE email = ?",
                    (avatar_url, current_user_email)
                )
                conn.commit()

                
                return jsonify({
                    "message": "Avatar uploaded successfully",
                    "avatar": avatar_url
                }), 200
                
            finally:
                conn.close()
                
    except Exception as e:
        logger.error(f"Avatar upload error: {e}")
        return jsonify({"error": str(e)}), 500
