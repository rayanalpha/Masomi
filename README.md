This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Admin Panel Guide

- Start dev: `npm run dev`
- Admin login: http://localhost:3000/login
  - Dev admin: admin@example.com / admin123
- Admin area: http://localhost:3000/admin

### Modules
- Products: list/create/edit at `/admin/products`, API under `/api/products`.
- Categories: `/admin/categories` (+ API `/api/categories`).
- Attributes & Values: `/admin/attributes` (+ API `/api/attributes`).
- Product Attributes/Values attach: API `/api/products/:id/attributes` & `/api/products/:id/attributes/values`.
- Variations: `/admin/products/:id/variations` (+ API `/api/products/:id/variations` and `/api/variations/:id`).
- Media upload (dev): POST `/api/upload` multipart, then attach via `/api/products/:id/images`.
- Orders: `/admin/orders` (+ API `/api/orders`).
- Coupons: `/admin/coupons` (+ API `/api/coupons`).
- Settings: `/admin/settings` (placeholder).

### Environment
- `.env` (dev):
  - `DATABASE_URL="file:./dev.db"`
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET=dev-secret-change-me`

### Prisma
- Generate: `npm run db:generate`
- Migrate: `npm run db:migrate`
- Seed: `npm run db:seed`

### Notes
- In dev, images saved to `public/uploads`.
- RBAC: Only ADMIN/MANAGER can access `/admin` and protected APIs.
- Validation: Zod is used in APIs.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
