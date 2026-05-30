# Deployment Guide

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add Firebase web app credentials.
4. Add ImageKit public key, URL endpoint, and private key.
5. Start the app with `npm run dev`.

## Firebase

1. Create a Firebase project.
2. Enable Authentication providers:
   - Email/Password
   - Google
3. Create a Firestore database.
4. Add the indexes listed in `docs/firestore-schema.md`.
5. Configure security rules so students can edit only their own profile, create listings under their own `sellerId`, and read active listings.

## ImageKit

1. Create an ImageKit account and URL endpoint.
2. Put `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` and `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` in the frontend env.
3. Put `IMAGEKIT_PRIVATE_KEY` only in server env.
4. Keep uploads authenticated through `/api/imagekit-auth`.

## Vercel

1. Import the GitHub repository into Vercel.
2. Add all environment variables from `.env.example`.
3. Keep the build command as `npm run build`.
4. Deploy.

The app is PWA-ready, mobile-first, and uses Next.js metadata for SEO defaults.
