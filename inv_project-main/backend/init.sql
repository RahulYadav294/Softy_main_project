CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT DEFAULT 0,
    min_stock INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS purchase (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    supplier_id INT,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales (
    sales_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    message VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- Insert admin user if they don't already exist
INSERT IGNORE INTO users (user_id, username, password, role) VALUES (1, 'admin', 'admin123', 'Admin');
