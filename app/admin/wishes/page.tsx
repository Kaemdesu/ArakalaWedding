'use client'

import { useEffect } from 'react'

export default function RedirectWishes() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/admin')
    }
  }, [])
  return null
}