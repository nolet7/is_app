from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'orders'

# Simulate some data variations between versions
def get_orders_data():
    base_orders = [
        {"id": "ord-001", "customer": "john.doe@example.com", "total": 299.99, "status": "confirmed"},
        {"id": "ord-002", "customer": "jane.smith@example.com", "total": 149.50, "status": "processing"},
        {"id": "ord-003", "customer": "bob.wilson@example.com", "total": 75.25, "status": "shipped"}
    ]
    
    if VERSION == 'v2':
        # v2 has additional fields and different pricing
        for order in base_orders:
            order['priority'] = random.choice(['high', 'medium', 'low'])
            order['estimated_delivery'] = '2-3 business days'
            order['total'] = round(order['total'] * 1.1, 2)  # 10% higher prices in v2
    
    return base_orders

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": SERVICE_NAME, "version": VERSION})

@app.route('/orders')
def get_orders():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.5))
    
    orders = get_orders_data()
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "orders": orders,
        "count": len(orders),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/orders/<order_id>')
def get_order(order_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    orders = get_orders_data()
    order = next((o for o in orders if o['id'] == order_id), None)
    
    if not order:
        return jsonify({"error": "Order not found"}), 404
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "order": order,
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)