-- ============================================================
-- RevShop Complete Database Schema
-- ============================================================

-- ─── user_db ─────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS user_db;
USE user_db;

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL COMMENT 'ROLE_BUYER | ROLE_SELLER'
);

CREATE TABLE IF NOT EXISTS users (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(200) UNIQUE NOT NULL,
    password         VARCHAR(300) NOT NULL,
    phone            VARCHAR(15) UNIQUE,
    address          TEXT,
    city             VARCHAR(100),
    state            VARCHAR(100),
    pincode          VARCHAR(10),
    profile_image_url VARCHAR(500),
    enabled          BOOLEAN DEFAULT TRUE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ─── product_db ───────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS product_db;
USE product_db;

CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url   VARCHAR(500),
    icon_class  VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS products (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    price               DECIMAL(10,2) NOT NULL,
    original_price      DECIMAL(10,2),
    stock               INT NOT NULL DEFAULT 0,
    image_url           VARCHAR(500),
    brand               VARCHAR(100),
    category_id         BIGINT,
    seller_id           BIGINT NOT NULL,
    seller_name         VARCHAR(200),
    average_rating      DOUBLE DEFAULT 0.0,
    rating_count        INT DEFAULT 0,
    active              BOOLEAN DEFAULT TRUE,
    low_stock_threshold INT DEFAULT 10,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category_id),
    FULLTEXT INDEX ft_search (name, description, brand)
);

CREATE TABLE IF NOT EXISTS product_images (
    product_id BIGINT NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    buyer_id   BIGINT NOT NULL,
    buyer_name VARCHAR(200),
    comment    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
);

CREATE TABLE IF NOT EXISTS ratings (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    buyer_id   BIGINT NOT NULL,
    score      INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_buyer_product (product_id, buyer_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── cart_db ──────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS cart_db;
USE cart_db;

CREATE TABLE IF NOT EXISTS carts (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id   BIGINT UNIQUE NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id      BIGINT NOT NULL,
    product_id   BIGINT NOT NULL,
    product_name VARCHAR(255),
    image_url    VARCHAR(500),
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    seller_id    BIGINT,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlists (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id      BIGINT NOT NULL,
    product_id    BIGINT NOT NULL,
    product_name  VARCHAR(255),
    image_url     VARCHAR(500),
    product_price DECIMAL(10,2),
    added_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_buyer_product (buyer_id, product_id)
);

-- ─── order_db ─────────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS order_db;
USE order_db;

CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number     VARCHAR(50) UNIQUE NOT NULL,
    buyer_id         BIGINT NOT NULL,
    buyer_email      VARCHAR(200),
    buyer_name       VARCHAR(200),
    status           ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    total_amount     DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method   VARCHAR(50),
    payment_id       VARCHAR(100),
    tracking_number  VARCHAR(100),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer (buyer_id),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT NOT NULL,
    product_id   BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    image_url    VARCHAR(500),
    price        DECIMAL(10,2) NOT NULL,
    quantity     INT NOT NULL,
    seller_id    BIGINT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_seller (seller_id)
);

-- ─── payment_db ───────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS payment_db;
USE payment_db;

CREATE TABLE IF NOT EXISTS payments (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id     VARCHAR(100) UNIQUE NOT NULL,
    order_id       BIGINT NOT NULL,
    order_number   VARCHAR(50),
    buyer_id       BIGINT NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH_ON_DELIVERY','CREDIT_CARD','DEBIT_CARD') NOT NULL,
    status         ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    failure_reason TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    INDEX idx_buyer (buyer_id)
);

-- ─── notification_db ──────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS notification_db;
USE notification_db;

CREATE TABLE IF NOT EXISTS notifications (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT,
    user_email   VARCHAR(200),
    type         VARCHAR(50) NOT NULL,
    message      TEXT,
    reference_id VARCHAR(100),
    is_read      BOOLEAN DEFAULT FALSE,
    sent         BOOLEAN DEFAULT FALSE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_unread (user_id, is_read)
);

-- ─── Seed Data ─────────────────────────────────────────────────
USE product_db;

INSERT IGNORE INTO categories (name, description, image_url, icon_class) VALUES
('Electronics',    'Phones, Laptops, Cameras',          'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 'devices'),
('Fashion',        'Clothing, Shoes, Accessories',       'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'checkroom'),
('Home & Kitchen', 'Furniture, Appliances, Decor',       'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'home'),
('Books',          'Fiction, Non-Fiction, Textbooks',    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'menu_book'),
('Sports',         'Equipment, Apparel, Footwear',       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'sports'),
('Beauty',         'Skincare, Makeup, Fragrances',       'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'spa'),
('Grocery',        'Fresh, Packaged, Beverages',         'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'local_grocery_store'),
('Toys',           'Kids Toys, Games, Puzzles',          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'toys');
