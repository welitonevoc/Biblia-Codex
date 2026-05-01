import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = Math.random().toString(36).substring(2, 9).toUpperCase();
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`Error [${this.state.errorId}] in ${this.props.pageName || 'App'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bible-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[40px] p-8 text-center shadow-2xl border border-red-500/20 overflow-hidden">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-display font-bold mb-2 text-bible-text">Ops! Algo deu errado.</h1>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {this.props.pageName && (
                <span className="px-2 py-0.5 bg-red-500/10 text-[10px] font-mono text-red-500 rounded uppercase tracking-tighter">
                  Local: {this.props.pageName}
                </span>
              )}
              {this.state.errorId && (
                <span className="px-2 py-0.5 bg-zinc-500/10 text-[10px] font-mono text-zinc-500 rounded uppercase tracking-tighter">
                  ID: #{this.state.errorId}
                </span>
              )}
            </div>
            <p className="ui-text opacity-60 mb-6 leading-relaxed text-sm">
              Ocorreu um erro inesperado. Veja os detalhes abaixo para nos ajudar a identificar o problema.
            </p>

            <div className="bg-red-500/5 rounded-xl p-4 mb-8 text-left border border-red-500/10 overflow-auto max-h-48 scrollbar-thin">
              <p className="text-xs font-bold text-red-500 mb-1">{this.state.error?.name || 'Error'}:</p>
              <p className="text-xs font-mono break-words opacity-80">{this.state.error?.message || 'Erro desconhecido'}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-[10px] cursor-pointer opacity-40 hover:opacity-100 transition-opacity">Ver Stack Trace</summary>
                  <pre className="text-[9px] mt-2 opacity-50 whitespace-pre-wrap leading-tight">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-bible-accent text-bible-bg py-3 rounded-xl font-bold ui-text tracking-widest uppercase text-[10px] flex items-center justify-center space-x-2 shadow-lg shadow-bible-accent/20"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Recarregar Página</span>
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full border border-bible-accent/20 py-3 rounded-xl font-bold ui-text tracking-widest uppercase text-[10px] opacity-40 hover:opacity-100 transition-opacity"
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
