import { useState, useRef, useEffect } from 'react'
import type { ThemeKey, PageKey } from './types'
import { THEMES, PAGES } from './themes'
import Sidebar from './components/Sidebar'
import SettingsPanel from './components/SettingsPanel'
import DashboardPage from './components/DashboardPage'
import ControlPage from './components/ControlPage'
import AnomalyPage from './components/AnomalyPage'

export default function App() {
  const isTouchDevice = !window.matchMedia('(hover: hover)').matches
  const [range, setRange] = useState(20)
  const [intervalSec, setIntervalSec] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [themeKey, setThemeKey] = useState<ThemeKey>('dark-blue')
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const theme = THEMES[themeKey]
  const settingsRef = useRef<HTMLDivElement>(null)
  const gearBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node) &&
        gearBtnRef.current &&
        !gearBtnRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false)
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: theme.bg, color: theme.text, transition: 'background-color 0.3s, color 0.3s' }}>

      {/* ヘッダー */}
      <header
        className="app-header"
        style={{
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="app-header__brand">
          <img src={theme.logo} alt="logo" className="logo" />
          <span className="app-header__title" style={{ color: theme.subtext }}>
            {PAGES.find(p => p.key === currentPage)?.label}
          </span>
        </div>

        {/* 歯車ボタン */}
        <div
          ref={gearBtnRef}
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={(e) => {
            const tooltip = e.currentTarget.querySelector('.settings-tooltip') as HTMLElement
            if (tooltip) tooltip.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            const tooltip = e.currentTarget.querySelector('.settings-tooltip') as HTMLElement
            if (tooltip) tooltip.style.opacity = '0'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowSettings(p => !p)
            }}
            style={{
              background: showSettings ? `${theme.accent}33` : 'transparent',
              border: `1px solid ${showSettings ? theme.accent : theme.border}`,
              borderRadius: '8px', padding: '6px 10px',
              cursor: 'pointer', fontSize: '18px', lineHeight: 1, transition: 'all 0.2s',
            }}
          >
            ⚙️
          </button>
          <span
            className="settings-tooltip"
            style={{
              position: 'absolute',
              bottom: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
              zIndex: 200,
              display: isTouchDevice ? 'none' : undefined,
           }}
          >
           設定
          </span>
        </div>
      </header>

      {/* ヘッダー下レイアウト */}
      <div style={{ position: 'relative', flex: 1 }}>

        {/* サイドバー（内部でモバイル/PCを判定して表示を切替） */}
        <Sidebar
          theme={theme}
          currentPage={currentPage}
          sidebarOpen={sidebarOpen}
          onPageChange={setCurrentPage}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(p => !p)}
        />

        {/* 設定パネル */}
        {showSettings && (
          <div ref={settingsRef}>
            <SettingsPanel
              theme={theme}
              themeKey={themeKey}
              range={range}
              intervalSec={intervalSec}
              isPlaying={isPlaying}
              onThemeChange={setThemeKey}
              onRangeChange={setRange}
              onIntervalChange={setIntervalSec}
              onPlayingChange={setIsPlaying}
            />
          </div>
        )}

        {/* ページコンテンツ */}
        {currentPage === 'dashboard' && (
          <DashboardPage
            theme={theme}
            isPlaying={isPlaying}
            intervalSec={intervalSec}
            range={range}
          />
        )}

        {currentPage === 'control' && (
          <ControlPage theme={theme} />
        )}

        {currentPage === 'anomaly' && (
          <AnomalyPage theme={theme} />
        )}

      </div>

    </div>
  )
}
