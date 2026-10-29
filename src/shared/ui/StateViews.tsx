import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function LoadingState({ label = 'Cargando tu espacio…' }: { label?: string }) {
  return <div className="loading-state" role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((row) => <div className="skeleton-card" key={row} aria-hidden="true">
      <span className="skeleton-line skeleton-title" /><span className="skeleton-line" /><span className="skeleton-line skeleton-short" />
    </div>)}
  </div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="glass state-card">
    <span className="icon-plate state-icon state-icon-danger"><Icon name="info" /></span>
    <h2>No pudimos cargar esta sección</h2>
    <p>{message}</p>
    <button type="button" className="button button-primary" onClick={onRetry}><Icon name="reset" />Reintentar</button>
  </div>
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="glass state-card">
    <span className="icon-plate state-icon"><Icon name="team" /></span>
    <h2>{title}</h2>
    <p>{description}</p>
    {children}
  </div>
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <p className="demo-notice"><span className="badge demo-badge">DEMO LOCAL</span><span>{children}</span></p>
}
