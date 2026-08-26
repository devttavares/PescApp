import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Waves,
  Droplets,
  Calendar as CalendarIcon,
  Download,
  Clock,
  ArrowDown,
  ArrowUp,
  Wind,
  Gauge,
  Thermometer,
  CloudRain,
  Sun,
  Sparkles,
  Target,
  MessageSquare,
  Send,
  Star,
  Compass,
  MapPin,
  CheckCircle,
  HelpCircle,
  Fish,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import {
  generateMonthCalendar,
  getMonthNamePt,
  WEEK_DAYS_SHORT,
  CalendarDayInfo
} from '../utils/calendarUtils';

export interface AgendaFeedbackItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  dateFormatted: string;
  fishCaught?: string;
}

export const AgendaView: React.FC = () => {
  const { currentLocation, sendPushNotification, species } = useApp();

  // Current real date of user's device/system
  const realToday = useMemo(() => new Date(), []);
  
  const [selectedYear, setSelectedYear] = useState<number>(realToday.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(realToday.getMonth()); // 0 - 11

  // Dynamic calendar days for the current year/month
  const { days, firstDayOffset } = useMemo(() => {
    return generateMonthCalendar(selectedYear, selectedMonth, currentLocation.name);
  }, [selectedYear, selectedMonth, currentLocation.name]);

  // Selected day object (default to today if in this month, or 1st day of month)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    if (realToday.getFullYear() === selectedYear && realToday.getMonth() === selectedMonth) {
      return realToday.getDate();
    }
    return 1;
  });

  // Find selected day data
  const selectedDay = useMemo(() => {
    return days.find(d => d.dayNumber === selectedDayNumber) || days[0] || null;
  }, [days, selectedDayNumber]);

  // Community user feedback input state
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [userFishCaught, setUserFishCaught] = useState('');
  const [customFishInput, setCustomFishInput] = useState('');

  // Persisted feedbacks & deleted preset ids
  const [customFeedbacks, setCustomFeedbacks] = useState<Record<string, AgendaFeedbackItem[]>>(() => {
    try {
      const saved = localStorage.getItem('pescapp_agenda_feedbacks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [deletedFeedbackIds, setDeletedFeedbackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pescapp_deleted_feedbacks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Feedback currently being edited
  const [editingFeedback, setEditingFeedback] = useState<AgendaFeedbackItem | null>(null);

  useEffect(() => {
    localStorage.setItem('pescapp_agenda_feedbacks', JSON.stringify(customFeedbacks));
  }, [customFeedbacks]);

  useEffect(() => {
    localStorage.setItem('pescapp_deleted_feedbacks', JSON.stringify(deletedFeedbackIds));
  }, [deletedFeedbackIds]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
    setSelectedDayNumber(1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
    setSelectedDayNumber(1);
  };

  const handleGoToToday = () => {
    setSelectedYear(realToday.getFullYear());
    setSelectedMonth(realToday.getMonth());
    setSelectedDayNumber(realToday.getDate());
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim() || !selectedDay) return;

    const fishName = userFishCaught === 'OUTRO'
      ? (customFishInput.trim() || 'Espécie Personalizada')
      : userFishCaught.trim() || 'Não especificado / Apenas relato do dia';

    const newFb: AgendaFeedbackItem = {
      id: `fb-user-${Date.now()}`,
      author: 'Você (Pescador)',
      location: currentLocation.name,
      rating: userRating,
      comment: userComment.trim(),
      dateFormatted: `${selectedDay.dayNumber}/${selectedMonth + 1}/${selectedYear}`,
      fishCaught: fishName !== 'Nenhum peixe (Apenas relato de água)' ? fishName : undefined
    };

    setCustomFeedbacks(prev => ({
      ...prev,
      [selectedDay.dateStr]: [newFb, ...(prev[selectedDay.dateStr] || [])]
    }));

    setUserComment('');
    setUserFishCaught('');
    setCustomFishInput('');
    sendPushNotification(
      '💬 Relato Publicado!',
      `Seu feedback de pesca para ${selectedDay.dayNumber} de ${getMonthNamePt(new Date(selectedYear, selectedMonth, 1))} com peixe (${fishName}) foi registrado!`,
      'system'
    );
  };

  const handleDeleteFeedback = (fbId: string, dateStr: string) => {
    // Remove from customFeedbacks
    setCustomFeedbacks(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] || []).filter(item => item.id !== fbId)
    }));
    // Mark as deleted in case it came from preset
    setDeletedFeedbackIds(prev => [...prev, fbId]);

    sendPushNotification('🗑️ Relato Excluído', 'O feedback foi removido com sucesso.', 'system');
    if (editingFeedback?.id === fbId) {
      setEditingFeedback(null);
    }
  };

  const handleSaveEditFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback || !selectedDay) return;

    setCustomFeedbacks(prev => {
      const currentList = prev[selectedDay.dateStr] || [];
      const exists = currentList.some(item => item.id === editingFeedback.id);

      if (exists) {
        return {
          ...prev,
          [selectedDay.dateStr]: currentList.map(item =>
            item.id === editingFeedback.id ? editingFeedback : item
          )
        };
      } else {
        // Was an initial/preset item that is now converted to custom updated item
        return {
          ...prev,
          [selectedDay.dateStr]: [editingFeedback, ...currentList]
        };
      }
    });

    sendPushNotification('✅ Relato Atualizado', 'Suas alterações no relato foram salvas.', 'system');
    setEditingFeedback(null);
  };

  const handleExportCalendar = () => {
    if (!selectedDay) return;
    const yearStr = selectedYear;
    const monthStr = String(selectedMonth + 1).padStart(2, '0');
    const dayStr = String(selectedDay.dayNumber).padStart(2, '0');

    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PescApp Marine//BR
BEGIN:VEVENT
SUMMARY:Pescaria em ${currentLocation.name} - ${selectedDay.moonPhaseName}
DESCRIPTION:Condições de Pesca: ${selectedDay.solunarRating} (Solunar ${selectedDay.solunarScore}%). Lua: ${selectedDay.moonPhaseName} (${selectedDay.moonIlluminationPercent}%). Vento: ${selectedDay.weather.windSpeedKnots}kn (${selectedDay.weather.windDirection}). Pressão: ${selectedDay.weather.pressureHpa}hPa. Maré Alta às ${selectedDay.tide.highTime} e Baixa às ${selectedDay.tide.lowTime}.
DTSTART:${yearStr}${monthStr}${dayStr}T060000Z
DTEND:${yearStr}${monthStr}${dayStr}T180000Z
LOCATION:${currentLocation.name}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pescaria-${dayStr}-${monthStr}-${yearStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    sendPushNotification(
      '📅 Agenda Sincronizada',
      `Pescaria de ${selectedDay.dayNumber} de ${getMonthNamePt(new Date(selectedYear, selectedMonth, 1))} salva no seu calendário!`,
      'system'
    );
  };

  const activeFeedbacks = useMemo(() => {
    if (!selectedDay) return [];
    const saved = (customFeedbacks[selectedDay.dateStr] || []).filter(
      fb => !deletedFeedbackIds.includes(fb.id)
    );
    const presetFiltered = selectedDay.anglerFeedback.filter(
      fb => !deletedFeedbackIds.includes(fb.id) && !saved.some(s => s.id === fb.id)
    );
    return [...saved, ...presetFiltered];
  }, [selectedDay, customFeedbacks, deletedFeedbackIds]);

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Month Header & Sincronização */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {getMonthNamePt(new Date(selectedYear, selectedMonth, 1))}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-teal-600 dark:text-cyan-400 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {currentLocation.name}
            </span>
            <span className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-cyan-400 px-2 py-0.5 rounded-full font-mono-tech font-bold">
              Data do Celular Sincronizada
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleGoToToday}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2d] text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Ir para o dia de hoje"
          >
            Hoje
          </button>
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2d] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151b2d] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Card Grid */}
      <div className="rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center mb-2.5">
          {WEEK_DAYS_SHORT.map(wd => (
            <span
              key={wd}
              className="text-[11px] font-bold font-mono-tech text-slate-400 dark:text-slate-500 py-1"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1.5 text-center">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}

          {days.map(day => {
            const isSelected = selectedDay?.dayNumber === day.dayNumber;
            const isExcellent = day.solunarRating === 'EXCELENTE';
            const isGood = day.solunarRating === 'BOM';

            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`relative h-12 rounded-2xl text-xs font-semibold flex flex-col items-center justify-center transition-all p-1 ${
                  isSelected
                    ? 'border-2 border-teal-500 dark:border-cyan-400 bg-teal-50 dark:bg-cyan-950/40 text-teal-950 dark:text-cyan-200 font-extrabold scale-105 shadow-md z-10'
                    : isExcellent
                    ? 'bg-teal-600/90 text-white font-bold hover:opacity-90'
                    : isGood
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold hover:bg-cyan-500/25 border border-cyan-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Today badge indicator */}
                {day.isToday && (
                  <span className="absolute -top-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase font-mono-tech bg-amber-500 text-slate-950 shadow-sm">
                    Hoje
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <span>{day.dayNumber}</span>
                  <span className="text-[10px]">{day.moonIconUrl}</span>
                </div>

                {/* Solunar activity score indicator */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[9px] font-mono-tech font-bold opacity-85">
                    {day.solunarScore}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono-tech font-bold">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-teal-600 dark:text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-cyan-400" />
              <span>LUA CHEIA / NOVA (EXCELENTE)</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
              <span>QUARTO (BOM)</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-normal">
            Toque em um dia para ver lua, clima, iscas e relatos
          </span>
        </div>
      </div>

      {/* Selected Day Details Section */}
      {selectedDay && (
        <div className="space-y-4 pt-1">
          {/* Header of selected day */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedDay.moonIconUrl}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {selectedDay.dayNumber} de {getMonthNamePt(new Date(selectedYear, selectedMonth, 1))} ({selectedDay.dayOfWeekFull})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Fase da Lua: <strong className="text-slate-800 dark:text-slate-200">{selectedDay.moonPhaseName}</strong> • {selectedDay.moonPhaseDetails} ({selectedDay.moonIlluminationPercent}% Iluminação)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center gap-1 ${
                  selectedDay.solunarRating === 'EXCELENTE'
                    ? 'bg-teal-500/15 text-teal-600 dark:text-cyan-300 border border-teal-500/30'
                    : selectedDay.solunarRating === 'BOM'
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Atividade {selectedDay.solunarRating} ({selectedDay.solunarScore}%)
              </span>
            </div>
          </div>

          {/* Cards 1: Previsão do Tempo, Vento e Pressão Atmosférica */}
          <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <Sun className="w-5 h-5" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Condições Meteorológicas & Atmosféricas
                </h4>
              </div>
              <span className="text-xs font-bold font-mono-tech text-teal-600 dark:text-cyan-400">
                {selectedDay.weather.condition}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Temperatura */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      Temperatura do Ar
                    </span>
                    <span className="text-xs text-slate-400 font-mono-tech">
                      Mín: {selectedDay.weather.tempMin}°C • Chuva {selectedDay.weather.rainProbPercent}%
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono-tech">
                  {selectedDay.weather.tempMax}°C
                </div>
              </div>

              {/* Vento */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      Velocidade & Direção do Vento
                    </span>
                    <span className="text-xs text-slate-400 font-mono-tech">
                      {selectedDay.weather.windSpeedKmh} km/h • Direção {selectedDay.weather.windDirection}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono-tech">
                  {selectedDay.weather.windSpeedKnots} <span className="text-xs font-normal text-slate-400">kn</span>
                </div>
              </div>

              {/* Pressão Atmosférica */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-tech font-bold uppercase text-slate-500 dark:text-slate-400 block">
                      Pressão Barométrica
                    </span>
                    <span className="text-xs text-teal-600 dark:text-cyan-400 font-bold">
                      {selectedDay.weather.pressureTrend}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono-tech">
                  {selectedDay.weather.pressureHpa} <span className="text-xs font-normal text-slate-400">hPa</span>
                </div>
              </div>
            </div>

            {/* Impacto da Pressão na Pesca */}
            <div className="p-3 rounded-2xl bg-teal-500/10 dark:bg-cyan-950/30 border border-teal-500/20 text-xs flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-teal-500 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Comportamento dos Peixes ({selectedDay.weather.pressureTrend}):
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">
                  {selectedDay.weather.pressureHpa >= 1013
                    ? 'Pressão em alta expande a bexiga natatória dos peixes de forma estável, estimulando ataques ferozes a iscas de superfície e meia-água em estruturas.'
                    : 'Pressão atmosférica oscilando. Recomenda-se trabalhar iscas mais lentas no fundo ou isca viva em poções profundos.'}
                </span>
              </div>
            </div>
          </div>

          {/* Cards 2: Iscas Recomendadas para o Dia & Espécies Propícias (Embaixo uma da outra) */}
          <div className="space-y-4">
            {/* 1. Iscas Recomendadas para as Condições do Dia */}
            <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                  <Compass className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Iscas Recomendadas para o Dia ({selectedDay.moonPhaseName})
                  </h4>
                </div>
                <span className="text-[10px] font-mono-tech text-slate-400 font-bold">
                  Ajustado p/ Vento {selectedDay.weather.windSpeedKnots}kn & Pressão {selectedDay.weather.pressureHpa}hPa
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedDay.recommendedBaits.map((bait, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-teal-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          {bait}
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-cyan-400 font-mono-tech">
                          Ideal para {selectedDay.moonPhaseName} e vento {selectedDay.weather.windSpeedKnots}kn
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-cyan-400 font-mono-tech shrink-0">
                      Recomendada
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Espécies Propícias no Local (Abaixo das Iscas) */}
            <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <Target className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Espécies Propícias em {currentLocation.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono-tech text-teal-600 dark:text-cyan-400 font-bold">
                  Solunar {selectedDay.solunarRating} ({selectedDay.solunarScore}%)
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedDay.propitiousSpecies.map((spName, idx) => {
                  const spMatch = species.find(s => s.name.toLowerCase().includes(spName.toLowerCase().slice(0, 5)));
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {spMatch?.imageUrl ? (
                          <img
                            src={spMatch.imageUrl}
                            alt={spName}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                            <Fish className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {spName}
                          </h5>
                          <span className="text-[11px] text-teal-600 dark:text-cyan-400 font-mono-tech font-bold block truncate">
                            {spMatch?.minLegalSizeCm ? `Mínimo Legal: ${spMatch.minLegalSizeCm} cm` : 'Pesca Ativa na Região'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono-tech shrink-0">
                        Alta Atividade
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cards 3: Marés e Horários Solunares */}
          <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Tábua de Marés & Picos de Ação
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Horários com maior probabilidade de fisgadas
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center gap-1 ${
                  selectedDay.tide.trend === 'DESCENDO'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {selectedDay.tide.trend === 'DESCENDO' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                Maré {selectedDay.tide.trend}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Maré Alta */}
              <div className="rounded-2xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151b2d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400 block">
                      MARÉ ALTA
                    </span>
                    <span className="text-xs font-bold font-mono-tech text-teal-600 dark:text-cyan-400">
                      Altura: {selectedDay.tide.highHeight}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono-tech">
                  {selectedDay.tide.highTime}
                </div>
              </div>

              {/* Maré Baixa */}
              <div className="rounded-2xl p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#151b2d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400 block">
                      MARÉ BAIXA
                    </span>
                    <span className="text-xs font-bold font-mono-tech text-slate-500 dark:text-slate-400">
                      Altura: {selectedDay.tide.lowHeight}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono-tech">
                  {selectedDay.tide.lowTime}
                </div>
              </div>
            </div>

            {/* Picos Solunares Maiores e Menores */}
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-[#151b2d]/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  Picos Maiores de Alimentação:
                </span>
                <span className="font-mono-tech font-bold text-teal-600 dark:text-cyan-400">
                  {selectedDay.solunarMajorPeriods.join(' • ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Picos Menores:
                </span>
                <span className="font-mono-tech text-slate-500 dark:text-slate-400">
                  {selectedDay.solunarMinorPeriods.join(' • ')}
                </span>
              </div>
            </div>

            {/* Exportar .ICS */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sincronizar esta pescaria com a agenda do seu celular
              </span>
              <button
                id="export-calendar-ics-btn"
                onClick={handleExportCalendar}
                className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Salvar Evento (.ICS)
              </button>
            </div>
          </div>

          {/* Cards 4: Feedback e Relatos de Pescadores da Comunidade */}
          <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <MessageSquare className="w-4 h-4" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Relatos & Feedback de Pescadores ({activeFeedbacks.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-tech font-bold">
                Data: {selectedDay.dayNumber}/{selectedMonth + 1}/{selectedYear}
              </span>
            </div>

            {/* Feedback List */}
            <div className="space-y-3">
              {activeFeedbacks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhum relato registrado para este dia ainda. Seja o primeiro a compartilhar sua experiência de pesca!
                </div>
              ) : (
                activeFeedbacks.map(fb => (
                  <div
                    key={fb.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800/80 space-y-2.5 group transition-all shadow-sm"
                  >
                    {/* Header do Card: Avatar Redondo, Nome, Local, Estrelas e Ações */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar 100% circular, com tamanho fixo e aspecto 1:1 para nunca achatar */}
                        <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] aspect-square rounded-full shrink-0 bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-teal-500/20">
                          {fb.author ? fb.author.trim()[0].toUpperCase() : 'P'}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {fb.author}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono-tech flex-wrap">
                            <span className="truncate max-w-[150px] sm:max-w-none">{fb.location}</span>
                            <span>•</span>
                            <span className="shrink-0">{fb.dateFormatted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lado Direito: Estrelas + Botões de Ação */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < fb.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`}
                            />
                          ))}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => setEditingFeedback({ ...fb })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors"
                            title="Editar este relato"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(fb.id, selectedDay.dateStr)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Excluir este relato"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Texto do Comentário com visual limpo */}
                    <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/60">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        "{fb.comment}"
                      </p>
                    </div>

                    {/* Peixe Capturado - Badge arredondado e estilizado */}
                    {fb.fishCaught && (
                      <div className="flex items-center gap-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-500/10 dark:bg-cyan-500/15 border border-teal-500/20 text-teal-700 dark:text-cyan-300 text-[11px] font-bold">
                          <Fish className="w-3.5 h-3.5 shrink-0" />
                          <span>Peixe capturado: <strong className="font-extrabold">{fb.fishCaught}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Form to submit own feedback for the day */}
            <form onSubmit={handleAddFeedback} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Deixar seu relato / feedback para este dia:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`text-amber-400 hover:scale-110 transition-transform ${star <= userRating ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <Star className={`w-4 h-4 ${star <= userRating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Peixe capturado (Customizável pelo usuário) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Fish className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                  Qual peixe foi fisgado neste dia?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={userFishCaught}
                    onChange={e => setUserFishCaught(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione o peixe capturado...</option>
                    <option value="Nenhum peixe (Apenas relato de água)">Nenhum peixe (Apenas relato de água / maré)</option>
                    {species.map(sp => (
                      <option key={sp.id} value={sp.name}>
                        {sp.name}
                      </option>
                    ))}
                    <option value="OUTRO">+ Digitar outro peixe...</option>
                  </select>

                  {userFishCaught === 'OUTRO' && (
                    <input
                      type="text"
                      value={customFishInput}
                      onChange={e => setCustomFishInput(e.target.value)}
                      placeholder="Nome do peixe (ex: Trairão, Robalo-Flecha...)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#151b2d] border border-teal-500 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  )}
                </div>
              </div>

              {/* Comentário & Enviar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userComment}
                  onChange={e => setUserComment(e.target.value)}
                  placeholder="Conte como foi a ação, isca que mais pegou ou transparência da água..."
                  className="flex-1 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!userComment.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR RELATO / FEEDBACK DA AGENDA                                 */}
      {/* ========================================================================= */}
      {editingFeedback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditFeedback}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <Edit2 className="w-4 h-4" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Editar Relato de Pescaria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFeedback(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Avaliação em Estrelas */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Avaliação da Ação / Condição:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditingFeedback(prev => prev ? { ...prev, rating: star } : null)}
                      className={`text-amber-400 hover:scale-110 transition-transform ${
                        star <= (editingFeedback.rating || 5) ? 'opacity-100' : 'opacity-30'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${star <= (editingFeedback.rating || 5) ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Peixe Capturado */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Peixe Capturado:
                </label>
                <input
                  type="text"
                  value={editingFeedback.fishCaught || ''}
                  onChange={e => setEditingFeedback(prev => prev ? { ...prev, fishCaught: e.target.value } : null)}
                  placeholder="Nome do peixe ou deixe vazio"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Comentário */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Comentário / Relato:
                </label>
                <textarea
                  value={editingFeedback.comment}
                  onChange={e => setEditingFeedback(prev => prev ? { ...prev, comment: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (selectedDay) {
                    handleDeleteFeedback(editingFeedback.id, selectedDay.dateStr);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
