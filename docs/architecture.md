# Architecture

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS v4, shadcn/ui,
framer-motion, Supabase (Postgres + RLS + optional storage for photos/audio).
Ported from `Kaemdesu/wedding-invitation`.

## Routes

| Route | Who | Purpose |
|---|---|---|
| `/` | public | Vendor landing: product + template gallery |
| `/w/[slug]` | guest | Public invitation; 404 when draft/expired |
| `/edit/[edit_token]` | customer (secret link) | Self-serve editor + live preview + publish toggle |
| `/admin` | vendor (PIN) | Invitations list/create, RSVPs, wishes, gifts, settings per invitation |
| `/api/public/rsvp` `/api/public/wishes` `/api/public/gifts` `/api/public/settings` | guest | Writes/reads scoped by `slug` → `invitation_id` |
| `/api/admin/*` | vendor | Service-role key, server-side only |

## Data flow

```
templates/*.json ──seed──▶ templates (DB)
                              │ template_id
invitations (slug, data jsonb, status, tier, edit_token, expires_at)
      │  public read (published only, via RLS)
      ▼
/w/[slug] ── WeddingDataProvider ──▶ components/wedding/* (data-driven)
      │
      ├── POST /api/public/rsvp|wishes|gifts ──▶ rsvps|wishes|gifts (invitation_id)
      └── /edit/[edit_token] ──▶ UPDATE invitations.data ──▶ live preview of /w/[slug]
```

## Request scoping rule

Every `/api/public/*` handler resolves `slug` → `invitation` server-side with the
service-role client, checks `status = 'published'` and `expires_at`, then acts on
`invitation.id`. Guests never send or see raw `invitation_id`s.

## Schema

See `supabase/migrations/20260109_0001_init.sql`. Summary:

- `templates(id text pk, name, description, theme jsonb, sections jsonb, tier, is_active)`
- `invitations(id uuid pk, slug text unique, template_id fk, data jsonb, status text, tier text, custom_domain text null, owner_email text, edit_token uuid unique, expires_at timestamptz null, created_at, updated_at)`
- `rsvps(id, invitation_id fk, full_name, email, attendance, guest_count, ip_address, user_agent, created_at)` — unique(invitation_id, email)
- `wishes(id, invitation_id fk, name, message, is_pinned, is_hidden, ip_address, user_agent, created_at)`
- `gifts(id, invitation_id fk, name, description, price_idr, image_url, shop_url, shop_name, status, reserved_by_name, reserved_by_email, reserved_at, purchased_message, display_order, is_active, created_at, updated_at)`
- `site_settings(id, invitation_id fk unique, delivery_*, bank_*, updated_at)`

RLS: anonymous role can SELECT published invitations + active gifts + public wish
fields, and INSERT rsvps/wishes/gift reservations. All admin reads/writes use the
service role, which bypasses RLS.

## Rendering strategy

- `/w/[slug]`: server component fetches invitation + template, renders client
  tree under `WeddingDataProvider`. `dynamic = 'force-dynamic'` in MVP for instant
  publish; move to ISR/revalidate on publish later.
- Premium **static export**: `next build` with an export script that renders
  `/w/[slug]` for each published premium invitation into static HTML.
- Premium **custom domain**: map domain → Vercel project domain; route by
  `custom_domain` lookup in middleware.
