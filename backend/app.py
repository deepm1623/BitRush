
import os
import random
from datetime import datetime, timezone
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route("/")
def home():
    return "BiteRush Flask Backend is Running!"

# Allow frontend requests
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://*.vercel.app"
        ]
    }
})

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from your .env file")


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_connection():
    return psycopg2.connect(DATABASE_URL)


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def current_time():
    return datetime.now(timezone.utc).isoformat()


def to_float(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def generate_order_id(cursor):
    for _ in range(50):
        order_id = f"BR-{random.randint(1000, 9999)}"

        cursor.execute(
            "SELECT id FROM orders WHERE order_id = %s",
            (order_id,)
        )

        if cursor.fetchone() is None:
            return order_id

    raise Exception("Could not generate a unique order number")


def error_response(message, status_code=400):
    return jsonify({"error": message}), status_code


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "BiteRush API and database connected"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# --------------------------------------------------
# GET MENU
# --------------------------------------------------

@app.route("/api/menu", methods=["GET"])
def get_menu():
    conn = None

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                m.id,
                m.name,
                c.name AS category,
                m.category_id,
                m.price,
                m.description,
                m.image,
                m.available
            FROM menu_items m
            LEFT JOIN categories c
                ON m.category_id = c.id
            ORDER BY m.id
        """)

        rows = cur.fetchall()

        menu = []

        for row in rows:
            item = dict(row)
            item["price"] = to_float(item["price"])
            item["available"] = bool(item["available"])
            menu.append(item)

        cur.close()

        return jsonify(menu)

    except Exception as e:
        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# PLACE ORDER
# --------------------------------------------------

@app.route("/api/orders", methods=["POST"])
def place_order():
    conn = None

    try:
        data = request.get_json(silent=True) or {}

        items = data.get("items")

        if not isinstance(items, list) or not items:
            return error_response("Order items are required")

        payment_method = str(
            data.get("payment_method", "Cash")
        ).strip()

        pickup_time = str(
            data.get("pickup_time", "")
        ).strip()

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        order_items_data = []
        calculated_total = Decimal("0.00")

        # Verify menu items and calculate prices from database
        for item in items:

            food_id = item.get("id", item.get("food_id"))

            try:
                food_id = int(food_id)
                quantity = int(item.get("quantity", 1))
            except (TypeError, ValueError):
                conn.rollback()
                return error_response("Invalid food ID or quantity")

            if quantity <= 0:
                conn.rollback()
                return error_response("Quantity must be greater than zero")

            cur.execute("""
                SELECT id, name, price, available
                FROM menu_items
                WHERE id = %s
            """, (food_id,))

            food = cur.fetchone()

            if not food:
                conn.rollback()
                return error_response(
                    f"Food item {food_id} does not exist"
                )

            if not food["available"]:
                conn.rollback()
                return error_response(
                    f"{food['name']} is currently unavailable"
                )

            unit_price = Decimal(str(food["price"]))
            line_total = unit_price * quantity

            calculated_total += line_total

            order_items_data.append({
                "food_id": food["id"],
                "food_name": food["name"],
                "unit_price": unit_price,
                "quantity": quantity,
                "line_total": line_total
            })

        order_id = generate_order_id(cur)
        now = current_time()

        pickup_token = str(random.randint(1000, 9999))

        # Save main order
        cur.execute("""
            INSERT INTO orders (
                order_id,
                pickup_time,
                payment_method,
                status,
                total,
                created_at,
                updated_at,
                payment_status,
                pickup_token,
                payment_reference
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            order_id,
            pickup_time,
            payment_method,
            "Order Placed",
            calculated_total,
            now,
            now,
            "Pending",
            pickup_token,
            None
        ))

        saved_order = cur.fetchone()
        order_fk = saved_order["id"]

        # Save individual order items
        for item in order_items_data:
            cur.execute("""
                INSERT INTO order_items (
                    order_fk,
                    food_id,
                    food_name,
                    unit_price,
                    quantity,
                    line_total
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_fk,
                item["food_id"],
                item["food_name"],
                item["unit_price"],
                item["quantity"],
                item["line_total"]
            ))

        conn.commit()
        cur.close()

        return jsonify({
            "success": True,
            "order_id": order_id,
            "status": "Order Placed",
            "total": float(calculated_total),
            "pickup_token": pickup_token,
            "created_at": now
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()

        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# TRACK SINGLE ORDER
# --------------------------------------------------

@app.route("/api/orders/<order_id>", methods=["GET"])
def track_order(order_id):
    conn = None

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                order_id,
                status,
                total,
                pickup_time,
                payment_method,
                payment_status,
                pickup_token,
                created_at
            FROM orders
            WHERE order_id = %s
        """, (order_id,))

        order = cur.fetchone()
        cur.close()

        if not order:
            return error_response("Order not found", 404)

        order = dict(order)
        order["total"] = to_float(order["total"])

        return jsonify(order)

    except Exception as e:
        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# GET ALL ORDERS (ADMIN)
