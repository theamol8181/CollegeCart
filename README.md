# CollegeCart

CollegeCart is a production-ready campus marketplace built with Next.js 15, TypeScript, Tailwind CSS, Firebase Authentication, Firestore, ImageKit, Framer Motion, Zustand, PWA support, and Vercel-friendly deployment defaults.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add Firebase plus ImageKit credentials.

## Firebase collections

- `users`: student profiles, college, avatar, role, online status, saved listing ids.
- `products`: listing data, image URLs, seller details, price, condition, status, report count.
- `messages`: chat rooms with participants, last message, unread counts, nested `items` subcollection.
- `notifications`: user notifications for messages, wishlist activity, sold listings, admin moderation.
- `wishlists`: per-user saved products or denormalized wishlist records.

## ImageKit security

ImageKit private keys are used only in `app/api/imagekit-auth/route.ts`. The browser receives a short-lived signature for uploads and never sees `IMAGEKIT_PRIVATE_KEY`.

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add every variable from `.env.example` in Vercel Project Settings.
4. Enable Firebase Authentication providers: Email/Password and Google.
5. Create Firestore in production mode and add indexes for `products.category`, `products.createdAt`, and `products.sellerId`.
6. Deploy.

## Useful commands

```bash
npm run typecheck
npm run build
```
