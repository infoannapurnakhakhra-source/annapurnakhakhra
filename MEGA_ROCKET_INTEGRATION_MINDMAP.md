# Mega Rocket Integration — Clear Mind Map

This mind map explains how to integrate Mega Rocket OTP/email verification and custom checkout into your existing Next.js + Shopify cart flow. It's organised so you can implement step-by-step without confusion.

---

## 1. Goal (one line)
- Add email OTP verification before checkout and create Shopify orders server-side while keeping your existing cart functionality intact.

---

## 2. High-level Flow
- Cart (existing) → Email Verification → Customer Details → Create Order (Shopify) → Update Cart

Visual (text):
Cart Page
  └─> Checkout UI
      ├─> Ask for Email
      │   ├─> call `check-verified`
      │   │   └─ If verified → skip OTP
      │   └─> else → `send-otp` → user enters OTP → `verify-otp`
      └─> After verified → show Address form → `custom-checkout`

---

## 3. Key New API Endpoints (server)
- `POST /api/send-otp` — send OTP to email (rate-limited)
- `POST /api/verify-otp` — verify OTP, mark email verified
- `POST /api/check-verified` — quick check if email verified within 24h
- `POST /api/custom-checkout` — build Shopify order from cart + return order URL

Notes:
- Keep CORS headers where needed for client calls.
- Return clear statuses and messages for client UI.

---

## 4. Database Models (new files)
- `Otp`
  - fields: `email`, `otp`, `created_at`
  - TTL: 5 minutes (expireAfterSeconds)
- `VerifiedEmail`
  - fields: `email`, `shop`, `verified_at`
  - used to skip OTP for recent verifications (24h window)
- `ShopToken`
  - fields: `shop`, `access_token`, `shop_name`, `email`

Where to create: `lib/models/*.js` (match existing project structure).

---

## 5. Backend Helpers (where to place functions)
Option A (recommended): Add functions to existing `lib/db.js` to avoid duplicate connection logic.
Option B: Create `lib/megarocket.js` and import `lib/mongodb.js`.

Essential functions:
- `generateOTP()`
- `storeOTPInDatabase(email, otp, shop)`
- `verifyOTP(email, otp, shop)`
- `checkEmailVerified(email, shop)`
- `getShopToken(shop)`

---

## 6. Cart → Shopify Mapping (concrete)
- Cart item properties you must have:
  - `variant_id` (or map from `shopify_variant_id`)
  - `quantity`
  - `price`
- Build `line_items` for Shopify from cart items:
  - { variant_id, quantity, price: price.toString() }
- Include cart metadata in order:
  - `note`: include `Cart ID: <shopify_cart_id>`
  - `note_attributes`: `{ customer_id, cart_id }`
- After successful Shopify order creation, update your cart record:
  - `status: 'completed'`, `order_id`, `completed_at`

---

## 7. UI Changes (minimal, clear)
- Checkout component changes (client-side):
  1. Add an email input at checkout entry.
  2. On email change, call `check-verified`.
  3. If not verified: button `Send OTP` → calls `send-otp`.
  4. Show OTP input, submit to `verify-otp`.
  5. On success show address/payment form and enable `Place Order`.
  6. Place Order calls `custom-checkout` with `lineItems`, `email`, `name`, `address`, `customerId`, `cartId`.
- UX tips:
  - Show concise inline errors (e.g., "OTP sent — check email" or "OTP expired, resend").
  - Disable repeated `Send OTP` for 5 minutes.

---

## 8. Cart API Adjustments (server)
- `GET /api/cart/[cartId]` must include:
  - `shopifyCartId` (map from your DB field)
  - `items[].variant_id` (map from `shopify_variant_id`)
- `PATCH /api/cart/[cartId]` should accept: `{ status, order_id, completed_at }` to mark cart completed.

Why: `custom-checkout` needs cart data and you must persist order association.

---

## 9. Env & Security
- Required env vars:
  - `MONGODB_URI`, `MAIL_USER`, `MAIL_PASS`
  - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SHOP_DOMAIN`
- Safety:
  - Rate-limit `send-otp` and require short TTLs.
  - Never log credentials or OTPs in production.
  - For dev, allow logging OTP to console if SMTP unavailable.

---

## 10. Failure Modes & Fallbacks
- If DB or mail fails → show clear message and optionally offer to continue with default checkout (if you want fallback).
- If Shopify fails during order creation → return error and keep cart untouched.
- If `verify-otp` fails → allow user to resend after the cooldown.

---

## 11. Testing Checklist (practical steps)
- [ ] Confirm `MONGODB_URI` connects locally or to a test DB.
- [ ] `send-otp` returns success and sends/logs OTP.
- [ ] `verify-otp` marks email verified and `check-verified` returns true.
- [ ] Cart GET returns `shopifyCartId` and `variant_id` for items.
- [ ] `custom-checkout` creates a Shopify order (use test shop) and returns `order_status_url`.
- [ ] Cart PATCH updates status to `completed` and stores `order_id`.
- [ ] End-to-end: user can go from Email -> OTP -> create order -> cart updated.

---

## 12. Minimal Implementation Steps (one-liners)
1. Add models in `lib/models/`.
2. Add helper functions into `lib/db.js` (or new `lib/megarocket.js`).
3. Create API routes in `app/api/*.js` as described.
4. Update `GET /api/cart/[cartId]` and `PATCH /api/cart/[cartId]`.
5. Update checkout UI to include email/OTP flow and call `custom-checkout`.
6. Test end-to-end.

---

## 13. Next Steps (if you want me to continue)
- I can generate the exact `app/api` route files and model files to drop into your repo.
- I can modify your checkout UI component and `api/cart` routes based on your existing code.

---

*Concise, actionable, and aligned with your current cart system. If you want, I can now create the actual files and patches tailored to your repo (I can merge OTP helpers into your existing `lib/db.js` or keep them separate — tell me which).*