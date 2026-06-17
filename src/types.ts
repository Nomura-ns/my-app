// =============================================
// 型定義
// =============================================

export type ThemeKey = 'dark-blue' | 'dark-red' | 'dark-green' | 'light-blue' | 'light-red' | 'light-green'

export type Theme = {
  label: string
  bg: string
  surface: string
  border: string
  text: string
  subtext: string
  accent: string
  headerBg: string
  logo: string
}

export type PageKey = 'dashboard' | 'control'

export type DataPoint = {
  time: string
  _ts: number
} & Record<string, number | string>

/** 横軸: 時系列 または Dレジスタ（1つ） */
export type XAxisKey = 'time' | number

/** 軸スケールの手動指定（空欄ならデータから自動） */
export type AxisRange = {
  min?: number
  max?: number
}

export type PanelConfig = {
  id: number
  xAxis: XAxisKey
  /** 縦軸データ（最大2） */
  yAddresses: number[]
  yRange?: AxisRange
  /** 横軸=データのときのみ有効 */
  xRange?: AxisRange
}

export type ActionStatus = 'done' | 'active' | 'waiting'

export type RobotAction = {
  id: number
  name: string
  detail: string
  status: ActionStatus
  startTime: string
  endTime?: string
  progress?: number
}