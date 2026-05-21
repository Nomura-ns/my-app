import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts'
import type { Theme, DataPoint, PanelConfig } from '../types'
import { GRAPH_DEFINITIONS } from '../themes'
import GraphSelector from './GraphSelector'

// =============================================
// 運転モニタページ
// =============================================

type Props = {
  theme: Theme
  isPlaying: boolean
  intervalSec: number
  range: number
  sidebarOpen: boolean
}

export default function DashboardPage({ theme, isPlaying, intervalSec, range, sidebarOpen }: Props) {
  const [data, setData] = useState<DataPoint[]>([])
  const [panels, setPanels] = useState<PanelConfig[]>([
    { id: 1, selectedKeys: ['A', 'B'] },
    { id: 2, selectedKeys: ['C', 'D'] },
    { id: 3, selectedKeys: ['E', 'F'] },
    { id: 4, selectedKeys: ['G', 'H'] },
  ])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const now = new Date()
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      setData(prev => {
        const newPoint: DataPoint = { time }
        GRAPH_DEFINITIONS.forEach(g => { newPoint[g.key] = Math.floor(Math.random() * 100) })
        const updated = [...prev, newPoint]
        return updated.length > 50 ? updated.slice(-50) : updated
      })
    }, intervalSec * 1000)
    return () => clearInterval(id)
  }, [intervalSec, isPlaying])

  const displayData = data.slice(-range)

  const handlePanelChange = (panelId: number, keys: string[]) => {
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, selectedKeys: keys } : p))
  }

  return (
  <div style={{
    padding: '35px',
    boxSizing: 'border-box',
    width: '100%',
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {panels.map(panel => (
          <div key={panel.id} style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '12px', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text }}>パネル{panel.id}</span>
              <GraphSelector
                panelId={panel.id}
                selectedKeys={panel.selectedKeys}
                onChange={handlePanelChange}
                theme={theme}
              />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: theme.subtext }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: theme.subtext }} />
                <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: theme.text }} />
                {panel.selectedKeys.map(key => {
                  const def = GRAPH_DEFINITIONS.find(g => g.key === key)
                  if (!def) return null
                  return (
                    <Line key={key} type="monotone" dataKey={key} name={def.label}
                      stroke={def.stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
                  )
                })}
                {!isPlaying && <Brush dataKey="time" height={24} stroke={theme.accent} fill={theme.surface} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}