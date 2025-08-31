from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'inventory'

def get_products_data():
    products = [
        {
            "id": "LAP-001",
            "name": "Gaming Laptop Pro",
            "stock": 15,
            "price": 1299.99,
            "category": "Electronics",
            "description": "High-performance gaming laptop with RTX 4070 and 32GB RAM"
        },
        {
            "id": "PHN-002",
            "name": "Smartphone X1",
            "stock": 42,
            "price": 899.00,
            "category": "Electronics",
            "description": "Latest flagship smartphone with advanced camera system"
        },
        {
            "id": "HDH-003",
            "name": "Wireless Headphones",
            "stock": 28,
            "price": 199.99,
            "category": "Audio",
            "description": "Premium noise-canceling wireless headphones"
        },
        {
            "id": "CHR-004",
            "name": "USB-C Fast Charger",
            "stock": 67,
            "price": 29.99,
            "category": "Accessories",
            "description": "65W fast charging adapter with multiple ports"
        },
        {
            "id": "TAB-005",
            "name": "Tablet Pro",
            "stock": 23,
            "price": 649.99,
            "category": "Electronics",
            "description": "12.9-inch tablet with Apple M2 chip and 5G connectivity"
        },
        {
            "id": "SPK-006",
            "name": "Smart Speaker",
            "stock": 35,
            "price": 149.99,
            "category": "Audio",
            "description": "Voice-controlled smart speaker with premium sound"
        }
    ]
    
    if VERSION == 'v2':
        # v2 includes additional warehouse and availability info
        for product in products:
            product['warehouse_location'] = random.choice(['North', 'South', 'East', 'West'])
            product['reserved'] = random.randint(0, 5)
            product['available'] = product['stock'] - product['reserved']
            product['last_updated'] = '2025-01-08T10:30:00Z'
            product['supplier'] = f"Supplier-{random.randint(1, 5)}"
    
    return products

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy", 
        "service": SERVICE_NAME, 
        "version": VERSION,
        "timestamp": time.time()
    })

@app.route('/inventory')
def get_inventory():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    products = get_products_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "products": products,
        "total_items": len(products),
        "total_stock": sum(product['stock'] for product in products),
        "categories": list(set(product['category'] for product in products)),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/inventory/<product_id>')
def get_product(product_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    products = get_products_data()
    product = next((p for p in products if p['id'] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "product": product,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)