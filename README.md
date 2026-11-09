# Arakala Wedding

Sellable wedding-invitation platform: the vendor ships invitation **templates**;
customers self-serve a form; a personalized online invitation is generated and
hosted at `/w/<slug>` (Basic) or on their own domain / as a static export (Premium).

## Read first

- [CONTEXT.md](CONTEXT.md) — product, decisions, data model, routes, stack
- [docs/architecture.md](docs/architecture.md) — routes, data flow, schema
- [docs/features-and-tiers.md](docs/features-and-tiers.md) — feature matrix, pricing tiers, order workflow
- [docs/roadmap.md](docs/roadmap.md) — build milestones
- [.agents/skills/README.md](.agents/skills/README.md) — agent skills to install (Antigravity)

## Structure

```
templates/                 # template seeds: theme + sections JSON (templates/<id>.json)
supabase/
  migrations/              # SQL schema (multi-tenant)
  seed.sql                 # seed templates + one example invitation
docs/                      # architecture, features, roadmap
.agents/skills/            # agent skills (custom wedding-template skill + install guide)
CONTEXT.md                 # source of truth for the product
AGENTS.md                  # rules for AI agents working here
```

## Quick start (once the app code lands)

```bash
cp .env.example .env.local   # fill Supabase values
npm install
npm run dev
```

Apply `supabase/migrations/20260109_0001_init.sql` then `supabase/seed.sql` in the
Supabase SQL editor.

Design base to port from: `Kaemdesu/wedding-invitation` (single-couple Next.js site
with hero, couple, events, gallery, RSVP, wishes, gifts, countdown, music).
