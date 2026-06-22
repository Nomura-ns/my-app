import { useState, useEffect } from 'react'
import { calcDynamicFrameHeight, type LayoutSize } from '../axisControlStyles'

const FALLBACK: Record<LayoutSize, number> = {
  desktop: 340,
  mobile: 260,
}

export function useFrameHeight(layoutSize: LayoutSize): number {
  const [height, setHeight] = useState<number>(FALLBACK[layoutSize])

  useEffect(() => {
    const update = () => setHeight(calcDynamicFrameHeight(layoutSize))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [layoutSize])

  return height
}