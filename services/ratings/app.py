from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'ratings'

# Simulate rating analytics data
def get_ratings_data():
    base_ratings = {
        "overall_rating": 4.3,
        "total_ratings": 1247,
        "rating_distribution": {
            "5_star": 652,
            "4_star": 398,
            "3_star": 124,
            "2_star": 45,
            "1_star": 28
        },
        "trending": "up",
        "last_30_days": 89
    }
    
    if VERSION == 'v2':
        # v2 includes enhanced analytics
        base_ratings.update({
            "sentiment_analysis": {
                "positive": 78.5,
                "neutral": 15.2,
                "negative": 6.3
            },
            "top_keywords": ["quality", "fast", "reliable", "value", "recommend"],
            "geographic_breakdown": {
                "north_america": 45.2,
                "europe": 32.1,
                "asia": 18.7,
                "other": 4.0
            },
            "verified_purchase_percentage": 87.3
        })
    
    return base_ratings

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": SERVICE_NAME, "version": VERSION})

@app.route('/ratings')
def get_ratings():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.5))
    
    ratings = get_ratings_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "ratings": ratings,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/ratings/<product_id>')
def get_product_ratings(product_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    ratings = get_ratings_data()
    
    # Simulate product-specific variations
    product_rating = dict(ratings)
    product_rating['overall_rating'] = round(random.uniform(3.5, 5.0), 1)
    product_rating['total_ratings'] = random.randint(50, 500)
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "product_id": product_id,
        "ratings": product_rating,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)