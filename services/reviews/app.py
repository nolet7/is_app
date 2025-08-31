from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'reviews'

# Simulate different review data for each version
def get_reviews_data():
    base_reviews = [
        {
            "id": "rev-001",
            "product_id": "LAP-001",
            "user": "john.doe@example.com",
            "rating": 5,
            "title": "Excellent gaming laptop!",
            "content": "Perfect for gaming and development work. Fast delivery too!",
            "date": "2025-01-05"
        },
        {
            "id": "rev-002", 
            "product_id": "PHN-002",
            "user": "jane.smith@example.com",
            "rating": 4,
            "title": "Great phone, good value",
            "content": "Camera quality is amazing, battery life could be better.",
            "date": "2025-01-03"
        },
        {
            "id": "rev-003",
            "product_id": "HDH-003", 
            "user": "bob.wilson@example.com",
            "rating": 5,
            "title": "Best headphones I've owned",
            "content": "Sound quality is incredible, very comfortable for long sessions.",
            "date": "2025-01-01"
        }
    ]
    
    if VERSION == 'v2':
        # v2 includes additional review features
        for review in base_reviews:
            review['verified_purchase'] = True
            review['helpful_votes'] = random.randint(5, 25)
            review['images'] = random.choice([[], ['image1.jpg'], ['image1.jpg', 'image2.jpg']])
            review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
            
        # v2 has more reviews
        base_reviews.extend([
            {
                "id": "rev-004",
                "product_id": "CHR-004",
                "user": "alice.brown@example.com", 
                "rating": 3,
                "title": "Decent charger",
                "content": "Works as expected, nothing special but reliable.",
                "date": "2024-12-28",
                "verified_purchase": True,
                "helpful_votes": 8,
                "images": [],
                "sentiment": "neutral"
            }
        ])
    elif VERSION == 'v3':
        # v3 includes AI-powered features
        for review in base_reviews:
            review['verified_purchase'] = True
            review['helpful_votes'] = random.randint(10, 50)
            review['images'] = random.choice([[], ['image1.jpg'], ['image1.jpg', 'image2.jpg']])
            review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
            review['ai_summary'] = f"AI Summary: {review['title'][:30]}..."
            review['moderation_status'] = 'approved'
            review['translation_available'] = random.choice([True, False])
    
    return base_reviews

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": SERVICE_NAME, "version": VERSION})

@app.route('/reviews')
def get_reviews():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.7))
    
    reviews = get_reviews_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "reviews": reviews,
        "total_reviews": len(reviews),
        "average_rating": round(sum(r['rating'] for r in reviews) / len(reviews), 2),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/reviews/<product_id>')
def get_product_reviews(product_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    reviews = get_reviews_data()
    product_reviews = [r for r in reviews if r['product_id'] == product_id]
    
    if not product_reviews:
        return jsonify({"error": "No reviews found for product"}), 404
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "reviews": product_reviews,
        "product_id": product_id,
        "total_reviews": len(product_reviews),
        "average_rating": round(sum(r['rating'] for r in product_reviews) / len(product_reviews), 2),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    app.run(host='0.0.0.0', port=port, debug=True)