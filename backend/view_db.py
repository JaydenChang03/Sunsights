 import sqlite3

def view_users():
    # Connect to the database
    conn = sqlite3.connect('c:/Users/jayde/VSCProject/Sunsights/backend/database.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute('SELECT id, email, name, created_at FROM users')
    users = cursor.fetchall()
    
    # Print users in a formatted way
    print("\nRegistered Users:")
    print("-" * 80)
    print(f"{'ID':<5} {'Email':<30} {'Name':<20} {'Created At':<25}")
    print("-" * 80)
    
    for user in users:
        print(f"{user['id']:<5} {user['email']:<30} {user['name']:<20} {user['created_at']:<25}")
    
    conn.close()

if __name__ == '__main__':
    view_users()