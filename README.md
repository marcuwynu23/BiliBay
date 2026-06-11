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
graph TD
    A[User Registration] --> B{User Role}
    B -->|Buyer| C[Browse Products]
    B -->|Seller| D[List Products]
    B -->|Courier| E[Wait for Orders]
    B -->|Deliverer| F[Wait for Deliveries]
    B -->|Admin| G[Platform Management]

    C --> H[Add to Cart]
    H --> I[Place Order]
    I --> J[Order Created]

    D --> K[Product Listed]
    K --> L[Receive Order]
    L --> M[Process Order]
    M --> N[Assign Courier]

    J --> O[Seller Processing]
    O --> P[Courier Pickup]
    P --> Q[Inter-city Shipping]
    Q --> R[Assign Deliverer]
    R --> S[Local Delivery]
    S --> T[Order Delivered]

    E --> P
    F --> S
    G --> U[Monitor All Activities]

    T --> V[Order Complete]
    V --> W[Payment Settlement]
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

- **Frontend:** [http://localhost:5173](http://localhost:5000)
- **Backend:** [http://localhost:4000](http://localhost:4000)

---

## License

MIT License © 2025 marcuwynu23
