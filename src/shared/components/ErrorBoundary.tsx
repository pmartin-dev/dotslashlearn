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
            <p className="text-sm text-muted">
              Something went wrong rendering this content.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 text-xs text-brand hover:text-brand-hover transition-colors font-medium"
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
