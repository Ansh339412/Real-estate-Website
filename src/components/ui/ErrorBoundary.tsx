import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorView } from '../errors/ErrorView';
import { logEvent } from '../../lib/logger';

interface State { failed: boolean; reference: string }

/** Catches unexpected render crashes. Users get the friendly page; the details go to the redacted log only. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false, reference: '' };
  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.setState({ reference: logEvent({ level: 'error', code: 'render_error', area: 'react', error }) });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <ErrorView code={500} fullScreen reference={this.state.reference} onRetry={() => this.setState({ failed: false, reference: '' })} />;
  }
}
