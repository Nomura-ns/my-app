import type { Theme } from './types'

export type LayoutSize = 'desktop' | 'mobile'

/** Y軸①ドロップダウンと同じ寸法（軸範囲入力もこれに合わせる） */
export const AXIS_CTRL = {
  fontSize: '12px',
  padding: '4px 6px',
  borderRadius: '6px',
  selectWidth: 128,
  inputWidth: 52,
  labelWidth: 36,
  controlHeight: 26,
} as const

const LAYOUT = {
  desktop: {
    frameHeight: 340,
    plotLeft: 5,
    xMinLeft: 60,
    top: 8,
    right: 8,
    bottom: 30,
    bottomTime: 18,
    brushExtra: 22,
    inputWidth: 52,
    selectWidth: 128,
  },
  mobile: {
    frameHeight: 260,
    plotLeft: 44,
    xMinLeft: 68,
    top: 6,
    right: 4,
    bottom: 32,
    bottomTime: 18,
    brushExtra: 18,
    inputWidth: 44,
    selectWidth: '100%' as const,
  },
} as const

export function getLayoutConfig(size: LayoutSize) {
  return LAYOUT[size]
}

export function getLineChartMargin(
  showXRange: boolean,
  withBrush: boolean,
  size: LayoutSize = 'desktop',
) {
  const cfg = LAYOUT[size]
  let bottom = showXRange ? cfg.bottom : cfg.bottomTime
  if (withBrush) bottom += cfg.brushExtra
  return {
    top: cfg.top,
    right: cfg.right,
    bottom,
    left: cfg.plotLeft,
  }
}

export function axisSelectStyle(theme: Theme, size: LayoutSize = 'desktop') {
  const cfg = LAYOUT[size]
  return {
    width: cfg.selectWidth,
    maxWidth: '100%',
    height: AXIS_CTRL.controlHeight,
    fontSize: AXIS_CTRL.fontSize,
    padding: AXIS_CTRL.padding,
    borderRadius: AXIS_CTRL.borderRadius,
    border: `1px solid ${theme.border}`,
    background: theme.bg,
    color: theme.text,
    boxSizing: 'border-box' as const,
  }
}

export function axisInputStyle(theme: Theme, size: LayoutSize = 'desktop') {
  const cfg = LAYOUT[size]
  return {
    width: cfg.inputWidth,
    height: AXIS_CTRL.controlHeight,
    fontSize: AXIS_CTRL.fontSize,
    padding: AXIS_CTRL.padding,
    borderRadius: AXIS_CTRL.borderRadius,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
  }
}

export function calcDynamicFrameHeight(size: LayoutSize = 'desktop'): number {
  if (typeof window === 'undefined') return LAYOUT[size].frameHeight

  // visualViewport があればそちらを優先（iOSのアドレスバー収縮対策）
  const windowH = window.visualViewport?.height ?? window.innerHeight

  if (size === 'mobile') {
  const windowH = window.innerHeight
  const headerH = 49
  const statusH = 39
  const tabH = 31 + 12      // タブ + marginBottom
  const controlH = 113
  const pagePaddingH = 10 * 2
  const statusMarginH = 16 + 16
  const cardPaddingH = 10 * 2

  const available = windowH - headerH - statusH - tabH - controlH
    - pagePaddingH - statusMarginH - cardPaddingH - 8
  return Math.max(available, 160)
}

  // desktop
  const headerH = 57
  const statusH = 52
  const paddingH = 35 * 2
  const controlH = 44
  const cardPaddingH = 12 * 2
  const gapH = 24
  const rows = 2

  const available = windowH - headerH - statusH - paddingH - gapH
  const perPanel = Math.floor(available / rows) - controlH - cardPaddingH - 8
  return Math.max(perPanel, 200)
}