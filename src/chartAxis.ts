import type { AxisRange, DataPoint, PanelConfig, XAxisKey } from './types'
import { addressToDataKey, formatRegisterLabel, isDoubleWordStartAddress } from './plc'

export const MAX_SERIES = 2

export function normalizeAddresses(addresses: number[]): number[] {
  const unique: number[] = []
  for (const addr of addresses) {
    if (!isDoubleWordStartAddress(addr)) continue
    if (unique.includes(addr)) continue
    unique.push(addr)
    if (unique.length >= MAX_SERIES) break
  }
  return unique
}

export function coerceXAxis(key: unknown, fallback: XAxisKey = 'time'): XAxisKey {
  if (key === 'time') return 'time'
  if (typeof key === 'number' && isDoubleWordStartAddress(key)) return key
  if (typeof key === 'string') {
    if (key === 'time') return 'time'
    const n = Number(key)
    if (Number.isFinite(n) && isDoubleWordStartAddress(n)) return n
  }
  return fallback
}

export function normalizeAxisRange(range?: AxisRange): AxisRange | undefined {
  if (!range) return undefined
  const hasMin = typeof range.min === 'number' && Number.isFinite(range.min)
  const hasMax = typeof range.max === 'number' && Number.isFinite(range.max)
  if (!hasMin && !hasMax) return undefined
  if (hasMin && hasMax && range.min! >= range.max!) return undefined
  return {
    ...(hasMin ? { min: range.min } : {}),
    ...(hasMax ? { max: range.max } : {}),
  }
}

export function countPlottablePoints(
  data: { [key: string]: number | string | undefined }[],
  keys: string[],
): number {
  return data.filter((row) =>
    keys.every((k) => typeof row[k] === 'number' && Number.isFinite(row[k] as number)),
  ).length
}

export type ChartSeries = {
  xAddr?: number
  yAddr: number
  xKey?: string
  yKey: string
  label: string
}

export function getChartSeries(panel: PanelConfig): ChartSeries[] {
  const p = normalizePanel(panel)
  const yAddrs = normalizeAddresses(p.yAddresses)
  if (yAddrs.length === 0) return []

  if (p.xAxis === 'time') {
    return yAddrs.map((yAddr) => ({
      yAddr,
      yKey: addressToDataKey(yAddr),
      label: formatRegisterLabel(yAddr),
    }))
  }

  // p.xAxis が number のときだけここに来る
  const xAxis = p.xAxis as number
  const xKey = addressToDataKey(xAxis)
  return yAddrs.map((yAddr) => ({
    xAddr: xAxis,
    yAddr,
    xKey,
    yKey: addressToDataKey(yAddr),
    label: formatRegisterLabel(yAddr),
  }))
}

export function isValidPanel(panel: PanelConfig): boolean {
  const p = normalizePanel(panel)
  if (p.yAddresses.length < 1) return false
  if (p.xAxis === 'time') return true
  return typeof p.xAxis === 'number'
}

export function collectRequiredAddresses(panels: PanelConfig[]): number[] {
  const set = new Set<number>()
  for (const p of panels) {
    const n = normalizePanel(p)
    if (typeof n.xAxis === 'number') set.add(n.xAxis)
    for (const addr of n.yAddresses) set.add(addr)
  }
  return [...set]
}

export function normalizePanel(panel: PanelConfig): PanelConfig {
  const xAxis = coerceXAxis(panel.xAxis, 'time')
  const yAddresses = normalizeAddresses(panel.yAddresses)

  if (xAxis === 'time') {
    return {
      id: panel.id,
      xAxis: 'time',
      yAddresses: yAddresses.length > 0 ? yAddresses : [15000],
      yRange: normalizeAxisRange(panel.yRange),
      xRange: undefined,
    }
  }

  return {
    id: panel.id,
    xAxis,
    yAddresses: yAddresses.length > 0 ? yAddresses : [15000],
    yRange: normalizeAxisRange(panel.yRange),
    xRange: normalizeAxisRange(panel.xRange),
  }
}

function coerceAddress(raw: unknown): number | null {
  if (typeof raw === 'number' && isDoubleWordStartAddress(raw)) return raw
  if (typeof raw === 'string') {
    const n = Number(raw)
    if (Number.isFinite(n) && isDoubleWordStartAddress(n)) return n
  }
  return null
}

/** localStorage 保存形式から移行 */
export function migrateLegacyPanel(raw: Record<string, unknown>, id: number): PanelConfig {
  if (raw.xAxis !== undefined && !raw.xMode) {
    return normalizePanel({
      id,
      xAxis: coerceXAxis(raw.xAxis),
      yAddresses: (raw.yAddresses as number[]) ?? [],
      yRange: raw.yRange as AxisRange | undefined,
      xRange: raw.xRange as AxisRange | undefined,
    })
  }

  if (raw.xMode === 'time' || raw.xMode === 'data') {
    const xAddresses = (raw.xAddresses as number[]) ?? []
    const xAxis: XAxisKey =
      raw.xMode === 'time' ? 'time' : coerceXAxis(xAddresses[0], 15000)
    return normalizePanel({
      id,
      xAxis,
      yAddresses: (raw.yAddresses as number[]) ?? [],
      yRange: raw.yRange as AxisRange | undefined,
      xRange: raw.xRange as AxisRange | undefined,
    })
  }

  const legacyX = coerceXAxis(raw.xAxis, 'time')
  const yFromArray = normalizeAddresses(
    (Array.isArray(raw.yAddresses) ? raw.yAddresses : raw.selectedAddresses) as number[] ?? [],
  )

  if (legacyX === 'time') {
    const legacyY = coerceAddress(raw.yAxis)
    const yAddresses = legacyY != null ? [legacyY] : yFromArray
    return normalizePanel({ id, xAxis: 'time', yAddresses })
  }

  const yAddr = coerceAddress(raw.yAxis)
  const yAddresses = yAddr != null ? [yAddr] : yFromArray
  return normalizePanel({ id, xAxis: legacyX, yAddresses })
}

export function collectNumericValues(data: DataPoint[], key: string): number[] {
  return data.flatMap((row) => {
    const v = row[key]
    return typeof v === 'number' && Number.isFinite(v) ? [v] : []
  })
}

export function resolveDomain(
  data: DataPoint[],
  keys: string[],
  range?: AxisRange,
): [number, number] | ['auto', 'auto'] {
  const specified = normalizeAxisRange(range)
  let autoMin = Infinity
  let autoMax = -Infinity
  for (const key of keys) {
    for (const v of collectNumericValues(data, key)) {
      autoMin = Math.min(autoMin, v)
      autoMax = Math.max(autoMax, v)
    }
  }
  const hasAuto = Number.isFinite(autoMin) && Number.isFinite(autoMax) && autoMin <= autoMax

  // ?? ではなく !== undefined で判定し、0 などの falsy 値も正しく扱う
  const min = specified?.min !== undefined ? specified.min : (hasAuto ? autoMin : undefined)
  const max = specified?.max !== undefined ? specified.max : (hasAuto ? autoMax : undefined)

  if (min === undefined && max === undefined) return ['auto', 'auto']
  if (min !== undefined && max !== undefined) {
    if (min === max) return [min - 1, max + 1]
    return [min, max]
  }
  if (min !== undefined) return [min, hasAuto ? Math.max(autoMax, min + 1) : min + 100]
  return [hasAuto ? Math.min(autoMin, max! - 1) : max! - 100, max!]
}