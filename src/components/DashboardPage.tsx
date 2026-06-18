import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts'
import type { AxisRange, Theme, DataPoint, PanelConfig, XAxisKey } from '../types'
import { getStrokeColor } from '../plc'
import {
  collectRequiredAddresses,
  countPlottablePoints,
  getChartSeries,
  isValidPanel,
  migrateLegacyPanel,
  normalizeAddresses,
  normalizePanel,
  resolveDomain,
} from '../chartAxis'
import { usePlcWebSocket } from '../hooks/usePlcWebSocket'
import { useIsMobile } from '../hooks/useMediaQuery'
import PanelAxisControls from './PanelAxisControls'
import ChartAxisFrame, { getChartFrameHeight } from './ChartAxisFrame'
import { getLineChartMargin, type LayoutSize } from '../axisControlStyles'
import { calcDynamicFrameHeight } from '../axisControlStyles'

const DEFAULT_PANELS: PanelConfig[] = [
  { id: 1, xAxis: 15004, yAddresses: [15000, 15002] },
  { id: 2, xAxis: 'time', yAddresses: [15000, 15002] },
  { id: 3, xAxis: 'time', yAddresses: [15000] },
  { id: 4, xAxis: 15004, yAddresses: [15002] },
]

const PANELS_STORAGE_KEY = 'plc-dashboard-panels'

function loadPanels(): PanelConfig[] {
  try {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY)
    if (!raw) return DEFAULT_PANELS
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    if (!Array.isArray(parsed) || parsed.length !== 4) return DEFAULT_PANELS
    return parsed.map((p, i) =>
      migrateLegacyPanel({ ...p, id: (p.id as number) ?? i + 1 }, (p.id as number) ?? i + 1),
    )
  } catch {
    return DEFAULT_PANELS
  }
}

type Props = {
  theme: Theme
  isPlaying: boolean
  intervalSec: number
  range: number
}

const STATUS_LABEL: Record<string, string> = {
  idle: '未接続',
  connecting: '接続中…',
  open: 'PLC 受信中',
  closed: '切断',
  error: 'エラー',
}

function NoDataHint({ theme, message }: { theme: Theme; message: string }) {
  const parts = message.split('。')
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textAlign: 'center',
        fontSize: '12px',
        color: theme.subtext,
        pointerEvents: 'none',
        width: '80%',
      }}
    >
      {parts.filter(p => p.trim()).map((part, i) => (
        <span key={i}>{part}。</span>
      ))}
    </div>
  )
}

