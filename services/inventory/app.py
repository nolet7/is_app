from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'inventory'

# Simulate some data variations between versions
def get_inventory_data():
    base_inventory = [
        {"sku": "LAP-001", "name": "Gaming Laptop", "stock": 15, "price": 1299.99, "category": "electronics"},
        {"sku": "PHN-002", "name": "Smartphone", "stock": 42, "price": 899.00, "category": "electronics"},
        {"sku": "HDH-003", "name": "Wireless Headphones", "stock": 28, "price": 199.99, "category": "audio"},
        {"sku": "CHR-004", "name": "USB-C Charger", "stock": 67, "price": 29.99, "category": "accessories"}
    ]
    
    if VERSION == 'v2':
        # v2 has additional fields and stock variations
        for item in base_inventory:
            item['warehouse_location'] = random.choice(['North', 'South', 'East', 'West'])
            item['reserved'] = random.randint(0, 5)
            item['available'] = item['stock'] - item['reserved']
            item['last_updated'] = '2025-01-08T10:30:00Z'
    
    return base_inventory

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": SERVICE_NAME, "version": VERSION})

@app.route('/inventory')
def get_inventory():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    inventory = get_inventory_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "inventory": inventory,
        "total_items": len(inventory),
        "total_stock": sum(item['stock'] for item in inventory),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/inventory/<sku>')
def get_item(sku):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    inventory = get_inventory_data()
    item = next((i for i in inventory if i['sku'] == sku), None)
    
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "item": item,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)