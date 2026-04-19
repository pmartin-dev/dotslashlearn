import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <p className="font-mono text-sm text-slate-steel">
              Something went wrong rendering this content.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 font-mono text-xs text-emerald-signal hover:text-volt-mint transition-colors"
            >
              try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
