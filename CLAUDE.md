# Claude Project Rules

Follow all rules in `AGENTS.md`.

After every completed implementation, explicitly tell the user:

1. If database changes must be pushed/applied.
2. If any additional command must be run.
3. If a commit and push is needed to deploy.

Always include exact commands to execute.

## Deployment

- No local dev server is used. Deployment is via **Vercel**, triggered automatically on push to GitHub.
- To release: commit → push to GitHub → Vercel deploys.

## Database

- Supabase is the managed database service for this project.
- Always use the Supabase CLI via `npx supabase` (not installed globally).
- Use the CLI to automate database work: migrations, schema changes, type generation, seeding, etc.
