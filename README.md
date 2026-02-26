# Multivendor E‑commerce Platform

A modern multivendor e‑commerce platform built with **React Native (Expo)** for the mobile/web client and **Hono + Better Auth + Drizzle ORM + PostgreSQL** for the backend.

---

## 🏗️ Architecture Overview

### Frontend (Mobile/Web)

- **Framework**: React Native with Expo (runs on iOS, Android, and Web)
- **Styling**: NativeWind (Tailwind CSS for RN)
- **State**: Zustand for auth and global state
- **Navigation**: Expo Router with file‑based routing
- **Auth**: Better Auth Expo client with SecureStore session storage
- **Icons**: Lucide React Native

### Backend

- **Runtime**: Node.js with Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (email/password + OAuth: Google, Apple, Discord)
- **Validation**: Zod
- **Logging**: Pino with pretty printing
- **Migrations**: Drizzle Kit

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (local or cloud)
- Expo CLI (`npx expo install -g`)

### 1. Clone & Install

```bash
git clone <repo-url>
cd e-commerce
pnpm install
cd mobile && pnpm install
cd ../backend && pnpm install
```

### 2. Environment

Create `.env` in `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
BETTER_AUTH_EMAIL=noreply@yourapp.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### 3. Database Setup

```bash
cd backend
pnpm run db:generate
pnpm run db:migrate
```

### 4. Run Development Servers

```bash
# Backend (port 8000)
cd backend && pnpm run dev

# Frontend (port 8081)
cd mobile && npx expo start --tunnel
```

---

## 📁 Project Structure

```
e-commerce/
├─ backend/
│  ├─ src/
│  │  ├─ db/
│  │  │  ├─ index.ts          # Drizzle instance & schema export
│  │  │  └─ schema/           # Table definitions
│  │  ├─ utils/
│  │  │  └─ auth.ts           # Better Auth config
│  │  └─ index.ts             # Hono server + middleware
│  ├─ drizzle.config.ts        # Drizzle Kit config
│  └─ drizzle/                # Generated migrations
├─ mobile/
│  ├─ app/
│  │  ├─ (auth)/             # Auth screens (sign‑in, sign‑up)
│  │  ├─ (admin)/             # Admin screens
│  │  ├─ (vendor)/             # Vendor screens
│  │  ├─ (user)/             # User screens
│  │  └─ _layout.tsx         # Root layout
│  ├─ lib/
│  │  ├─ auth-client.ts       # Better Auth Expo client
│  │  ├─ authStore.ts        # Zustand auth store
│  │  └─ money.ts            # Currency helpers
│  └─ package.json
└─ README.md
```

---

## 🔐 Authentication

- **Email/Password** with Better Auth sessions
- **Social OAuth**: Google, Apple, Discord
- **Roles**: `user`, `vendor`, `admin`
- **Session storage**: SecureStore on native, cookies on web
- **Redirects**: Role‑based after sign‑in

---

## 🛒 E‑commerce Features (Schema)

### Core Entities

- **Users**: Auth + profile + roles
- **Vendors**: Store profile, verification status, payout details
- **Products**: Linked to vendors + categories
- **Orders & OrderItems**: Multi‑vendor per order
- **Addresses**: Shipping/billing per user
- **Categories**: Hierarchical product categories

### Relationships

- `user` 1→1 `profile`
- `user` 1→1 `vendor` (if role=vendor)
- `vendor` 1→N `product`
- `user` 1→N `order`
- `order` 1→N `orderItem` (each with `vendorId`)

---

## 🛠️ Development Scripts

### Backend

```bash
pnpm run dev          # Start dev server
pnpm run build        # TypeScript build
pnpm run start        # Run production build
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Run migrations
pnpm run db:push      # Push schema changes (dev)
pnpm run db:studio    # Open Drizzle Studio
```

### Frontend

```bash
npx expo start        # Start Metro dev server
npx expo start --tunnel  # Expose via tunnel (for mobile devices)
npx expo run:android     # Run on Android
npx expo run:ios         # Run on iOS
```

---

## 📦 Key Dependencies

### Backend

- `better-auth` – Auth core
- `@better-auth/expo` – Expo integration
- `drizzle-orm` – ORM
- `drizzle-kit` – Migrations
- `hono` – Web framework
- `pg` – PostgreSQL driver
- `zod` – Validation
- `pino` – Logging

### Frontend

- `expo` – React Native toolchain
- `expo-router` – File‑based routing
- `native-base` or `nativewind` – UI/styling
- `zustand` – State
- `lucide-react-native` – Icons
- `@better-auth/expo` – Auth client

---

## 🔧 Configuration Notes

- **CORS/Origins**: Backend trusts `exp://*` for Expo dev and `mobile://` for production builds.
- **Dynamic baseURL**: Auth client auto‑detects LAN IP for native devices.
- **Environment**: Use `.env.local` for secrets; never commit.

---

## 🧪 Testing & Debugging

- **Better Auth debug**: Enabled in non‑production (`debug: true`).
- **Database**: Use `pnpm run db:studio` to inspect tables.
- **Logs**: Backend logs via Pino; frontend via Expo Metro.

---

## 📈 Next Steps / TODOs

- [ ] Connect sign‑up screen to backend API
- [ ] Implement vendor onboarding flow
- [ ] Add product upload with images (S3/Supabase Storage)
- [ ] Build checkout flow with multi‑vendor cart
- [ ] Add order status tracking
- [ ] Admin dashboard for vendor verification
- [ ] Push notifications (Expo)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a PR with clear description

---

## 📄 License

MIT License

---

## 🆘 Troubleshooting

### Social sign‑in 500 / Drizzle tracing error

- Ensure `verification` config in `backend/src/utils/auth.ts` is disabled or use a compatible Drizzle version.
- Restart backend after config changes.

### Expo dev origin errors

- Ensure `exp://*` origins are in `trustedOrigins`.
- Use `pnpm run dev` on backend bound to `0.0.0.0`.

### Migration conflicts (enum already exists)

- Drop dependent column first, then enum:
  ```sql
  ALTER TABLE vendor DROP COLUMN IF EXISTS is_verified;
  DROP TYPE IF EXISTS vendor_status;
  ```
- Then re‑run migrations.

---
