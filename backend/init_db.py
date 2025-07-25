import sqlite3

def initialize_database():
    try:
        # just connect to the db file - SQLite makes one if it does not exist
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # create the users table with everything we need
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                bio TEXT,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reset_token TEXT
            )
        ''')
        
        # try to add these columns in case we are updating an old database
        # dont want to break existing user data
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT')
        except sqlite3.OperationalError:
            pass  # already exists, all good
            
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN avatar TEXT')
        except sqlite3.OperationalError:
            pass  # this one too
        
        conn.commit()
        
    except Exception as e:
        pass
    finally:
        conn.close()

if __name__ == "__main__":
    initialize_database() 