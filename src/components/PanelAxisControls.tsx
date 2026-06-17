import type { ReactNode } from 'react'
import type { Theme, XAxisKey } from '../types'
import { formatRegisterLabel, getAllRegisterAddresses, getStrokeColor } from '../plc'
import { AXIS_CTRL, axisSelectStyle, type LayoutSize } from '../axisControlStyles'

const ALL_REGISTERS = getAllRegisterAddresses()

type Props = {
  panelId: number
  xAxis: XAxisKey
  yAddresses: number[]
  onXAxisChange: (value: XAxisKey) => void
  onYAddressesChange: (addresses: number[]) => void
  theme: Theme
  layoutSize?: LayoutSize
}

function SeriesColorMark({ color }: { color: string }) {
  return (
    <span
      className="series-color-mark"
      aria-hidden
      style={{
        position: 'relative',
        flexShrink: 0,
        width: 28,
        height: 12,
        display: 'inline-block',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 2.5,
          marginTop: -1.25,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 7,
          height: 7,
          marginLeft: -3.5,
          marginTop: -3.5,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    </span>
  )
}

function AxisGroup({
  label,
  theme,
  children,
}: {
  label: string
  theme: Theme
  children: ReactNode
}) {
  return (
    <div className="axis-group">
      <span className="axis-group__label" style={{ color: theme.subtext }}>
        {label}
      </span>
      {children}
    </div>
  )
}

export default function PanelAxisControls({
  panelId,
  xAxis,
  yAddresses,
  onXAxisChange,
  onYAddressesChange,
  theme,
  layoutSize = 'desktop',
}: Props) {
  const yFirst = yAddresses[0] ?? ALL_REGISTERS[0]
  const ySecond = yAddresses[1]
  const sel = axisSelectStyle(theme, layoutSize)
  const isMobile = layoutSize === 'mobile'

  const updateYSlot = (slot: 0 | 1, value: string) => {
    if (slot === 0) {
      const addr = Number(value)
      const next = ySecond != null && ySecond !== addr ? [addr, ySecond] : [addr]
      onYAddressesChange(next)
      return
    }
    if (value === '') {
      onYAddressesChange([yFirst])
      return
    }
    const addr = Number(value)
    if (addr === yFirst) return
    onYAddressesChange([yFirst, addr])
  }

  return (
    <div
      className={`panel-axis-controls${isMobile ? ' panel-axis-controls--mobile' : ''}`}
    >
      <span className="panel-axis-controls__title" style={{ color: theme.text }}>
        パネル{panelId}
      </span>

      <AxisGroup label="Y軸①" theme={theme}>
        <select
          className="axis-group__select"
          value={String(yFirst)}
          onChange={(e) => updateYSlot(0, e.target.value)}
          style={sel}
        >
          {ALL_REGISTERS.map((addr) => (
            <option key={addr} value={String(addr)}>
              {formatRegisterLabel(addr)}
            </option>
          ))}
        </select>
        <SeriesColorMark color={getStrokeColor(yFirst)} />
      </AxisGroup>

      <AxisGroup label="Y軸②" theme={theme}>
        <select
          className="axis-group__select"
          value={ySecond != null ? String(ySecond) : ''}
          onChange={(e) => updateYSlot(1, e.target.value)}
          style={sel}
        >
          <option value="">なし</option>
          {ALL_REGISTERS.filter((addr) => addr !== yFirst).map((addr) => (
            <option key={addr} value={String(addr)}>
              {formatRegisterLabel(addr)}
            </option>
          ))}
        </select>
        {ySecond != null && <SeriesColorMark color={getStrokeColor(ySecond)} />}
      </AxisGroup>

      <AxisGroup label="X軸" theme={theme}>
        <select
          className="axis-group__select"
          value={xAxis === 'time' ? 'time' : String(xAxis)}
          onChange={(e) => {
            const v = e.target.value
            onXAxisChange(v === 'time' ? 'time' : Number(v))
          }}
          style={sel}
        >
          <option value="time">時系列</option>
          <optgroup label="データ">
            {ALL_REGISTERS.map((addr) => (
              <option key={addr} value={String(addr)}>
                {formatRegisterLabel(addr)}
              </option>
            ))}
          </optgroup>
        </select>
      </AxisGroup>
    </div>
  )
}