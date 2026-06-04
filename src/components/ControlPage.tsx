import { useState, useEffect, useRef } from 'react'
import type { Theme, ActionStatus, RobotAction } from '../types'

function ActionIcon({ name, theme, active, size = 56 }: { name: string; theme: Theme; active: boolean; size?: number }) {
  const iconMap: Record<string, { icon: string; color: string }> = {
    '移動':     { icon: '➡️', color: '#38bdf8' },
    '下刃撮像': { icon: '📷', color: '#f472b6' },
    '上刃取出': { icon: '⬆️', color: '#34d399' },
    '上刃撮像': { icon: '🔍', color: '#a78bfa' },
    '目標位置': { icon: '🎯', color: '#fb923c' },
    'ネジ締め': { icon: '🔩', color: '#f87171' },
  }
  const match = Object.entries(iconMap).find(([key]) => name.includes(key))
  const { icon, color } = match ? match[1] : { icon: '⚙️', color: theme.accent }

  return (
    <div style={{
      width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      border: `2px solid ${color}`,
      background: active ? `${color}22` : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: `${size * 0.45}px`,
      boxShadow: active ? `0 0 12px ${color}66` : 'none',
      transition: 'all 0.3s', flexShrink: 0,
    }}>
      {icon}
    </div>
  )
}

