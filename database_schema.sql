-- Database Schema for Hall Booking Application

-- Create database
CREATE DATABASE IF NOT EXISTS hall_booking;
USE hall_booking;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator') DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    function_date DATE NOT NULL,
    guests INT DEFAULT 0,
    function_type VARCHAR(50),
    booking_by VARCHAR(100),
    address TEXT,
    cnic VARCHAR(20),
    contact_number VARCHAR(20),
    start_time TIME,
    end_time TIME,
    booking_days INT DEFAULT 1,
    booking_type ENUM('perHead', 'fixed') DEFAULT 'perHead',
    cost_per_head DECIMAL(10, 2) DEFAULT 0.00,
    fixed_rate DECIMAL(10, 2) DEFAULT 0.00,
    booking_date DATE,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    advance DECIMAL(10, 2) DEFAULT 0.00,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    dj_charges DECIMAL(10, 2) DEFAULT 0.00,
    decor_charges DECIMAL(10, 2) DEFAULT 0.00,
    tma_charges DECIMAL(10, 2) DEFAULT 0.00,
    other_charges DECIMAL(10, 2) DEFAULT 0.00,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items for bookings (many-to-many relationship)
CREATE TABLE booking_menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    menu_item VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Payments for bookings (one-to-many relationship)
CREATE TABLE booking_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_date DATE,
    payment_method VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Vendors table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    total_credit DECIMAL(10, 2) DEFAULT 0.00,
    total_paid DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    vendor_id INT,
    title VARCHAR(100),
    category VARCHAR(50),
    amount DECIMAL(10, 2) DEFAULT 0.00,
    receipt_image VARCHAR(255),
    payment_status ENUM('paid', 'credit') DEFAULT 'paid',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Payment history for expenses (one-to-many relationship)
CREATE TABLE expense_payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT,
    amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_date DATE,
    payment_method VARCHAR(50),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- Vendor transactions table
CREATE TABLE vendor_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    expense_id INT,
    type ENUM('credit', 'payment'),
    amount DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    transaction_date DATE,
    balance_after DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL
);

-- Insert default users for testing
-- Admin user (username: admin, password: password)
INSERT INTO users (username, password, role) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- Operator user (username: operator, password: password)
INSERT INTO users (username, password, role) VALUES ('operator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator');