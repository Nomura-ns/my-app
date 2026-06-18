import type { Theme, PageKey } from '../types'
import { PAGES } from '../themes'

// =============================================
// ミニプレビュー
// =============================================

function DashboardPreview({ theme }: { theme: Theme }) {
  // 簡易的なグラフデータ
  const lines = [
    { points: '10,50 25,30 40,45 55,20 70,35 80,15', color: '#0af3e0' },
    { points: '10,60 25,45 40,55 55,40 70,50 80,35', color: '#43d0f3' },
  ]

  return (
    <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          background: theme.bg, border: `1px solid ${theme.border}`,
          borderRadius: '6px', padding: '4px', overflow: 'hidden',
        }}>
          {/* パネルタイトル */}
          <div style={{ fontSize: '8px', color: theme.subtext, marginBottom: '2px' }}>
            パネル{i + 1}
          </div>
          {/* グラフ */}
          <svg width="100%" height="45" viewBox="0 0 90 55" preserveAspectRatio="none">
            {/* グリッド */}
            <line x1="0" y1="18" x2="90" y2="18" stroke={theme.border} strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="36" x2="90" y2="36" stroke={theme.border} strokeWidth="0.5" strokeDasharray="2,2" />
            {/* Y軸 */}
            <line x1="10" y1="0" x2="10" y2="55" stroke={theme.border} strokeWidth="0.5" />
            {/* X軸 */}
            <line x1="10" y1="48" x2="90" y2="48" stroke={theme.border} strokeWidth="0.5" />
            {/* 折れ線 */}
            {lines.map((line, li) => (
              <polyline
                key={li}
                points={line.points}
                fill="none"
                stroke={line.color}
                strokeWidth="1.5"
                opacity={i % 2 === 0 ? 1 : 0.7}
              />
            ))}
          </svg>
        </div>
      ))}
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
        {/* 前の枠 */}
        <div style={{
          background: `${theme.surface}88`, border: `1px solid ${theme.border}`,
          borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: theme.subtext,
        }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '4px' }}>ロボット1</span>
          下刃撮像
        </div>
        {/* 矢印 */}
        <div style={{ textAlign: 'center', color: theme.accent, fontSize: '10px' }}>▼</div>
        {/* 現在枠 */}
        <div style={{
          background: theme.surface, border: `1.5px solid ${theme.accent}`,
          borderRadius: '4px', padding: '4px 6px', fontSize: '9px', color: theme.text,
          boxShadow: `0 0 6px ${theme.accent}33`,
        }}>
          <span style={{ color: theme.accent, fontSize: '8px', marginRight: '4px' }}>ロボット1</span>
          上刃ストックから移動
        </div>
        {/* 矢印 */}
        <div style={{ textAlign: 'center', color: theme.border, fontSize: '10px', opacity: 0.4 }}>▼</div>
        {/* 次の枠 */}
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
              {/* ページ名（クリック不要、表示のみ） */}
              <div style={{
                padding: '4px 8px', fontSize: '12px',
                color: currentPage === page.key ? theme.accent : theme.text,
                fontWeight: currentPage === page.key ? 'bold' : 'normal',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                 <span style={{
                   width: '6px', height: '6px', borderRadius: '50%',
                   background: currentPage === page.key ? theme.accent : theme.subtext,
                   flexShrink: 0,
               }} />
               {page.label}
             </div>

             {/* プレビュー画像クリックで切り替え */}
             <div
               onClick={() => { onPageChange(page.key); onClose() }}
               style={{
                 borderRadius: '6px', overflow: 'hidden',
                 border: `1px solid ${currentPage === page.key ? theme.accent : theme.border}`,
                 marginTop: '4px', opacity: 0.85,
                 cursor: 'pointer',
                 transition: 'all 0.2s',
                 boxShadow: currentPage === page.key ? `0 0 8px ${theme.accent}44` : 'none',
               }}
             >
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