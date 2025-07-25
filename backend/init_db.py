import sqlite3

def initialize_database():
    try:
        # Connect to the database - SQLite will create it if it's not there yet
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Set up the main users table with all the fields we need
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
        
        # These next parts handle adding new columns to existing databases
        # so we don't break anything if someone already has data
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT')
            print("Added bio column to users table")
        except sqlite3.OperationalError:
            pass  # already there, no worries
            
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN avatar TEXT')
            print("Added avatar column to users table")
        except sqlite3.OperationalError:
            pass  # already there too
        
        conn.commit()
        print("Database is ready to go!")
        
    except Exception as e:
        print(f"Hmm, something went wrong setting up the database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    initialize_database() 