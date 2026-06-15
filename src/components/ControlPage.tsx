import { useState, useEffect, useRef } from 'react'
import type { Theme } from '../types'

// =============================================
// 型定義
// =============================================
type StepStatus = 'done' | 'active' | 'waiting'

type SubStep = {
  name: string
}

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

// =============================================
// シーケンス定義
// =============================================
const MAIN_SEQUENCE: Omit<MainStep, 'id' | 'status' | 'activeSubIndex' | 'startTime' | 'endTime'>[] = [
  {
    name: '下刃撮像',
    robot: 'ロボット1',
    subSteps: [
      { name: '下刃へ移動' },
      { name: '下刃の溝を撮影' },
      { name: '上刃ストックへ移動' },
    ],
  },
  {
    name: '上刃ストックから上刃組換台に移動',
    robot: 'ロボット1',
    subSteps: [
      { name: '上刃をつかむ' },
      { name: '上刃を取り出す' },
      { name: '上刃組換台へ移動' },
    ],
  },
  {
    name: '上刃組換台から上刃軸へ移動',
    robot: 'ロボット1',
    subSteps: [
      { name: '上刃交換台に上刃を置く' },
      { name: '持ち換える' },
      { name: '上刃軸へ移動' },
    ],
  },
  {
    name: '上刃軸に上刃を入れる',
    robot: 'ロボット1',
    subSteps: [
      { name: '勘合' },
      { name: 'カメラで撮影(つかみずれ調整)' },
      { name: '上刃取付位置へ移動' },
    ],
  },
  {
    name: '上刃を固定',
    robot: 'ロボット2',
    subSteps: [
      { name: '上刃正面まで移動' },
      { name: 'ネジ締め' },
      { name: '待機位置へ移動' },
    ],
  },
  {
    name: '上刃を固定',
    robot: 'ロボット1',
    subSteps: [
      { name: '上刃正面まで移動' },
      { name: 'ネジ締め' },
      { name: '待機位置へ移動' },
    ],
  },
  {
    name: '上刃ストックへ移動',
    robot: 'ロボット1',
    subSteps: [
      { name: '上刃を離す' },
      { name: '上刃ストックへ移動' },
    ],
  },
]

const CYCLE_COUNT = 8

function buildSteps(): MainStep[] {
  const now = new Date()
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  return MAIN_SEQUENCE.map((s, i) => ({
    ...s,
    id: i,
    status: i === 0 ? 'active' : 'waiting',
    activeSubIndex: i === 0 ? 0 : -1,
    startTime: i === 0 ? timeStr : '—',
    endTime: undefined,
  }))
}