# --------------------------------------------------

@app.route("/api/orders", methods=["GET"])
def get_all_orders():
    conn = None

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                id,
                order_id,
                pickup_time,
                payment_method,
                status,
                total,
                created_at,
                updated_at,
                payment_status,
                pickup_token,
                payment_reference
            FROM orders
            ORDER BY id DESC
        """)

        orders = cur.fetchall()
        result = []

        for order in orders:
            order = dict(order)

            cur.execute("""
                SELECT
                    id,
                    food_id,
                    food_name,
                    unit_price,
                    quantity,
                    line_total
                FROM order_items
                WHERE order_fk = %s
                ORDER BY id
            """, (order["id"],))

            items = cur.fetchall()

            for item in items:
                item = dict(item)
                item["unit_price"] = to_float(item["unit_price"])
                item["line_total"] = to_float(item["line_total"])

            order["items"] = items
            order["total"] = to_float(order["total"])

            result.append(order)

        cur.close()

        return jsonify(result)

    except Exception as e:
        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# UPDATE ORDER STATUS (ADMIN)
# --------------------------------------------------

@app.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    conn = None

    try:
        data = request.get_json(silent=True) or {}
        new_status = data.get("status")

        allowed_statuses = [
            "Order Placed",
            "Accepted",
            "Preparing",
            "Ready for Pickup",
            "Completed",
            "Cancelled"
        ]

        if new_status not in allowed_statuses:
            return error_response("Invalid order status")

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE orders
            SET status = %s,
                updated_at = %s
            WHERE order_id = %s
            RETURNING order_id, status
        """, (
            new_status,
            current_time(),
            order_id
        ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return error_response("Order not found", 404)

        conn.commit()
        cur.close()

        return jsonify({
            "success": True,
            "order_id": updated["order_id"],
            "status": updated["status"]
        })

    except Exception as e:
        if conn:
            conn.rollback()

        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# UPDATE MENU ITEM (ADMIN)
# --------------------------------------------------

@app.route("/api/menu/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):
    conn = None

    try:
        data = request.get_json(silent=True) or {}

        if "available" not in data and "price" not in data:
            return error_response(
                "Provide price or available to update"
            )

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        updates = []
        values = []

        if "available" in data:
            if not isinstance(data["available"], bool):
                return error_response(
                    "Available must be true or false"
                )

            updates.append("available = %s")
            values.append(data["available"])

        if "price" in data:
            try:
                price = Decimal(str(data["price"]))

                if not price.is_finite() or price < 0:
                    return error_response("Invalid price")

            except Exception:
                return error_response("Invalid price")

            updates.append("price = %s")
            values.append(price)

        updates.append("updated_at = %s")
        values.append(current_time())

        values.append(item_id)

        query = f"""
            UPDATE menu_items
            SET {", ".join(updates)}
            WHERE id = %s
            RETURNING id, name, price, available
        """

        cur.execute(query, tuple(values))
        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return error_response("Menu item not found", 404)

        conn.commit()
        cur.close()

        updated = dict(updated)
        updated["price"] = to_float(updated["price"])

        return jsonify({
            "success": True,
            "item": updated
        })

    except Exception as e:
        if conn:
            conn.rollback()

        return error_response(str(e), 500)

    finally:
        if conn:
            conn.close()


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True
    )
