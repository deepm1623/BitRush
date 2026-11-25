<<<<<<< HEAD

import os
import random
from datetime import datetime, timezone
from decimal import Decimal
=======
import os
import random
from datetime import datetime
from decimal import Decimal, InvalidOperation
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
<<<<<<< HEAD

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
=======
CORS(app)
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
<<<<<<< HEAD
    raise RuntimeError("DATABASE_URL is missing from your .env file")


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------
=======
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

>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

def get_connection():
    return psycopg2.connect(DATABASE_URL)


<<<<<<< HEAD
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
=======
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

>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

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
<<<<<<< HEAD
            "message": "BiteRush API and database connected"
=======
            "message": "BiteRush Flask Backend and Database Connected!"
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

            cur.execute("""
                SELECT id, name, price, available
                FROM menu_items
                WHERE id = %s
            """, (food_id,))

            food = cur.fetchone()

            if not food:
<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
                "quantity": quantity,
                "line_total": line_total
            })

<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            order_id,
<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
                item["quantity"],
                item["line_total"]
            ))

        conn.commit()
        cur.close()

        return jsonify({
<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
            FROM orders
            ORDER BY id DESC
        """)

        orders = cur.fetchall()
        result = []

        for order in orders:
<<<<<<< HEAD
            order = dict(order)

            cur.execute("""
                SELECT
                    id,
                    food_id,
                    food_name,
                    unit_price,
                    quantity,
                    line_total
=======
            cur.execute("""
                SELECT food_id AS id, food_name AS name,
                       unit_price AS price, quantity
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
                FROM order_items
                WHERE order_fk = %s
                ORDER BY id
            """, (order["id"],))

            items = cur.fetchall()

<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE orders
<<<<<<< HEAD
            SET status = %s,
                updated_at = %s
            WHERE order_id = %s
            RETURNING order_id, status
        """, (
            new_status,
            current_time(),
            order_id
        ))
=======
            SET status = %s, updated_at = %s
            WHERE order_id = %s
            RETURNING order_id, status
        """, (status, now_text(), order_id))
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

        updated = cur.fetchone()

        if not updated:
<<<<<<< HEAD
            conn.rollback()
            return error_response("Order not found", 404)
=======
            return jsonify({"error": "Order not found"}), 404
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

        conn.commit()
        cur.close()

        return jsonify({
<<<<<<< HEAD
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
=======
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
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
