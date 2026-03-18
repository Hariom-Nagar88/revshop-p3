# 🛍️ RevShop — E-Commerce Platform

> Production-ready microservices e-commerce application built with Spring Boot 3, Spring Cloud, and Angular 17.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Angular 17 Frontend                          │
│                  ( Responsive · Material Icons)        │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Gateway  :8080                                │
│         JWT Validation · Routing · Circuit Breaker · CORS           │
└──┬────────┬──────────┬──────────┬──────────┬──────────┬────────────┘
   │        │          │          │          │          │
   ▼        ▼          ▼          ▼          ▼          ▼
:8081    :8082      :8083      :8084      :8085      :8086
User    Product    Cart       Order     Payment  Notification
Service Service   Service    Service   Service    Service
  │        │          │          │          │          │
  ▼        ▼          ▼          ▼          ▼          ▼
user_db product_db cart_db  order_db  payment_db notification_db
                                │
                    OpenFeign ──┼──► product-service (stock)
                                └──► notification-service (emails)

        Eureka Server :8761  ◄── All services register here
        Config Server :8888  ◄── Centralised config
```

---

## 🗂️ Project Structure

```
revshop/
├── pom.xml                        # Parent Maven POM
├── docker-compose.yml             # Full stack Docker setup
├── init.sql                       # DB initialization
├── schema.sql                     # Complete SQL schemas + seed data
│
├── config-server/                 # Spring Cloud Config Server  :8888
├── eureka-server/                 # Eureka Service Discovery    :8761
├── api-gateway/                   # Spring Cloud Gateway        :8080
│
├── user-service/                  # Auth + User management      :8081
│   └── src/main/java/com/revshop/user/
│       ├── controller/AuthController.java
│       ├── service/AuthService.java
│       ├── entity/{User, Role}.java
│       ├── security/{JwtService, JwtAuthFilter, UserDetailsServiceImpl}.java
│       └── config/SecurityConfig.java
│
├── product-service/               # Product catalog + Reviews   :8082
│   └── src/main/java/com/revshop/product/
│       ├── controller/{ProductController, CategoryController}.java
│       ├── service/ProductService.java
│       └── entity/{Product, Category, Review, Rating}.java
│
├── cart-service/                  # Cart + Wishlist             :8083
│   └── src/main/java/com/revshop/cart/
│       ├── controller/CartController.java
│       ├── service/CartService.java
│       └── entity/{Cart, CartItem, Wishlist}.java
│
├── order-service/                 # Order processing            :8084
│   └── src/main/java/com/revshop/order/
│       ├── controller/OrderController.java
│       ├── service/OrderService.java
│       ├── client/{ProductClient, NotificationClient}.java  ← Feign
│       └── entity/{Order, OrderItem}.java
│
├── payment-service/               # Simulated payments          :8085
│   └── src/main/java/com/revshop/payment/
│
├── notification-service/          # Email notifications         :8086
│   └── src/main/java/com/revshop/notification/
│
└── revshop-frontend/              # Angular 17 SPA
    └── src/app/
        ├── components/{navbar, product-card, star-rating}/
        ├── pages/{home, login, register, product-list,
        │         product-detail, cart, wishlist, checkout,
        │         orders, order-tracking, seller-dashboard,
        │         seller-products, seller-orders}/
        ├── services/{auth, product, cart, order}.service.ts
        ├── models/index.ts
        ├── guards/auth.guard.ts
        └── interceptors/jwt.interceptor.ts
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd revshop

# 2. Start everything
docker-compose up --build

# 3. Access the app
#    Frontend     → http://localhost:4200
#    API Gateway  → http://localhost:8080
#    Eureka       → http://localhost:8761  (admin/admin)
#    Config       → http://localhost:8888
```

### Option B — Run Locally

```bash
# Prerequisites: Java 17, Maven, Node 20, MySQL 8

# 1. Start MySQL and run init.sql
mysql -u root -p < init.sql

# 2. Start infrastructure services first
cd config-server  && mvn spring-boot:run &
cd eureka-server  && mvn spring-boot:run &

# 3. Start business services
cd user-service         && mvn spring-boot:run &
cd product-service      && mvn spring-boot:run &
cd cart-service         && mvn spring-boot:run &
cd order-service        && mvn spring-boot:run &
cd payment-service      && mvn spring-boot:run &
cd notification-service && mvn spring-boot:run &

