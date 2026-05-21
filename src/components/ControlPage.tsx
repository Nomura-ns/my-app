import { useState, useEffect } from 'react'
import type { Theme, ActionStatus, RobotAction } from '../types'

// =============================================
// 動作アイコンUI
// =============================================

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

// =============================================
// 制御フローページ
// =============================================

type Props = {
  theme: Theme
}

export default function ControlPage({ theme }: Props) {
  const [actions, setActions] = useState<RobotAction[]>([
    { id: 1, name: '移動 A→B', detail: '座標(120, 80, 50)へ移動', status: 'done', startTime: '14:32:10', endTime: '14:32:18' },
    { id: 2, name: '把持', detail: 'グリッパー閉 / 圧力 3.2N', status: 'active', startTime: '14:32:18', progress: 0 },
    { id: 3, name: '上昇', detail: 'Z軸 +150mm', status: 'waiting', startTime: '—' },
    { id: 4, name: '移動 B→C', detail: '座標(200, 80, 50)へ移動', status: 'waiting', startTime: '—' },
    { id: 5, name: '解放', detail: 'グリッパー開', status: 'waiting', startTime: '—' },
    { id: 6, name: '待機', detail: '次の指示待ち', status: 'waiting', startTime: '—' },
  ])

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

          if (nextIndex >= prev.length) {
            return prev.map((a, i) => {
              if (i === 0) return { ...a, status: 'active' as ActionStatus, startTime: timeStr, endTime: undefined, progress: 0 }
              return { ...a, status: 'waiting' as ActionStatus, startTime: '—', endTime: undefined, progress: undefined }
            })
          }

          return prev.map((a, i) => {
            if (i === activeIndex) return { ...a, status: 'done' as ActionStatus, progress: undefined, endTime: timeStr }
            if (i === nextIndex) return { ...a, status: 'active' as ActionStatus, startTime: timeStr, progress: 0 }
            return a
          })
        }

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

          return (
            <div key={action.id}>
              {i > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '36px' }}>
                  <div style={{ width: '2px', height: '16px', background: action.status === 'done' ? theme.accent : theme.border, opacity: 0.4 }} />
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