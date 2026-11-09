'use client'
import { ArrowLeft } from 'lucide-react'
import { GiftRegistry } from '@/components/wedding/gift-registry'
import { ElegantBackground } from '@/components/wedding/elegant-background'
import { MusicPlayer } from '@/components/wedding/music-player'
export default function GiftsPage() {
  const goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }
  return (
    <>
      <ElegantBackground />
      <main className="relative min-h-screen">
        <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 md:px-0">
          <div className="px-6 pt-8 safe-top safe-x md:pt-12">
            <button
              type="button"
              onClick={goHome}
              className="inline-flex items-center gap-2 rounded-lg border border-gold/25 bg-card/40 px-4 py-2.5 font-poppins font-medium text-fluid-xs uppercase tracking-[0.2em] text-cream/85 backdrop-blur-sm transition hover:border-gold/50 hover:text-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Invitation
            </button>
          </div>
          <GiftRegistry />
        </div>
      </main>
      <MusicPlayer />
    </>
  )
}