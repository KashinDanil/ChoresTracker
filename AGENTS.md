<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Collaboration Rules

After finishing any implementation task, the agent must always tell the user:

1. Whether the app server needs to be restarted.
2. Whether database updates are required (for example migrations, schema push, seed).
3. Whether any other command must be executed.

The agent must always provide exact shell commands for each required follow-up step.
