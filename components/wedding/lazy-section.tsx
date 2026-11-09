'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  minHeight?: string
}

export function LazySection({ children, minHeight = '400px' }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const rootMargin = isMobile ? '120px' : '300px'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        // 🚀 Browser skips painting & layout for off-screen sections
        contentVisibility: 'auto',
        containIntrinsicSize: '0 800px',
      }}
    >
      {isVisible && children}
    </div>
  )
}