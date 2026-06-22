import { useState, useEffect, useRef } from 'react'
import { calcDynamicFrameHeight, type LayoutSize } from '../axisControlStyles'

const FALLBACK: Record<LayoutSize, number> = {
  desktop: 340,
  mobile: 260,
}

export function useFrameHeight(layoutSize: LayoutSize): number {
  const [height, setHeight] = useState<number>(FALLBACK[layoutSize])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stableHeightRef = useRef<number>(FALLBACK[layoutSize])

  useEffect(() => {
  const update = (force = false) => {
    const next = calcDynamicFrameHeight(layoutSize)

    if (layoutSize === 'mobile' && !force) {
      if (Math.abs(next - stableHeightRef.current) < 80) return
    }

    stableHeightRef.current = next
    setHeight(next)
  }

  const onResize = () => {
    if (layoutSize === 'mobile') {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => update(), 300)
    } else {
      update()
    }
  }

  const onOrientation = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => update(true), 300)
  }

  update(true)

  // visualViewport があればそちらを監視
  const vv = window.visualViewport
  if (vv && layoutSize === 'mobile') {
    vv.addEventListener('resize', onResize)
  } else {
    window.addEventListener('resize', onResize)
  }
  window.addEventListener('orientationchange', onOrientation)

  return () => {
    const vv = window.visualViewport
    if (vv && layoutSize === 'mobile') {
      vv.removeEventListener('resize', onResize)
    } else {
      window.removeEventListener('resize', onResize)
    }
    window.removeEventListener('orientationchange', onOrientation)
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [layoutSize])

  return height
}