from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'users'

# Simulate some data variations between versions
def get_users_data():
    base_users = [
        {"id": "usr-001", "email": "john.doe@example.com", "name": "John Doe", "role": "customer", "active": True},
        {"id": "usr-002", "email": "jane.smith@example.com", "name": "Jane Smith", "role": "premium", "active": True},
        {"id": "usr-003", "email": "bob.wilson@example.com", "name": "Bob Wilson", "role": "customer", "active": False},
        {"id": "usr-004", "email": "admin@example.com", "name": "Admin User", "role": "admin", "active": True}
    ]
    
    if VERSION == 'v2':
        # v2 has additional profile fields and enhanced data
        for user in base_users:
            user['last_login'] = '2025-01-08T09:15:00Z'
            user['preferences'] = {
                "notifications": True,
                "newsletter": random.choice([True, False]),
                "theme": random.choice(["light", "dark"])
            }
            user['membership_tier'] = random.choice(['bronze', 'silver', 'gold'])
    
    return base_users

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": SERVICE_NAME, "version": VERSION})

@app.route('/users')
def get_users():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.6))
    
    users = get_users_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "users": users,
        "total_users": len(users),
        "active_users": len([u for u in users if u['active']]),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/users/<user_id>')
def get_user(user_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    users = get_users_data()
    user = next((u for u in users if u['id'] == user_id), None)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "user": user,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5003))
    app.run(host='0.0.0.0', port=port, debug=True)