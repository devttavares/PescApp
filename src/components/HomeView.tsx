import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Thermometer,
  Wind,
  Gauge,
  Moon,
  TrendingUp,
  Fish,
  Sparkles,
  Compass,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { getMoonPhase } from '../utils/calendarUtils';

export const HomeView: React.FC = () => {
  const {
    weather,
    currentLocation,
    setIsCatchModalOpen,
    setIsPremiumModalOpen,
    user,
    ads,
    catches,
    setActiveTab,
    setSelectedCatchModal,
  } = useApp();

  const activeAd = ads.find(a => a.active);

  // Real-time calculated moon phase based on 7-day phase cycles
  const todayMoon = useMemo(() => {
    return getMoonPhase(new Date());
  }, []);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Vertical Stack of Metrics: Temp then Vento */}
      {/* Card 1: TEMP */}
      <div
        id="card-temperature"
        className="rounded-3xl p-5 transition-all border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-cyan-400">
            <Thermometer className="w-4 h-4" />
            <span className="text-[11px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TEMPERATURA
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
            {weather.condition}
          </p>
        </div>

        <div className="text-4xl font-black tracking-tight text-slate-900 dark:text-white font-mono-tech">
          {weather.tempC}°C
        </div>
      </div>

      {/* Card 2: VENTO */}
      <div
        id="card-wind"
        className="rounded-3xl p-5 transition-all border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-cyan-400">
            <Wind className="w-4 h-4" />
            <span className="text-[11px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
              VELOCIDADE DO VENTO
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-500 dark:text-cyan-400" />
            Direção: {weather.windDirection} (Brisa Ideal)
          </p>
        </div>

        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono-tech flex items-baseline gap-1">
          {weather.windSpeedKnots}
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">knots</span>
        </div>
      </div>

      {/* Card 3: PRESSÃO ATMOSFÉRICA */}
      <div
        id="card-pressure"
        className="rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm transition-all"
      >
        <div className="flex items-center gap-1.5 text-teal-600 dark:text-cyan-400 mb-6">
          <Gauge className="w-4 h-4" />
          <span className="text-[11px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
            PRESSÃO
          </span>
        </div>

        <div className="mt-1">
          <div className="text-5xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-1">
            {weather.pressureHpa}
            <span className="text-xl font-bold text-slate-500 dark:text-slate-400 font-mono-tech">hPa</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-cyan-400 mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>{weather.pressureTrend}</span>
          </div>
        </div>
      </div>

      {/* Card 4: FASE DA LUA */}
      <div
        id="card-moon"
        className="rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-teal-600 dark:text-cyan-400">
            <Moon className="w-4 h-4" />
            <span className="text-[11px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
              FASE DA LUA (CICLO DE 7 DIAS)
            </span>
          </div>

          <span className="text-[11px] font-mono-tech font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-cyan-400 border border-teal-500/20">
            Dia {todayMoon.phaseDay}/7
          </span>
        </div>

        {/* Visual Moon Graphic filling the full circle */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl p-1">
            {/* Outer atmospheric halo */}
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl scale-110 pointer-events-none" />

            {/* Complete Full-Disk Moon Sphere Graphic */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-slate-700/50 bg-[#0c1322] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {/* Surface craters topography background (visible on both dark & lit sides) */}
              <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
                <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-white/20 blur-[1px]" />
                <div className="absolute top-10 left-3 w-7 h-7 rounded-full bg-white/15 blur-[1px]" />
                <div className="absolute top-6 right-5 w-8 h-8 rounded-full bg-white/20 blur-[1px]" />
                <div className="absolute bottom-6 left-8 w-10 h-10 rounded-full bg-white/15 blur-[2px]" />
                <div className="absolute bottom-4 right-6 w-6 h-6 rounded-full bg-white/20 blur-[1px]" />
                <div className="absolute top-12 right-10 w-4 h-4 rounded-full bg-white/25 blur-[1px]" />
              </div>

              {/* Dynamic Illumination Layer according to Phase */}
              {todayMoon.phase === 'Lua Cheia' && (
                /* Full Moon: 100% luminous disk */
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-slate-200 shadow-[0_0_25px_rgba(254,240,138,0.5)]">
                  {/* Mare / crater details on full moon */}
                  <div className="absolute top-5 left-5 w-6 h-6 rounded-full bg-amber-900/15" />
                  <div className="absolute top-12 left-3 w-8 h-8 rounded-full bg-amber-900/10" />
                  <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-amber-900/15" />
                  <div className="absolute bottom-5 left-7 w-11 h-11 rounded-full bg-amber-900/10" />
                  <div className="absolute bottom-5 right-5 w-7 h-7 rounded-full bg-amber-900/15" />
                  <div className="absolute top-12 right-10 w-4 h-4 rounded-full bg-amber-900/20" />
                </div>
              )}

              {todayMoon.phase === 'Quarto Crescente' && (
                /* First Quarter: Right half 100% illuminated, left half shaded */
                <>
                  <div className="absolute inset-0 bg-[#0f172a]" />
                  <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-r from-slate-200 via-amber-50 to-slate-100 rounded-r-full shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {/* Craters on illuminated side */}
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-500/20" />
                    <div className="absolute bottom-5 right-5 w-6 h-6 rounded-full bg-slate-500/20" />
                    <div className="absolute top-12 right-8 w-4 h-4 rounded-full bg-slate-500/25" />
                  </div>
                  {/* Subtle 3D terminator shadow blend */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />
                </>
              )}

              {todayMoon.phase === 'Quarto Minguante' && (
                /* Last Quarter: Left half 100% illuminated, right half shaded */
                <>
                  <div className="absolute inset-0 bg-[#0f172a]" />
                  <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-gradient-to-l from-slate-200 via-amber-50 to-slate-100 rounded-l-full shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {/* Craters on illuminated side */}
                    <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-slate-500/20" />
                    <div className="absolute bottom-5 left-5 w-6 h-6 rounded-full bg-slate-500/20" />
                    <div className="absolute top-12 left-8 w-4 h-4 rounded-full bg-slate-500/25" />
                  </div>
                  {/* Subtle 3D terminator shadow blend */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-l from-black/40 via-transparent to-transparent pointer-events-none" />
                </>
              )}

              {todayMoon.phase === 'Lua Nova' && (
                /* New Moon: Dark textured disk with faint rim highlight */
                <div className="absolute inset-0 bg-gradient-to-b from-[#111827] to-[#0b0f19]">
                  <div className="absolute inset-0 rounded-full border border-slate-600/30" />
                  <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-slate-800/40" />
                  <div className="absolute bottom-5 right-6 w-6 h-6 rounded-full bg-slate-800/40" />
                </div>
              )}

              {/* 3D Sphere Sphere Gradient Reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/15 pointer-events-none" />
            </div>
          </div>

          <div className="text-center mt-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {todayMoon.phase}
            </h3>
            <p className="text-xs font-semibold text-teal-600 dark:text-cyan-400 mt-0.5">
              {todayMoon.phaseDetails}
            </p>
            <p className="text-[11px] font-mono-tech text-slate-500 dark:text-slate-400 mt-0.5">
              {todayMoon.illumination}% Iluminação Lunar
            </p>
          </div>
        </div>
      </div>

      {/* Card 5: PREVISÃO DE ATIVIDADE (Solunar Peaks) */}
      <div
        id="card-activity-forecast"
        className="rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          Previsão de Atividade
        </h3>

        <div className="space-y-4">
          {/* Morning Peak */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">{weather.solunarMorningPeak}</span>
              <span className="font-mono-tech text-slate-500 dark:text-slate-400">{weather.solunarMorningPeakRange}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${weather.solunarMorningProgress}%` }}
              />
            </div>
          </div>

          {/* Evening Peak */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">{weather.solunarEveningPeak}</span>
              <span className="font-mono-tech text-slate-500 dark:text-slate-400">{weather.solunarEveningPeakRange}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${weather.solunarEveningProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 6: Ready to Cast Action Card matching screenshot */}
      <div
        id="card-ready-to-launch"
        className="rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm text-center flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 dark:bg-cyan-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center mb-3">
          <Fish className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Pronto para lançar?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
          {weather.recommendation}
        </p>

        <button
          id="home-register-catch-cta"
          onClick={() => setIsCatchModalOpen(true)}
          className="mt-4 w-full py-3 px-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Registrar Captura
        </button>
      </div>

      {/* Monetization: Native In-Feed Ad Banner (Disappears if user.isPremium) */}
      {!user.isPremium && activeAd && (
        <div
          id="sponsored-ad-banner"
          className="relative rounded-2xl p-4 border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-slate-900/40 to-teal-500/5 dark:bg-[#0f172a] shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-500 mb-2">
            <span>Patrocinado • {activeAd.sponsor}</span>
            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className="text-cyan-500 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Remover Anúncios
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <img
              src={activeAd.imageUrl}
              alt={activeAd.title}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700/50 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                {activeAd.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                {activeAd.description}
              </p>
              <a
                href={activeAd.ctaLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:underline"
              >
                {activeAd.ctaText}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Recent Catches Quick Strip */}
      <div className="rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#151b2d] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fish className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Últimas Capturas Registradas ({catches.length})
            </h4>
          </div>
          <button
            onClick={() => setActiveTab('ferramentas')}
            className="text-xs font-semibold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            Ver Todas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {catches.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Nenhuma captura registrada ainda. Use o botão (+) para marcar seu troféu!
          </p>
        ) : (
          <div className="space-y-2">
            {catches.slice(0, 3).map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCatchModal(c)}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-teal-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer group"
                title="Clique para ver os detalhes da captura"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 transition-transform">
                    <img
                      src={c.photoUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=150&q=80'}
                      alt={c.species}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                      {c.species}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono-tech truncate">
                      {c.lengthCm}cm • {c.weightKg}kg • {c.locationName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.released
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {c.released ? 'Solto' : 'Embarcado'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
