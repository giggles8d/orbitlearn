# OrbitLearn (MVP)

A fast, modern learning platform you can sell to creators and orgs. Built with Next.js (App Router) + TypeScript + Tailwind CSS + Prisma.
- **Web app** with catalog, course pages, lesson player, quizzes, and a lightweight creator studio.
- **Database** via Prisma (SQLite in dev, Postgres in prod).
- **Seed data** includes a sample GD&T course to get you started.
- **Feature flags** included for easy iteration and A/B tests.
- **Payments, auth, video, and AI** have clean integration points and sample code stubs.

> This is a starter you can deploy today, then extend quickly.

## Quickstart

1) **Install** (Node 18+ recommended):
```bash
npm install
```
2) **Create the DB & seed**:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```
3) **Run the dev server**:
```bash
npm run dev
```
Open http://localhost:3000

## Environment

Copy `.env.example` to `.env.local` and fill as needed. For dev, the defaults work (SQLite).

## Deploy (suggested)

- **Web**: Vercel
- **Database**: Neon/Supabase (Postgres). Set `DATABASE_URL` accordingly, then run `npx prisma migrate deploy`.
- **Video**: Mux or Cloudflare Stream (see `lib/integrations/video.ts` placeholder).
- **Auth**: Auth.js (NextAuth) or Clerk (integration point in `lib/auth/`).
- **Payments**: Stripe (see `app/api/payments/checkout/route.ts` placeholder).

## What’s here

- App Router pages:
  - `/` – Marketing home
  - `/catalog` – Course catalog (search/filter)
  - `/course/[slug]` – Course detail & lesson player
  - `/studio` – Creator dashboard (list/manage courses)
  - `/studio/courses/new` – Create a new course
- API routes:
  - `/api/health`
  - `/api/courses` (list/create)
  - `/api/courses/[id]` (get/update/delete)
  - `/api/quiz/submit` (evaluate answers client-side with server verification stub)
- Prisma models: Users, Organizations, Courses, Modules, Lessons, Quizzes, Questions, Options, Enrollments, Purchases, FeatureFlags, Notes, Reviews
- Seed data including a sample **GD&T Essentials** course

## Roadmap-ready integration points

- `lib/auth/` – drop in your Auth.js/Clerk provider
- `lib/payments/` – Stripe session creation + webhooks
- `lib/integrations/video.ts` – Mux/CF Stream helpers
- `lib/ai/` – RAG-ready tutor endpoint (OpenAI-compatible interface)

## License

MIT – do anything, just don’t hold the authors liable.

### Enabling payments (optional)
1) `npm i stripe`
2) Set `STRIPE_SECRET_KEY` in `.env.local`
3) Use `/api/payments/checkout` to create sessions
