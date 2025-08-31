from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'users'

def get_user_data():
    user = {
        "id": "usr-001",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "role": "Premium Customer",
        "joinedAt": "2023-06-15",
        "active": True,
        "orders_count": 23,
        "total_spent": 2847.50
    }
    
    if VERSION == 'v2':
        # v2 includes enhanced user profile
        user.update({
            "last_login": time.time(),
            "preferences": {
                "notifications": True,
                "newsletter": random.choice([True, False]),
                "theme": random.choice(["light", "dark"])
            },
            "membership_tier": random.choice(['bronze', 'silver', 'gold', 'platinum']),
            "loyalty_points": random.randint(1000, 5000),
            "shipping_address": {
                "street": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zip": "94105"
            },
            "payment_methods": ["**** 1234", "**** 5678"]
        })
    
    return user

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy", 
        "service": SERVICE_NAME, 
        "version": VERSION,
        "timestamp": time.time()
    })

@app.route('/users/current')
def get_current_user():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    user = get_user_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "user": user,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/users/<user_id>')
def get_user(user_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    if user_id != "usr-001":
        return jsonify({"error": "User not found"}), 404
    
    user = get_user_data()
    
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