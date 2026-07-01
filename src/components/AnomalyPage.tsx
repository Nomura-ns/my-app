import { useState } from 'react'
import type { Theme } from '../types'

// =============================================
// 型定義
// =============================================

type AlertLevel = 'error' | 'warn' | 'info'

type Alert = {
  id: number
  level: AlertLevel
  code: string
  message: string
  target: string
  time: string
  acknowledged: boolean
}

// =============================================
// ダミーデータ
// =============================================

const INITIAL_ALERTS: Alert[] = [
  { id: 1,  level: 'error', code: 'E-001', message: 'モーター過負荷',           target: 'ロボット1',   time: '12:04:11', acknowledged: false },
  { id: 2,  level: 'error', code: 'E-002', message: '非常停止スイッチ作動',     target: 'ライン全体', time: '12:03:55', acknowledged: false },
  { id: 3,  level: 'warn',  code: 'W-011', message: 'センサー応答遅延',         target: 'センサー3',  time: '12:01:32', acknowledged: false },
  { id: 4,  level: 'warn',  code: 'W-012', message: '温度上限接近 (78°C)',      target: '制御盤A',    time: '11:58:20', acknowledged: false },
  { id: 5,  level: 'warn',  code: 'W-013', message: '空気圧低下',               target: 'バルブ2',    time: '11:55:01', acknowledged: true  },
  { id: 6,  level: 'info',  code: 'I-101', message: '定期メンテナンス通知',     target: 'ロボット2',  time: '11:50:44', acknowledged: true  },
  { id: 7,  level: 'info',  code: 'I-102', message: 'ソフトウェア更新利用可能', target: 'システム',   time: '11:45:00', acknowledged: true  },
  { id: 8,  level: 'warn',  code: 'W-014', message: '振動異常検知',             target: 'ロボット1',  time: '11:40:17', acknowledged: true  },
]

// =============================================
// 定数
// =============================================

const LEVEL_COLORS: Record<AlertLevel, string> = {
  error: '#f55252',
  warn:  '#f97316',
  info:  '#38bdf8',
}

const LEVEL_LABELS: Record<AlertLevel, string> = {
  error: 'ERROR',
  warn:  'WARN',
  info:  'INFO',
}

// =============================================
// サブコンポーネント
// =============================================

function LevelBadge({ level }: { level: AlertLevel }) {
  const color = LEVEL_COLORS[level]
  return (
    <span style={{
      display: 'inline-block',
      minWidth: '52px',
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      color,
      border: `1px solid ${color}`,
      borderRadius: '4px',
      padding: '1px 6px',
      background: `${color}18`,
      letterSpacing: '0.05em',
    }}>
      {LEVEL_LABELS[level]}
    </span>
  )
}

function SummaryCard({
  theme,
  label,
  count,
  color,
}: {
  theme: Theme
  label: string
  count: number
  color: string
}) {
  return (
    <div style={{
      flex: 1,
      background: theme.surface,
      border: `1px solid ${color}55`,
      borderTop: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '12px 16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{count}</div>
      <div style={{ fontSize: '12px', color: theme.subtext, marginTop: '2px' }}>{label}</div>
    </div>
  )
}

// =============================================
// メインコンポーネント
// =============================================

type Props = { theme: Theme }

export default function AnomalyPage({ theme }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [filter, setFilter] = useState<AlertLevel | 'all'>('all')

  const errorCount = alerts.filter(a => a.level === 'error').length
  const warnCount  = alerts.filter(a => a.level === 'warn').length
  const infoCount  = alerts.filter(a => a.level === 'info').length
  const unackCount = alerts.filter(a => !a.acknowledged).length

  const filtered = alerts.filter(a => filter === 'all' || a.level === filter)

  function acknowledge(id: number) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  function acknowledgeAll() {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const filterButtons: { key: AlertLevel | 'all'; label: string; color: string }[] = [
    { key: 'all',   label: 'すべて', color: theme.accent },
    { key: 'error', label: 'ERROR',  color: LEVEL_COLORS.error },
    { key: 'warn',  label: 'WARN',   color: LEVEL_COLORS.warn },
    { key: 'info',  label: 'INFO',   color: LEVEL_COLORS.info },
  ]

  return (
    <div style={{
      padding: '24px',
      maxWidth: '960px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>

      {/* サマリーカード */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <SummaryCard theme={theme} label="ERROR" count={errorCount} color={LEVEL_COLORS.error} />
        <SummaryCard theme={theme} label="WARN"  count={warnCount}  color={LEVEL_COLORS.warn}  />
        <SummaryCard theme={theme} label="INFO"  count={infoCount}  color={LEVEL_COLORS.info}  />
        <SummaryCard theme={theme} label="未確認" count={unackCount} color={theme.accent}       />
      </div>

      {/* フィルター & 一括確認 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 'bold',
                borderRadius: '6px',
                cursor: 'pointer',
                border: `1px solid ${filter === btn.key ? btn.color : theme.border}`,
                background: filter === btn.key ? `${btn.color}22` : 'transparent',
                color: filter === btn.key ? btn.color : theme.subtext,
                transition: 'all 0.2s',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {unackCount > 0 && (
          <button
            onClick={acknowledgeAll}
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: `1px solid ${theme.accent}`,
              background: `${theme.accent}22`,
              color: theme.accent,
              fontWeight: 'bold',
              transition: 'all 0.2s',
            }}
          >
            ✓ すべて確認済みにする
          </button>
        )}
      </div>

      {/* アラートリスト */}
      <div style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {/* テーブルヘッダー */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 80px 1fr 120px 90px 90px',
          padding: '8px 16px',
          fontSize: '11px',
          color: theme.subtext,
          borderBottom: `1px solid ${theme.border}`,
          background: `${theme.border}22`,
          letterSpacing: '0.08em',
        }}>
          <span>レベル</span>
          <span>コード</span>
          <span>メッセージ</span>
          <span>対象</span>
          <span>時刻</span>
          <span style={{ textAlign: 'center' }}>確認</span>
        </div>

        {/* アラート行 */}
        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: theme.subtext, fontSize: '14px' }}>
            アラームはありません
          </div>
        ) : (
          filtered.map((alert, i) => {
            const color = LEVEL_COLORS[alert.level]
            return (
              <div
                key={alert.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 80px 1fr 120px 90px 90px',
                  padding: '10px 16px',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${theme.border}` : 'none',
                  background: alert.acknowledged
                    ? 'transparent'
                    : `${color}09`,
                  borderLeft: `3px solid ${alert.acknowledged ? 'transparent' : color}`,
                  transition: 'background 0.2s',
                  opacity: alert.acknowledged ? 0.55 : 1,
                }}
              >
                <span><LevelBadge level={alert.level} /></span>
                <span style={{ fontSize: '12px', color: theme.subtext, fontFamily: 'monospace' }}>
                  {alert.code}
                </span>
                <span style={{ fontSize: '13px', color: theme.text }}>
                  {alert.message}
                </span>
                <span style={{ fontSize: '12px', color: theme.subtext }}>
                  {alert.target}
                </span>
                <span style={{ fontSize: '12px', color: theme.subtext, fontFamily: 'monospace' }}>
                  {alert.time}
                </span>
                <span style={{ textAlign: 'center' }}>
                  {alert.acknowledged ? (
                    <span style={{ fontSize: '12px', color: theme.subtext }}>✓ 確認済</span>
                  ) : (
                    <button
                      onClick={() => acknowledge(alert.id)}
                      style={{
                        padding: '3px 10px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: `1px solid ${color}`,
                        background: `${color}22`,
                        color,
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                      }}
                    >
                      確認
                    </button>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
