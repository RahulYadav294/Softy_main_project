"""
Flask HTTP wrapper — exact same logic as the original CLI backend.
All SQL queries, variable names, conditions and messages are preserved verbatim.
"""

import mysql.connector
from datetime import date, datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "inv_secret_key_2024")
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# ── DB (mirrors original top-level conn) ─────────────────────────────────────
def get_conn():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "YOUR_PASSWORD"),
        database=os.getenv("DB_NAME", "inventory_db")
    )

def serial(row, keys):
    out = {}
    for k, v in zip(keys, row):
        out[k] = v.isoformat() if isinstance(v, (date, datetime)) else v
    return out


# ── AUTH ──────────────────────────────────────────────────────────────────────
# Original login():
#   cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))
#   if user: print("Login successful!") / else: print("Invalid credentials")

@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password)
    )
    user = cursor.fetchone()
    cursor.close(); conn.close()

    if user:
        session["user_id"]  = user[0]
        session["username"] = user[1]
        session["role"]     = user[3]
        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": {"user_id": user[0], "username": user[1], "role": user[3]}
        })
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})


# ── PRODUCT ───────────────────────────────────────────────────────────────────
# Original add_product():
#   cursor.execute("INSERT INTO product (name, price, quantity, min_stock) VALUES (%s,%s,%s,%s)",
#                  (name, price, quantity, min_stock))
#   print("Product added!")
#
# Original view_products():
#   cursor.execute("SELECT * FROM product")
#   for row in cursor.fetchall(): print(row)

@app.route("/api/products", methods=["GET"])
def view_products():
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM product")
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    keys = ["product_id", "name", "price", "quantity", "min_stock"]
    return jsonify([serial(r, keys) for r in rows])


@app.route("/api/products", methods=["POST"])
def add_product():
    d         = request.get_json()
    name      = d.get("name")
    price     = float(d.get("price"))
    quantity  = int(d.get("quantity"))
    min_stock = int(d.get("min_stock"))

    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO product (name, price, quantity, min_stock) VALUES (%s,%s,%s,%s)",
        (name, price, quantity, min_stock)
    )
    conn.commit()
    pid = cursor.lastrowid
    cursor.close(); conn.close()
    return jsonify({"success": True, "product_id": pid, "message": "Product added!"})


@app.route("/api/products/<int:pid>", methods=["DELETE"])
def delete_product(pid):
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM product WHERE product_id=%s", (pid,))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"success": True})


# ── SUPPLIER ──────────────────────────────────────────────────────────────────
# Original add_supplier():
#   cursor.execute("INSERT INTO supplier (name, contact) VALUES (%s,%s)", (name, contact))
#   print("Supplier added!")

@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM supplier")
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    keys = ["supplier_id", "name", "contact"]
    return jsonify([serial(r, keys) for r in rows])


@app.route("/api/suppliers", methods=["POST"])
def add_supplier():
    d       = request.get_json()
    name    = d.get("name")
    contact = d.get("contact")

    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO supplier (name, contact) VALUES (%s,%s)",
        (name, contact)
    )
    conn.commit()
    sid = cursor.lastrowid
    cursor.close(); conn.close()
    return jsonify({"success": True, "supplier_id": sid, "message": "Supplier added!"})


@app.route("/api/suppliers/<int:sid>", methods=["DELETE"])
def delete_supplier(sid):
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM supplier WHERE supplier_id=%s", (sid,))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"success": True})


# ── PURCHASE ──────────────────────────────────────────────────────────────────
# Original record_purchase():
#   cursor.execute("SELECT quantity FROM product WHERE product_id=%s", (pid,))
#   stock = cursor.fetchone()
#   if stock:
#       new_qty = stock[0] + qty
#       cursor.execute("UPDATE product SET quantity=%s WHERE product_id=%s", (new_qty, pid))
#       cursor.execute("INSERT INTO purchase (product_id, supplier_id, quantity, date) ...", ...)
#       conn.commit()
#       print("Purchase recorded!")
#   else:
#       print("Product not found")

@app.route("/api/purchase", methods=["POST"])
def record_purchase():
    d   = request.get_json()
    pid = int(d.get("product_id"))
    sid = int(d.get("supplier_id"))
    qty = int(d.get("quantity"))

    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT quantity FROM product WHERE product_id=%s", (pid,))
    stock = cursor.fetchone()

    if stock:
        new_qty = stock[0] + qty

        cursor.execute(
            "UPDATE product SET quantity=%s WHERE product_id=%s",
            (new_qty, pid)
        )
        cursor.execute(
            "INSERT INTO purchase (product_id, supplier_id, quantity, date) VALUES (%s,%s,%s,%s)",
            (pid, sid, qty, date.today())
        )
        conn.commit()
        cursor.close(); conn.close()
        return jsonify({
            "success": True,
            "new_quantity": new_qty,
            "message": "Purchase recorded!"
        })
    else:
        cursor.close(); conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404


