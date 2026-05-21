import type { Theme, PageKey } from '../types'
import { PAGES } from '../themes'

// =============================================
// ミニプレビュー
// =============================================

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

function ControlPreview({ theme }: { theme: Theme }) {
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

export default function Sidebar({ theme, currentPage, sidebarOpen, onPageChange, onClose, onToggle }: Props) {
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
            <div key={page.key} style={{ marginBottom: '12px' }}>
              <button
                onClick={() => { onPageChange(page.key); onClose() }}
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