# 4. Start API Gateway last
cd api-gateway && mvn spring-boot:run &

# 5. Start Angular frontend
cd revshop-frontend
npm install
npm start
# → http://localhost:4200
```

---

## 🔑 API Reference

### Authentication  `POST /api/auth/**`

| Method | Endpoint              | Description         | Auth |
|--------|-----------------------|---------------------|------|
| POST   | `/api/auth/register`  | Register buyer/seller | ❌  |
| POST   | `/api/auth/login`     | Login, get JWT token  | ❌  |
| GET    | `/api/auth/profile`   | Get own profile       | ✅  |
| PUT    | `/api/auth/profile`   | Update profile        | ✅  |

**Register payload:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "9876543210",
  "role": "BUYER"       // or "SELLER"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "john@example.com",
  "firstName": "John",
  "role": "ROLE_BUYER"
}
```

### Products  `GET /api/products/**`

| Method | Endpoint                       | Description            | Auth     |
|--------|--------------------------------|------------------------|----------|
| GET    | `/api/products`                | List all (paginated)   | ❌       |
| GET    | `/api/products/{id}`           | Product details        | ❌       |
| GET    | `/api/products/search`         | Filter + search        | ❌       |
| POST   | `/api/products`                | Create product         | SELLER   |
| PUT    | `/api/products/{id}`           | Update product         | SELLER   |
| DELETE | `/api/products/{id}`           | Soft delete            | SELLER   |
| GET    | `/api/products/seller`         | Seller's own products  | SELLER   |
| GET    | `/api/products/seller/low-stock` | Low stock list       | SELLER   |
| GET    | `/api/products/{id}/reviews`   | Product reviews        | ❌       |
| POST   | `/api/products/{id}/reviews`   | Add review             | BUYER    |
| POST   | `/api/products/{id}/rating`    | Rate product (1–5)     | BUYER    |

### Cart  `**/api/cart/**`

| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| GET    | `/api/cart`                 | Get cart            |
| POST   | `/api/cart/items`           | Add item            |
| PUT    | `/api/cart/items/{id}`      | Update quantity     |
| DELETE | `/api/cart/items/{id}`      | Remove item         |
| DELETE | `/api/cart`                 | Clear cart          |
| GET    | `/api/cart/wishlist`        | Get wishlist        |
| POST   | `/api/cart/wishlist`        | Add to wishlist     |
| DELETE | `/api/cart/wishlist/{pid}`  | Remove from wishlist|

### Orders  `/api/orders/**`

| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| POST   | `/api/orders`                    | Place order            |
| GET    | `/api/orders`                    | My orders (buyer)      |
| GET    | `/api/orders/{id}`               | Order details          |
| GET    | `/api/orders/track/{orderNum}`   | Track by order number  |
| PUT    | `/api/orders/{id}/cancel`        | Cancel order           |
| GET    | `/api/orders/seller`             | Seller's orders        |
| PUT    | `/api/orders/seller/{id}/status` | Update order status    |
| GET    | `/api/orders/seller/stats`       | Revenue & stats        |

### Payments  `/api/payments/**`

| Method | Endpoint                       | Description         |
|--------|--------------------------------|---------------------|
| POST   | `/api/payments`                | Initiate payment    |
| GET    | `/api/payments/order/{id}`     | Payment by order    |
| GET    | `/api/payments/my`             | Buyer payment history |
| POST   | `/api/payments/{id}/refund`    | Refund payment      |

---

## 🧩 Key Design Patterns

### JWT Flow
```
Client → POST /api/auth/login → User Service
                              ← JWT Token
Client → GET /api/orders (Bearer <token>)
       → API Gateway validates JWT
       → Forwards X-User-Name, X-User-Role headers
       → Order Service reads headers (no re-validation needed)
```

### OpenFeign Inter-service Communication
```java
// Order Service calls Product Service to decrease stock
@FeignClient(name = "product-service", fallback = ProductClientFallback.class)
public interface ProductClient {
    @PutMapping("/api/products/{id}/stock/decrease")
    void decreaseStock(@PathVariable Long id, @RequestParam int quantity);
}
```

### Circuit Breaker (Resilience4j)
- Configured in `api-gateway/application.yml`
- Each service has its own circuit breaker instance
- Fallback controllers return graceful error responses
- 50% failure rate threshold, 10s wait in open state

### Domain-Driven Design
Each microservice owns its bounded context:
- **User Service** — Identity & Access Management
- **Product Service** — Catalog, Inventory, Reviews
- **Cart Service** — Shopping Cart & Wishlist
- **Order Service** — Order Lifecycle Management
- **Payment Service** — Payment Processing
- **Notification Service** — Email & In-app Notifications

---

## 🗃️ Database Schemas

| Database         | Tables                                  |
|------------------|-----------------------------------------|
| `user_db`        | users, roles, user_roles                |
| `product_db`     | products, categories, reviews, ratings, product_images |
| `cart_db`        | carts, cart_items, wishlists            |
| `order_db`       | orders, order_items                     |
| `payment_db`     | payments                                |
| `notification_db`| notifications                           |

---

## 🌐 Frontend Pages

### Public
| Route            | Description                      |
|------------------|----------------------------------|
| `/`              | Home with categories & products  |
| `/products`      | Product list with filters        |
| `/products/:id`  | Product detail + reviews         |
| `/login`         | Login page                       |
| `/register`      | Register as buyer or seller      |

### Buyer (requires login)
| Route            | Description                      |
|------------------|----------------------------------|
| `/cart`          | Shopping cart                    |
| `/wishlist`      | Saved products                   |
| `/checkout`      | 3-step checkout flow             |
| `/orders`        | Order history                    |
| `/orders/track`  | Real-time order tracking         |

### Seller (requires seller login)
| Route                | Description                  |
|----------------------|------------------------------|
| `/seller/dashboard`  | Stats, revenue, low stock    |
| `/seller/products`   | CRUD product management      |
| `/seller/orders`     | Manage & update orders       |

---

## 🔒 Security Configuration

```yaml
# JWT settings (user-service.yml)
jwt:
  secret: revshop-secret-key-2024-very-long-and-secure-key-for-jwt-signing
  expiration: 86400000   # 24 hours

# Role-based access
ROLE_BUYER:  cart, wishlist, orders, reviews, ratings
ROLE_SELLER: products (CRUD), order management, analytics
```

> ⚠️ **Production**: Change the JWT secret, use environment variables,
> enable HTTPS, and configure proper CORS origins.

---

## 🐳 Docker Services

| Service              | Port  | Image              |
|----------------------|-------|--------------------|
| mysql                | 3306  | mysql:8.0          |
| config-server        | 8888  | revshop/config     |
| eureka-server        | 8761  | revshop/eureka     |
| api-gateway          | 8080  | revshop/gateway    |
| user-service         | 8081  | revshop/user       |
| product-service      | 8082  | revshop/product    |
| cart-service         | 8083  | revshop/cart       |
| order-service        | 8084  | revshop/order      |
| payment-service      | 8085  | revshop/payment    |
| notification-service | 8086  | revshop/notification|
| angular-frontend     | 4200  | revshop/frontend   |

---

## 📦 Technology Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Backend      | Java 17, Spring Boot 3.2, Spring Cloud 2023     |
| Security     | Spring Security, JWT (JJWT 0.12.3)             |
| Database     | MySQL 8.0, Spring Data JPA, Hibernate           |
| Microservices| Eureka, Config Server, API Gateway, Feign       |
| Resilience   | Resilience4j Circuit Breaker                    |
| Docs         | SpringDoc OpenAPI / Swagger UI                  |
| Frontend     | Angular 17, TypeScript, Angular Material Icons  |
| DevOps       | Docker, Docker Compose, Nginx                   |

---

## 📝 Swagger UI

Each service exposes Swagger docs at:
```
http://localhost:8081/swagger-ui.html   # user-service
http://localhost:8082/swagger-ui.html   # product-service
http://localhost:8083/swagger-ui.html   # cart-service
http://localhost:8084/swagger-ui.html   # order-service
http://localhost:8085/swagger-ui.html   # payment-service
```

---

## 🛠️ Development Notes

1. **Startup Order**: MySQL → Config → Eureka → Gateway → Business Services → Frontend
2. **User ID Header**: The API Gateway injects `X-User-Id` (from JWT claims) — update gateway JwtUtil to extract `userId` claim properly.
3. **Email Notifications**: Configure SMTP credentials in `notification-service.yml` or set `SPRING_MAIL_*` environment variables.
4. **Stock Management**: Order service calls product service via Feign. If product service is down, circuit breaker activates fallback.
5. **Seed Products**: After startup, POST to `/api/categories` to create categories, then use seller account to add products.
6. Done
