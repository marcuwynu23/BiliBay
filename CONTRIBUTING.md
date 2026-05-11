# Contributing to BiliBay

Thank you for your interest in contributing to BiliBay! This guide will help you get started with development, testing, and contributing to the project.

## Project Structure

```
bilibay/
├── apps/
│   ├── frontend/        # Buyer & Seller web app (React + Vite)
│   └── backend/         # REST API backend (Node.js + Express)
├── packages/
│   └── ui/              # Shared React UI component library
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Workspaces

- **Frontend** (`apps/frontend`)
  - React + TypeScript + Vite
  - Uses UI components from `@bilibay/ui`
  - Buyer & seller dashboards, product browsing, auth UI

- **Backend** (`apps/backend`)
  - Node.js + Express + TypeScript
  - API routes for users, products, orders, auth

- **UI Library** (`packages/ui`)
  - Shared React components: `Page`, `Button`, `Card`, `Table`, etc.
  - Reused across all BiliBay apps

## Getting Started

### Prerequisites

- Node.js >= 20
- PNPM >= 8
- Turborepo (via devDependencies)

### Install all dependencies

```bash
pnpm install
```

## Development

Run everything (frontend + backend + ui) in parallel:

```bash
pnpm dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

## Frontend Setup

```bash
cd apps/frontend
pnpm dev
```

### Vite Proxy for API

Allows calling `/api/...` without CORS issues:

```ts
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## Backend Setup

```bash
cd apps/backend
pnpm dev
```

Default endpoints:

```
GET /api/users
GET /api/products
POST /api/auth/login
POST /api/orders
```

## UI Component Library

```bash
cd packages/ui
pnpm build
pnpm dev
```

Exports components like:

- `<Page />`
- `<Button />`
- `<Card />`
- `<Table />`

## API Structure (Example)

```
apps/backend/src/api/
├── auth/
│   └── login.ts
├── users/
│   └── routes.ts
├── products/
│   └── routes.ts
└── orders/
    └── routes.ts
```

### Example Route

```ts
router.get("/users", async (req, res) => {
  const users = await db.user.findMany();
  res.json(users);
});
```

## Example Usage (Frontend + UI + API)

```tsx
import {Page, Table} from "@bilibay/ui";
import {useEffect, useState} from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  return (
    <Page className="p-6">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <Table
        items={users}
        emptyMessage="No users found."
        columns={[
          {header: "ID", render: (u) => u.id},
          {header: "Name", render: (u) => u.name},
        ]}
      />
    </Page>
  );
}
```

## Build for Production

```bash
pnpm build
```

Outputs:

- `apps/frontend/dist/`
- `apps/backend/dist/`
- `packages/ui/dist/`

## Linting

```bash
pnpm lint
```

## Testing

```bash
pnpm test
```

## Contributing Guidelines

- Use feature branches
- Update UI types + components when needed
- Ensure tests and lint pass before PR
- Follow the existing code style and conventions
- Write meaningful commit messages
- Update documentation when adding new features

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your branch: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Architecture Guidelines

- Follow the monorepo structure
- Keep shared components in the `packages/ui` workspace
- Use proper separation of concerns between frontend and backend
- Implement proper error handling and validation
- Use TypeScript interfaces for data models

## Need Help?

If you have questions or need help with development, please:

1. Check existing issues and discussions
2. Create a new issue with detailed information
3. Join our community discussions

Thank you for contributing to BiliBay!
