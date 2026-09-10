# Yuri Fitness App (Phase 1 Scaffold)

A full-stack fitness tracking application built with a React Native/Web monorepo architecture. 
This repository contains a responsive web dashboard that can be installed as a PWA, and an Express API backend.

## Architecture

This is an npm workspace monorepo:
- `apps/web`: React 18, Vite, Tailwind CSS, React Query
- `apps/api`: Node.js, Express, Mongoose
- `packages/shared`: Shared TypeScript interfaces and UI Design Tokens

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development servers (runs both Web and API concurrently):
   ```bash
   npm run dev
   ```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Environment Variables

### Backend (`apps/api/.env`)
Create a `.env` file in `apps/api` with:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/yuri_fitness
STRIPE_SECRET_KEY=sk_test_...
```

## Deployment

The Vite build is explicitly configured to output to a `public_html` directory inside `apps/web` instead of the default `dist`. 
This allows for drop-in deployment to Namecheap shared hosting environments that serve from `public_html`.

To build the project:
```bash
npm run build
```

## Phase 2/3/4 TODOs
- [ ] Connect actual MongoDB instance using Mongoose schemas.
- [ ] Implement secure JWT Authentication flow.
- [ ] Finalize Stripe Webhook handler and update User Subscription Status.
- [ ] Wrap frontend in Capacitor for iOS/Android native deployments.
- [ ] Address Apple IAP requirement before App Store submission.
