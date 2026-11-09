import { Hero } from '@/components/wedding/hero'
import { CoupleSection } from '@/components/wedding/couple-section'
import { EventDetails } from '@/components/wedding/event-details'
import { Gallery } from '@/components/wedding/gallery'
import { Rsvp } from '@/components/wedding/rsvp'
import { WishesWall } from '@/components/wedding/wishes-wall'
import { GiftRegistryCta } from '@/components/wedding/gift-registry-cta'
import { Countdown } from '@/components/wedding/countdown'
import { Footer } from '@/components/wedding/footer'
import { LazySection } from '@/components/wedding/lazy-section'
import { ElegantBackground } from '@/components/wedding/elegant-background'
import { MusicPlayer } from '@/components/wedding/music-player'
import { BismillahTransition } from '@/components/wedding/bismillah-transition'
import { InvitationMessage } from '@/components/wedding/invitation-message'
import { DressCode } from '@/components/wedding/dress-code'
import { WeddingDataProvider, type WeddingData } from '@/lib/wedding-data'
import fixture from '@/data/annisa-kelvin.json'

export default function Page() {
  const data = fixture as WeddingData
  return (
    <WeddingDataProvider data={data}>
      <ElegantBackground />
      <main className="relative">
        <Hero />
        <div
          aria-hidden
          className="relative h-48 bg-linear-to-b from-background via-background/70 to-transparent"
        />
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 md:px-0">
          <BismillahTransition />
          <InvitationMessage />
          <LazySection>
            <CoupleSection />
          </LazySection>
          <LazySection>
            <EventDetails />
          </LazySection>
          <LazySection>
            <Gallery />
          </LazySection>
          <LazySection>
              <Rsvp />
            </LazySection>
            <LazySection>
              <DressCode />
            </LazySection>
          <LazySection>
            <WishesWall />
          </LazySection>
          <LazySection>
            <GiftRegistryCta />
          </LazySection>
          <LazySection>
            <Countdown />
          </LazySection>
          <Footer />
        </div>
      </main>
      <MusicPlayer />
    </WeddingDataProvider>
  )
}
