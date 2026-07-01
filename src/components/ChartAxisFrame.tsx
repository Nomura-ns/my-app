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

// PC用（横並び：ラベル→入力）
function AxisLimitCell({
  theme,
  label,
  value,
  layoutSize,
  onChange,
}: {
  theme: Theme
  label: string
  value?: number
  layoutSize: LayoutSize
  onChange: (raw: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '10px', whiteSpace: 'nowrap', color: theme.subtext }}>
        {label}
      </span>
      <input
        type="number"
        placeholder="自動"
        title="空欄で自動スケール"
        value={formatValue(value)}
        onChange={(e) => onChange(e.target.value)}
        style={axisInputStyle(theme, layoutSize)}
      />
    </div>
  )
}

// モバイル用（縦並び：ラベル上、入力下）グラフ上に絶対配置
function AxisLimitCellVertical({
  theme,
  label,
  value,
  layoutSize,
  onChange,
}: {
  theme: Theme
  label: string
  value?: number
  layoutSize: LayoutSize
  onChange: (raw: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
      <span style={{ fontSize: '9px', whiteSpace: 'nowrap', color: theme.subtext }}>
        {label}
      </span>
      <input
        type="number"
        placeholder="自動"
        title="空欄で自動スケール"
        value={formatValue(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...axisInputStyle(theme, layoutSize),
          width: '48px',
          height: '22px',
          fontSize: '10px',
          padding: '2px 4px',
        }}
      />
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
  frameHeight?: number
  xInputLeft?: number
  xInputRight?: number
  yInputTop?: number
  yInputBottom?: number
  onYRangeChange: (range: AxisRange | undefined) => void
  onXRangeChange: (range: AxisRange | undefined) => void
  children: ReactNode
  noDataOverlay?: ReactNode
}

export default function ChartAxisFrame({
  theme,
  showXRange,
  yRange,
  xRange,
  layoutSize = 'desktop',
  frameHeight: frameHeightProp,
  onYRangeChange,
  onXRangeChange,
  children,
  noDataOverlay,
}: FrameProps) {
  const { frameHeight: defaultHeight, xMinLeft } = getLayoutConfig(layoutSize)
  const frameHeight = frameHeightProp ?? defaultHeight
  const isMobile = layoutSize === 'mobile'

  return (
    <div style={{ width: '100%' }}>
      {/* グラフ本体 */}
      <div
        style={{
          position: 'relative',
          height: frameHeight,
          width: '100%',
          border: `1px solid ${theme.border}`,
          borderRadius: '4px 4px 0 0',
          background: theme.bg,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>{children}</div>

        {/* モバイル時：Y軸最大/最小をグラフ上に絶対配置 */}
        {isMobile && (
          <>
            <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 10 }}>
              <AxisLimitCellVertical
                theme={theme}
                label="Y軸最大"
                value={yRange?.max}
                layoutSize={layoutSize}
                onChange={(raw) => onYRangeChange(updateRange(yRange, 'max', raw))}
              />
            </div>
            <div style={{ position: 'absolute', bottom: 6, left: 6, zIndex: 10 }}>
              <AxisLimitCellVertical
                theme={theme}
                label="Y軸最小"
                value={yRange?.min}
                layoutSize={layoutSize}
                onChange={(raw) => onYRangeChange(updateRange(yRange, 'min', raw))}
              />
            </div>
          </>
        )}

        {/* モバイルではnoDataOverlayを表示しない */}
        {noDataOverlay && !isMobile && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translate(${xMinLeft / 2}px, 0)`,
            }}
          >
            {noDataOverlay}
          </div>
        )}
      </div>

      {/* 軸入力バー（グラフ下）：PC版はここにY軸入力、モバイルはX軸のみ（あれば） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 10px',
          background: theme.surface,
          borderLeft: `1px solid ${theme.border}`,
          borderRight: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          flexWrap: 'wrap',
        }}
      >
        {!isMobile && (
          <>
            <AxisLimitCell
              theme={theme}
              label="Y軸最大"
              value={yRange?.max}
              layoutSize={layoutSize}
              onChange={(raw) => onYRangeChange(updateRange(yRange, 'max', raw))}
            />
            <AxisLimitCell
              theme={theme}
              label="Y軸最小"
              value={yRange?.min}
              layoutSize={layoutSize}
              onChange={(raw) => onYRangeChange(updateRange(yRange, 'min', raw))}
            />
          </>
        )}
        {showXRange && (
          <>
            <AxisLimitCell
              theme={theme}
              label="X軸最大"
              value={xRange?.max}
              layoutSize={layoutSize}
              onChange={(raw) => onXRangeChange(updateRange(xRange, 'max', raw))}
            />
            <AxisLimitCell
              theme={theme}
              label="X軸最小"
              value={xRange?.min}
              layoutSize={layoutSize}
              onChange={(raw) => onXRangeChange(updateRange(xRange, 'min', raw))}
            />
          </>
        )}
      </div>
    </div>
  )
}