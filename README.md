# Marketplace — Multivendor E-commerce Platform

A full-stack multivendor marketplace built with **Expo (React Native)** for the client and **Hono + Better Auth + Drizzle ORM + PostgreSQL** for the API.

> **Web** · **iOS** · **Android** — shared codebase with role-based views (Buyer, Vendor, Admin).

---

## Features

### Buyer
- Browse/search products with category filters
- Product detail page with dynamic variant selectors (color, size, etc.)
- Cart — guest and authenticated with seamless guest→user merge on sign-in
- Checkout flow with shipping and coupon code support
- Order history with per-item status tracking
- Product reviews & star ratings
- Wishlist (favorite products)
- Address management (CRUD with defaults)
- In-app messaging with vendors (start conversation from product page)

### Vendor
- Product & variant CRUD with SKU management
- Order management — accept, ship, deliver line items
- Inventory dashboard — low-stock alerts with inline stock updates
- Store profile management (name, slug, description, payout details)
- Messaging — full conversation management with buyers (list, send, auto-polling)
- Payout requests (list earnings, request payouts)
- Analytics dashboard (product/order counts, revenue, growth, low-stock warnings)

### Admin
- Vendor registration verification (approve/reject applications)
- User and vendor management
- Platform settings
- Coupon/promotion CRUD

### Cross-cutting
- Role-based access control (`user` / `vendor` / `admin`)
- Guest session cart (survives device storage)
- Cart merge on sign-in (guest items transfer to user)
- Rich product variants (attributes, price override, stock, SKU)
- Form standardization: all forms use `react-hook-form` + `zod` + `Field` component

---

## Project Structure

```
e-commerce/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle instance + schema registry
│   │   │   └── schema/               # Table definitions (19 tables)
│   │   ├── routes/
│   │   │   ├── admin/                # Admin CRUD (coupons, users, vendors)
│   │   │   ├── user/                 # Buyer routes (profile, cart, orders, reviews, wishlist, addresses, messaging, become-vendor)
│   │   │   ├── vendor/               # Vendor routes (products, variants, orders, inventory, store, messaging, payouts, dashboard)
│   │   │   ├── product/              # Public product & review endpoints
│   │   │   ├── cart/                 # Cart (guest + auth)
│   │   │   └── coupon/               # Coupon validation
│   │   ├── utils/
│   │   │   ├── auth.ts               # Better Auth server config
│   │   │   └── permissions.ts        # Role middleware
│   │   └── index.ts                  # Hono server entry
│   ├── drizzle/                      # Generated SQL migrations (6 increments)
│   └── drizzle.config.ts
│
├── mobile/
│   ├── app/
│   │   ├── (auth)/                   # Sign-in, sign-up, forgot/reset password, verify email
│   │   ├── (user)/                   # Buyer screens (cart, checkout, orders, profile, messages, search)
│   │   ├── (vendor)/                 # Vendor screens (dashboard, products, orders, inventory, messages, analytics, profile, settings)
│   │   └── (admin)/                  # Admin screens (vendors, users, coupons)
│   ├── components/
│   │   ├── ui/                       # RNR primitives (button, card, avatar, input, badge, field, etc.)
│   │   ├── messages/                 # Chat (ChatListItem, MessageBubble, ConversationView, etc.)
│   │   ├── ProductCard.tsx, ReviewForm.tsx, ReviewCard.tsx, StarRating.tsx
│   ├── hooks/                        # Zustand stores (cart, wishlist, auth)
│   ├── lib/                          # API client, theme, utilities
│   └── types/                        # Shared TypeScript types
│
└── README.md
```

---

## Tech Stack

