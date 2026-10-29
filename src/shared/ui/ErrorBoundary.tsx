import { Component, type ErrorInfo, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('TeamVal: error de interfaz', error, info.componentStack) }
  render() {
    if (this.state.failed) return <main className="fatal-error"><h1>No pudimos abrir esta pantalla.</h1><p>Recarga TeamVal para intentarlo de nuevo.</p><button className="button button-primary" onClick={() => window.location.reload()}>Recargar</button></main>
    return this.props.children
  }
}
