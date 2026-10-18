import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro interceptado pelo ErrorBoundary do Vortex Stream:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Ops, algo inesperado aconteceu
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A aplicação encontrou um problema durante a exibição. Você pode tentar recarregar ou retornar à página inicial.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-left">
                <p className="text-[11px] font-mono text-slate-500 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition active:scale-95"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Página Inicial</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
