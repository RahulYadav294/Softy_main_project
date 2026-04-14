import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "YOUR_PASSWORD"),
        database=os.getenv("DB_NAME", "inventory_db")
    )
conn = get_conn()
cursor = conn.cursor()
cursor.execute("SELECT username, password FROM users;")
for row in cursor.fetchall():
    print(f"User: {row[0]}, Pass: {row[1]}")
