'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Music, Pause } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const MUSIC_SRC = '/audio/wedding-music.mp3'
const FADE_DURATION = 800 // ms
const TARGET_VOLUME = 0.55

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHint, setShowHint] = useState(false)
  // Track manual user pause — so it doesn't auto-resume on visibility change
  const userPausedRef = useRef(false)

  /** Smooth fade volume in/out */
  const fadeVolume = useCallback((to: number, onComplete?: () => void) => {
    const audio = audioRef.current
    if (!audio) return

    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)

    const from = audio.volume
    const steps = 16
    const stepTime = FADE_DURATION / steps
    const stepValue = (to - from) / steps
    let current = 0

    fadeIntervalRef.current = setInterval(() => {
      current++
      const next = from + stepValue * current
      audio.volume = Math.max(0, Math.min(1, next))
      if (current >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
        onComplete?.()
      }
    }, stepTime)
  }, [])

  /** Start playing with fade-in */
  const startPlayback = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || isPlaying) return false

    try {
      audio.volume = 0
      await audio.play()
      setIsPlaying(true)
      setShowHint(false)
      fadeVolume(TARGET_VOLUME)
      return true
    } catch {
      return false
    }
  }, [isPlaying, fadeVolume])

  /** Initialize audio & attempt autoplay on mount */
  useEffect(() => {
    const audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    audioRef.current = audio

    // Try autoplay immediately
    const attemptAutoplay = async () => {
      const success = await startPlayback()
      if (!success) {
        // Blocked — show hint, wait for any gesture
        setShowHint(true)
      }
    }

    attemptAutoplay()

    return () => {
      audio.pause()
      audio.src = ''
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Fallback: start on first user gesture if autoplay was blocked */
  useEffect(() => {
    if (isPlaying || userPausedRef.current) return

    const tryStart = () => {
      // Only auto-start if user hasn't manually paused
      if (!userPausedRef.current) startPlayback()
    }

    window.addEventListener('scroll', tryStart, { once: true, passive: true })
    window.addEventListener('click', tryStart, { once: true })
    window.addEventListener('touchstart', tryStart, { once: true, passive: true })
    window.addEventListener('keydown', tryStart, { once: true })

    return () => {
      window.removeEventListener('scroll', tryStart)
      window.removeEventListener('click', tryStart)
      window.removeEventListener('touchstart', tryStart)
      window.removeEventListener('keydown', tryStart)
    }
  }, [isPlaying, startPlayback])

  /** Pause when tab hidden, resume when visible (unless user paused) */
  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) {
        audio.pause()
      } else if (!userPausedRef.current && isPlaying) {
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isPlaying])

  /** Auto-hide hint after 6s */
  useEffect(() => {
    if (!showHint) return
    const timer = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(timer)
  }, [showHint])

  /** Toggle play/pause with smooth fade */
  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setShowHint(false)

    if (isPlaying) {
      userPausedRef.current = true
      fadeVolume(0, () => {
        audio.pause()
        setIsPlaying(false)
      })
    } else {
      userPausedRef.current = false
      startPlayback()
    }
  }, [isPlaying, fadeVolume, startPlayback])

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 safe-bottom safe-x md:bottom-8 md:right-8">
      {/* Hint bubble when autoplay is blocked */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto rounded-xl border border-gold/30 bg-card/80 px-4 py-2.5 backdrop-blur-md"
          >
            <p className="font-mono text-fluid-xs uppercase tracking-[0.2em] text-gold/90">
              Tap anywhere for music ♪
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music button */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-card/70 text-gold backdrop-blur-md transition-colors hover:border-gold hover:bg-card/90 md:h-14 md:w-14"
      >
        {isPlaying && (
          <>
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-gold"
            />
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 1,
              }}
              className="absolute inset-0 rounded-full border border-gold"
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.span
              key="pause"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              <Pause className="h-4 w-4 md:h-5 md:w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="play"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              <Music className="h-4 w-4 md:h-5 md:w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}