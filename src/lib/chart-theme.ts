/** Cores de gráfico alinhadas aos tokens em globals.css */
export const CHART_THEME = {
  primary: '#0F7A82',
  navy: '#1D3456',
  warning: '#B45309',
  danger: '#DC2626',
  muted: '#475569',
  grid: '#D8E0E8',
  success: '#15803D',
  info: '#1D4ED8',
} as const;

export const CHART_SERIES = [
  CHART_THEME.primary,
  CHART_THEME.navy,
  CHART_THEME.warning,
  CHART_THEME.muted,
] as const;