// =============================================
// メインカード
// =============================================
// =============================================
// 動作シミュレーション
// =============================================
function ActionSimulation({ name, theme }: { name: string; theme: Theme }) {
  const color = theme.accent

  // 下刃撮像
  if (name.includes('下刃撮像')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
      {/* カメラ */}
      <div style={{ fontSize: '40px', animation: 'cameraPan 2s ease-in-out infinite' }}>📷</div>
      {/* 刃 */}
      <div style={{ width: '60px', height: '8px', background: color, borderRadius: '4px', boxShadow: `0 0 8px ${color}` }} />
      <style>{`@keyframes cameraPan { 0%,100%{transform:translateX(-10px)} 50%{transform:translateX(10px)} }`}</style>
    </div>
  )

  // 上刃ストックから上刃組換台に移動
  if (name.includes('上刃ストックから')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '18px', color: theme.subtext }}>ストック</div>
      <div style={{ fontSize: '28px', animation: 'moveRight 2s ease-in-out infinite' }}>🦾</div>
      <div style={{ fontSize: '18px', color: theme.subtext }}>組換台</div>
      <style>{`@keyframes moveRight { 0%,100%{transform:translateX(-20px)} 50%{transform:translateX(20px)} }`}</style>
    </div>
  )

  // 上刃組換台から上刃軸へ移動
  if (name.includes('上刃組換台から')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '18px', color: theme.subtext }}>組換台</div>
      <div style={{ fontSize: '28px', animation: 'moveRight2 2s ease-in-out infinite' }}>🦾</div>
      <div style={{ fontSize: '18px', color: theme.subtext }}>上刃軸</div>
      <style>{`@keyframes moveRight2 { 0%,100%{transform:translateX(-20px)} 50%{transform:translateX(20px)} }`}</style>
    </div>
  )

  // 上刃軸に上刃を入れる
  if (name.includes('上刃軸に')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '28px', animation: 'insert 2s ease-in-out infinite' }}>🔧</div>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${color}`, boxShadow: `0 0 8px ${color}` }} />
      <style>{`@keyframes insert { 0%,100%{transform:translateX(-15px)} 50%{transform:translateX(5px)} }`}</style>
    </div>
  )

  // 上刃を固定（ネジ締め）
  if (name.includes('上刃を固定')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '36px', animation: 'screw 0.8s linear infinite' }}>🔩</div>
      <div style={{ width: '50px', height: '50px', border: `3px solid ${color}`, borderRadius: '8px', boxShadow: `0 0 8px ${color}` }} />
      <style>{`@keyframes screw { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
  )

  // 上刃ストックへ移動
  if (name.includes('上刃ストックへ')) return (
    <div style={{ position: 'relative', height: '120px', background: `${theme.bg}`, borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '28px', animation: 'returnStock 2s ease-in-out infinite' }}>🦾</div>
      <div style={{ fontSize: '18px', color: theme.subtext }}>ストック</div>
      <style>{`@keyframes returnStock { 0%,100%{transform:translateX(20px)} 50%{transform:translateX(-20px)} }`}</style>
    </div>
  )

  // デフォルト
  return (
    <div style={{ height: '120px', background: `${theme.bg}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '36px', animation: 'defaultAnim 2s ease-in-out infinite' }}>⚙️</div>
      <style>{`@keyframes defaultAnim { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(180deg)} }`}</style>
    </div>
  )
}

// =============================================
// メインカード
// =============================================
function StepCard({ step, theme, isActive, isPrev }: {
  step: MainStep
  theme: Theme
  isActive: boolean
  isPrev: boolean
}) {
  return (
    <div style={{
      border: isActive ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
      borderStyle: step.status === 'waiting' ? 'dashed' : 'solid',
      borderRadius: '16px',
      padding: isActive ? '28px 32px' : '18px 24px',
      background: isActive ? theme.surface : isPrev ? `${theme.surface}88` : 'transparent',
      opacity: step.status === 'waiting' ? 0.5 : 1,
      boxShadow: isActive ? `0 0 24px ${theme.accent}44` : 'none',
      transition: 'all 0.3s',
    }}>

      {/* ロボットバッジ + タイトル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isActive ? '20px' : '12px' }}>
        <span style={{
          fontSize: '18px', padding: '2px 10px', borderRadius: '999px',
          background: step.robot === 'ロボット2' ? '#f4727233' : `${theme.accent}33`,
          color: step.robot === 'ロボット2' ? '#f47272' : theme.accent,
          border: `1px solid ${step.robot === 'ロボット2' ? '#f4727266' : `${theme.accent}66`}`,
          fontWeight: 'bold', flexShrink: 0,
        }}>
          {step.robot}
        </span>
        <span style={{ fontSize: isActive ? '32px' : '20px', fontWeight: 'bold', color: theme.text }}>
          {step.name}
        </span>
        <span style={{
          fontSize: '20px', padding: '2px 8px', borderRadius: '999px', marginLeft: 'auto',
          background: isActive ? `${theme.accent}33` : step.status === 'done' ? `${theme.subtext}22` : `${theme.border}44`,
          color: isActive ? theme.accent : theme.subtext,
        }}>
          {isActive ? '実行中' : step.status === 'done' ? '完了' : '待機中'}
        </span>
      </div>

      {/* 小項目（横並び） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: isActive ? '22px' : '0px' , justifyContent: 'center'}}>
        {step.subSteps.map((sub, i) => {
          const isDone = i < step.activeSubIndex || (step.status === 'done')
          const isCurrent = isActive && i === step.activeSubIndex

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && (
                <span style={{ color: isDone ? theme.accent : theme.border, fontSize: '20px', opacity: 0.7 }}>▶</span>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: isActive ? '6px 14px' : '4px 10px',
                borderRadius: '999px',
                background: isCurrent ? `${theme.accent}22` : isDone ? `${theme.subtext}11` : 'transparent',
                border: `1px solid ${isCurrent ? theme.accent : isDone ? theme.subtext + '44' : theme.border + '44'}`,
                transition: 'all 0.3s',
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isCurrent ? theme.accent : isDone ? theme.subtext : theme.border,
                  boxShadow: isCurrent ? `0 0 6px ${theme.accent}` : 'none',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: isActive ? '13px' : '11px',
                  color: isCurrent ? theme.accent : isDone ? theme.text : theme.subtext,
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                }}>
                  {sub.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* シミュレーション（現在のみ） */}
      {isActive && <ActionSimulation name={step.name} theme={theme} />}

      {/* 時間表示 */}
      {(step.startTime !== '—' || step.endTime) && (
        <div style={{ display: 'flex', gap: '16px', fontSize: '18px', color: theme.subtext, marginTop: '10px' }}>
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

  const [steps, setSteps] = useState<MainStep[]>(stepsRef.current)
  const [cycleIndex, setCycleIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)

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
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // メインループ
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()

      if (spinUntilRef.current > now) {
       return
      }

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
          // 次の小項目へ
          stepsRef.current = prev.map((s, i) =>
            i === activeStepIndex ? { ...s, activeSubIndex: nextSubIndex } : s
          )
        } else {
          // 大項目完了 → 次の大項目へ
          const nextStepIndex = activeStepIndex + 1

          if (nextStepIndex >= prev.length) {
            // サイクル終了
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

      // 通常進行 → 矢印アニメーション開始
      const prev = stepsRef.current
      const activeStepIndex = prev.findIndex(s => s.status === 'active')
      if (activeStepIndex === -1) return

      const activeStep = prev[activeStepIndex]
      const nextSubIndex = activeStep.activeSubIndex + 1
      const isLastSub = nextSubIndex >= activeStep.subSteps.length

      const lag = Math.floor(Math.random() * 1000) + 900
      spinUntilRef.current = Date.now() + lag

      // 大項目が終わるときだけ矢印を光らせる
      if (isLastSub) {
       setTransitioning(true)
       }
      }, 150)

    return () => clearInterval(id)
  }, [])

  // 表示: 前・現在・次
  const activeStepIndex = steps.findIndex(s => s.status === 'active')
  const prevStep = activeStepIndex > 0 ? steps[activeStepIndex - 1] : null
  const currStep = steps[activeStepIndex] ?? null
  const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null
  const displaySlots: (MainStep | null)[] = [prevStep, currStep, nextStep]

  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <div style={{ padding: '35px 40px', color: theme.text, maxWidth: '1200px', margin: '0 auto' }}>

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '20px', color: theme.subtext, margin: 0, fontWeight: 'normal', letterSpacing: '0.1em' }}>
          ロボット動作シーケンス
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 14px', fontSize: '16px' }}>
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>{doneCount}</span>
          <span style={{ color: theme.subtext }}>/</span>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{steps.length}</span>
          <span style={{ color: theme.subtext, fontSize: '16px', marginLeft: '4px' }}>完了</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 14px', fontSize: '13px' }}>
          <span style={{ color: theme.subtext, fontSize: '16px' }}>サイクル</span>
          <span style={{ color: theme.accent, fontWeight: 'bold' }}>{cycleIndex + 1}</span>
          <span style={{ color: theme.subtext }}>/</span>
          <span style={{ color: theme.text, fontWeight: 'bold' }}>{CYCLE_COUNT}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${theme.accent}22`, border: `1px solid ${theme.accent}66`, borderRadius: '999px', padding: '4px 14px', fontSize: '13px' }}>
          <span style={{ color: theme.subtext, fontSize: '16px' }}>総経過時間</span>
          <span style={{ color: theme.accent, fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* カード3枚 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {displaySlots.map((step, i) => {
          const position = i === 0 ? 'prev' : i === 1 ? 'curr' : 'next'
          const isActive = position === 'curr'

          return (
            <div key={i}>
              {i > 0 && (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '36px' }}>
               {/* 上の矢印（i===1）は前の項目がnullのとき非表示 */}
               {i === 1 && prevStep === null ? null : (
                <div style={{
                fontSize: '24px',
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
                  padding: '32px',
                  opacity: 0.15,
                  minHeight: '80px',
                }} />
              ) : (
                <StepCard
                  step={step}
                  theme={theme}
                  isActive={isActive}
                  isPrev={position === 'prev'}
                  
                />
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}