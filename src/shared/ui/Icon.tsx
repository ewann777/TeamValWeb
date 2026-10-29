import type { CSSProperties } from 'react'

const paths = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  team: 'M15 7A3 3 0 1 1 9 7a3 3 0 1 1 6 0M6 21v-3c0-4 12-4 12 0v3M18 4c4 0 4 6 0 6M21 20v-4c0-2-1-3-3-3M6 4c-4 0-4 6 0 6M3 20v-4c0-2 1-3 3-3',
  scrims: 'm4 3 6 2 10 13-3 3L4 8Zm16 0-6 2-3 4M4 18l4-5m-3 8 5-6M2 17l5 5M17 22l5-5',
  shop: 'M3 9h18l-2-6H5ZM4 9v12h16V9M9 21v-7h6v7M3 9c0 4 4 4 4 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 4 4 4 0',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2c0-8 16-8 16 0v2',
  palette: 'M12 3a9 9 0 1 0 0 18h1c3 0 2-3 1-4s0-3 2-3h2c5 0 3-11-6-11M7 8h.01M12 6h.01M17 8h.01M6 13h.01',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6 6-6-6 6-6',
  moon: 'M20.5 13A8.5 8.5 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  monitor: 'M3 4h18v13H3ZM8 21h8m-4-4v4',
  check: 'm5 12 4 4L19 6',
  coin: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M8 9h8m-4 0v7m-2 0h4',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
  reset: 'M3 10a9 9 0 1 1 1 8M3 3v7h7',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6m0-10v.01',
  lock: 'M5 10h14v11H5ZM8 10V7a4 4 0 0 1 8 0v3m-4 5v2',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20.5 20.5 16 16',
  filter: 'M4 5h16l-6.2 7.2V19L10.2 21v-8.8Z',
  close: 'M6 6l12 12M18 6 6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16Zm10-11 4 4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7.5V12l3.2 2',
  star: 'm12 3.2 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9Z',
  requests: 'M4 5h16v11H9.5L4 20Zm4 4h8m-8 4h5',
} as const
export type IconName = keyof typeof paths
export function Icon({ name, className = '', style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`icon ${className}`} style={style}><path d={paths[name]} /></svg>
}
