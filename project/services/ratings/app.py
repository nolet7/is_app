from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'ratings'

def get_product_rating(product_id):
    # Simulate different ratings for different products
    base_ratings = {
        "LAP-001": {"avg": 4.7, "total": 156},
        "PHN-002": {"avg": 4.3, "total": 243},
        "HDH-003": {"avg": 4.8, "total": 189},
        "CHR-004": {"avg": 4.1, "total": 67},
        "TAB-005": {"avg": 4.5, "total": 134},
        "SPK-006": {"avg": 4.4, "total": 98}
    }
    
    base = base_ratings.get(product_id, {"avg": 4.0, "total": 50})
    
    # Add some randomness
    avg_rating = base["avg"] + random.uniform(-0.2, 0.2)
    total_reviews = base["total"] + random.randint(-10, 20)
    
    # Generate distribution
    distribution = {}
    remaining = total_reviews
    for star in [5, 4, 3, 2, 1]:
        if star == 1:
            distribution[star] = remaining
        else:
            count = random.randint(0, remaining // 2)
            distribution[star] = count
            remaining -= count
    
    rating_data = {
        "productId": product_id,
        "averageRating": round(avg_rating, 1),
        "totalReviews": total_reviews,
        "distribution": distribution
    }
    
    if VERSION == 'v2':
        # v2 includes enhanced analytics
        rating_data.update({
            "sentiment_analysis": {
                "positive": 75.0 + random.uniform(-10, 15),
                "neutral": 18.0 + random.uniform(-5, 10),
                "negative": 7.0 + random.uniform(-3, 8)
            },
            "trending": random.choice(["up", "down", "stable"]),
            "verified_purchase_percentage": 80.0 + random.uniform(-10, 15),
            "top_keywords": ["quality", "fast", "reliable", "value", "recommend"],
            "monthly_trend": [4.1, 4.2, 4.3, 4.4, avg_rating]
        })
    
    return rating_data

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy", 
        "service": SERVICE_NAME, 
        "version": VERSION,
        "timestamp": time.time()
    })

@app.route('/ratings/<product_id>')
def get_product_ratings(product_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    rating_data = get_product_rating(product_id)
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "rating": rating_data,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/ratings')
def get_all_ratings():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.5))
    
    product_ids = ["LAP-001", "PHN-002", "HDH-003", "CHR-004", "TAB-005", "SPK-006"]
    all_ratings = {}
    
    for product_id in product_ids:
        all_ratings[product_id] = get_product_rating(product_id)
    
    # Calculate overall statistics
    total_reviews = sum(rating["totalReviews"] for rating in all_ratings.values())
    avg_rating = sum(rating["averageRating"] * rating["totalReviews"] for rating in all_ratings.values()) / total_reviews if total_reviews > 0 else 0
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "ratings": all_ratings,
        "overall_stats": {
            "average_rating": round(avg_rating, 2),
            "total_reviews": total_reviews,
            "total_products": len(all_ratings)
        },
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    app.run(host='0.0.0.0', port=port, debug=True)