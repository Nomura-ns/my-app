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
    plotLeft: 56,
    xMinLeft: 92,
    top: 8,
    right: 8,
    bottom: 38,
    bottomTime: 24,
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