from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random
import uuid

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'reviews'

# In-memory storage for demo purposes
reviews_db = [
    {
        "id": "rev-001",
        "productId": "LAP-001",
        "userId": "usr-002",
        "userName": "John Doe",
        "rating": 5,
        "comment": "Excellent gaming laptop! Perfect for development and gaming.",
        "createdAt": "2025-01-07T10:30:00Z",
        "verified": True
    },
    {
        "id": "rev-002",
        "productId": "PHN-002",
        "userId": "usr-003",
        "userName": "Jane Smith",
        "rating": 4,
        "comment": "Great phone with amazing camera quality. Battery could be better.",
        "createdAt": "2025-01-06T15:45:00Z",
        "verified": True
    },
    {
        "id": "rev-003",
        "productId": "HDH-003",
        "userId": "usr-004",
        "userName": "Bob Wilson",
        "rating": 5,
        "comment": "Best headphones I've ever owned. Sound quality is incredible.",
        "createdAt": "2025-01-05T09:20:00Z",
        "verified": True
    }
]

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy", 
        "service": SERVICE_NAME, 
        "version": VERSION,
        "timestamp": time.time()
    })

@app.route('/reviews/<product_id>')
def get_product_reviews(product_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.5))
    
    product_reviews = [r for r in reviews_db if r['productId'] == product_id]
    
    # Add version-specific fields
    for review in product_reviews:
        if VERSION == 'v2':
            review['helpful_votes'] = random.randint(5, 25)
            review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
            review['images'] = random.choice([[], ['image1.jpg'], ['image1.jpg', 'image2.jpg']])
        elif VERSION == 'v3':
            review['helpful_votes'] = random.randint(10, 50)
            review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
            review['ai_summary'] = f"AI Summary: {review['comment'][:30]}..."
            review['moderation_status'] = 'approved'
            review['translation_available'] = random.choice([True, False])
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "reviews": product_reviews,
        "product_id": product_id,
        "total_reviews": len(product_reviews),
        "average_rating": round(sum(r['rating'] for r in product_reviews) / len(product_reviews), 2) if product_reviews else 0,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/reviews', methods=['POST'])
def create_review():
    # Simulate processing time
    time.sleep(random.uniform(0.2, 0.6))
    
    try:
        data = request.get_json()
        
        review = {
            "id": f"rev-{uuid.uuid4().hex[:8]}",
            "productId": data.get('productId'),
            "userId": data.get('userId', 'usr-001'),
            "userName": data.get('userName', 'Anonymous'),
            "rating": data.get('rating'),
            "comment": data.get('comment'),
            "createdAt": time.time(),
            "verified": True
        }
        
        # Add version-specific fields
        if VERSION == 'v2':
            review['helpful_votes'] = 0
            review['sentiment'] = 'positive' if review['rating'] >= 4 else 'neutral' if review['rating'] >= 3 else 'negative'
            review['images'] = []
        elif VERSION == 'v3':
            review['helpful_votes'] = 0
            review['sentiment'] = 'positive' if review['rating'] >= 4 else 'neutral' if review['rating'] >= 3 else 'negative'
            review['ai_summary'] = f"AI Summary: {review['comment'][:30]}..."
            review['moderation_status'] = 'pending'
            review['translation_available'] = False
        
        reviews_db.append(review)
        
        response_data = {
            "service": SERVICE_NAME,
            "version": VERSION,
            "review": review,
            "timestamp": time.time()
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({
            "service": SERVICE_NAME,
            "version": VERSION,
            "error": str(e),
            "timestamp": time.time()
        }), 400

@app.route('/reviews')
def get_all_reviews():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    # Add version-specific fields to all reviews
    enhanced_reviews = []
    for review in reviews_db:
        enhanced_review = review.copy()
        if VERSION == 'v2':
            enhanced_review['helpful_votes'] = random.randint(5, 25)
            enhanced_review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
        elif VERSION == 'v3':
            enhanced_review['helpful_votes'] = random.randint(10, 50)
            enhanced_review['sentiment'] = random.choice(['positive', 'neutral', 'negative'])
            enhanced_review['ai_summary'] = f"AI Summary: {review['comment'][:30]}..."
            enhanced_review['moderation_status'] = 'approved'
        enhanced_reviews.append(enhanced_review)
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "reviews": enhanced_reviews,
        "total_reviews": len(enhanced_reviews),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    app.run(host='0.0.0.0', port=port, debug=True)