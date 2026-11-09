---
name: wedding-template
description: Use when creating, editing, or rendering wedding invitation templates: theme config schema (templates/*.json), section order, WeddingDataProvider data flow, and component conventions for components/wedding/*.
---

# Wedding template conventions

## What a template is

A template is a JSON file at `templates/<id>.json`. It contains NO couple data —
only theme and layout. Couple data lives in `invitations.data` (DB) and is passed
to components through `WeddingDataProvider`.

## Theme schema (`templates/<id>.json`)

```json
{
  "id": "elegant-gold",
  "name": "Elegant Gold",
  "description": "Warm ivory background, gold accents, serif display type.",
  "tier": "basic",
  "palette": {
    "background": "#faf7f2",
    "foreground": "#2b2620",
    "accent": "#b08d3e",
    "muted": "#8a8378"
  },
  "fonts": { "heading": "Cormorant Garamond", "body": "Poppins" },
  "sections": [
    "hero", "invitation-message", "couple", "events", "gallery",
    "rsvp", "dress-code", "wishes", "gifts", "countdown", "footer"
  ],
  "decorations": { "divider": "floral", "frame": "arch", "motion": "fade-up" }
}
```

- `sections` is ordered; the page renders them in this order. Valid section ids:
  `hero, invitation-message, couple, events, venue-map, gallery, rsvp,
  dress-code, wishes, gifts, countdown, footer`.
- `palette` keys map to Tailwind theme tokens in `app/globals.css`
  (`background`, `foreground`, `gold`/accent, `muted`). Add tokens there when a
  template needs a new color.
- `fonts` must reference fonts already loaded in `app/layout.tsx`.
- `tier`: `basic` templates are selectable by all customers; `premium` only on the
  premium tier.

## Invitation data schema (`invitations.data`)

Mirror of the base repo's `lib/wedding-config.ts` — keep this exact shape so ported
components keep working. Full reference: `references/invitation-data-schema.md`.

```json
{
  "bride":  { "name": "", "shortName": "", "bio": "", "photo": "/images/..." },
  "groom":  { "name": "", "shortName": "", "bio": "", "photo": "/images/..." },
  "date":   { "full": "", "short": "DD . MM . YYYY", "iso": "YYYY-MM-DD" },
  "city": "",
  "rsvpBy": "",
  "ceremony":   { "time": "", "venue": "", "address": "", "note": "" },
  "reception":  { "time": "", "venue": "", "address": "", "note": "" },
  "shuttleNote": "",
  "venue": { "name": "", "fullAddress": "", "lat": 0, "lng": 0, "placeId": "" },
  "gallery": ["/images/..."],
  "poetry": { "afterCouple": [], "afterEvents": [], "afterGallery": [], "afterRsvp": [], "afterWishes": [], "afterGifts": [], "afterCountdown": [] }
}
```

## Component rules

- One component per section in `components/wedding/<section>.tsx`, kebab-case.
- Components consume data via `useWeddingData()` from the provider — never import
  a static config. The provider is fed from `invitations.data` (or the editor
  draft) at the `/w/[slug]` page and `/edit/[edit_token]` page.
- Section components must render nothing (return `null`) when their section id is
  not in the template's `sections` list.
- Guest-facing forms (RSVP, wishes, gift reserve) POST to `/api/public/*` with the
  invitation slug; server injects `invitation_id`.
- Keep pages mobile-first and fast: lazy-load heavy sections (`LazySection`),
  optimize images, avoid layout shift.

## Design quality rules

- When designing or restyling a template, the `frontend-design` and
  `ui-ux-pro-max` skills (see `../README.md`) should be active; run a
  `web-design-guidelines` audit pass before marking a template done.
- No default AI look: distinct typography pairing, real palette, intentional
  spacing, custom SVG decorations (see `decorations`).

## Adding a new template (checklist)

1. Copy `templates/elegant-gold.json` → `templates/<new-id>.json`; edit palette,
   fonts, sections, decorations.
2. Add any new palette colors as Tailwind tokens in `app/globals.css`.
3. Add a row to `templates` (or extend `supabase/seed.sql`) with the JSON.
4. Preview via an invitation instance using the template; audit on a phone
   viewport; then set `is_active = true`.
