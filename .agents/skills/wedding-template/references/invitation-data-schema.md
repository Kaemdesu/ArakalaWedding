# Invitation data schema (`invitations.data` jsonb)

This is the exact shape ported from the base repo (`Kaemdesu/wedding-invitation`,
`lib/wedding-config.ts`). Keep it stable — components depend on it.

```ts
type Person = { name: string; shortName: string; bio: string; photo: string }
type WeddingData = {
  bride: Person
  groom: Person
  date: { full: string; short: string; iso: string } // iso = YYYY-MM-DD, local +07:00 assumed for countdown
  city: string
  rsvpBy: string
  ceremony:  EventInfo
  reception: EventInfo
  shuttleNote: string
  venue: { name: string; fullAddress: string; lat: number; lng: number; placeId: string }
  gallery: string[]            // image paths, even count preferred
  poetry: {
    afterCouple: string[]
    afterEvents: string[]
    afterGallery: string[]
    afterRsvp: string[]
    afterWishes: string[]
    afterGifts: string[]
    afterCountdown: string[]
  }
}
type EventInfo = { time: string; venue: string; address: string; note: string }
```

Validation rules for the editor form (`/edit/[edit_token]`):

- `bride.name`, `groom.name`, `date.iso` (valid date), `ceremony.venue`,
  `reception.venue` are required to publish.
- `date.iso` must match `/^\d{4}-\d{2}-\d{2}$/`; countdown targets
  `<iso>T09:00:00+07:00`.
- `gallery` max 12 images; `photo` fields are paths under `/public/images/`.
- `poetry` arrays: each entry is one line; max 2 lines per key.
- `venue.lat/lng` required for the map embed; `placeId` optional.
