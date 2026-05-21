import type { Theme, ThemeKey } from '../types'
import { THEMES } from '../themes'

// =============================================
// 設定パネル
// =============================================

type Props = {
  theme: Theme
  themeKey: ThemeKey
  range: number
  intervalSec: number
  isPlaying: boolean
  onThemeChange: (key: ThemeKey) => void
  onRangeChange: (value: number) => void
  onIntervalChange: (value: number) => void
  onPlayingChange: (value: boolean) => void
}

export default function SettingsPanel({
  theme, themeKey, range, intervalSec, isPlaying,
  onThemeChange, onRangeChange, onIntervalChange, onPlayingChange,
}: Props) {
  return (
    <div style={{
      position: 'fixed', top: '57px', right: '16px', zIndex: 100,
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: '12px', padding: '20px 24px', minWidth: '420px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <p style={{ fontSize: '13px', fontWeight: 'bold', color: theme.accent, margin: 0 }}>設定</p>

      {/* 表示件数 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>表示件数</span>
        <input type="range" min={10} max={50} step={10} value={range}
          onChange={(e) => onRangeChange(Number(e.target.value))}
          style={{ width: '180px', accentColor: theme.accent }} />
        <span style={{ fontSize: '13px', width: '50px', color: theme.text }}>{range}件</span>
      </div>

      {/* 更新間隔 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>更新間隔</span>
        <input type="range" min={0.5} max={5} step={0.5} value={intervalSec}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          style={{ width: '180px', accentColor: theme.accent }} />
        <span style={{ fontSize: '13px', width: '50px', color: theme.text }}>{intervalSec}秒</span>
      </div>

      {/* 再生・停止 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ width: '80px', fontSize: '13px', color: theme.text }}>再生状態</span>
        <button onClick={() => onPlayingChange(!isPlaying)} style={{
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

      {/* テーマ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <span style={{ width: '80px', fontSize: '13px', color: theme.text, paddingTop: '4px' }}>テーマ</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(Object.keys(THEMES) as ThemeKey[]).map(key => (
            <button key={key} onClick={() => onThemeChange(key)} style={{
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
  )
}