import { useState } from 'react'
import type { ThemeKey, PageKey } from './types'
import { THEMES, PAGES } from './themes'
import Sidebar from './components/Sidebar'
import SettingsPanel from './components/SettingsPanel'
import DashboardPage from './components/DashboardPage'
import ControlPage from './components/ControlPage'

export default function App() {
  const [range, setRange] = useState(20)
  const [intervalSec, setIntervalSec] = useState(0.1)
  const [showSettings, setShowSettings] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [themeKey, setThemeKey] = useState<ThemeKey>('dark-blue')
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const theme = THEMES[themeKey]

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
        <button onClick={() => setShowSettings(p => !p)} style={{
          background: showSettings ? `${theme.accent}33` : 'transparent',
          border: `1px solid ${showSettings ? theme.accent : theme.border}`,
          borderRadius: '8px', padding: '6px 10px',
          cursor: 'pointer', fontSize: '18px', lineHeight: 1, transition: 'all 0.2s',
        }}>
          ⚙️
        </button>
      </header>

      {/* ヘッダー下レイアウト */}
      <div style={{ position: 'relative', flex: 1 }}>

        {/* サイドバー */}
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

      </div>

    </div>
  )
}