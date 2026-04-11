import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bible-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] p-12 text-center shadow-2xl border border-red-500/20">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-4 text-bible-text">Ops! Algo deu errado.</h1>
            <p className="ui-text opacity-60 mb-12 leading-relaxed text-sm">
              Ocorreu um erro inesperado na interface. Tente recarregar a página ou limpar as configurações.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-bible-accent text-bible-bg py-4 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs flex items-center justify-center space-x-2 shadow-lg shadow-bible-accent/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full border border-bible-accent/20 py-4 rounded-2xl font-bold ui-text tracking-widest uppercase text-xs opacity-40 hover:opacity-100 transition-opacity"
              >
                Limpar Configurações
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
