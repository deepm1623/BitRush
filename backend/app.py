import os
import random
from datetime import datetime
from decimal import Decimal, InvalidOperation

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL missing from backend/.env")

STATUSES = [
    "Order Placed",
    "Accepted",
    "Preparing",
    "Ready for Pickup",
    "Completed"
]

SEED_MENU = [
    ("Veg Sandwich", "Snacks", 60, "Toasted sandwich with fresh vegetables and cheese.", "assets/Veg Sandwich.jpg"),
    ("Cheese Sandwich", "Snacks", 70, "Grilled sandwich filled with delicious melted cheese.", "assets/Cheese Sandwich.jpg"),
    ("Veg Burger", "Fast Food", 80, "Crispy vegetable patty with fresh lettuce.", "assets/Veg Burger.jpg"),
    ("French Fries", "Snacks", 70, "Golden crispy fries with delicious seasoning.", "assets/French Fries.jpg"),
    ("Masala Dosa", "South Indian", 90, "Crispy dosa with potato masala and chutney.", "assets/Masala Dosa.jpg"),
    ("Cold Coffee", "Drinks", 50, "Refreshing chilled coffee for your break.", "assets/Cold Coffee.jpg"),
    ("Veg Pizza", "Fast Food", 120, "Loaded with cheese and fresh vegetables.", "assets/Veg Pizza.jpg"),
    ("Gujarati Thali", "Meals", 110, "A delicious traditional Gujarati meal.", "assets/Gujarati Thali.jpg"),
    ("Chocolate Brownie", "Desserts", 65, "Rich chocolate brownie for your sweet cravings.", "assets/Chocolate Brownie.jpg"),
    ("Cheese Maggi", "Snacks", 50, "Hot Maggi noodles topped with delicious cheese.", "assets/Cheese Maggi.jpg"),
    ("Hakka Noodles", "Fast Food", 90, "Stir-fried noodles with vegetables and sauces.", "assets/Hakka Noodles.jpg"),
    ("Manchurian", "Fast Food", 100, "Spicy vegetable Manchurian tossed in flavorful sauce.", "assets/Manchurian.jpg"),
    ("Paneer Wrap", "Snacks", 80, "Paneer and vegetables wrapped in a soft tortilla.", "assets/Paneer Wrap.jpg"),
    ("Pav Bhaji", "Meals", 100, "Mumbai-style bhaji served with buttery pav.", "assets/Pav Bhaji.jpg")
]


def get_connection():
    return psycopg2.connect(DATABASE_URL)


def now_text():
    return datetime.now().strftime("%I:%M %p")


def money(value):
    return float(value) if isinstance(value, Decimal) else value


def init_db():
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM menu_items")
        count = cur.fetchone()[0]

        if count == 0:
            category_ids = {}

            for _, category, *_ in SEED_MENU:
                cur.execute(
                    "SELECT id FROM categories WHERE name = %s",
                    (category,)
                )
                result = cur.fetchone()

                if result:
                    category_ids[category] = result[0]
                else:
                    cur.execute("""
                        INSERT INTO categories (name, description, created_at)
                        VALUES (%s, %s, %s)
                        RETURNING id
                    """, (
                        category,
                        category,
                        now_text()
                    ))
                    category_ids[category] = cur.fetchone()[0]

            for name, category, price, description, image in SEED_MENU:
                cur.execute("""
                    INSERT INTO menu_items
                    (name, description, price, category_id, image, available, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, TRUE, %s, %s)
                """, (
                    name,
                    description,
                    price,
                    category_ids[category],
                    image,
                    now_text(),
                    now_text()
                ))

        conn.commit()
        cur.close()

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


def get_or_create_category(cur, category_name):
    cur.execute(
        "SELECT id FROM categories WHERE name = %s",
        (category_name,)
    )
    row = cur.fetchone()

    if row:
        return row["id"]

    cur.execute("""
        INSERT INTO categories (name, description, created_at)
        VALUES (%s, %s, %s)
        RETURNING id
    """, (category_name, category_name, now_text()))

    return cur.fetchone()["id"]


