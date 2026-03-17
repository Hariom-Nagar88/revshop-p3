-- RevShop Database Initialization
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS cart_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;

GRANT ALL PRIVILEGES ON user_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON cart_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON order_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- Seed categories in product_db
USE product_db;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    icon_class VARCHAR(100)
);

INSERT IGNORE INTO categories (name, description, image_url, icon_class) VALUES
('Electronics',   'Phones, Laptops, Cameras and more',      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 'devices'),
('Fashion',       'Clothing, Shoes, Accessories',            'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'checkroom'),
('Home & Kitchen','Furniture, Appliances, Decor',            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'home'),
('Books',         'Fiction, Non-Fiction, Textbooks',         'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'menu_book'),
('Sports',        'Equipment, Apparel, Footwear',            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'sports'),
('Beauty',        'Skincare, Makeup, Fragrances',            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'spa'),
('Grocery',       'Fresh, Packaged, Beverages',              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'local_grocery_store'),
('Toys',          'Kids Toys, Games, Puzzles',               'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'toys');
