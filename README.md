# 🛒 Retail Ordering Website — Full-Stack .NET Case 1

> Angular 17 · ASP.NET Core 8 · MS SQL Server · EF Core 8 · Clean Architecture

A modern full-stack retail ordering platform that allows customers to browse products, manage carts, place orders, apply promotions, and track order history seamlessly.

---

# 👥 Team Members

| Member | Name            | Role                        | Area                                  |
| ------ | --------------- | --------------------------- | ------------------------------------- |
| M1     | Neha R Nala     | Project Manager & Architect | Frontend Features + SRS + Git + Setup |
| M2     | Rehmat Tadpatri | Frontend Engineer           | Frontend Core                         |
| M3     | Samarth Bhutnal | Database Engineer           | Domain & Infrastructure               |
| M4     | Deepak Misal    | Backend API Engineer        | API & WebAPI Layer                    |
| M5     | Pavan Kallur    | QA & Integration Engineer   | Integration & Testing                 |

---

# 📋 Project Overview

Retail Ordering Website is a scalable retail ordering application developed using **Angular 17**, **ASP.NET Core 8 Web API**, and **MS SQL Server** following **Clean Architecture** principles.

The application enables users to:

* Browse products
* Search and filter items
* Add products to cart
* Place orders
* Apply promotions and loyalty points
* View order history
* Reorder previous purchases

Products available in the platform include:

* 🍕 Pizza
* 🥤 Cold Drinks
* 🍞 Breads

---

# 🚀 Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Frontend         | Angular 17 (Standalone Components) |
| Backend API      | ASP.NET Core 8 Web API             |
| Database         | MS SQL Server + EF Core 8          |
| Architecture     | Clean Architecture                 |
| Authentication   | JWT Bearer Authentication          |
| Messaging        | MediatR                            |
| Validation       | FluentValidation                   |
| Mapping          | AutoMapper                         |
| State Management | NgRx                               |
| Email Service    | MailKit                            |
| Testing          | xUnit, Swagger, Postman            |

---

# 🏗️ Clean Architecture

```text
Angular Frontend
        ↓
ASP.NET Core WebAPI
        ↓
Application Layer
        ↓
Domain Layer
        ↓
Infrastructure Layer
```

## Layer Responsibilities

### Domain Layer

Contains:

* Entities
* Value Objects
* Domain Events
* Core Business Rules

### Application Layer

Contains:

* CQRS Commands & Queries
* DTOs
* Validators
* MediatR Handlers

### Infrastructure Layer

Contains:

* EF Core DbContext
* Repository Implementations
* Email Services
* Database Migrations

### WebAPI Layer

Contains:

* Controllers
* Middleware
* Authentication
* Swagger Configuration

---

# ✨ Features

## 👤 Authentication & Authorization

* User Registration
* JWT Login Authentication
* Role-based Authorization
* Protected Routes

## 🛍️ Product Features

* Product Browsing
* Product Details
* Search & Filtering
* Category & Brand Filtering

## 🛒 Cart & Orders

* Add to Cart
* Update Quantity
* Remove Items
* Place Orders
* Order History
* Reorder Previous Orders

## 🎁 Promotions

* Coupon Validation
* Loyalty Points
* Seasonal Offers

## 🛠️ Admin Features

* Inventory Management
* Product Management
* Order Status Updates
* Promotion Management

---

# 📄 Software Requirements Specification (SRS)

## Primary Actors

| Actor               | Description                         |
| ------------------- | ----------------------------------- |
| Guest User          | Browse products and product details |
| Registered Customer | Place orders and manage cart        |
| Admin / Staff       | Manage inventory and promotions     |
| System              | Sends emails and updates inventory  |

## Core Use Cases

1. Browse Products
2. Manage Cart & Place Orders
3. Order Confirmation & Email Notification
4. View Order History & Reorder
5. Apply Promotions & Loyalty Points

---

# 🌐 API Endpoint Reference

## Authentication

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/auth/register` |
| POST   | `/api/auth/login`    |
| POST   | `/api/auth/logout`   |

## Products

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/products`      |
| GET    | `/api/products/{id}` |
| POST   | `/api/products`      |
| PUT    | `/api/products/{id}` |
| DELETE | `/api/products/{id}` |

## Cart & Orders

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/api/cart`                |
| POST   | `/api/cart/items`          |
| PATCH  | `/api/cart/items/{id}`     |
| DELETE | `/api/cart/items/{id}`     |
| POST   | `/api/orders`              |
| GET    | `/api/orders`              |
| GET    | `/api/orders/{id}`         |
| POST   | `/api/orders/{id}/reorder` |

---

# 📂 Folder Structure

```text
RetailOrdering/
│
├── RetailOrdering.Domain
├── RetailOrdering.Application
├── RetailOrdering.Infrastructure
├── RetailOrdering.WebAPI
│
└── retail-ordering-ui
```

---

# ⚙️ Backend Setup (.NET 8)

## Clone Repository

```bash
git clone https://github.com/your-username/retail-ordering-website.git
cd retail-ordering-website
```

## Restore Packages

```bash
dotnet restore
```

## Apply Migrations

```bash
dotnet ef database update
```

## Run API

```bash
dotnet run
```

---

# 🎨 Frontend Setup (Angular 17)

## Install Dependencies

```bash
npm install
```

## Run Angular Application

```bash
ng serve
```

Frontend runs on:

```text
http://localhost:4200
```

---

# 🔀 Git Branching Strategy

| Branch    | Purpose               |
| --------- | --------------------- |
| main      | Production-ready code |
| develop   | Integration branch    |
| feature/* | Feature development   |
| bugfix/*  | Bug fixes             |
| hotfix/*  | Production fixes      |

---

# 📝 Commit Convention

```text
type(scope): message
```

### Examples

```text
feat(orders): add place-order endpoint
fix(cart): resolve quantity overflow
docs(readme): update documentation
```

---

# 🧪 Testing

Testing tools used:

* xUnit
* Swagger
* Postman

### Test Coverage

* API Testing
* Unit Testing
* Integration Testing
* Authentication Testing
* End-to-End Order Flow Testing

---

# 🌱 Seed Data

The database includes sample data for:

* Pizza
* Cold Drinks
* Breads
* Categories
* Brands
* Promotions

---

# 📖 Future Enhancements

* Online Payment Gateway
* Docker Deployment
* CI/CD Pipeline
* Mobile Application
* Real-time Order Tracking
* AI-based Product Recommendations

---


# ⭐ Acknowledgements

Special thanks to all team members for contributing to the successful development of this full-stack retail ordering platform.
