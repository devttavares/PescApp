import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Calendar, BookOpen, Wrench, PlusCircle, MessageSquarePlus } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsCatchModalOpen, setIsFeedbackModalOpen } = useApp();

  const navItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    isActive: boolean;
    badgeColor?: string;
  }> = [
    {
      id: 'inicio',
      label: 'Início',
      icon: Home,
      onClick: () => setActiveTab('inicio'),
      isActive: activeTab === 'inicio',
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      onClick: () => setActiveTab('agenda'),
      isActive: activeTab === 'agenda',
    },
    {
      id: 'registro',
      label: 'Registro',
      icon: PlusCircle,
      onClick: () => setIsCatchModalOpen(true),
      isActive: false, // Opens catch modal directly
    },
    {
      id: 'guia',
      label: 'Guia',
      icon: BookOpen,
      onClick: () => setActiveTab('guia'),
      isActive: activeTab === 'guia',
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      icon: Wrench,
      onClick: () => setActiveTab('ferramentas'),
      isActive: activeTab === 'ferramentas',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquarePlus,
      onClick: () => setIsFeedbackModalOpen(true),
      isActive: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto w-full pointer-events-auto">
      {/* Background container styling matching exact mobile and tablet layout */}
      <nav
        id="bottom-navigation-bar"
        className="relative bg-white/95 dark:bg-[#020617]/95 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl px-2 sm:px-4 py-1.5 flex items-center justify-around shadow-2xl transition-colors duration-200"
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isCurrent = item.isActive;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-2xl transition-all duration-200 group ${
                isCurrent
                  ? 'text-teal-600 dark:text-cyan-400 font-black scale-110 -translate-y-0.5'
                  : item.id === 'registro'
                  ? 'text-teal-600 dark:text-cyan-400 font-bold hover:scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 hover:scale-105'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-teal-500/15 dark:bg-cyan-500/15 shadow-sm text-teal-600 dark:text-cyan-400'
                    : item.id === 'registro'
                    ? 'bg-teal-500/10 dark:bg-cyan-500/10 text-teal-600 dark:text-cyan-400 group-hover:bg-teal-500/20'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isCurrent ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-all truncate max-w-full ${
                  isCurrent ? 'font-black text-teal-600 dark:text-cyan-400' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};


