// components/wedding/orbit-gallery.tsx
'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, OrbitControls, Sparkles, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const GOLD = '#d8b56a'
const CREAM = '#efe6d2'
const DUST = '#e6c879'
const SPARKLE = '#f5d68a'

type OrbitGalleryProps = {
  images: string[]
  radiusX?: number
  radiusZ?: number
  autoRotateSpeed?: number
}

function GoldDust({ count = 900, spread = 18 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const base = new THREE.Color(DUST)
    for (let i = 0; i < count; i++) {
      const r = spread * (0.35 + Math.random() * 0.65)
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.55
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      const c = base.clone().multiplyScalar(0.65 + Math.random() * 0.5)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    return { positions, colors }
  }, [count, spread])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.025
    ref.current.position.y = Math.sin(t * 0.1) * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Photo({
  url,
  position,
  cardBase,
}: {
  url: string
  position: [number, number, number]
  cardBase: number
}) {
  const tex = useTexture(url)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8

  // full image, never cropped — plane matches the texture's aspect ratio
  const { w, h } = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined
    const ar = img?.width && img?.height ? img.width / img.height : 1.4
    return ar >= 1 ? { w: cardBase, h: cardBase / ar } : { w: cardBase * ar, h: cardBase }
  }, [tex, cardBase])

  return (
    <Billboard position={position}>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[w + 0.28, h + 0.28]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[w + 0.1, h + 0.1]} />
        <meshBasicMaterial color={CREAM} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

function OrbitRing({
  images,
  radiusX,
  radiusZ,
  autoRotateSpeed,
  cardBase,
  reduceMotion,
  scrollBoost,
}: {
  images: string[]
  radiusX: number
  radiusZ: number
  autoRotateSpeed: number
  cardBase: number
  reduceMotion: boolean
  scrollBoost: React.MutableRefObject<number>
}) {
  const group = useRef<THREE.Group>(null)

  const positions = useMemo<[number, number, number][]>(() => {
    const n = Math.max(images.length, 1)
    return images.map((_, i) => {
      const a = (i / n) * Math.PI * 2
      const y = Math.sin(a * 2) * 0.7
      return [Math.cos(a) * radiusX, y, Math.sin(a) * radiusZ]
    })
  }, [images, radiusX, radiusZ])

  useFrame((state, delta) => {
    if (!group.current || reduceMotion) return
    const t = state.clock.elapsedTime
    // base spin + scroll-driven boost (decays back to base) → feels reactive
    const boost = scrollBoost.current
    group.current.rotation.y += delta * (autoRotateSpeed + boost)
    // gentle life: breathing tilt + slow bob
    group.current.rotation.x = Math.sin(t * 0.25) * 0.08
    group.current.position.y = Math.sin(t * 0.4) * 0.15
    // decay the boost toward 0
    scrollBoost.current = THREE.MathUtils.damp(scrollBoost.current, 0, 2.5, delta)
  })

  return (
    <group ref={group}>
      {images.map((url, i) => (
        <Photo key={url + i} url={url} position={positions[i]} cardBase={cardBase} />
      ))}
    </group>
  )
}

function StaticGrid({ images }: { images: string[] }) {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((src, i) => (
        <div
          key={i}
          role="img"
          aria-label={'Wedding moment ' + (i + 1)}
          style={{ backgroundImage: 'url(' + src + ')' }}
          className="min-h-[120px] rounded-xl border border-gold/15 bg-cover bg-center"
        />
      ))}
    </div>
  )
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function OrbitGallery({
  images,
  radiusX,
  radiusZ,
  autoRotateSpeed = 0.28,
}: OrbitGalleryProps) {
  const [mounted, setMounted] = useState(false)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [contextLost, setContextLost] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const scrollBoost = useRef(0)

  useEffect(() => {
    setMounted(true)
    setWebgl(hasWebGL())
    setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const on = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Scroll-reactive spin (mobile especially): each scroll nudges the orbit faster.
  useEffect(() => {
    let last = typeof window !== 'undefined' ? window.scrollY : 0
    const onScroll = () => {
      const now = window.scrollY
      const dv = Math.abs(now - last)
      last = now
      // clamp so a fast fling doesn't spin like crazy (gentler than before)
      scrollBoost.current = Math.min(scrollBoost.current + dv * 0.004, 1.1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (mounted && webgl === false) return <StaticGrid images={images} />
  if (contextLost) return <StaticGrid images={images} />
  if (!mounted) return null

  // wider elliptical orbit; tuned per device so nothing clips
  const rx = radiusX ?? (isMobile ? 5.2 : 7.0)
  const rz = radiusZ ?? (isMobile ? 2.4 : 3.4)
  const cardBase = isMobile ? 2.4 : 3.0
  const camZ = isMobile ? 13 : 11

  return (
    <Canvas
      camera={{ position: [0, 0.4, camZ], fov: 50 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      frameloop="always"
      gl={{
        antialias: !isMobile,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
        stencil: false,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
      }}
      // 🔑 mobile: canvas ignores touch entirely → page scrolls freely, never traps.
      //    interactivity comes from the scroll-reactive spin instead of drag.
      style={{
        background: 'transparent',
        pointerEvents: isMobile ? 'none' : 'auto',
        touchAction: isMobile ? 'pan-y' : 'none',
      }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement
        canvas.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault()
            setContextLost(true)
          },
          { once: true }
        )
      }}
    >
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <OrbitRing
          images={images}
          radiusX={rx}
          radiusZ={rz}
          autoRotateSpeed={autoRotateSpeed}
          cardBase={cardBase}
          reduceMotion={reduceMotion}
          scrollBoost={scrollBoost}
        />
        <GoldDust count={isMobile ? 450 : 900} />
        <Sparkles
          count={isMobile ? 40 : 80}
          scale={[16, 8, 12]}
          size={isMobile ? 1.6 : 2.2}
          speed={0.3}
          color={SPARKLE}
          opacity={0.85}
        />
      </Suspense>
      {/* Desktop only: drag to rotate. Mobile has no controls (scroll-reactive instead). */}
      {!isMobile && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.45}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.7}
        />
      )}
    </Canvas>
  )
}

export default OrbitGallery
