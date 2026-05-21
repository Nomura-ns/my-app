import { useState, useEffect, useRef } from 'react'
import type { Theme } from '../types'
import { GRAPH_DEFINITIONS } from '../themes'

// =============================================
// グラフ選択ドロップダウン
// =============================================

type Props = {
  panelId: number
  selectedKeys: string[]
  onChange: (id: number, keys: string[]) => void
  theme: Theme
}

export default function GraphSelector({ panelId, selectedKeys, onChange, theme }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = (key: string) => {
    if (selectedKeys.includes(key)) onChange(panelId, selectedKeys.filter(k => k !== key))
    else if (selectedKeys.length < 2) onChange(panelId, [...selectedKeys, key])
  }

  const label = selectedKeys
    .map(k => GRAPH_DEFINITIONS.find(g => g.key === k)?.label)
    .join(' / ') || '未選択'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'transparent', border: `1px solid ${theme.border}`,
        borderRadius: '6px', padding: '4px 10px',
        cursor: 'pointer', fontSize: '13px', color: theme.text,
      }}>
        {label} ▼
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 300,
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '8px', padding: '8px', minWidth: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <p style={{ fontSize: '11px', color: theme.subtext, margin: '0 0 6px 4px' }}>最大2つ選択</p>
          {GRAPH_DEFINITIONS.map(g => {
            const selected = selectedKeys.includes(g.key)
            const disabled = !selected && selectedKeys.length >= 2
            return (
              <div key={g.key} onClick={() => !disabled && toggle(g.key)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px', borderRadius: '6px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                background: selected ? `${theme.accent}22` : 'transparent',
                color: theme.text,
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.stroke, flexShrink: 0 }} />
                <span style={{ fontSize: '13px' }}>{g.label}</span>
                {selected && <span style={{ marginLeft: 'auto', fontSize: '11px', color: theme.accent }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}