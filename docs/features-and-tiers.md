# Features, tiers, and the order workflow

## Feature matrix

| Feature | Basic | Premium |
|---|---|---|
| Hosted invitation at `/w/<slug>` | yes | yes |
| Template choice (basic templates) | yes | all templates |
| Self-serve editor + live preview | yes | yes |
| RSVP form → dashboard | yes | yes |
| Wishes wall (guestbook) | yes | yes |
| Gift registry + reservations | yes | yes |
| Photo gallery, countdown, music | yes | yes |
| Multiple events (akad/resepsi/…) | 2 events | unlimited |
| Livestream link, accommodation info | — | yes |
| Multi-language (ID/EN) | — | yes |
| Custom domain | — | yes |
| Static export of the site | — | yes |
| Expiry (e.g. 30 days after wedding) | yes | configurable/none |
| View/RSVP analytics | — | yes |

## Sections a template can enable (ordered)

`hero, invitation-message, couple, events, venue-map, gallery, rsvp, dress-code,
wishes, gifts, countdown, footer`

## Order workflow (per customer)

1. Customer messages vendor and pays (manual in MVP).
2. Vendor creates an invitation in `/admin`: pick template, set `slug`
   (e.g. `andi-sinta`), `tier`, `expires_at`, `owner_email`; system generates
   `edit_token`.
3. Vendor sends the customer the edit link `yourdomain.com/edit/<edit_token>`.
4. Customer fills the form (couple, date, events, venue + map pin, photos,
   poetry lines, RSVP deadline), watches the live preview, hits **Publish**.
5. Vendor/customer shares `yourdomain.com/w/<slug>` + QR code with guests.
6. Guests RSVP / send wishes / reserve gifts → visible in `/admin` per invitation;
   exportable as CSV.
7. Premium: vendor attaches `custom_domain` or runs the static export and hands
   over the files.
