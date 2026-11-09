'use client'

export function ElegantBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 1. Floral wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/wallpaper.jpg)' }}
      />

      {/* 2. Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/65" />

      {/* 3. Soft gold ambient glows for warmth */}
      <div className="absolute -left-[20%] top-[8%] h-[700px] w-[700px] rounded-full bg-gold/[0.05] blur-[140px]" />
      <div className="absolute -right-[15%] top-[45%] h-[800px] w-[800px] rounded-full bg-amber/[0.04] blur-[160px]" />
      <div className="absolute bottom-[-10%] left-[28%] h-[600px] w-[600px] rounded-full bg-gold-soft/[0.04] blur-[150px]" />

      {/* 4. Edge vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,oklch(0.03_0.006_270/0.75)_100%)]" />
    </div>
  )
}