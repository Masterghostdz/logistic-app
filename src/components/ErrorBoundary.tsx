import React from 'react';

type State = { hasError: boolean; error?: Error | null; info?: any };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Une erreur s'est produite</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: 'red' }}>{String(this.state.error)}</pre>
          {this.state.error && (this.state.error as any).stack && (
            <div style={{ marginTop: 12 }}>
              <h3>Stack:</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{(this.state.error as any).stack}</pre>
            </div>
          )}
          {this.state.info && this.state.info.componentStack && (
            <div style={{ marginTop: 12 }}>
              <h3>Component stack:</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
