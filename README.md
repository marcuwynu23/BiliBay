<div align="center">

# BiliBay

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.0+-000000.svg)](https://expressjs.com/)
[![PNPM](https://img.shields.io/badge/PNPM-8+-F69220.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Latest-EF4444.svg)](https://turbo.build/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **Filipino-inspired online marketplace** that connects **buyers**, **sellers**, **couriers**, and **deliverers** in a complete e-commerce ecosystem.
**BiliBay** supports multiple user roles with role-based dashboards, product management, order processing, and a complete delivery workflow from purchase to doorstep delivery.

</div>

---

## About BiliBay

**BiliBay** is a comprehensive online marketplace that connects multiple stakeholders in the e-commerce ecosystem:

- **Buyers**: Browse products, manage cart, place orders, track deliveries
- **Sellers**: List products, manage inventory, process orders, track sales
- **Couriers**: Handle inter-city shipping and logistics
- **Deliverers**: Manage local area deliveries and final handoff
- **Admins**: Oversee platform operations, user management, and analytics

The platform features a complete order fulfillment workflow with role-based access control, real-time order tracking, and integrated payment processing.

## How BiliBay Works

```mermaid
sequenceDiagram
    participant B as Buyer
    participant S as Seller
    participant C as Courier
    participant D as Deliverer
    participant A as Admin
    participant API as BiliBay API
    participant DB as Database

    Note over B,DB: User Registration & Authentication
    B->>API: Register as Buyer
    S->>API: Register as Seller
    C->>API: Register as Courier
    D->>API: Register as Deliverer
    API->>DB: Store user profiles
    API-->>B: Account created
    API-->>S: Account created
    API-->>C: Account created
    API-->>D: Account created

    Note over B,DB: Product Management
    S->>API: Create product listing
    API->>DB: Store product data
    S->>API: Upload product images
    API->>DB: Store image references
    API-->>S: Product listed successfully

    Note over B,DB: Shopping & Order Creation
    B->>API: Browse products
    API->>DB: Fetch available products
    API-->>B: Return product listings
    B->>API: Add items to cart
    API->>DB: Store cart items
    B->>API: Place order with shipping address
    API->>DB: Create order record
    API->>DB: Update product stock
    API-->>B: Order confirmation
    API-->>S: New order notification

    Note over B,DB: Order Processing
    S->>API: View pending orders
    API->>DB: Fetch seller's orders
    API-->>S: Return order list
    S->>API: Mark order as processing
    API->>DB: Update order status
    S->>API: Assign courier for shipping
    API->>DB: Assign courier to order
    API-->>C: Order assignment notification

    Note over B,DB: Shipping & Logistics
    C->>API: View assigned orders
    API->>DB: Fetch courier's orders
    API-->>C: Return assigned orders
    C->>API: Mark order as shipped
    C->>API: Assign local deliverer
    API->>DB: Update order status & assign deliverer
    API-->>D: Delivery assignment notification
    API-->>B: Order shipped notification

    Note over B,DB: Final Delivery
    D->>API: View assigned deliveries
    API->>DB: Fetch deliverer's orders
    API-->>D: Return delivery list
    D->>API: Mark order as delivered (with proof)
    API->>DB: Update order status & delivery evidence
    API-->>B: Order delivered notification
    API-->>S: Order completed notification

    Note over B,DB: Admin Oversight
    A->>API: View platform analytics
    API->>DB: Fetch system metrics
    API-->>A: Return dashboard data
    A->>API: Manage users & orders
    API->>DB: Update system data
    API-->>A: Management actions completed
```

---

## User Roles & Capabilities

### Buyer Features

- **Product Discovery**: Browse and search products by category
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Management**: Place orders, track status, view history
- **Payment Options**: Cash on Delivery (COD) or Bank Transfer
- **Profile Management**: Update personal information and addresses

### Seller Features

- **Product Management**: Create, edit, and manage product listings
- **Inventory Control**: Track stock levels and product variants
- **Order Processing**: View and process incoming orders
- **Sales Analytics**: Monitor sales performance and metrics
- **Courier Assignment**: Assign orders to courier services

### Courier Features

- **Order Assignment**: Receive orders for inter-city shipping
- **Logistics Management**: Handle shipping and tracking
- **Deliverer Coordination**: Assign orders to local deliverers
- **Status Updates**: Update shipping status and tracking info

### Deliverer Features

- **Local Delivery**: Handle final mile delivery in local areas
- **Proof of Delivery**: Upload delivery evidence and photos
- **Route Optimization**: Manage delivery schedules efficiently
- **Customer Interaction**: Direct communication with buyers

### Admin Features

- **User Management**: Oversee all user accounts and roles
- **Platform Analytics**: Monitor system performance and metrics
- **Order Oversight**: Manage and resolve order issues
- **Category Management**: Organize product categories
- **Payment Monitoring**: Track payment transactions and status

---

## Getting Started

Ready to explore BiliBay? Check out our [Contributing Guide](CONTRIBUTING.md) for detailed setup instructions, development workflow, and technical documentation.

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

## License

MIT License © 2025 marcuwynu23
