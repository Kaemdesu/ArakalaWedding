-- Seed: templates from templates/*.json + one example invitation ported from
-- Kaemdesu/wedding-invitation (lib/wedding-config.ts) so /w/annisa-kelvin renders.
-- Run AFTER migrations/20260109_0001_init.sql.

insert into public.templates (id, name, description, theme, sections, tier, is_active)
values (
  'elegant-gold',
  'Elegant Gold',
  'Warm ivory background, gold accents, serif display type. Classic and timeless.',
  '{"palette": {"background": "#faf7f2", "foreground": "#2b2620", "accent": "#b08d3e", "muted": "#8a8378"}, "fonts": {"heading": "Cormorant Garamond", "body": "Poppins"}, "decorations": {"divider": "floral", "frame": "arch", "motion": "fade-up"}}'::jsonb,
  '["hero","invitation-message","couple","events","venue-map","gallery","rsvp","dress-code","wishes","gifts","countdown","footer"]'::jsonb,
  'basic',
  true
),
(
  'minimal-ivory',
  'Minimal Ivory',
  'Clean ivory canvas, charcoal text, single accent. Modern minimal.',
  '{"palette": {"background": "#fdfcfb", "foreground": "#1f1d1a", "accent": "#7a6a53", "muted": "#a39e94"}, "fonts": {"heading": "Cormorant Garamond", "body": "Inter"}, "decorations": {"divider": "line", "frame": "none", "motion": "fade"}}'::jsonb,
  '["hero","invitation-message","couple","events","venue-map","gallery","rsvp","wishes","countdown","footer"]'::jsonb,
  'basic',
  true
)
on conflict (id) do nothing;

-- Example invitation (ported from the base repo). edit_token is a placeholder —
-- the admin UI generates a fresh one per order.
insert into public.invitations (slug, template_id, data, status, tier, owner_email, edit_token, expires_at)
values (
  'annisa-kelvin',
  'elegant-gold',
  '{
    "bride": {
      "name": "Annisa Fajri Luthfiani",
      "shortName": "Annisa",
      "bio": "The beloved first daughter of Mrs. Wiwin Winarsih and the late Mr. Hendro Dwi Tjiptadi.\n\nEmbracing a new chapter as Mrs. Muliawan.",
      "photo": "/images/bride-frame.png"
    },
    "groom": {
      "name": "Kelvin Muliawan",
      "shortName": "Kelvin",
      "bio": "The beloved first son of Mrs. Indri, the late Mr. Herman Tedja Muliawan, and his stepfather Mr. Achmad Hidayat.\n\nSoon to be Annisa'\''s husband.",
      "photo": "/images/groom-frame.png"
    },
    "date": {
      "full": "Saturday, the Eighth of August, Two Thousand and Twenty-Six",
      "short": "08 . 08 . 2026",
      "iso": "2026-08-08"
    },
    "city": "Grand Wisata, Bekasi",
    "rsvpBy": "July 25th, 2026",
    "ceremony": {
      "time": "08:00 AM",
      "venue": "Masjid Izzatul Islam",
      "address": "Grand Wisata, Bekasi, West Java",
      "note": "The akad nikah ceremony will begin promptly. Kindly arrive fifteen minutes early to be seated."
    },
    "reception": {
      "time": "11:00 AM - 02:00 PM",
      "venue": "Izzatul Islam Grand Hall",
      "address": "Grand Wisata, Bekasi, West Java",
      "note": "Join us for a celebration of food, music, and joy as we begin our journey as husband and wife."
    },
    "shuttleNote": "A complimentary shuttle service will run between the main parking area and the venue throughout the day.",
    "venue": {
      "name": "Masjid Izzatul Islam",
      "fullAddress": "Masjid Izzatul Islam, Grand Wisata, Bekasi, West Java, Indonesia",
      "lat": -6.285576421702599,
      "lng": 107.04020836931957,
      "placeId": ""
    },
    "gallery": [
      "/images/gallery-1.webp", "/images/gallery-2.webp", "/images/gallery-3.webp",
      "/images/gallery-4.webp", "/images/gallery-5.webp", "/images/gallery-6.webp"
    ],
    "poetry": {
      "afterCouple": ["From a single soul, He created its mate,", "that they might find peace in one another."],
      "afterEvents": ["Every place becomes sacred", "when love is the prayer being said."],
      "afterGallery": ["The past is a garden,", "walked by the One who plants every step."],
      "afterRsvp": ["Bear witness, you who love us -", "the angels write your name in light."],
      "afterWishes": ["Your prayers rise like incense,", "and return as mercy upon our days."],
      "afterGifts": ["Your presence is the dearest gift,", "for love is the only currency of the soul."],
      "afterCountdown": ["In every breath, in every silence,", "we are drawing nearer."]
    }
  }'::jsonb,
  'draft',
  'basic',
  '',
  '00000000-0000-0000-0000-000000000001',
  null
)
on conflict (slug) do nothing;
