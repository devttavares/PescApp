import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { AgendaView } from './components/AgendaView';
import { GuiaView } from './components/GuiaView';
import { FerramentasView } from './components/FerramentasView';
import { MapView } from './components/MapView';
import { AdminPanel } from './components/AdminPanel';
import { CatchModal } from './components/CatchModal';
import { CatchDetailModal } from './components/CatchDetailModal';
import { BaitModal } from './components/BaitModal';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { FeedbackModal } from './components/FeedbackModal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PescApp Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black mb-2">Ops! Ocorreu uma oscilação momentânea</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            O aplicativo preservou seus dados salvos com segurança. Clique abaixo para restabelecer a navegação.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Aplicativo</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainContainer: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200">
      {/* Responsive Viewport Container: fluid on mobile and expansive on tablet/desktop */}
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl min-h-screen bg-slate-50 dark:bg-[#070d1f] shadow-2xl flex flex-col relative border-x border-slate-200/60 dark:border-slate-800/60">
        {/* Header */}
        <Header />

        {/* Dynamic Main Body based on current active tab */}
        <main className="flex-1 px-3 sm:px-6 pt-3 pb-28 overflow-y-auto">
          {activeTab === 'inicio' && <HomeView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'guia' && <GuiaView />}
          {activeTab === 'ferramentas' && <FerramentasView />}
          {activeTab === 'mapa' && <MapView />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>

        {/* Fixed Bottom Navigation with Action FAB */}
        <BottomNav />

        {/* Global Action Modals */}
        <CatchModal />
        <CatchDetailModal />
        <BaitModal
          onOpenEditBait={(bait) => {
            // Trigger edit bait modal if user clicks edit in BaitModal
            const event = new CustomEvent('open-edit-bait', { detail: bait });
            window.dispatchEvent(event);
          }}
        />
        <AuthModal />
        <PremiumModal />
        <FeedbackModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContainer />
      </AppProvider>
    </ErrorBoundary>
  );
}

