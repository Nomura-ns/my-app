import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts'

const GRAPH_DEFINITIONS = [
  { key: 'A', label: '値A', stroke: '#0af3e0' },
  { key: 'B', label: '値B', stroke: '#43d0f3' },
  { key: 'C', label: '値C', stroke: '#f472b6' },
  { key: 'D', label: '値D', stroke: '#fb923c' },
  { key: 'E', label: '値E', stroke: '#34d399' },
  { key: 'F', label: '値F', stroke: '#60a5fa' },
  { key: 'G', label: '値G', stroke: '#f87171' },
  { key: 'H', label: '値H', stroke: '#a78bfa' },
]

type ThemeKey = 'dark-blue' | 'dark-red' | 'dark-green' | 'light-blue' | 'light-red' | 'light-green'

const THEMES: Record<ThemeKey, {
  label: string; bg: string; surface: string; border: string
  text: string; subtext: string; accent: string; headerBg: string; logo:string;
}> = {
  'dark-blue':   { label: '🌙 ダーク青', bg: '#1a1d3a', surface: '#23274f', border: '#245d9b', text: '#f1f5f9', subtext: '#94a3b8', accent: '#38bdf8', headerBg: '#23274f', logo: '/ns_slitter_silver.png'},
  'dark-red':    { label: '🌙 ダーク赤', bg: '#200f0fff', surface: '#2d1515', border: '#5c2a2a', text: '#fef2f2', subtext: '#fca5a5', accent: '#f87171', headerBg: '#2d1515', logo: '/ns_slitter_silver.png'},
  'dark-green':  { label: '🌙 ダーク緑', bg: '#0a1a0f', surface: '#152d1e', border: '#1f4a30', text: '#f0fdf4', subtext: '#86efac', accent: '#34d399', headerBg: '#152d1e', logo: '/ns_slitter_silver.png' },
  'light-blue':  { label: '☀️ ライト青', bg: '#eff6ff', surface: '#ffffff', border: '#bfdbfe', text: '#1e3a5f', subtext: '#3b82f6', accent: '#2563eb', headerBg: '#dbeafe', logo: '/image001.png' },
  'light-red':   { label: '☀️ ライト赤', bg: '#fff1f2', surface: '#ffffff', border: '#fecdd3', text: '#4c0519', subtext: '#f43f5e', accent: '#e11d48', headerBg: '#ffe4e6' , logo: '/image001.png'},
  'light-green': { label: '☀️ ライト緑', bg: '#f0fdf4', surface: '#ffffff', border: '#bbf7d0', text: '#14532d', subtext: '#16a34a', accent: '#15803d', headerBg: '#dcfce7' , logo: '/image001.png'},
}

type PageKey = 'dashboard' | 'control'

const PAGES: { key: PageKey; label: string; short: string }[] = [
  { key: 'dashboard', label: '運転モニタ', short: '画面' },
  { key: 'control',   label: '制御フロー', short: '制御' },
]

type DataPoint = { time: string; [key: string]: number | string }
type PanelConfig = { id: number; selectedKeys: string[] }
type Theme = typeof THEMES[ThemeKey]

