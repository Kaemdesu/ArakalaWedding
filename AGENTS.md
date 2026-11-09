# AGENTS.md — working rules for AI agents on this repo

1. Read `CONTEXT.md` and `docs/` before writing code. `CONTEXT.md` is the source of
   truth for product decisions; if code and `CONTEXT.md` disagree, `CONTEXT.md` wins
   until a human updates it.
2. Follow the `wedding-template` skill in `.agents/skills/wedding-template/` for
   anything touching templates, themes, or the invitation page.
3. Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui,
   framer-motion, Supabase. Match existing file/component naming
   (`components/wedding/<section>.tsx`, kebab-case files, `@/` path alias).
4. Invitation pages must be data-driven: components read from
   `WeddingDataProvider`, never from a hardcoded config import.
5. All guest-facing writes go through `/api/public/*` with the service-role key
   server-side only. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
6. Never commit secrets, `.env` files, or tokens. Use `.env.example` placeholders.
7. Verify with `npm run lint` and `npm run build` before finishing a task.
8. Commit on a `vibe/<slug>-6bd695` branch with focused messages; open a draft PR.
