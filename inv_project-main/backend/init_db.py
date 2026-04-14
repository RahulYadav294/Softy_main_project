import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# We connect without specifying a database first to create it
try:
    print("Connecting to MySQL...")
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "YOUR_PASSWORD")
    )
    cursor = conn.cursor()

    db_name = os.getenv("DB_NAME", "inventory_db")

    print(f"Creating database '{db_name}' (if it doesn't exist)...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    cursor.execute(f"USE {db_name}")

    print("Creating tables...")

    # Create Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
    )
    """)

    # Create Product table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 0,
        min_stock INT DEFAULT 0
    )
    """)

    # Create Supplier table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS supplier (
        supplier_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(255)
    )
    """)

    # Create Purchase table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS purchase (
        purchase_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        supplier_id INT,
        quantity INT NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
    )
    """)

    # Create Sales table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        sales_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        quantity INT NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
    )
    """)

    # Create Alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        alert_id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        message VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
    )
    """)

    # Insert default admin user if it doesn't exist
    cursor.execute("SELECT * FROM users WHERE username='admin'")
    admin = cursor.fetchone()
    if not admin:
        print("Inserting default admin user...")
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            ("admin", "admin123", "Admin")
        )
    
    conn.commit()
    print("====================================")
    print("✅ Database setup completed successfully!")
    print("Initial Login Credentials:")
    print("Username: admin")
    print("Password: admin123")
    print("====================================")

except mysql.connector.Error as err:
    print(f"❌ Error: {err}")
    print("Please make sure your MySQL server is running and the DB_USER/DB_PASSWORD are correct in your .env or script!")
finally:
    if 'cursor' in locals() and cursor:
        cursor.close()
    if 'conn' in locals() and conn.is_connected():
        conn.close()