function GraphSelector({ panelId, selectedKeys, onChange, theme }: {
  panelId: number; selectedKeys: string[]
  onChange: (id: number, keys: string[]) => void; theme: Theme
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = (key: string) => {
    if (selectedKeys.includes(key)) onChange(panelId, selectedKeys.filter(k => k !== key))
    else if (selectedKeys.length < 2) onChange(panelId, [...selectedKeys, key])
  }

  const label = selectedKeys.map(k => GRAPH_DEFINITIONS.find(g => g.key === k)?.label).join(' / ') || '未選択'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'transparent', border: `1px solid ${theme.border}`,
        borderRadius: '6px', padding: '4px 10px',
        cursor: 'pointer', fontSize: '13px', color: theme.text,
      }}>
        {label} ▼
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 300,
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '8px', padding: '8px', minWidth: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <p style={{ fontSize: '11px', color: theme.subtext, margin: '0 0 6px 4px' }}>最大2つ選択</p>
          {GRAPH_DEFINITIONS.map(g => {
            const selected = selectedKeys.includes(g.key)
            const disabled = !selected && selectedKeys.length >= 2
            return (
              <div key={g.key} onClick={() => !disabled && toggle(g.key)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px', borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                background: selected ? `${theme.accent}22` : 'transparent',
                color: theme.text,
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.stroke, flexShrink: 0 }} />
                <span style={{ fontSize: '13px' }}>{g.label}</span>
                {selected && <span style={{ marginLeft: 'auto', fontSize: '11px', color: theme.accent }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DashboardPreview({ theme }: { theme: Theme }) {
  return (
    <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: theme.bg, border: `1px solid ${theme.border}`,
          borderRadius: '6px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="80" height="40" viewBox="0 0 80 40">
            <polyline
              points={Array.from({ length: 10 }, (_, j) => `${j * 9},${40 - Math.random() * 30}`).join(' ')}
              fill="none" stroke={theme.accent} strokeWidth="1.5"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

//ミニプレビュー設定箇所
function ControlPreview({ theme }: { theme: Theme }) {
  return (
    <div style={{ padding: '8px' }}>
      <div style={{
        background: theme.bg, border: `1px solid ${theme.border}`,
        borderRadius: '6px', height: '130px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme.subtext, fontSize: '28px',
      }}>
        🎛️
      </div>
    </div>
  )
}

// =============================================
// 制御フローページ
// =============================================

type ActionStatus = 'done' | 'active' | 'waiting'

type RobotAction = {
  id: number
  name: string
  detail: string
  status: ActionStatus
  startTime: string
  endTime?: string
  progress?: number // activeのみ 0~100
}

// 動作アイコンUI
function ActionIcon({ name, theme, active }: { name: string; theme: Theme; active: boolean }) {
  const iconMap: Record<string, { icon: string; color: string }> = {
    '移動': { icon: '➡️', color: '#38bdf8' },
    '把持': { icon: '✊', color: '#f472b6' },
    '解放': { icon: '🖐️', color: '#34d399' },
    '待機': { icon: '⏸️', color: '#94a3b8' },
    '上昇': { icon: '⬆️', color: '#a78bfa' },
    '下降': { icon: '⬇️', color: '#fb923c' },
  }
  const match = Object.entries(iconMap).find(([key]) => name.includes(key))
  const { icon, color } = match ? match[1] : { icon: '⚙️', color: theme.accent }

  return (
    <div style={{
      width: '64px', height: '64px', borderRadius: '50%',
      border: `2px solid ${color}`,
      background: active ? `${color}22` : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px',
      boxShadow: active ? `0 0 12px ${color}66` : 'none',
      transition: 'all 0.3s',
      flexShrink: 0,
    }}>
      {icon}
    </div>
  )
}

function ControlPage({ theme }: { theme: Theme }) {
  const [actions, setActions] = useState<RobotAction[]>([
  { id: 1, name: '移動 A→B', detail: '座標(120, 80, 50)へ移動', status: 'done', startTime: '14:32:10', endTime: '14:32:18' },
  { id: 2, name: '把持', detail: 'グリッパー閉 / 圧力 3.2N', status: 'active', startTime: '14:32:18', progress: 0 },
  { id: 3, name: '上昇', detail: 'Z軸 +150mm', status: 'waiting', startTime: '—' },
  { id: 4, name: '移動 B→C', detail: '座標(200, 80, 50)へ移動', status: 'waiting', startTime: '—' },
  { id: 5, name: '解放', detail: 'グリッパー開', status: 'waiting', startTime: '—' },
  { id: 6, name: '待機', detail: '次の指示待ち', status: 'waiting', startTime: '—' },
])

  // 進捗を少しずつ進めるシミュレーション
  useEffect(() => {
  const id = setInterval(() => {
    setActions(prev => {
      const activeIndex = prev.findIndex(a => a.status === 'active')
      if (activeIndex === -1) return prev

      const active = prev[activeIndex]
      if (active.progress === undefined) return prev

      const next = Math.min(active.progress + 2, 100)

      if (next >= 100) {
        const now = new Date()
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        const nextIndex = activeIndex + 1

        // 最後の動作が完了したらループ（全部リセット）
        if (nextIndex >= prev.length) {
          return prev.map((a, i) => {
            if (i === 0) {
              return { ...a, status: 'active' as ActionStatus, startTime: timeStr, endTime: undefined, progress: 0 }
            }
            return { ...a, status: 'waiting' as ActionStatus, startTime: '—', endTime: undefined, progress: undefined }
          })
        }

        return prev.map((a, i) => {
          if (i === activeIndex) {
            // 現在 → 完了
            return { ...a, status: 'done' as ActionStatus, progress: undefined, endTime: timeStr }
          } else if (i === nextIndex) {
            // 次 → アクティブ
            return { ...a, status: 'active' as ActionStatus, startTime: timeStr, progress: 0 }
          }
          return a
        })
      }

      // まだ進行中
      return prev.map((a, i) =>
        i === activeIndex ? { ...a, progress: next } : a
      )
    })
  }, 100)
  return () => clearInterval(id)
}, [])

  const activeIndex = actions.findIndex(a => a.status === 'active')
  const visibleActions = actions.slice(
  Math.max(0, activeIndex - 1),
  Math.min(actions.length, activeIndex + 2)
)

  return (
   <div style={{ padding: '35px 120px', color: theme.text, maxWidth: '1200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '50px' }}>
      <h2 style={{ fontSize: '16px', color: theme.subtext, margin: 0, fontWeight: 'normal', letterSpacing: '0.1em' }}>
        ロボット動作シーケンス
      </h2>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: `${theme.accent}22`,
        border: `1px solid ${theme.accent}66`,
        borderRadius: '999px', padding: '4px 14px', fontSize: '13px',
      }}>
        <span style={{ color: theme.accent, fontWeight: 'bold' }}>
          {actions.filter(a => a.status === 'done').length}
        </span>
        <span style={{ color: theme.subtext }}>/</span>
        <span style={{ color: theme.text, fontWeight: 'bold' }}>{actions.length}</span>
        <span style={{ color: theme.subtext, fontSize: '11px', marginLeft: '4px' }}>完了</span>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {visibleActions.map((action, i) => {

        const isActive = action.status === 'active'
        const isDone = action.status === 'done'

        return (
          <div key={action.id}>
            {/* 接続線 */}
            {i > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '36px', marginBottom: '0px' }}>
                <div style={{ width: '2px', height: '16px', background: isDone ? theme.accent : theme.border, opacity: 0.4 }} />
              </div>
            )}

            <div style={{
              border: isActive ? `1.5px solid ${theme.accent}` : `1px solid ${theme.border}`,
              borderStyle: action.status === 'waiting' ? 'dashed' : 'solid',
              borderRadius: '12px',
              padding: isActive ? '48px 35px' : '28px 35px',
              display: 'flex', alignItems: 'center',
              gap: isActive ? '24px' : '16px',
              background: isActive ? theme.surface : action.status === 'done' ? `${theme.surface}88` : 'transparent',
              opacity: action.status === 'waiting' ? 0.5 : 1,
              boxShadow: isActive ? `0 0 16px ${theme.accent}33` : 'none',
              transition: 'all 0.3s',
            }}>

              {/* インジケーター */}
              <div style={{
                width: isActive ? '10px' : '8px',
                height: isActive ? '10px' : '8px',
                borderRadius: '50%',
                background: isActive ? theme.accent : action.status === 'done' ? theme.subtext : 'transparent',
                border: action.status === 'waiting' ? `2px solid ${theme.border}` : 'none',
                boxShadow: isActive ? `0 0 6px ${theme.accent}` : 'none',
                flexShrink: 0,
              }} />

              <ActionIcon name={action.name} theme={theme} active={isActive} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: isActive ? '15px' : '14px', fontWeight: 'bold', color: theme.text }}>
                    {action.name}
                  </span>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                    background: isActive ? `${theme.accent}33` : action.status === 'done' ? `${theme.subtext}22` : `${theme.border}44`,
                    color: isActive ? theme.accent : theme.subtext,
                  }}>
                    {isActive ? '実行中' : action.status === 'done' ? '完了' : '待機中'}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: theme.subtext, margin: '0 0 6px' }}>{action.detail}</p>

                {/* プログレスバー（実行中のみ） */}
                {isActive && (
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ height: '6px', borderRadius: '999px', background: `${theme.accent}22`, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '999px',
                        background: theme.accent,
                        width: `${action.progress}%`,
                        transition: 'width 0.1s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* 時間表示 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: theme.subtext }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {action.startTime !== '—' && <span>開始: {action.startTime}</span>}
                    {action.endTime && <span>終了: {action.endTime}</span>}
                  </div>
                  {isActive && (
                    <span style={{ color: theme.accent, fontWeight: 'bold' }}>{action.progress}%</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)
}

export default function App() {
  const [data, setData] = useState<DataPoint[]>([])
  const [range, setRange] = useState(20)
  const [intervalSec, setIntervalSec] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [themeKey, setThemeKey] = useState<ThemeKey>('dark-blue')
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const theme = THEMES[themeKey]

  const [panels, setPanels] = useState<PanelConfig[]>([
    { id: 1, selectedKeys: ['A', 'B'] },
    { id: 2, selectedKeys: ['C', 'D'] },
    { id: 3, selectedKeys: ['E', 'F'] },
    { id: 4, selectedKeys: ['G', 'H'] },
  ])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const now = new Date()
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      setData(prev => {
        const newPoint: DataPoint = { time }
        GRAPH_DEFINITIONS.forEach(g => { newPoint[g.key] = Math.floor(Math.random() * 100) })
        const updated = [...prev, newPoint]
        // 最大50件に制限してクラッシュ防止
        return updated.length > 50 ? updated.slice(-50) : updated
      })
    }, intervalSec * 1000)
    return () => clearInterval(id)
  }, [intervalSec, isPlaying])

  const displayData = data.slice(-range)

  const handlePanelChange = (panelId: number, keys: string[]) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, selectedKeys: keys } : p))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: theme.bg, color: theme.text, transition: 'all 0.3s' }}>

      {/* ===================== ヘッダー（横幅いっぱい） ===================== */}
      <header style={{
        width: '100%',
        background: theme.headerBg,
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '8px 24px',
        position: 'sticky', top: 0, zIndex: 50,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={theme.logo} alt="logo" className="logo" />
          <span style={{ fontSize: '13px', color: theme.subtext }}>
            {PAGES.find(p => p.key === currentPage)?.label}
          </span>
        </div>
        <button onClick={() => setShowSettings(p => !p)} style={{
          background: showSettings ? `${theme.accent}33` : 'transparent',
          border: `1px solid ${showSettings ? theme.accent : theme.border}`,
          borderRadius: '8px', padding: '6px 10px',
          cursor: 'pointer', fontSize: '18px', lineHeight: 1, transition: 'all 0.2s',
        }}>
          ⚙️
        </button>
      </header>

      {/* ===================== ヘッダー下のレイアウト ===================== */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>

        {/* ===================== 左ブックマークタブ ===================== */}
<div style={{
  display: 'flex', flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: '20px', gap: '4px',
  flexShrink: 0, zIndex: 50,
  width: '40px',
  // 背景なし！
}}>
  <div
    onClick={() => setSidebarOpen(p => !p)}
    style={{
      width: '80px',
      height: '26px',
      background: sidebarOpen ? theme.accent : theme.surface,
      color: sidebarOpen ? '#fff' : theme.subtext,
      border: `1px solid ${sidebarOpen ? theme.accent : theme.border}`,
      borderRadius: '6px 6px 0 0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s',
      transform: 'rotate(90deg) translateX(48px) translateY(70px)',
      transformOrigin: 'right center',
      whiteSpace: 'nowrap',
    }}
  >
    画面切替
  </div>
</div>
        {/* ===================== スライドパネル ===================== */}
        <div style={{
          position: 'absolute', top: 0, left: '27px',
          height: '100%', width: sidebarOpen ? '220px' : '0px',
          background: theme.surface,
          borderRight: sidebarOpen ? `1px solid ${theme.border}` : 'none',
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          zIndex: 40,
        }}>
          <div style={{ padding: '12px 8px', minWidth: '200px' }}>
            <p style={{ fontSize: '11px', color: theme.subtext, margin: '0 0 10px 4px', letterSpacing: '0.1em' }}>
              ページ切り替え
            </p>
            {PAGES.map(page => (
              <div key={page.key} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => { setCurrentPage(page.key); setSidebarOpen(false) }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '6px 8px', borderRadius: '6px',
                    border: `1px solid ${currentPage === page.key ? theme.accent : 'transparent'}`,
                    background: currentPage === page.key ? `${theme.accent}22` : 'transparent',
                    color: theme.text, cursor: 'pointer', fontSize: '12px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: currentPage === page.key ? theme.accent : theme.subtext,
                    flexShrink: 0,
                  }} />
                  {page.label}
                </button>
                <div style={{
                  borderRadius: '6px', overflow: 'hidden',
                  border: `1px solid ${theme.border}`,
                  marginTop: '4px', opacity: 0.85,
                }}>
                  {page.key === 'dashboard'
                    ? <DashboardPreview theme={theme} />
                    : <ControlPreview theme={theme} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* スライドパネルを閉じるオーバーレイ */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.3)' }}
          />
        )}

        {/* ===================== メインコンテンツ ===================== */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 設定パネル（オーバーレイ） */}
          {showSettings && (
            <div style={{
              position: 'fixed', top: '57px', right: '16px', zIndex: 100,
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: '12px', padding: '20px 24px', minWidth: '420px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent, margin: 0 }}>設定</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>表示件数</span>
                <input type="range" min={10} max={50} step={10} value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  style={{ width: '180px', accentColor: theme.accent }} />
                <span style={{ fontSize: '13px', width: '50px', color: theme.text }}>{range}件</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>更新間隔</span>
                <input type="range" min={0.5} max={5} step={0.5} value={intervalSec}
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                  style={{ width: '180px', accentColor: theme.accent }} />
                <span style={{ fontSize: '13px', width: '50px', color: theme.text }}>{intervalSec}秒</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>再生状態</span>
                <button onClick={() => setIsPlaying(p => !p)} style={{
                  padding: '6px 20px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
                  background: isPlaying ? '#f87171' : '#34d399', color: '#fff',
                  transition: 'background 0.2s',
                }}>
                  {isPlaying ? '⏸ 停止' : '▶ 再生'}
                </button>
                <span style={{ fontSize: '11px', color: theme.subtext }}>
                  {isPlaying ? '再生中' : '停止中 — ブラシで範囲変更可'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '13px', color: theme.text, paddingTop: '4px' }}>テーマ</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Object.keys(THEMES) as ThemeKey[]).map(key => (
                    <button key={key} onClick={() => setThemeKey(key)} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
                      border: `1px solid ${themeKey === key ? theme.accent : theme.border}`,
                      background: themeKey === key ? `${theme.accent}22` : 'transparent',
                      color: theme.text, cursor: 'pointer',
                      fontWeight: themeKey === key ? 'bold' : 'normal',
                    }}>
                      {THEMES[key].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ページコンテンツ */}
          {currentPage === 'dashboard' && (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {panels.map(panel => (
                  <div key={panel.id} style={{
                    background: theme.surface, border: `1px solid ${theme.border}`,
                    borderRadius: '12px', padding: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>パネル{panel.id}</span>
                      <GraphSelector panelId={panel.id} selectedKeys={panel.selectedKeys} onChange={handlePanelChange} theme={theme} />
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={displayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                        <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.subtext }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: theme.subtext }} />
                        <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: theme.text }} />
                        {panel.selectedKeys.map(key => {
                          const def = GRAPH_DEFINITIONS.find(g => g.key === key)
                          if (!def) return null
                          return (
                            <Line key={key} type="monotone" dataKey={key} name={def.label}
                              stroke={def.stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
                          )
                        })}
                        {!isPlaying && <Brush dataKey="time" height={24} stroke={theme.accent} fill={theme.surface} />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'control' && <ControlPage theme={theme} />}

        </div>
      </div>
    </div>
  )
}