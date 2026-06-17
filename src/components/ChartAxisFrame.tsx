import type { ReactNode } from 'react'
import type { AxisRange, Theme } from '../types'
import { axisInputStyle, getLayoutConfig, type LayoutSize } from '../axisControlStyles'

export function getChartFrameHeight(size: LayoutSize = 'desktop') {
  return getLayoutConfig(size).frameHeight
}

function parseValue(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

function formatValue(v?: number): string {
  return v === undefined ? '' : String(v)
}

function updateRange(
  current: AxisRange | undefined,
  field: 'min' | 'max',
  raw: string,
): AxisRange | undefined {
  const next: AxisRange = { ...current, [field]: parseValue(raw) }
  if (next.min === undefined && next.max === undefined) return undefined
  return next
}

function AxisLimitCell({
  theme,
  label,
  value,
  labelFirst,
  layoutSize,
  onChange,
}: {
  theme: Theme
  label: string
  value?: number
  labelFirst?: boolean
  layoutSize: LayoutSize
  onChange: (raw: string) => void
}) {
  const labelEl = (
    <span style={{ fontSize: '9px', lineHeight: 1, whiteSpace: 'nowrap', color: theme.subtext }}>
      {label}
    </span>
  )
  const inputEl = (
    <input
      type="number"
      placeholder="自動"
      title="空欄で自動スケール"
      value={formatValue(value)}
      onChange={(e) => onChange(e.target.value)}
      style={axisInputStyle(theme, layoutSize)}
    />
  )
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
      }}
    >
      {labelFirst ? (
        <>
          {labelEl}
          {inputEl}
        </>
      ) : (
        <>
          {inputEl}
          {labelEl}
        </>
      )}
    </div>
  )
}

type FrameProps = {
  theme: Theme
  showXRange: boolean
  chartMargin: { top: number; right: number; bottom: number; left: number }
  yRange?: AxisRange
  xRange?: AxisRange
  layoutSize?: LayoutSize
  onYRangeChange: (range: AxisRange | undefined) => void
  onXRangeChange: (range: AxisRange | undefined) => void
  children: ReactNode
  noDataOverlay?: ReactNode
}

/**
 * 軸入力をプロット領域の端（Y軸上下・X軸左右）に合わせて配置。
 * グラフは枠いっぱいに描画し、入力は余白に重ねる。
 */
export default function ChartAxisFrame({
  theme,
  showXRange,
  chartMargin,
  yRange,
  xRange,
  layoutSize = 'desktop',
  onYRangeChange,
  onXRangeChange,
  children,
  noDataOverlay,
}: FrameProps) {
  const { top, right, bottom } = chartMargin
  const { frameHeight, xMinLeft } = getLayoutConfig(layoutSize)

  return (
    <div
      style={{
        position: 'relative',
        height: frameHeight,
        width: '100%',
        border: `1px solid ${theme.border}`,
        borderRadius: '4px',
        background: theme.bg,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>

      <div
        style={{
          position: 'absolute',
          left: 4,
          top,
          zIndex: 10,
          transform: 'translateY(-2px)',
        }}
      >
        <AxisLimitCell
          theme={theme}
          label="Y軸最大"
          value={yRange?.max}
          labelFirst
          layoutSize={layoutSize}
          onChange={(raw) => onYRangeChange(updateRange(yRange, 'max', raw))}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 4,
          bottom,
          zIndex: 10,
          transform: 'translateY(2px)',
        }}
      >
        <AxisLimitCell
          theme={theme}
          label="Y軸最小"
          value={yRange?.min}
          labelFirst
          layoutSize={layoutSize}
          onChange={(raw) => onYRangeChange(updateRange(yRange, 'min', raw))}
        />
      </div>

      {showXRange && (
        <div
          style={{
            position: 'absolute',
            left: xMinLeft,
            bottom: 4,
            zIndex: 10,
          }}
        >
          <AxisLimitCell
            theme={theme}
            label="X軸最小"
            value={xRange?.min}
            layoutSize={layoutSize}
            onChange={(raw) => onXRangeChange(updateRange(xRange, 'min', raw))}
          />
        </div>
      )}

      {showXRange && (
        <div
          style={{
            position: 'absolute',
            right,
            bottom: 4,
            zIndex: 10,
          }}
        >
          <AxisLimitCell
            theme={theme}
            label="X軸最大"
            value={xRange?.max}
            layoutSize={layoutSize}
            onChange={(raw) => onXRangeChange(updateRange(xRange, 'max', raw))}
          />
        </div>
      )}

      {noDataOverlay && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
          {noDataOverlay}
        </div>
      )}
    </div>
  )
}