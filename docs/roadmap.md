# Roadmap

## M1 — Foundation (this PR)

Docs, agent skills, DB schema + seeds, template seed JSONs. No app code yet.

## M2 — Port the base site

Port `Kaemdesu/wedding-invitation` into this repo (Next.js 16 + Tailwind v4 +
shadcn + framer-motion + three). Replace the static `lib/wedding-config.ts`
imports with `WeddingDataProvider` + `useWeddingData()`; `/` renders one
invitation from a local JSON fixture.

## M3 — Multi-tenant core

Apply migration + seed. `/w/[slug]` reads `invitations` + `templates` from
Supabase. `/api/public/*` endpoints scoped by slug. One seeded invitation
(`annisa-kelvin`) renders identically to the old site.

## M4 — Customer self-serve editor

`/edit/[edit_token]`: form for all `invitations.data` fields with validation
(rules in the `wedding-template` skill reference), live preview iframe of
`/w/[slug]`, publish/unpublish. RSVP/wishes/gifts wired to `invitation_id`.

## M5 — Vendor admin

`/admin` (PIN): create invitation (template, slug, tier, expiry, edit link),
list invitations, per-invitation RSVP/wish/gift moderation + CSV export.

## M6 — Templates & tiers

3–5 templates (elegant-gold, minimal-ivory, dark-luxe, floral, rustic) as JSON
seeds; tier gating in admin + editor; custom domain (premium); static export
script; QR code generator on the admin page.

## M7 — Polish & sell

Landing page with template gallery, pricing, WhatsApp order CTA. Analytics
(views/RSVPs). Payment integration (Midtrans/Xendit) — only after manual orders
prove demand. Web-design-guidelines audit pass on every template.
