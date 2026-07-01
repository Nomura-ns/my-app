import { useState, useMemo, useEffect, useRef } from 'react'

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
import { getStrokeColor, addressToDataKey } from '../plc'
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
import ChartAxisFrame from './ChartAxisFrame'
import { getLineChartMargin, type LayoutSize } from '../axisControlStyles'
import { useFrameHeight } from '../hooks/useFrameHeight'

// ランダムデータ生成ユーティリティ（モバイルプレビュー用）
 function generateMockPoint(addresses: number[], index: number): DataPoint {
   const point: DataPoint = {
    time: new Date(Date.now() - index * 100).toLocaleTimeString('ja-JP', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
    _ts: Date.now() - index * 100,  // ← これを追加
  }
  for (const addr of addresses) {
    // アドレスごとに異なる波形でリアルっぽく
    const base = (addr % 100)           // アドレスで基準値をずらす
    const noise = (Math.random() - 0.5) * 20
    const wave = Math.sin(Date.now() / 1000 + addr) * 30
    point[addressToDataKey(addr)] = Math.round((base + wave + noise) * 10) / 10
  }
  return point
}

function generateMockData(range: number, addresses: number[]): DataPoint[] {
  return Array.from({ length: range }, (_, i) =>
    generateMockPoint(addresses, range - i)
  )
}


const DEFAULT_PANELS: PanelConfig[] = [
  { id: 1, xAxis: 15004, yAddresses: [15000, 15002] },
  { id: 2, xAxis: 'time', yAddresses: [15000, 15002] },
  { id: 3, xAxis: 'time', yAddresses: [15000] },
  { id: 4, xAxis: 15004, yAddresses: [15002] },
]

const PANELS_STORAGE_KEY = 'plc-dashboard-panels'

function loadPanels(isMobile: boolean): PanelConfig[] {
  try {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY)
    if (!raw) return DEFAULT_PANELS
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    if (!Array.isArray(parsed) || parsed.length !== 4) return DEFAULT_PANELS
    const panels = parsed.map((p, i) =>
      migrateLegacyPanel({ ...p, id: (p.id as number) ?? i + 1 }, (p.id as number) ?? i + 1),
    )
    // モバイルは全パネルをtime固定に
    if (isMobile) {
      return panels.map((p) => normalizePanel({ ...p, xAxis: 'time', xRange: undefined }))
    }
    return panels
  } catch {
    return DEFAULT_PANELS
  }
}

type Props = {
  theme: Theme
  isPlaying: boolean
  intervalSec: number
  range: number
  mobile?: boolean
}
const STATUS_LABEL: Record<string, string> = {
  idle: '未接続',
  connecting: '接続中…',
  open: 'PLC 受信中',
  closed: '切断',
  error: 'エラー',
}

function NoDataHint({ theme, message }: { theme: Theme; message: string }) {
  const isMobile = useIsMobile()
  const parts = message.split('。')
  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? '16px': '50%',
        left: '50%',
        transform: isMobile
         ? 'translate(-35%, 180%)'
         : 'translate(-50%, -110%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        textAlign: 'center',
        fontSize: isMobile
         ? '10px'
         : '12px',
        color: theme.subtext,
        pointerEvents: 'none',
        width: isMobile
         ? '92%'
         : '80%',
        maxWidth: '100%',
        padding: isMobile
          ? '0 8px'
          : '0',
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
  const frameHeight = useFrameHeight(layoutSize)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setSize({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
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
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {size && (
        <LineChart
          width={size.width}
          height={size.height}
          data={displayData}
          margin={chartMargin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
          {isTimeMode ? (
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.subtext }} />
          ) : (
            <XAxis dataKey={xKey} type="number" tick={{ fontSize: 10, fill: theme.subtext }} domain={xDomain} />
          )}
          <YAxis tick={{ fontSize: 10, fill: theme.subtext }} domain={yDomain} allowDataOverflow={true} />
          <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }} />
          {series.map((s) => (
            <Line key={s.yKey} type="monotone" dataKey={s.yKey} name={s.label}
              stroke={getStrokeColor(s.yAddr)} strokeWidth={2} dot={false}
              isAnimationActive={false} connectNulls />
          ))}
          {isTimeMode && !isPlaying && (
            <Brush dataKey="time" height={20} stroke={theme.accent} fill={theme.surface} />
          )}
        </LineChart>
      )}
    </div>
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

