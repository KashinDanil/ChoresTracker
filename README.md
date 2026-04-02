# ChoresTracker Foundation

Bootstrapped with:

- Next.js (App Router)
- TypeScript
- Supabase client libraries
- Shadcn UI
- Lucide icons

## Run Locally

1. Ensure Node is available in your terminal session (if you use `nvm`):

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
```

2. Install dependencies:

```bash
npm install
```

3. (Optional for now) Create env file:

```bash
cp .env.example .env.local
```

You can leave the Supabase values empty while bootstrapping. The app is safe and will not crash.

4. Start dev server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Build And Lint

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables when ready.
