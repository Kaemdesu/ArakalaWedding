'use client'

import { createContext, useContext } from 'react'

export type Person = {
  name: string
  shortName: string
  bio: string
  photo: string
}

export type EventInfo = {
  time: string
  venue: string
  address: string
  note: string
}

export type WeddingData = {
  bride: Person
  groom: Person
  date: { full: string; short: string; iso: string }
  city: string
  rsvpBy: string
  ceremony: EventInfo
  reception: EventInfo
  shuttleNote: string
  venue: { name: string; fullAddress: string; lat: number; lng: number; placeId: string }
  gallery: string[]
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

const WeddingDataContext = createContext<WeddingData | null>(null)

export function WeddingDataProvider({
  data,
  children,
}: {
  data: WeddingData
  children: React.ReactNode
}) {
  return <WeddingDataContext.Provider value={data}>{children}</WeddingDataContext.Provider>
}

export function useWeddingData(): WeddingData {
  const ctx = useContext(WeddingDataContext)
  if (!ctx) throw new Error('useWeddingData must be used within <WeddingDataProvider>')
  return ctx
}