// スピナー
function Spinner({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 0' }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        border: `3px solid ${color}33`,
        borderTop: `3px solid ${color}`,
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const SEQUENCE = [
  { name: '移動',                 detail: '初期位置へ移動' },
  { name: '下刃撮像',             detail: '下刃の位置を撮像・認識' },
  { name: '移動',                 detail: '上刃取出位置へ移動' },
  { name: '上刃取出中',           detail: '上刃をグリッパーで取り出し' },
  { name: '移動',                 detail: '上刃撮像位置へ移動' },
  { name: '上刃撮像中',           detail: '上刃の位置を撮像・認識' },
  { name: '上刃目標位置へ移動中', detail: '算出した目標位置へ移動' },
  { name: 'ネジ締め中',           detail: '上刃をネジで固定' },
  { name: '移動',                 detail: '上刃取出位置へ移動' },
  { name: '上刃取出中',           detail: '上刃をグリッパーで取り出し' },
  { name: '移動',                 detail: '上刃撮像位置へ移動' },
  { name: '上刃撮像中',           detail: '上刃の位置を撮像・認識' },
  { name: '上刃目標位置へ移動中', detail: '算出した目標位置へ移動' },
  { name: 'ネジ締め中',           detail: '上刃をネジで固定' },
]

const CYCLE_COUNT = 8

function buildActions(): RobotAction[] {
  return SEQUENCE.map((s, i) => ({
    id: i, name: s.name, detail: s.detail,
    status: i === 0 ? 'active' as ActionStatus : 'waiting' as ActionStatus,
    startTime: i === 0 ? (() => { const n = new Date(); return `${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}` })() : '—',
    endTime: undefined,
    progress: i === 0 ? 0 : undefined,
  }))
}

type Props = { theme: Theme }

export default function ControlPage({ theme }: Props) {
  const [cycleIndex, setCycleIndex] = useState(0)
  const [actions, setActions] = useState<RobotAction[]>(buildActions())
  const [spinning, setSpinning] = useState(false) // クルクル表示中
  const [totalSeconds, setTotalSeconds] = useState(0)
  const startTimeRef = useRef<Date>(new Date())
  const pausedRef = useRef(false) // クルクル中は進行停止

  // トータル時間
  useEffect(() => {
    const id = setInterval(() => {
      setTotalSeconds(Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  // シーケンス進行
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return

      setActions(prev => {
        const activeIndex = prev.findIndex(a => a.status === 'active')
        if (activeIndex === -1) return prev
        const active = prev[activeIndex]
        if (active.progress === undefined) return prev

        const next = Math.min(active.progress + 4, 100)

        if (next >= 100) {
          const now = new Date()
          const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
          const nextIndex = activeIndex + 1

          // クルクルを表示してからの切り替え
          pausedRef.current = true
          const lag = Math.floor(Math.random() * 1500) + 500 // 500〜2000msランダム
          setSpinning(true)
          setTimeout(() => {
            setSpinning(false)
            pausedRef.current = false

            if (nextIndex >= prev.length) {
              setCycleIndex(c => {
                const nextCycle = c + 1
                if (nextCycle >= CYCLE_COUNT) {
                  startTimeRef.current = new Date()
                  setTotalSeconds(0)
                  setTimeout(() => { setCycleIndex(0); setActions(buildActions()) }, 300)
                } else {
                  setTimeout(() => { setActions(buildActions()) }, 300)
                }
                return nextCycle
              })
            } else {
              setActions(prev2 => prev2.map((a, i) => {
                if (i === activeIndex) return { ...a, status: 'done' as ActionStatus, progress: undefined, endTime: timeStr }
                if (i === nextIndex) return { ...a, status: 'active' as ActionStatus, startTime: timeStr, progress: 0 }
                return a
              }))
            }
          }, lag)

          return prev.map((a, i) =>
            i === activeIndex ? { ...a, progress: 100 } : a
          )
        }

        return prev.map((a, i) =>
          i === activeIndex ? { ...a, progress: next } : a
        )
      })
    }, 150)
    return () => clearInterval(id)
  }, [])

  const activeIndex = actions.findIndex(a => a.status === 'active')

  // 常に真ん中固定：前1・現在・後1 + 先頭/末尾はnullで埋める
  const prevAction = activeIndex > 0 ? actions[activeIndex - 1] : null
  const currAction = actions[activeIndex] ?? null
  const nextAction = activeIndex < actions.length - 1 ? actions[activeIndex + 1] : null
  const displaySlots: (RobotAction | null)[] = [prevAction, currAction, nextAction]

  const doneCount = actions.filter(a => a.status === 'done').length

  const renderCard = (action: RobotAction | null, position: 'prev' | 'curr' | 'next') => {
    const isActive = position === 'curr'
    const isEmpty = action === null

    if (isEmpty) {
      return (
        <div style={{
          border: `1px dashed ${theme.border}`,
          borderRadius: '16px',
          padding: '32px',
          opacity: 0.15,
          minHeight: isActive ? '160px' : '100px',
        }} />
      )
    }

    return (
      <div style={{
        border: isActive ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
        borderStyle: action.status === 'waiting' ? 'dashed' : 'solid',
        borderRadius: '16px',
        padding: isActive ? '60px 70px' : '30px 32px',
        display: 'flex', alignItems: 'center',
        gap: isActive ? '28px' : '20px',
        background: isActive ? theme.surface : action.status === 'done' ? `${theme.surface}88` : 'transparent',
        opacity: action.status === 'waiting' ? 0.55 : 1,
        boxShadow: isActive ? `0 0 24px ${theme.accent}44` : 'none',
        transition: 'all 0.3s',
      }}>
        {/* インジケーター */}
        <div style={{
          width: isActive ? '12px' : '9px',
          height: isActive ? '12px' : '9px',
          borderRadius: '50%',
          background: isActive ? theme.accent : action.status === 'done' ? theme.subtext : 'transparent',
          border: action.status === 'waiting' ? `2px solid ${theme.border}` : 'none',
          boxShadow: isActive ? `0 0 8px ${theme.accent}` : 'none',
          flexShrink: 0,
        }} />

        <ActionIcon name={action.name} theme={theme} active={isActive} size={isActive ? 72 : 52} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: isActive ? '30px' : '18px', fontWeight: 'bold', color: theme.text }}>
              {action.name}
            </span>
            <span style={{
              fontSize: '13px', padding: '2px 10px', borderRadius: '999px',
              background: isActive ? `${theme.accent}33` : action.status === 'done' ? `${theme.subtext}22` : `${theme.border}44`,
              color: isActive ? theme.accent : theme.subtext,
            }}>
              {isActive ? '実行中' : action.status === 'done' ? '完了' : '待機中'}
            </span>
          </div>
          <p style={{ fontSize: isActive ? '16px' : '12px', color: theme.subtext, margin: '0 0 6px' }}>
            {action.detail}
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: theme.subtext }}>
            {action.startTime !== '—' && <span>開始: {action.startTime}</span>}
            {action.endTime && <span>終了: {action.endTime}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '35px 40px', color: theme.text, maxWidth: '1200px', margin: '0 auto' }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '16px', color: theme.subtext, margin: 0, fontWeight: 'normal', letterSpacing: '0.1em' }}>
          ロボット動作シーケンス
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 14px', fontSize: '13px' }}>
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>{doneCount}</span>
          <span style={{ color: theme.subtext }}>/</span>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{actions.length}</span>
          <span style={{ color: theme.subtext, fontSize: '11px', marginLeft: '4px' }}>完了</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 14px', fontSize: '13px' }}>
          <span style={{ color: theme.subtext, fontSize: '11px' }}>総経過時間</span>
          <span style={{ color: theme.accent, fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* カード3枚 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {displaySlots.map((action, i) => {
          const position = i === 0 ? 'prev' : i === 1 ? 'curr' : 'next'
          return (
            <div key={i}>
              {/* 接続部分 */}
              {i > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '36px' }}>
                  {spinning && position === 'curr' ? (
                    <Spinner color={theme.accent} />
                  ) : (
                    <div style={{ width: '2px', height: '100%', background: i === 1 && action?.status === 'done' ? theme.accent : theme.border, opacity: 0.4 }} />
                  )}
                </div>
              )}
              {renderCard(action, position)}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}