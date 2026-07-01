import type { Theme, PageKey } from '../types'
import { PAGES } from '../themes'
import { useIsMobile } from '../hooks/useMediaQuery'

// =============================================
// ミニプレビュー
// =============================================

function DashboardPreview({ theme }: { theme: Theme }) {
  const lines = [
    { points: '10,50 25,30 40,45 55,20 70,35 80,15', color: '#0af3e0' },
    { points: '10,60 25,45 40,55 55,40 70,50 80,35', color: '#43d0f3' },
  ]

  return (
    <div style={{ padding: '8px' }}>
      <div style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '6px',
        padding: '6px',
        overflow: 'hidden',
      }}>
        {/* パネルタイトル */}
        <div style={{ fontSize: '8px', color: theme.subtext, marginBottom: '4px' }}>
          モニタリング
        </div>
        {/* 大きいグラフ */}
        <svg width="100%" height="80" viewBox="0 0 90 70" preserveAspectRatio="none">
          {/* グリッド横線 */}
          {[14, 28, 42, 56].map(y => (
            <line key={y} x1="10" y1={y} x2="90" y2={y}
              stroke={theme.border} strokeWidth="0.5" strokeDasharray="2,2" />
          ))}
          {/* Y軸 */}
          <line x1="10" y1="0" x2="10" y2="62" stroke={theme.border} strokeWidth="0.5" />
          {/* X軸 */}
          <line x1="10" y1="62" x2="90" y2="62" stroke={theme.border} strokeWidth="0.5" />
          {/* 折れ線 */}
          {lines.map((line, li) => (
            <polyline
              key={li}
              points={line.points}
              fill="none"
              stroke={line.color}
              strokeWidth="1.5"
              opacity={li === 0 ? 1 : 0.6}
            />
          ))}
          {/* 凡例 */}
          <circle cx="14" cy="67" r="2" fill={lines[0].color} />
          <circle cx="34" cy="67" r="2" fill={lines[1].color} />
          <text x="18" y="69" fontSize="4" fill={theme.subtext}>Series A</text>
          <text x="38" y="69" fontSize="4" fill={theme.subtext}>Series B</text>
        </svg>
      </div>
    </div>
  )
}

function ControlPreview({ theme }: { theme: Theme }) {
  return (
    <div style={{ padding: '8px' }}>
      <div style={{
        background: theme.bg, border: `1px solid ${theme.border}`,
        borderRadius: '6px', padding: '6px', display: 'flex',
        flexDirection: 'column', gap: '4px',
      }}>
        <div style={{
          background: `${theme.surface}88`, border: `1px solid ${theme.border}`,
          borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: theme.subtext,
        }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '4px' }}>ロボット1</span>
          下刃撮像
        </div>
        <div style={{ textAlign: 'center', color: theme.accent, fontSize: '10px' }}>▼</div>
        <div style={{
          background: theme.surface, border: `1.5px solid ${theme.accent}`,
          borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: theme.text,
          boxShadow: `0 0 6px ${theme.accent}33`,
        }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '4px' }}>ロボット1</span>
          上刃ストックから移動
        </div>
        <div style={{ textAlign: 'center', color: theme.border, fontSize: '10px', opacity: 0.4 }}>▼</div>
        <div style={{
          background: 'transparent', border: `1px dashed ${theme.border}`,
          borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: theme.subtext,
          opacity: 0.5,
        }}>
          <span style={{ fontSize: '8px', marginRight: '4px' }}>ロボット1</span>
          上刃組換台から移動
        </div>
      </div>
    </div>
  )
}

