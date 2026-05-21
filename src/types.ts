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

export type DataPoint = { time: string; [key: string]: number | string }

export type PanelConfig = { id: number; selectedKeys: string[] }

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