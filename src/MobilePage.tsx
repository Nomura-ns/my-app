import { useState } from 'react'
import type { ThemeKey } from './types'
import { THEMES } from './themes'

import DashboardPage from './components/DashboardPage'

export default function MobilePage() {

  const [range] = useState(20)
  const [intervalSec] = useState(0.1)
  const [isPlaying] = useState(true)
  const [themeKey] = useState<ThemeKey>('dark-blue')

  const theme = THEMES[themeKey]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
      }}
    >

      {/* 共通ヘッダー */}
      <header
        className="app-header"
        style={{
          background: theme.headerBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="app-header__brand">
          <img
            src={theme.logo}
            alt="logo"
            className="logo"
          />

          <span
            className="app-header__title"
            style={{
              color: theme.subtext
            }}
          >
            Dashboard
          </span>
        </div>
      </header>

      {/* グラフだけ表示 */}
      <DashboardPage
        theme={theme}
        isPlaying={isPlaying}
        intervalSec={intervalSec}
        range={range}

        // ←あとで追加
        mobile
      />

    </div>
  )
}