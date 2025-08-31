from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random
import uuid

app = Flask(__name__)
CORS(app)

VERSION = os.environ.get('SERVICE_VERSION', 'v1')
SERVICE_NAME = 'orders'

# In-memory storage for demo purposes
orders_db = []

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy", 
        "service": SERVICE_NAME, 
        "version": VERSION,
        "timestamp": time.time()
    })

@app.route('/orders', methods=['POST'])
def create_order():
    # Simulate processing time
    time.sleep(random.uniform(0.2, 0.6))
    
    try:
        data = request.get_json()
        
        order = {
            "id": f"ORD-{int(time.time())}-{random.randint(1000, 9999)}",
            "userId": data.get('userId', 'usr-001'),
            "productId": data.get('productId'),
            "quantity": data.get('quantity', 1),
            "total": data.get('total', 0),
            "status": "confirmed",
            "createdAt": time.time()
        }
        
        # v2 includes additional order features
        if VERSION == 'v2':
            order['priority'] = random.choice(['high', 'medium', 'low'])
            order['estimated_delivery'] = '2-3 business days'
            order['tracking_number'] = f"TRK-{uuid.uuid4().hex[:8].upper()}"
            order['shipping_method'] = random.choice(['standard', 'express', 'overnight'])
            order['payment_method'] = 'credit_card'
        
        orders_db.append(order)
        
        response_data = {
            "service": SERVICE_NAME,
            "version": VERSION,
            "order": order,
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

@app.route('/orders')
def get_orders():
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.4))
    
    response_data = {
        "service": SERVICE_NAME,
        "version": VERSION,
        "orders": orders_db[-10:],  # Return last 10 orders
        "total_orders": len(orders_db),
        "timestamp": time.time()
    }
    
    return jsonify(response_data)

@app.route('/orders/<order_id>')
def get_order(order_id):
    # Simulate processing time
    time.sleep(random.uniform(0.1, 0.3))
    
    order = next((o for o in orders_db if o['id'] == order_id), None)
    
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