function PanelChart({
  panel,
  displayData,
  theme,
  isPlaying,
  layoutSize,
  onYRangeChange,
  onXRangeChange,
}: {
  panel: PanelConfig
  displayData: DataPoint[]
  theme: Theme
  isPlaying: boolean
  layoutSize: LayoutSize
  onYRangeChange: (range: AxisRange | undefined) => void
  onXRangeChange: (range: AxisRange | undefined) => void
}) {
  const frameHeight = calcDynamicFrameHeight() 
  const normalized = normalizePanel(panel)
  const isTimeMode = normalized.xAxis === 'time'
  const showXRange = !isTimeMode
  
  if (!isValidPanel(normalized)) {
    return (
      <div
        style={{
          height: frameHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.subtext,
          fontSize: '13px',
        }}
      >
        X軸・Y軸の組み合わせが不正です
      </div>
    )
  }

  const series = getChartSeries(normalized)
  const yKeys = series.map((s) => s.yKey)
  const xKey = series[0]?.xKey
  const plottableKeys = isTimeMode ? yKeys : xKey ? [xKey, ...yKeys] : yKeys
  const plottable = countPlottablePoints(displayData, plottableKeys)
  const yDomain = resolveDomain(displayData, yKeys, normalized.yRange)
  const xDomain = xKey ? resolveDomain(displayData, [xKey], normalized.xRange) : ['auto', 'auto']
  const withBrush = isTimeMode && !isPlaying
  const chartMargin = getLineChartMargin(showXRange, withBrush, layoutSize)

  const chartEl = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={displayData} margin={chartMargin}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
        {isTimeMode ? (
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.subtext }} />
        ) : (
          <XAxis
            dataKey={xKey}
            type="number"
            tick={{ fontSize: 10, fill: theme.subtext }}
            domain={xDomain}
          />
        )}
        <YAxis tick={{ fontSize: 10, fill: theme.subtext }} domain={yDomain} />
        <Tooltip
          contentStyle={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        />
        {series.map((s) => (
          <Line
            key={s.yKey}
            type="monotone"
            dataKey={s.yKey}
            name={s.label}
            stroke={getStrokeColor(s.yAddr)}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        ))}
        {isTimeMode && !isPlaying && (
          <Brush dataKey="time" height={20} stroke={theme.accent} fill={theme.surface} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <ChartAxisFrame
      theme={theme}
      showXRange={showXRange}
      chartMargin={chartMargin}
      layoutSize={layoutSize}
      frameHeight={frameHeight}
      yRange={normalized.yRange}
      xRange={normalized.xRange}
      onYRangeChange={onYRangeChange}
      onXRangeChange={onXRangeChange}
      noDataOverlay={
        plottable === 0 && yKeys.length > 0 ? (
          <NoDataHint
            theme={theme}
            message={`${yKeys.join(', ')} のデータがまだありません。新しい受信データが溜まると表示されます。`}
          />
        ) : undefined
      }
    >
      {chartEl}
    </ChartAxisFrame>
  )
}

export default function DashboardPage({ theme, isPlaying, intervalSec, range }: Props) {
  const [panels, setPanels] = useState<PanelConfig[]>(loadPanels)
  const isMobile = useIsMobile()
  const layoutSize: LayoutSize = isMobile ? 'mobile' : 'desktop'

  const allSelectedAddresses = useMemo(
    () => collectRequiredAddresses(panels),
    [panels],
  )

  const { status, errorMessage, data, browserCount } = usePlcWebSocket({
    enabled: false,//一時的？
    isPlaying,
    intervalSec,
    selectedAddresses: allSelectedAddresses,
  })

  const displayData = data.slice(-range)

  const savePanels = (next: PanelConfig[]) => {
    localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(next.map(normalizePanel)))
    return next.map(normalizePanel)
  }

  const updatePanel = (panelId: number, patch: Partial<PanelConfig>) => {
    setPanels((prev) =>
      savePanels(prev.map((p) => (p.id === panelId ? normalizePanel({ ...p, ...patch }) : p))),
    )
  }

  const handleXAxisChange = (panelId: number, xAxis: XAxisKey) => {
    setPanels((prev) =>
      savePanels(
        prev.map((p) => {
          if (p.id !== panelId) return p
          if (xAxis === 'time') {
            return normalizePanel({ ...p, xAxis: 'time', xRange: undefined })
          }
          return normalizePanel({ ...p, xAxis })
        }),
      ),
    )
  }

  const statusColor =
    status === 'open' ? '#34d399' : status === 'error' ? '#f87171' : theme.subtext

  return (
    <div className="dashboard-page">
      <div
        className="status-bar"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          marginTop: '-16px',   // ← 上の余白（増減で上下に移動）
          marginBottom: '16px', // ← 下の余白（増減で上下に移動）
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: statusColor,
            boxShadow: status === 'open' ? `0 0 8px ${statusColor}` : 'none',
          }}
        />
        <span style={{ color: theme.text }}>
          {STATUS_LABEL[status] ?? status}
          {errorMessage && (
            <span style={{ color: '#f87171', marginLeft: '8px' }}>— {errorMessage}</span>
          )}
        </span>
        {browserCount !== null && (
          <span className="status-bar__meta" style={{ color: theme.subtext }}>
            ブラウザ接続: {browserCount} 台
          </span>
        )}
        {!isPlaying && (
          <span style={{ color: theme.subtext }}>停止中 — 新規データは追記されません</span>
        )}
        {data.length > 0 && (
          <span style={{ color: theme.subtext }}>データ点数: {data.length}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', width: '100%' }}>
        {panels.map((panel) => {
          const normalized = normalizePanel(panel)
          return (
            <div
              key={panel.id}
              className="panel-card"
              style={{
                position: 'relative',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <PanelAxisControls
                panelId={panel.id}
                xAxis={normalized.xAxis}
                yAddresses={normalized.yAddresses}
                onXAxisChange={(v) => handleXAxisChange(panel.id, v)}
                onYAddressesChange={(addrs) =>
                  updatePanel(panel.id, { yAddresses: normalizeAddresses(addrs) })
                }
                theme={theme}
                layoutSize={layoutSize}
              />

              <PanelChart
                panel={normalized}
                displayData={displayData}
                theme={theme}
                isPlaying={isPlaying}
                layoutSize={layoutSize}
                onYRangeChange={(yRange) => updatePanel(panel.id, { yRange })}
                onXRangeChange={(xRange) => updatePanel(panel.id, { xRange })}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}