### Frontend
| Layer | Choice |
|-------|--------|
| Framework | React Native (Expo SDK 52+) |
| Routing | Expo Router (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| State | Zustand (persisted via AsyncStorage) |
| Auth Client | Better Auth Expo |
| Icons | Lucide React Native |
| UI Primitives | `@rn-primitives` (tabs, avatar, etc.) |

### Backend
| Layer | Choice |
|-------|--------|
| Runtime | Node.js / Hono |
| Auth | Better Auth (email/password + OAuth) |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Logging | Pino |
| Migrations | Drizzle Kit |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (local or cloud)
- Expo CLI (`npx expo install -g` recommended)

### 1. Clone & Install

```bash
git clone <repo-url>
cd e-commerce
pnpm install
cd backend && pnpm install
cd ../mobile && pnpm install
```

### 2. Environment

Create `backend/.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:8000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

For the mobile app, create `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. Database

```bash
cd backend
pnpm run db:generate
pnpm run db:migrate
pnpm run db:studio   # optional: inspect tables
```

### 4. Run

```bash
# Terminal 1 — Backend (port 8000)
cd backend && pnpm run dev

# Terminal 2 — Frontend (port 8081)
cd mobile && npx expo start
```

---

## API Overview

All routes are prefixed with `/api`.

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products (filterable) |
| GET | `/products/:id` | Product detail with avg rating |
| GET | `/products/:id/reviews` | Reviews with user info |
| GET | `/products/categories` | Category list |
| GET | `/cart` | Cart (auth or X-Session-Token) |
| POST | `/cart/add` | Add item to cart |
| PUT | `/cart/item/:id` | Update quantity |
| DELETE | `/cart/item/:id` | Remove item |
| DELETE | `/cart/clear` | Clear cart |
| GET | `/coupons/validate` | Coupon validation |

### Auth (user)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/user/profile` | Read/update profile info |
| GET/POST/PUT/DELETE | `/user/addresses` | Address CRUD with defaults |
| GET | `/user/orders` | My orders |
| GET | `/user/orders/:id` | Order detail |
| POST | `/user/orders` | Place order |
| GET | `/user/wishlist` | My wishlist |
| GET | `/user/wishlist/check` | Check if wishlisted |
| POST | `/user/wishlist/:productId` | Add to wishlist |
| DELETE | `/user/wishlist/:productId` | Remove from wishlist |
| POST | `/user/reviews/:productId` | Create review |
| PUT | `/user/reviews/:id` | Update review |
| DELETE | `/user/reviews/:id` | Delete review |
| GET | `/user/messaging` | List conversations |
| GET | `/user/messaging/:id` | Conversation detail with messages |
| POST | `/user/messaging/send` | Send message |
| POST | `/user/messaging/start` | Start new conversation with vendor |
| POST | `/user/become-vendor` | Apply as vendor |

### Auth (vendor)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/vendor/store` | Read/update store settings |
| GET/PUT | `/vendor/profile` | Read/update personal profile |
| CRUD | `/vendor/products` | Product management |
| CRUD | `/vendor/variants` | Variant management |
| GET | `/vendor/orders` | Orders containing my products |
| PUT | `/vendor/orders/items/:id/status` | Update item status |
| GET | `/vendor/inventory/low-stock` | Below-threshold products |
| PUT | `/vendor/inventory/products/:id/stock` | Update product stock |
| PUT | `/vendor/inventory/variants/:id/stock` | Update variant stock |
| GET | `/vendor/messaging` | List buyer conversations |
| GET | `/vendor/messaging/:id` | Conversation detail with messages |
| POST | `/vendor/messaging/send` | Send message |
| GET/POST | `/vendor/payouts` | List / request payouts |
| GET | `/vendor/dashboard/stats` | Aggregated dashboard stats |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| CRUD | `/admin/coupons` | Coupon management |
| CRUD | `/admin/users` | User management |
| GET | `/admin/vendors` | List vendor applications |
| PUT | `/admin/vendors/:id/approve` | Approve vendor |
| PUT | `/admin/vendors/:id/reject` | Reject vendor |

---

## Schema (19 tables)

`user` · `session` · `account` · `verification` · `profile` · `vendor` · `product` · `product_variant` · `category` · `cart` · `cart_item` · `order` · `order_item` · `address` · `review` · `coupon` · `wishlist_item` · `conversation` · `message` · `payout`

---

## Development Scripts

### Backend

```bash
pnpm run dev            # Dev server with hot reload
pnpm run build          # TypeScript compilation
pnpm run start          # Production server
pnpm run db:generate    # Generate SQL migration from schema
pnpm run db:migrate     # Apply pending migrations
pnpm run db:push        # Push schema (dev only)
pnpm run db:studio      # Drizzle Studio GUI
```

### Frontend

```bash
npx expo start              # Metro dev server
npx expo start --tunnel     # Expose for physical devices
npx expo run:android        # Native Android build
npx expo run:ios            # Native iOS build
```

---

## Roadmap

- [x] Product variants & SKU
- [x] Guest cart + cart merge
- [x] Reviews & ratings
- [x] Coupon / promo codes
- [x] Wishlist
- [x] Order lifecycle (multi-vendor status machine)
- [x] Inventory alerts (low stock)
- [x] Vendor store & profile management
- [x] Vendor messaging (conversations with buyers)
- [x] Vendor payouts
- [x] Vendor analytics dashboard
- [x] User messaging (in-app conversations with vendors)
- [x] Address CRUD
- [x] Vendor registration & approval flow
- [x] Form standardization (RHF + zod + Field component)
- [ ] **Payment gateway** (Stripe / Paystack — TBD based on region)
- [ ] **Post-purchase notifications** (email / push)
- [ ] Product media upload (S3 / Supabase Storage)
- [ ] Admin coupon management UI
- [ ] Admin analytics dashboard

---

## Troubleshooting

### Social sign-in 500 / Drizzle tracing error
Disable `verification` config in `backend/src/utils/auth.ts` or use a compatible Drizzle version.

### Expo dev origin errors
Ensure `exp://*` is in `trustedOrigins` in the auth config and backend binds to `0.0.0.0`.

### Migration conflicts (enum already exists)
```sql
ALTER TABLE vendor DROP COLUMN IF EXISTS is_verified;
DROP TYPE IF EXISTS vendor_status;
```
Then re-run migrations.

---

## License

MIT