export default function DashboardPage({
  theme,
  isPlaying,
  intervalSec,
  range,
  mobile = false,
}: Props) {
  const deviceMobile = useIsMobile()
  const isMobile = mobile || deviceMobile
  
  const [panels, setPanels] = useState<PanelConfig[]>(() => loadPanels(isMobile))
  const [activePanelId, setActivePanelId] = useState<number>(1)
 
  const layoutSize: LayoutSize = isMobile ? 'mobile' : 'desktop'

  
  const activePanel = panels.find((p) => p.id === activePanelId) ?? panels[0]
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

  // --- モバイル用ランダムデータ ---
 const [mockData, setMockData] = useState<DataPoint[]>(() =>
  isMobile ? generateMockData(range, allSelectedAddresses) : []
)

 useEffect(() => {
  if (!isMobile || !isPlaying) return
  const intervalMs = Math.max(intervalSec * 1000, 100)
  const id = setInterval(() => {
    setMockData(prev => {
      const next = [...prev.slice(-range + 1), generateMockPoint(allSelectedAddresses, 0)]
      return next
    })
  }, intervalMs)
  
  return () => clearInterval(id)
 }, [isMobile, isPlaying, intervalSec, range, allSelectedAddresses])
 // ---------------------------------
 useEffect(() => {
  if (!isMobile || !isPlaying) return
  const intervalMs = Math.max(intervalSec * 1000, 100)
  const id = setInterval(() => {
    setMockData(prev => {
      const next = [...prev.slice(-range + 1), generateMockPoint(allSelectedAddresses, 0)]
      return next
    })
  }, intervalMs)
  return () => clearInterval(id)
}, [isMobile, isPlaying, intervalSec, range, allSelectedAddresses])
// ---------------------------------

// ↓これを新たに追加（別のuseEffect）
useEffect(() => {
  if (!isMobile) return
  setPanels((prev) =>
    prev.map((p) => normalizePanel({ ...p, xAxis: 'time', xRange: undefined }))
  )
}, [isMobile])
  const displayData = isMobile ? mockData : data.slice(-range)

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
  const resolvedXAxis: XAxisKey = isMobile ? 'time' : xAxis
  setPanels((prev) =>
    savePanels(
      prev.map((p) => {
        if (p.id !== panelId) return p
        if (resolvedXAxis === 'time') {
          return normalizePanel({ ...p, xAxis: 'time', xRange: undefined })
        }
        return normalizePanel({ ...p, xAxis: resolvedXAxis })
      }),
    ),
  )
}

  const statusColor =
    status === 'open' ? '#34d399' : status === 'error' ? '#f87171' : theme.subtext
    
      
    return (
    <div className="dashboard-page">
     {!isMobile &&(
      <div
        className="status-bar"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text,
         marginTop: isMobile
      ? '16px'
      : '-16px',   // ← 上の余白（増減で上下に移動）
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
     )}  
       {/* ✅ モバイル時のパネル選択タブ */}
        <div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '12px',
}}>
  {panels.map((p) => (
    <button
      key={p.id}
      onClick={() => setActivePanelId(p.id)}
      style={{
        flex: 1,
        padding: '6px 0',
        fontSize: '12px',
        borderRadius: '6px',
        border: `1px solid ${theme.border}`,
        background: activePanelId === p.id ? theme.accent : theme.surface,
        color: activePanelId === p.id ? '#fff' : theme.text,
        cursor: 'pointer',
        fontWeight: activePanelId === p.id ? 'bold' : 'normal',
      }}
    >
      パネル {p.id}
    </button>
  ))}
</div> 

<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    width: '100%',
    minWidth: 0,
  }}
>
  {[activePanel].map((panel) => {
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
