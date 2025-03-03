# This file makes the backend directory a Python package
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, 
        origins=["http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:3000", "http://127.0.0.1:5500"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    return app
