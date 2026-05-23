import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorUI = ({ error }: { error: Error | null }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="app-form-shell max-w-md">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--app-error-text)' }}>
          {t('somethingWentWrong')}
        </h2>
        <p className="app-muted mb-2">{t('unexpectedErrorOccurred')}</p>
        <pre className="app-panel-soft text-sm overflow-auto">
          {error?.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="app-btn-primary mt-4"
        >
          {t('reloadPage')}
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI error={this.state.error} />;
    }

    return this.props.children;
  }
}
