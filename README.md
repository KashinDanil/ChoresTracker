# ChoresTracker

A household chore tracker where fate decides who does the work. Create chores, play a random real-life mini-game, and the chosen one gets assigned.

**Not a single line of code was written by a human.** Built entirely with [Claude Code](https://claude.ai/code).

## Features

- **Chore management** — create, edit, delete chores with due dates and optional recurrence (daily/weekly/biweekly/monthly)
- **Game randomizer** — when a chore is due, pick a random mini-game (15 options) with animated selection (slot machine, wheel, ticker, elimination)
- **Households** — create a household and invite others with a simple code
- **Status flow** — pending → pick a game → awaiting result → assigned → done
- **Repeating chores** — completed chores auto-create the next occurrence
- **Dark mode** — follows OS preference, toggle to override, persists in browser
- **Auth** — email sign-up with confirmation via Supabase Auth

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, React 19)
- [TypeScript](https://www.typescriptlang.org)
- [Supabase](https://supabase.com) (Auth, PostgreSQL, RLS)
- [Shadcn UI](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Lucide](https://lucide.dev) icons
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Push database migrations

```bash
npx supabase db push
```

### 4. Run locally (optional)

```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all four env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) in Vercel Environment Variables
4. Deploy — Vercel builds and deploys on every push

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication > URL Configuration** and set your site URL to your Vercel deployment URL
3. Add `https://your-app.vercel.app/auth/callback` to the redirect URLs
4. Run `npx supabase db push` to apply migrations

## Project Structure

```
app/
  (auth)/          Sign in, sign up pages + server actions
  (app)/           Authenticated pages (dashboard, settings, profile, onboarding)
  auth/callback/   Supabase auth callback handler
components/        UI components (chore card, game randomizer, header, etc.)
lib/supabase/      Supabase client/server helpers + generated types
supabase/
  migrations/      Database migrations (profiles, households, chores, games)
proxy.ts           Session refresh + route protection
```
