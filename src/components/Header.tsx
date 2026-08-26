import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_LOCATIONS } from '../data/initialData';
import {
  MapPin,
  Bell,
  Sun,
  Moon,
  Crosshair,
  Loader2,
  ChevronDown,
  Check,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import pescAppLogo from '../assets/images/pescapp_logo_icon_1787581647876.jpg';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentLocation,
    setCurrentLocation,
    locateCurrentGPS,
    isLocatingGPS,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    user,
    setIsAuthModalOpen,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Extract just the city / point name (without coordinates)
  const cityName = currentLocation.name.replace(/\(Lat.*Lng.*\)/i, '').replace(/Coord\..*/i, 'Ponto Personalizado').trim();

  return (
    <header className="sticky top-0 z-30 w-full transition-colors duration-200 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#070d1f]/95 backdrop-blur-md px-3 sm:px-5 py-2">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        
        {/* Top bar on Mobile / Left & Right on Desktop */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md border border-teal-500/30 bg-slate-900 flex items-center justify-center">
              <img
                src={pescAppLogo}
                alt="PescApp Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-teal-600 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent leading-none">
                PescApp
              </span>
              <span className="text-[9px] font-mono-tech uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">
                Pesca & Legislação
              </span>
            </div>
          </div>

          {/* Right Actions on Mobile (Visible only on mobile top-row to avoid crowding) */}
          <div className="flex sm:hidden items-center gap-1 shrink-0">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn-mobile"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-bell-btn-mobile"
                onClick={() => {
                  setIsNotifOpen(prev => !prev);
                  if (!isNotifOpen) markNotificationsAsRead();
                }}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                )}
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500" />
                )}
              </button>
            </div>

            {/* Admin Panel Quick Link */}
            <button
              id="admin-tab-toggle-btn-mobile"
              onClick={() => setActiveTab(activeTab === 'admin' ? 'inicio' : 'admin')}
              className={`p-1.5 rounded-xl transition-colors ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Painel Administrativo"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* User Account Button */}
            <button
              id="auth-profile-btn-mobile"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-teal-500/50 transition-all ml-0.5 relative"
              title={user.isLoggedIn ? `Perfil: ${user.name}` : 'Entrar / Criar Conta'}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-teal-500/50 shadow-sm"
              />
              {user.isLoggedIn && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Center: Simplified Clean City Name with GPS Icon Button */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 w-full sm:w-auto relative">
          {/* City Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              id="header-location-picker-btn"
              onClick={() => setIsLocDropdownOpen(prev => !prev)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50 transition-all text-left max-w-full sm:max-w-[260px]"
              title="Mudar Cidade / Ponto de Pesca"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                  {cityName}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Location Dropdown */}
            {isLocDropdownOpen && (
              <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <span>Cidades & Regiões de Pesca</span>
                  <span className="text-[9px] font-mono-tech text-teal-500 font-bold">Brasil</span>
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto mt-1">
                  {PRESET_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setCurrentLocation(loc);
                        setIsLocDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentLocation.id === loc.id
                          ? 'bg-teal-500/10 text-teal-600 dark:text-cyan-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate">{loc.name}</p>
                        <p className="text-[10px] text-slate-400">{loc.region}</p>
                      </div>
                      {currentLocation.id === loc.id && <Check className="w-4 h-4 text-teal-500 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsLocDropdownOpen(false);
                      locateCurrentGPS();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-teal-600 dark:text-cyan-400 bg-teal-500/10 hover:bg-teal-500/20 flex items-center gap-2 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    Detectar Ponto Atual via GPS
                  </button>
                  <button
                    onClick={() => {
                      setIsLocDropdownOpen(false);
                      setActiveTab('mapa');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Abrir Mapa Náutico
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* GPS Icon Button */}
          <button
            id="header-gps-locate-btn"
            onClick={locateCurrentGPS}
            disabled={isLocatingGPS}
            title="Sincronizar com Meu GPS do Celular"
            className="px-2.5 py-1.5 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 text-teal-700 dark:text-cyan-300 font-mono-tech text-xs font-bold flex items-center gap-1.5 border border-teal-500/30 transition-all shrink-0 active:scale-95 shadow-sm"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-cyan-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
            )}
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>

        {/* Right Actions on Desktop (Hidden on mobile to keep top bar uncluttered) */}
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setIsNotifOpen(prev => !prev);
                if (!isNotifOpen) markNotificationsAsRead();
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notificações em Tempo Real"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              )}
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
              )}
            </button>
          </div>

          {/* Admin Panel Quick Link */}
          <button
            id="admin-tab-toggle-btn"
            onClick={() => setActiveTab(activeTab === 'admin' ? 'inicio' : 'admin')}
            className={`p-2 rounded-xl transition-colors ${
              activeTab === 'admin'
                ? 'bg-teal-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Painel Administrativo"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* User Account Button */}
          <button
            id="auth-profile-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-teal-500/50 transition-all relative"
            title={user.isLoggedIn ? `Perfil: ${user.name} (${user.email})` : 'Entrar / Criar Conta'}
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-teal-500/50 shadow-sm"
              />
              {user.isLoggedIn && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden lg:inline max-w-[120px] truncate">
              {user.name}
            </span>
          </button>
        </div>

        {/* Global Notification Dropdown popup positioned properly */}
        {isNotifOpen && (
          <div className="absolute right-3 top-14 sm:right-5 sm:top-14 mt-1 w-80 max-w-[92vw] rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Notificações
              </h4>
              <span className="text-[10px] font-mono-tech text-teal-600 dark:text-cyan-400 font-bold">
                Tempo Real
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto mt-1">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">Nenhuma notificação</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="py-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

