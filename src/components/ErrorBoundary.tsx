import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: wire to error reporting service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C]">
          <div className="text-center max-w-md px-6">
            <p className="text-[#C6FF00] text-[12px] font-bold uppercase tracking-[0.12em] mb-3">
              Something went wrong
            </p>
            <h1 className="text-white text-[24px] font-bold mb-2">
              Unexpected error
            </h1>
            <p className="text-[rgba(255,255,255,0.4)] text-[13px] leading-relaxed mb-6">
              {this.state.error?.message ?? 'An unknown error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-[20px] py-[10px] rounded-[10px] bg-[#C6FF00] text-[#0A0A0F] text-[13px] font-bold cursor-pointer border-none"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
