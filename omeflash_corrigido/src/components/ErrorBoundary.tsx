import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7F4] text-[#171717] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E8E6E1] rounded-3xl p-6 sm:p-8 text-center shadow-xs">
            <div className="w-12 h-12 bg-[#FFF2E8] border border-[#FF6A00]/20 text-[#FF6A00] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#171717] mb-2 font-['Plus_Jakarta_Sans']">
              Ocorreu um erro temporário
            </h2>
            <p className="text-[#646464] text-sm mb-6 leading-relaxed">
              Não foi possível carregar esta seção. Tente recarregar a página para restaurar o estado normal.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