function AlertPreview({ theme }: { theme: Theme }) {
  const alerts = [
    { level: 'error',   label: 'ERR', text: 'モーター過負荷',     time: '12:04' },
    { level: 'warn',    label: 'WRN', text: 'センサー応答遅延',   time: '12:01' },
    { level: 'warn',    label: 'WRN', text: '温度上限接近',       time: '11:58' },
    { level: 'info',    label: 'INF', text: '定期メンテ通知',     time: '11:50' },
  ]
  const colors: Record<string, string> = {
    error: '#f55',
    warn:  '#f93',
    info:  '#0af3e0',
  }

  return (
    <div style={{ padding: '8px' }}>
      <div style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: '6px',
        padding: '5px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 4px',
            borderRadius: '3px',
            background: i === 0 ? `${colors[a.level]}11` : 'transparent',
            borderLeft: `2px solid ${colors[a.level]}`,
          }}>
            <span style={{
              fontSize: '7px',
              fontWeight: 'bold',
              color: colors[a.level],
              minWidth: '22px',
            }}>
              {a.label}
            </span>
            <span style={{ fontSize: '8px', color: theme.text, flex: 1 }}>
              {a.text}
            </span>
            <span style={{ fontSize: '7px', color: theme.subtext }}>
              {a.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================
// サイドバー本体
// =============================================

type Props = {
  theme: Theme
  currentPage: PageKey
  sidebarOpen: boolean
  onPageChange: (page: PageKey) => void
  onClose: () => void
  onToggle: () => void
}

export default function Sidebar({
  theme,
  currentPage,
  sidebarOpen,
  onPageChange,
  onClose,
  onToggle,
}: Props) {

  const isMobile = useIsMobile()

  // モバイル版：画面下部固定のコンパクトなタブバー
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        display: 'flex',
        background: theme.surface,
        borderTop: `1px solid ${theme.border}`,
        zIndex: 100,
        boxSizing: 'border-box',
      }}>
        {PAGES.filter(page => page.key !== 'anomaly').map(page => {
          const isActive = currentPage === page.key
          return (
            <button
              key={page.key}
              onClick={() => onPageChange(page.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: isActive ? theme.accent : theme.subtext,
              }}
            >
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: isActive ? theme.accent : theme.subtext,
                opacity: isActive ? 1 : 0.5,
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 'bold' : 'normal',
              }}>
                {page.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  function renderPreview(pageKey: string) {
    if (pageKey === 'dashboard') return <DashboardPreview theme={theme} />
    if (pageKey === 'anomaly')   return <AlertPreview theme={theme} />
    return <ControlPreview theme={theme} />
  }

  return (
    <>
      {/* ブックマークタブ */}
      <div style={{
        position: 'fixed',
        top: '57px',
        left: sidebarOpen ? '220px' : '0px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
        paddingTop: '20px',
        zIndex: 50,
        transition: 'left 0.3s ease',
      }}>
        <div
          onClick={onToggle}
          style={{
            width: '80px', height: '26px',
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

      {/* スライドパネル */}
      <div style={{
        position: 'fixed', top: '57px', left: 0,
        height: '100vh', width: sidebarOpen ? '220px' : '0px',
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
            <div
              key={page.key}
              onClick={() => { onPageChange(page.key); onClose() }}
              style={{
                marginBottom: '12px',
                cursor: 'pointer',
                borderRadius: '8px',
                border: `1px solid ${currentPage === page.key ? theme.accent : 'transparent'}`,
                background: currentPage === page.key ? `${theme.accent}11` : 'transparent',
                padding: '6px',
                transition: 'all 0.2s',
              }}
            >
              {/* ページ名 */}
              <div style={{
                padding: '2px 4px', fontSize: '12px',
                color: currentPage === page.key ? theme.accent : theme.text,
                fontWeight: currentPage === page.key ? 'bold' : 'normal',
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '4px',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: currentPage === page.key ? theme.accent : theme.subtext,
                  flexShrink: 0,
                }} />
                {page.label}
              </div>

              {/* ミニプレビュー */}
              <div style={{
                borderRadius: '6px', overflow: 'hidden',
                border: `1px solid ${theme.border}`,
                opacity: 0.85,
              }}>
                {renderPreview(page.key)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* オーバーレイ */}
      {sidebarOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.3)' }}
        />
      )}
    </>
  )
}