def menu_item_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "price": money(row["price"]),
        "description": row["description"],
        "image": row["image"],
        "available": row["available"]
    }


def get_menu_query():
    return """
        SELECT
            m.id,
            m.name,
            c.name AS category,
            m.price,
            m.description,
            m.image,
            m.available
        FROM menu_items m
        LEFT JOIN categories c ON c.id = m.category_id
    """


@app.route("/", methods=["GET"])
def home():
    return "BiteRush Flask Backend is Running!"


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
            "message": "BiteRush Flask Backend and Database Connected!"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/menu", methods=["GET"])
def get_menu():
    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(get_menu_query() + " ORDER BY m.id")
        rows = cur.fetchall()

        result = [menu_item_dict(row) for row in rows]

        cur.close()
        return jsonify(result)

    finally:
        conn.close()


@app.route("/api/menu", methods=["POST"])
def add_menu_item():
    data = request.get_json(silent=True) or {}

    required = ["name", "category", "price", "description", "image"]

    if any(data.get(key) is None for key in required):
        return jsonify({"error": "All food fields are required"}), 400

    try:
        price = Decimal(str(data["price"]))
        if not price.is_finite() or price < 0:
            return jsonify({"error": "Invalid price"}), 400
    except (InvalidOperation, ValueError):
        return jsonify({"error": "Invalid price"}), 400

    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        category_id = get_or_create_category(cur, str(data["category"]).strip())

        cur.execute("""
            INSERT INTO menu_items
            (name, description, price, category_id, image, available, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            str(data["name"]).strip(),
            str(data["description"]).strip(),
            price,
            category_id,
            str(data["image"]).strip(),
            data.get("available", True),
            now_text(),
            now_text()
        ))

        item_id = cur.fetchone()["id"]

        cur.execute(get_menu_query() + " WHERE m.id = %s", (item_id,))
        item = menu_item_dict(cur.fetchone())

        conn.commit()
        cur.close()

        return jsonify(item), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@app.route("/api/menu/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):
    data = request.get_json(silent=True) or {}

    allowed = {"name", "category", "price", "description", "image", "available"}

    if not data or not set(data.keys()).issubset(allowed):
        return jsonify({"error": "Invalid or empty update fields"}), 400

    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT id FROM menu_items WHERE id = %s", (item_id,))
        if not cur.fetchone():
            return jsonify({"error": "Menu item not found"}), 404

        updates = []
        values = []

        for field in ["name", "description", "image", "available"]:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if "price" in data:
            try:
                price = Decimal(str(data["price"]))
                if not price.is_finite() or price < 0:
                    return jsonify({"error": "Invalid price"}), 400
            except (InvalidOperation, ValueError):
                return jsonify({"error": "Invalid price"}), 400

            updates.append("price = %s")
            values.append(price)

        if "category" in data:
            category_id = get_or_create_category(cur, str(data["category"]).strip())
            updates.append("category_id = %s")
            values.append(category_id)

        updates.append("updated_at = %s")
        values.append(now_text())
        values.append(item_id)

        cur.execute(
            "UPDATE menu_items SET " + ", ".join(updates) + " WHERE id = %s",
            tuple(values)
        )

        cur.execute(get_menu_query() + " WHERE m.id = %s", (item_id,))
        item = menu_item_dict(cur.fetchone())

        conn.commit()
        cur.close()

        return jsonify(item), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@app.route("/api/menu/<int:item_id>", methods=["DELETE"])
def delete_menu_item(item_id):
    conn = get_connection()

    try:
        cur = conn.cursor()

        cur.execute("DELETE FROM menu_items WHERE id = %s RETURNING id", (item_id,))
        deleted = cur.fetchone()

        if not deleted:
            return jsonify({"error": "Menu item not found"}), 404

        conn.commit()
        cur.close()

        return jsonify({
            "message": "Deleted",
            "id": deleted[0]
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({
            "error": str(e),
            "message": "Could not delete menu item. It may be referenced by previous orders."
        }), 400

    finally:
        conn.close()


@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.get_json(silent=True) or {}
    items = data.get("items")

    if not isinstance(items, list) or not items:
        return jsonify({"error": "Cart is empty"}), 400

    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        validated_items = []
        total = Decimal("0.00")

        for item in items:
            food_id = int(item.get("id"))
            quantity = int(item.get("quantity", 0))

            if quantity <= 0:
                return jsonify({"error": "Invalid quantity"}), 400

            cur.execute("""
                SELECT id, name, price, available
                FROM menu_items
                WHERE id = %s
            """, (food_id,))

            food = cur.fetchone()

            if not food:
                return jsonify({"error": f"Food ID {food_id} not found"}), 400

            if not food["available"]:
                return jsonify({"error": food["name"] + " is sold out"}), 400

            price = Decimal(str(food["price"]))
            line_total = price * quantity
            total += line_total

            validated_items.append({
                "id": food["id"],
                "name": food["name"],
                "price": price,
                "quantity": quantity,
                "line_total": line_total
            })

        for _ in range(100):
            order_id = f"BR-{random.randint(1000, 9999)}"
            cur.execute("SELECT id FROM orders WHERE order_id = %s", (order_id,))
            if cur.fetchone() is None:
                break
        else:
            return jsonify({"error": "Could not generate order number"}), 500

        created_at = now_text()

        cur.execute("""
            INSERT INTO orders
            (order_id, pickup_time, payment_method, status, total,
             created_at, updated_at, payment_status, pickup_token, payment_reference)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            order_id,
            data.get("pickup_time", ""),
            data.get("payment_method", "Cash"),
            "Order Placed",
            total,
            created_at,
            created_at,
            data.get("payment_status", "Pending"),
            str(random.randint(1000, 9999)),
            data.get("payment_reference")
        ))

        order_fk = cur.fetchone()["id"]

        for item in validated_items:
            cur.execute("""
                INSERT INTO order_items
                (order_fk, food_id, food_name, unit_price, quantity, line_total)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                order_fk,
                item["id"],
                item["name"],
                item["price"],
                item["quantity"],
                item["line_total"]
            ))

        conn.commit()
        cur.close()

        return jsonify({
            "order_id": order_id,
            "status": "Order Placed",
            "total": float(total),
            "created_at": created_at
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


@app.route("/api/orders", methods=["GET"])
def get_all_orders():
    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT id, order_id, total, status, created_at
            FROM orders
            ORDER BY id DESC
        """)

        orders = cur.fetchall()
        result = []

        for order in orders:
            cur.execute("""
                SELECT food_id AS id, food_name AS name,
                       unit_price AS price, quantity
                FROM order_items
                WHERE order_fk = %s
                ORDER BY id
            """, (order["id"],))

            items = cur.fetchall()

            result.append({
                "order_id": order["order_id"],
                "items": [
                    {
                        "id": item["id"],
                        "name": item["name"],
                        "price": money(item["price"]),
                        "quantity": item["quantity"]
                    }
                    for item in items
                ],
                "total": money(order["total"]),
                "status": order["status"],
                "created_at": order["created_at"]
            })

        cur.close()
        return jsonify(result)

    finally:
        conn.close()


@app.route("/api/orders/<order_id>", methods=["GET"])
def track_order(order_id):
    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT order_id, status
            FROM orders
            WHERE order_id = %s
        """, (order_id,))

        order = cur.fetchone()
        cur.close()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        return jsonify({
            "order_id": order["order_id"],
            "status": order["status"]
        })

    finally:
        conn.close()


@app.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_connection()

    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE orders
            SET status = %s, updated_at = %s
            WHERE order_id = %s
            RETURNING order_id, status
        """, (status, now_text(), order_id))

        updated = cur.fetchone()

        if not updated:
            return jsonify({"error": "Order not found"}), 404

        conn.commit()
        cur.close()

        return jsonify({
            "order_id": updated["order_id"],
            "status": updated["status"]
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
    print("BiteRush backend initialized!")
    app.run(host="127.0.0.1", port=5000, debug=True)
