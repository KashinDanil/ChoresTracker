<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Collaboration Rules

After finishing any implementation task, the agent must always tell the user:

1. Whether database changes must be pushed/applied.
2. Whether any other command must be executed.
3. Whether a commit and push is needed to deploy.

The agent must always provide exact shell commands for each required follow-up step.

## Deployment

There is no local dev server. The app is deployed via **Vercel**, which triggers automatically on every push to GitHub. To release changes:

1. Commit the changes.
2. Push to GitHub.
3. Vercel handles the build and deploy.

## Database

This project uses **Supabase** as its managed database service. For all database-related work (migrations, schema changes, seed data, type generation, etc.), use the Supabase CLI via `npx supabase`. The CLI is **not** installed globally — always invoke it through `npx`.
