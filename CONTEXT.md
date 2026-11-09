# CONTEXT — Arakala Wedding (multi-tenant invitation SaaS)

Read this file first. It is the source of truth for what this product is, how it is
architected, and the decisions already made. `AGENTS.md` holds agent working rules;
`docs/` holds the detailed plans; `.agents/skills/` holds agent skills.

## 1. What this product is

A sellable wedding-invitation platform. The vendor (repo owner) designs invitation
**templates**; a customer (a couple) buys one, fills in their details through a
self-serve editor, and gets a generated, hosted online invitation they share with
guests (link + QR code). RSVP responses, wishes and gift reservations from guests
land in a per-invitation dashboard.

Design base: the existing single-couple site in `Kaemdesu/wedding-invitation`
(Next.js 16 + Tailwind v4 + shadcn + framer-motion + Supabase). Its components and
visual language are ported into this repo and made data-driven. Do not start from a
generic starter.

## 2. Users and roles

- **Vendor (you)**: owns templates, creates invitation instances for customers,
  moderates RSVPs/wishes/gifts, sets tier and expiry. Auth: service-role key /
  admin PIN (port the PIN pattern from `wedding-invitation/app/admin/page.tsx`).
- **Customer (couple)**: fills the editor via a secret edit link
  (`/edit/<edit_token>`), previews live, publishes. No account system in MVP.
- **Guest**: opens `/w/<slug>`, RSVPs, posts wishes, reserves gifts. No auth.

## 3. Decisions already made (do not re-litigate)

- Customers **self-serve** the invitation form with live preview.
- Delivery tiers: **Basic** = hosted link `yourdomain.com/w/<slug>`;
  **Premium** = Basic + custom domain and/or static export of the invitation site.
- Data is per-invitation rows in Supabase, keyed by `invitation_id`.
- Payments are manual (chat/transfer) in MVP; vendor creates the instance.
- Invitation pages are mobile-first, fast, single page; guests open them on phones.

## 4. Feature set

Core (every invitation): hero with couple names + date, invitation message,
couple section (photos, bios, parents), event details (ceremony + reception:
time/venue/address/note), embedded venue map, photo gallery, RSVP form
(name/email/attend/guest count), countdown, music player, wishes wall,
gift registry, dress code, footer. Optional poetry/quote transitions between
sections.

Premium tier adds: multiple events, livestream link, accommodation/travel info,
multi-language, custom domain, static export, longer/no expiry, analytics.

## 5. Stack

Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui
(components.json present in base repo), framer-motion for motion,
three.js/@react-three for the ring scene, Supabase (Postgres + RLS) for all data,
Vercel-style deployment. Images unoptimized (static export friendly).

## 6. Data model (see `supabase/migrations/20260109_0001_init.sql`)

- `templates` — id (slug), name, description, `theme` jsonb (palette/fonts/
  decorations), `sections` jsonb (ordered list of enabled sections), is_active.
  Seed files live in `templates/*.json`.
- `invitations` — id uuid, `slug` unique, template_id → templates, `data` jsonb
  (couple/event/gallery/poetry payload, shape = `templates/schema.invitation-data.json`),
  `status` (draft|published|expired), `tier` (basic|premium), `custom_domain`,
  `owner_email`, `edit_token` uuid (secret editor link), `expires_at`.
- `rsvps`, `wishes`, `gifts`, `site_settings` — all carry `invitation_id`.
  `rsvps` unique on (invitation_id, email).

RLS: public can read published invitations and active gifts, and insert
rsvps/wishes/gift-reservations; everything else is service-role only.

## 7. Routes (target layout)

- `/w/[slug]` — public invitation page (renders template + data). 404/hidden when
  draft or expired.
- `/edit/[edit_token]` — customer self-serve editor with live preview; saves
  `invitations.data`; publish/unpublish toggle.
- `/admin` — vendor dashboard: list/create invitations (choose template, slug,
  tier, expiry, generate edit link), per-invitation RSVPs/wishes/gifts/settings.
- `/api/public/*` — guest-facing endpoints scoped by slug.
- `/api/admin/*` — vendor endpoints, service-role key.
- `/` — vendor landing page (MVP: simple page describing the product + templates).

## 8. Template system

A template = `templates/<id>.json` (theme + sections) rendered by one invitation
page component tree (`components/wedding/*`) that reads data from a
`WeddingDataProvider` context (never import a static config directly).
Adding a template = new JSON file + optional section components; no page changes.
The `wedding-template` agent skill in `.agents/skills/` encodes this schema and the
component conventions — follow it when adding or editing templates.

## 9. Environment

`.env.example` lists: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Never commit real values.

## 10. Agent skills setup (Antigravity)

Workspace skills live in `.agents/skills/<name>/SKILL.md`. Recommended external
skills and install commands are in `.agents/skills/README.md`. Skills load on
demand (only name+description at session start), so keep `SKILL.md` frontmatter
descriptions precise and put bulk detail in `references/` files.
