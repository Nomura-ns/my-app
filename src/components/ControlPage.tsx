import { useState, useEffect, useRef } from 'react'
import type { Theme } from '../types'

type StepStatus = 'done' | 'active' | 'waiting'
type SubStep = { name: string }
type MainStep = {
  id: number
  name: string
  robot: string
  subSteps: SubStep[]
  status: StepStatus
  activeSubIndex: number
  startTime: string
  endTime?: string
}

const MAIN_SEQUENCE: Omit<MainStep, 'id' | 'status' | 'activeSubIndex' | 'startTime' | 'endTime'>[] = [
  { name: '下刃撮像', robot: 'ロボット1', subSteps: [{ name: '下刃へ移動' }, { name: '下刃の溝を撮影' }, { name: '上刃ストックへ移動' }] },
  { name: '上刃ストックから上刃組換台に移動', robot: 'ロボット1', subSteps: [{ name: '上刃をつかむ' }, { name: '上刃を取り出す' }, { name: '上刃組換台へ移動' }] },
  { name: '上刃組換台から上刃軸へ移動', robot: 'ロボット1', subSteps: [{ name: '上刃交換台に上刃を置く' }, { name: '持ち換える' }, { name: '上刃軸へ移動' }] },
  { name: '上刃軸に上刃を入れる', robot: 'ロボット1', subSteps: [{ name: '勘合' }, { name: 'カメラで撮影(つかみずれ調整)' }, { name: '上刃取付位置へ移動' }] },
  { name: '上刃を固定', robot: 'ロボット2', subSteps: [{ name: '上刃正面まで移動' }, { name: 'ネジ締め' }, { name: '待機位置へ移動' }] },
  { name: '上刃を固定', robot: 'ロボット1', subSteps: [{ name: '上刃正面まで移動' }, { name: 'ネジ締め' }, { name: '待機位置へ移動' }] },
  { name: '上刃ストックへ移動', robot: 'ロボット1', subSteps: [{ name: '上刃を離す' }, { name: '上刃ストックへ移動' }] },
]

const CYCLE_COUNT = 8

function buildSteps(): MainStep[] {
  const now = new Date()
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  return MAIN_SEQUENCE.map((s, i) => ({
    ...s, id: i,
    status: i === 0 ? 'active' : 'waiting',
    activeSubIndex: i === 0 ? 0 : -1,
    startTime: i === 0 ? timeStr : '—',
    endTime: undefined,
  }))
}