@app.route("/api/purchase", methods=["GET"])
def get_purchases():
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT pu.purchase_id, p.name AS product_name, s.name AS supplier_name,
               pu.quantity, pu.date
        FROM purchase pu
        JOIN product  p ON pu.product_id  = p.product_id
        JOIN supplier s ON pu.supplier_id = s.supplier_id
        ORDER BY pu.date DESC
    """)
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    keys = ["purchase_id", "product_name", "supplier_name", "quantity", "date"]
    return jsonify([serial(r, keys) for r in rows])


# ── SALES ─────────────────────────────────────────────────────────────────────
# Original record_sale():
#   cursor.execute("SELECT quantity, min_stock FROM product WHERE product_id=%s", (pid,))
#   data = cursor.fetchone()
#   if data and data[0] >= qty:
#       new_qty = data[0] - qty
#       cursor.execute("UPDATE product SET quantity=%s WHERE product_id=%s", (new_qty, pid))
#       cursor.execute("INSERT INTO sales (product_id, quantity, date) VALUES (%s,%s,%s)", ...)
#       if new_qty < data[1]:              ← ALERT CHECK (exact condition)
#           message = "Stock below minimum level!"
#           cursor.execute("INSERT INTO alerts (product_id, message, date) VALUES (%s,%s,%s)", ...)
#           print("⚠ ALERT GENERATED!")
#       conn.commit()
#       print("Sale recorded!")
#   else:
#       print("Not enough stock!")

@app.route("/api/sales", methods=["POST"])
def record_sale():
    d   = request.get_json()
    pid = int(d.get("product_id"))
    qty = int(d.get("quantity"))

    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT quantity, min_stock FROM product WHERE product_id=%s", (pid,)
    )
    data = cursor.fetchone()

    if data and data[0] >= qty:
        new_qty = data[0] - qty

        cursor.execute(
            "UPDATE product SET quantity=%s WHERE product_id=%s",
            (new_qty, pid)
        )
        cursor.execute(
            "INSERT INTO sales (product_id, quantity, date) VALUES (%s,%s,%s)",
            (pid, qty, date.today())
        )

        alert_generated = False
        if new_qty < data[1]:                       # exact condition from original
            message = "Stock below minimum level!"
            cursor.execute(
                "INSERT INTO alerts (product_id, message, date) VALUES (%s,%s,%s)",
                (pid, message, date.today())
            )
            alert_generated = True                  # mirrors: print("⚠ ALERT GENERATED!")

        conn.commit()
        cursor.close(); conn.close()
        return jsonify({
            "success": True,
            "new_quantity": new_qty,
            "alert_generated": alert_generated,
            "message": "Sale recorded!"
        })
    else:
        cursor.close(); conn.close()
        return jsonify({"success": False, "message": "Not enough stock!"}), 400


@app.route("/api/sales", methods=["GET"])
def get_sales():
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.sales_id, p.name AS product_name, s.quantity, s.date
        FROM sales s
        JOIN product p ON s.product_id = p.product_id
        ORDER BY s.date DESC
    """)
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    keys = ["sales_id", "product_name", "quantity", "date"]
    return jsonify([serial(r, keys) for r in rows])


# ── ALERTS ────────────────────────────────────────────────────────────────────

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    conn   = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.alert_id, p.name AS product_name, a.message, a.date
        FROM alerts a
        JOIN product p ON a.product_id = p.product_id
        ORDER BY a.date DESC
    """)
    rows = cursor.fetchall()
    cursor.close(); conn.close()
    keys = ["alert_id", "product_name", "message", "date"]
    return jsonify([serial(r, keys) for r in rows])


# ── REPORTS ───────────────────────────────────────────────────────────────────
# Original generate_report():
#   cursor.execute("SELECT * FROM sales")
#   print("\nSales Report:")
#   for row in cursor.fetchall(): print(row)

@app.route("/api/reports", methods=["GET"])
def generate_report():
    conn   = get_conn()
    cursor = conn.cursor()

    # Exact original query
    cursor.execute("SELECT * FROM sales")
    raw_sales = cursor.fetchall()

    # Aggregated for charts
    cursor.execute("""
        SELECT p.name, SUM(s.quantity) AS total_sold, COUNT(s.sales_id) AS num_transactions
        FROM sales s
        JOIN product p ON s.product_id = p.product_id
        GROUP BY p.product_id, p.name
        ORDER BY total_sold DESC
    """)
    product_sales = cursor.fetchall()

    cursor.execute("""
        SELECT date, SUM(quantity) AS total
        FROM sales
        GROUP BY date
        ORDER BY date ASC
    """)
    trend = cursor.fetchall()

    cursor.close(); conn.close()

    return jsonify({
        "raw_sales": [
            serial(r, ["sales_id", "product_id", "quantity", "date"]) for r in raw_sales
        ],
        "product_sales": [
            {"name": r[0], "total_sold": r[1], "num_transactions": r[2]}
            for r in product_sales
        ],
        "sales_trend": [
            {"date": r[0].isoformat() if isinstance(r[0], date) else r[0], "total": r[1]}
            for r in trend
        ]
    })


# ── DASHBOARD (summary for UI) ────────────────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    conn   = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM product")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM product WHERE quantity < min_stock")
    low_stock = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM sales")
    total_sales = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM supplier")
    total_suppliers = cursor.fetchone()[0]

    cursor.execute("""
        SELECT s.sales_id, p.name, s.quantity, s.date
        FROM sales s
        JOIN product p ON s.product_id = p.product_id
        ORDER BY s.date DESC
        LIMIT 5
    """)
    recent = cursor.fetchall()

    cursor.close(); conn.close()

    return jsonify({
        "total_products":  total_products,
        "low_stock":       low_stock,
        "total_sales":     total_sales,
        "total_suppliers": total_suppliers,
        "recent_sales": [
            serial(r, ["sales_id", "product_name", "quantity", "date"]) for r in recent
        ]
    })


if __name__ == "__main__":
    import sys
    try:
        print(f"Starting Flask app from {__file__} using Python {sys.executable}")
        print(f"CWD: {os.getcwd()}")
        app.run(debug=True, port=5000)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise
