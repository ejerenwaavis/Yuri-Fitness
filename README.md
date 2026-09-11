# Yuri Fitness App

A full-stack cross-platform fitness tracking application built with a monorepo architecture targeting Web, PWA, and mobile environments.

## Architecture

This is an npm workspace monorepo:
- `apps/web`: React 18, Vite, Tailwind CSS, TanStack Query, `react-i18next`
- `apps/api`: Node.js, Express, Mongoose (MongoDB Atlas), Cloudinary video streaming, JWT auth, Multer
- `packages/shared`: Shared TypeScript interfaces, theming configuration, and validation types
- `public_html`: Top-level production bundle directory for Namecheap / cPanel Passenger deployment

---

## Live Deployment
- **Staging / Production URL**: [https://yurifitness.aceddivision.com](https://yurifitness.aceddivision.com)
- **Node.js Engine**: CloudLinux Passenger Node 22 selector

---

## Authentication & Mobile Architecture Report

### Current Live Auth Methods
1. **Google OAuth 2.0 (One-Tap & Popup)**:
   - Web Client ID: `730691495819-1grpk8k8d7efba30n1vtdvicmkvk41jr.apps.googleusercontent.com`
   - Verified on backend via `google-auth-library`.
   - Generates persistent JWT token with role claims.
2. **Email & Password Authentication**:
   - Secure registration (`POST /auth/register`) with `bcryptjs` password hashing (salt rounds: 10).
   - Direct login (`POST /auth/login`) issuing JWT session token.
3. **Role-Based Access Control (RBAC)**:
   - `role: 'user' | 'admin'`.
   - Default administrator: `ejerenwaavis@gmail.com` and any addresses defined in `ADMIN_EMAILS`.
   - Server-side middleware (`authenticateToken`, `requireAdmin`) strictly rejects unauthorized mutations with `403 Forbidden`.

### Requirements for Phase 4 (Capacitor iOS & Android Native App)
> [!IMPORTANT]
> Web Google One-Tap / GIS popup relies on browser cookies and window popups that do not function cleanly inside a native mobile WebView wrapper.
> To support Google Sign-In natively in Capacitor:
> 1. Install `@codetrix-studio/capacitor-google-auth` or `@capacitor-community/google-auth`.
> 2. Create separate **Android** and **iOS** OAuth 2.0 Client IDs in the Google Cloud Console:
>    - Android requires SHA-1 fingerprint and package name (`com.yurifitness.app`).
>    - iOS requires iOS Bundle Identifier (`com.yurifitness.app`) and custom URL scheme (`com.googleusercontent.apps.<client-id>`).
> 3. Native app passes the returned ID token directly to `POST /auth/google` on `yurifitness.aceddivision.com`, ensuring seamless backend re-use with zero changes to existing server models.

---

## Phase Status & Roadmap

### Phase 0 & 1: Core Scaffold (Complete ✅)
- [x] Monorepo structure with `@yuri/shared`, `@yuri/api`, `@yuri/web`.
- [x] Neon cyberpunk / minimal theme system (`#7CFF3D` neon green, dark surfaces).
- [x] PWA offline support with service worker and custom install prompt.
- [x] Multi-lingual i18n support (Spanish `es` as first-class citizen, English `en`).
- [x] Namecheap cPanel sub-domain deployment with CloudLinux Node.js Passenger.

### Phase 2: Feature Depth & RBAC (Complete ✅)
- [x] **RBAC for Video Uploads**:
  - `User.role` schema field (`user` | `admin`).
  - Auto-admin assignment for `ejerenwaavis@gmail.com`.
  - Backend `requireAdmin` middleware enforcing `403 Forbidden` on upload/create/delete routes.
  - Client-side upload affordance rendered exclusively for admins.
- [x] **Full-Loop Exercise Library**:
  - Cloudinary video upload streaming directly into `yuri-fitness` folder.
  - Video player modal with playback controls and step-by-step form cues.
  - Initial seed data with video guides across Chest, Back, Legs, Shoulders.
- [x] **Independent Weekly Rings**:
  - Minutes, Exercises, Sets, and Max Weight calculate against independent targets.
  - Distinct visual ring fills and percentages.
- [x] **Full-Loop Body Measurements & Live BMI**:
  - Editable modal to record height, weight, and circumferences (neck, shoulders, chest, etc.).
  - Metric (`cm`/`kg`) and Imperial (`in`/`lbs`) unit support.
  - Live calculated BMI gauge with underweight, normal, overweight, and obese thresholds.
  - Dated measurement snapshots history in MongoDB Atlas.
- [x] **Full-Loop Workout Logging**:
  - Quick-log "+" modal to save date, duration, and exercise breakdown.
  - Workout history connected to real `WorkoutSession` documents.
  - Detailed session breakdown modal with volume totals.
- [x] **Dual Authentication Flow**:
  - Email/Password registration and login.
  - Google Sign-In with polished branding.

### Phase 3: Monetization & Community (Next Phase ⏳)
- [ ] Stripe Subscription checkout and webhook processing for premium gating.
- [ ] User profile photo uploads and social sharing.

### Phase 4: Native Mobile Wrappers (Future Phase ⏳)
- [ ] Initialize Capacitor project with iOS and Android targets.
- [ ] Native Google Sign-In plugin integration.
- [ ] Apple In-App Purchase (IAP) bridge implementation to meet App Store guidelines.

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev servers:
   ```bash
   npm run dev
   ```

3. Build production bundle (emits to root `public_html/`):
   ```bash
   npm run build
   ```