function useCardHeights() {
  const [heights, setHeights] = useState({ active: 400, inactive: 80, arrow: 32 })

  useEffect(() => {
    function calc() {
      const windowH = window.innerHeight
      const headerBarH = 57
      const pageHeaderH = 56
      const pagePaddingH = 32
      const arrowH = 32
      const inactiveH = 80
      const available = windowH - headerBarH - pageHeaderH - pagePaddingH - (arrowH * 2) - (inactiveH * 2)
      const activeH = Math.max(available, 200)
      setHeights({ active: activeH, inactive: inactiveH, arrow: arrowH })
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  return heights
}

// =============================================
// プレースホルダー（画像未設定時）
// =============================================
function ImagePlaceholder({ height, theme }: { height: number; theme: Theme }) {
  return (
    <div style={{
      height: `${height}px`,
      background: theme.bg,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        padding: '8px',
        height: `${Math.floor(height * 0.75)}px`,
        width: '80%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#aaaaaa',
        fontSize: '20px',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
      }}>
        image
      </div>
    </div>
  )
}

// =============================================
// 下刃撮像シミュレーション
// =============================================
function DownBladeSimulation({ theme, activeSubIndex, height }: {
  theme: Theme; activeSubIndex: number; height: number
}) {
  const images = [
    { src: '/下刃へ移動.png', label: '下刃へ移動' },
    { src: '/下刃溝作成.png', label: '下刃溝撮影' },
    { src: '/上刃ストックへ移動.png', label: '上刃ストックへ移動' },
  ]
  const currentIndex = Math.min(activeSubIndex, images.length - 1)
  const imgHeight = Math.floor(height * 0.80)

  return (
    <div style={{
      position: 'relative', height: `${height}px`, background: theme.bg,
      borderRadius: '12px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '6px',
    }}>
      <img
        src={images[currentIndex].src}
        alt={images[currentIndex].label}
        style={{
          height: `${imgHeight}px`,
          maxWidth: '90%',
          objectFit: 'contain',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '8px',
        }}
      />
      <div style={{ display: 'flex', gap: '6px' }}>
        {images.map((_, i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: i === currentIndex ? theme.accent : theme.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// =============================================
// 動作シミュレーション
// =============================================
function ActionSimulation({ name, theme, activeSubIndex, height }: {
  name: string; theme: Theme; activeSubIndex: number; height: number
}) {
  if (name.includes('下刃撮像')) return (
    <DownBladeSimulation theme={theme} activeSubIndex={activeSubIndex} height={height} />
  )

  // 下刃撮像以外はプレースホルダー
  return <ImagePlaceholder height={height} theme={theme} />
}

// =============================================
// メインカード
// =============================================
function StepCard({ step, theme, isActive, isPrev, activeCardHeight }: {
  step: MainStep; theme: Theme; isActive: boolean; isPrev: boolean; activeCardHeight: number
}) {
  const simHeight = Math.floor(activeCardHeight * 0.60)

  return (
    <div style={{
      border: isActive ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
      borderStyle: step.status === 'waiting' ? 'dashed' : 'solid',
      borderRadius: '16px',
      padding: isActive ? '14px 24px' : '8px 16px',
      background: isActive ? theme.surface : isPrev ? `${theme.surface}88` : 'transparent',
      opacity: step.status === 'waiting' ? 0.5 : 1,
      boxShadow: isActive ? `0 0 24px ${theme.accent}44` : 'none',
      transition: 'all 0.3s',
      height: isActive ? `${activeCardHeight}px` : undefined,
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ロボットバッジ + タイトル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isActive ? '8px' : '4px', flexShrink: 0 }}>
        <span style={{
          fontSize: isActive ? '16px' : '12px', padding: '2px 8px', borderRadius: '999px',
          background: step.robot === 'ロボット2' ? '#f4727233' : `${theme.accent}33`,
          color: step.robot === 'ロボット2' ? '#f47272' : theme.accent,
          border: `1px solid ${step.robot === 'ロボット2' ? '#f4727266' : `${theme.accent}66`}`,
          fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {step.robot}
        </span>
        <span style={{
          fontSize: isActive ? '22px' : '15px', fontWeight: 'bold', color: theme.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {step.name}
        </span>
        <span style={{
          fontSize: isActive ? '14px' : '12px', padding: '2px 8px', borderRadius: '999px', marginLeft: 'auto', flexShrink: 0,
          background: isActive ? `${theme.accent}33` : step.status === 'done' ? `${theme.subtext}22` : `${theme.border}44`,
          color: isActive ? theme.accent : theme.subtext,
        }}>
          {isActive ? '実行中' : step.status === 'done' ? '完了' : '待機中'}
        </span>
      </div>

      {/* 小項目（横並び） */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        flexWrap: 'nowrap', justifyContent: 'center',
        marginBottom: isActive ? '8px' : '0px',
        flexShrink: 0, overflow: 'hidden',
      }}>
        {step.subSteps.map((sub, i) => {
          const isDone = i < step.activeSubIndex || (step.status === 'done')
          const isCurrent = isActive && i === step.activeSubIndex
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && (
                <span style={{ color: isDone ? theme.accent : theme.border, fontSize: '12px', opacity: 0.7 }}>▶</span>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px', borderRadius: '999px',
                background: isCurrent ? `${theme.accent}22` : isDone ? `${theme.subtext}11` : 'transparent',
                border: `1px solid ${isCurrent ? theme.accent : isDone ? theme.subtext + '44' : theme.border + '44'}`,
                transition: 'all 0.3s',
              }}>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: isCurrent ? theme.accent : isDone ? theme.subtext : theme.border,
                  boxShadow: isCurrent ? `0 0 4px ${theme.accent}` : 'none', flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '17px',
                  color: isCurrent ? theme.accent : isDone ? theme.text : theme.subtext,
                  fontWeight: isCurrent ? 'bold' : 'normal', whiteSpace: 'nowrap',
                }}>
                  {sub.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* シミュレーション（現在のみ） */}
      {isActive && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ActionSimulation
            name={step.name}
            theme={theme}
            activeSubIndex={step.activeSubIndex}
            height={simHeight}
          />
        </div>
      )}

      {/* 時間表示 */}
      {(step.startTime !== '—' || step.endTime) && (
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: theme.subtext, marginTop: '6px', flexShrink: 0 }}>
          {step.startTime !== '—' && <span>開始: {step.startTime}</span>}
          {step.endTime && <span>終了: {step.endTime}</span>}
        </div>
      )}
    </div>
  )
}

// =============================================
// メインコンポーネント
// =============================================
type Props = { theme: Theme }

export default function ControlPage({ theme }: Props) {
  const stepsRef = useRef<MainStep[]>(buildSteps())
  const cycleRef = useRef(0)
  const spinUntilRef = useRef(0)
  const startTimeRef = useRef<Date>(new Date())
  const cardHeights = useCardHeights()

  const [steps, setSteps] = useState<MainStep[]>(stepsRef.current)
  const [cycleIndex, setCycleIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)

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
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      if (spinUntilRef.current > now) return

      if (spinUntilRef.current > 0) {
        spinUntilRef.current = 0
        setTransitioning(false)

        const prev = stepsRef.current
        const activeStepIndex = prev.findIndex(s => s.status === 'active')
        const activeStep = prev[activeStepIndex]
        const nowDate = new Date()
        const timeStr = `${nowDate.getHours()}:${String(nowDate.getMinutes()).padStart(2, '0')}:${String(nowDate.getSeconds()).padStart(2, '0')}`
        const nextSubIndex = activeStep.activeSubIndex + 1

        if (nextSubIndex < activeStep.subSteps.length) {
          stepsRef.current = prev.map((s, i) =>
            i === activeStepIndex ? { ...s, activeSubIndex: nextSubIndex } : s
          )
        } else {
          const nextStepIndex = activeStepIndex + 1
          if (nextStepIndex >= prev.length) {
            const nextCycle = cycleRef.current + 1
            if (nextCycle >= CYCLE_COUNT) {
              cycleRef.current = 0
              setCycleIndex(0)
              startTimeRef.current = new Date()
              setTotalSeconds(0)
              stepsRef.current = buildSteps()
            } else {
              cycleRef.current = nextCycle
              setCycleIndex(nextCycle)
              stepsRef.current = buildSteps()
            }
          } else {
            stepsRef.current = prev.map((s, i) => {
              if (i === activeStepIndex) return { ...s, status: 'done' as StepStatus, activeSubIndex: s.subSteps.length, endTime: timeStr }
              if (i === nextStepIndex) return { ...s, status: 'active' as StepStatus, activeSubIndex: 0, startTime: timeStr }
              return s
            })
          }
        }
        setSteps([...stepsRef.current])
        return
      }

      const prev = stepsRef.current
      const activeStepIndex = prev.findIndex(s => s.status === 'active')
      if (activeStepIndex === -1) return

      const activeStep = prev[activeStepIndex]
      const nextSubIndex = activeStep.activeSubIndex + 1
      const isLastSub = nextSubIndex >= activeStep.subSteps.length
      const lag = Math.floor(Math.random() * 1000) + 900
      spinUntilRef.current = Date.now() + lag
      if (isLastSub) setTransitioning(true)
    }, 150)

    return () => clearInterval(id)
  }, [])

  const activeStepIndex = steps.findIndex(s => s.status === 'active')
  const prevStep = activeStepIndex > 0 ? steps[activeStepIndex - 1] : null
  const currStep = steps[activeStepIndex] ?? null
  const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null
  const displaySlots: (MainStep | null)[] = [prevStep, currStep, nextStep]
  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <div style={{
      padding: '16px 40px',
      color: theme.text,
      maxWidth: '1200px',
      margin: '0 auto',
      height: 'calc(100vh - 57px)',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
        <h2 style={{ fontSize: '16px', color: theme.subtext, margin: 0, fontWeight: 'normal', letterSpacing: '0.1em' }}>
          ロボット動作シーケンス
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 12px', fontSize: '13px' }}>
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>{doneCount}</span>
          <span style={{ color: theme.subtext }}>/</span>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{steps.length}</span>
          <span style={{ color: theme.subtext, fontSize: '12px', marginLeft: '4px' }}>完了</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 12px', fontSize: '13px' }}>
          <span style={{ color: theme.subtext, fontSize: '12px' }}>サイクル</span>
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>{cycleIndex + 1}</span>
          <span style={{ color: theme.subtext }}>/</span>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{CYCLE_COUNT}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 12px', fontSize: '13px' }}>
          <span style={{ color: theme.subtext, fontSize: '12px' }}>総経過時間</span>
          <span style={{ color: theme.accent, fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* カード3枚 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: 1, overflow: 'hidden' }}>
        {displaySlots.map((step, i) => {
          const position = i === 0 ? 'prev' : i === 1 ? 'curr' : 'next'
          const isActive = position === 'curr'

          return (
            <div key={i} style={{ flexShrink: isActive ? 0 : 1 }}>
              {i > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `${cardHeights.arrow}px` }}>
                  {i === 1 && prevStep === null ? null : (
                    <div style={{
                      fontSize: '20px',
                      color: i === 1 ? theme.accent : transitioning ? theme.accent : theme.border,
                      opacity: i === 1 ? 0.8 : transitioning ? 1 : 0.3,
                      animation: i === 2 && transitioning ? 'blink 0.4s ease-in-out infinite' : 'none',
                      transition: 'all 0.2s',
                    }}>▼</div>
                  )}
                </div>
              )}
              {step === null ? (
                <div style={{
                  border: `1px dashed ${theme.border}`,
                  borderRadius: '16px',
                  height: `${cardHeights.inactive}px`,
                  opacity: 0.15,
                }} />
              ) : (
                <StepCard
                  step={step}
                  theme={theme}
                  isActive={isActive}
                  isPrev={position === 'prev'}
                  activeCardHeight={cardHeights.active}
                />
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}