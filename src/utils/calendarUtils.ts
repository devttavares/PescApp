// Utility functions for dynamic calendar, moon phases, solunar calculations, and weather forecasts
import React from 'react';
import { TideDayData, FishSpecies } from '../types';

export interface CalendarDayInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeekShort: string; // SEG, TER, etc.
  dayOfWeekFull: string;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  moonPhaseName: 'Lua Nova' | 'Quarto Crescente' | 'Lua Cheia' | 'Quarto Minguante';
  moonPhaseDay: number; // 1 to 7 (qual dia da fase de 7 dias)
  moonPhaseDetails: string; // Ex: "3º dia da Lua Cheia (Ciclo de 7 dias)"
  moonIlluminationPercent: number;
  moonIconUrl: string;
  solunarRating: 'EXCELENTE' | 'BOM' | 'REGULAR';
  solunarScore: number; // 0 - 100
  solunarMajorPeriods: string[];
  solunarMinorPeriods: string[];
  tide: {
    highTime: string;
    highHeight: string;
    lowTime: string;
    lowHeight: string;
    trend: 'SUBINDO' | 'DESCENDO';
  };
  weather: {
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
    rainProbPercent: number;
    windSpeedKnots: number;
    windSpeedKmh: number;
    windDirection: string;
    pressureHpa: number;
    pressureTrend: 'Subindo: Excelente para Ataques' | 'Estável: Atividade Boa' | 'Descendo: Peixes Manhosos / Frente Fria';
  };
  recommendedBaits: string[];
  propitiousSpecies: string[];
  anglerFeedback: Array<{
    id: string;
    author: string;
    location: string;
    rating: number;
    comment: string;
    dateFormatted: string;
    fishCaught?: string;
  }>;
}

// Calculate moon phase for a given date based on synodic lunar month (~29.53059 days)
// In astronomical & fishing practice, the 4 primary phases each last ~7.38 days (aprox. 7 dias cada):
// 1. Lua Nova: age 0 to 7.38 days (Dia 1 a 7 da Lua Nova)
// 2. Quarto Crescente: age 7.38 to 14.76 days (Dia 1 a 7 do Quarto Crescente)
// 3. Lua Cheia: age 14.76 to 22.15 days (Dia 1 a 7 da Lua Cheia - 7 dias de duração)
// 4. Quarto Minguante: age 22.15 to 29.53 days (Dia 1 a 7 do Quarto Minguante - 7 dias de duração)
export function getMoonPhase(date: Date): {
  phase: CalendarDayInfo['moonPhaseName'];
  phaseDay: number;
  phaseDetails: string;
  illumination: number;
} {
  // Known reference new moon: January 11, 2024 at 11:57 UTC
  const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
  const lunarCycleMs = 29.53058867 * 24 * 60 * 60 * 1000;
  
  const diffMs = date.getTime() - refNewMoon;
  const cycleFraction = ((diffMs % lunarCycleMs) + lunarCycleMs) % lunarCycleMs / lunarCycleMs;
  
  // Phase angle / age in days (0.00 to 29.53 days)
  const ageDays = cycleFraction * 29.53058867;
  
  // Illumination calculation (0% to 100%)
  const illumination = Math.round((1 - Math.cos(cycleFraction * 2 * Math.PI)) / 2 * 100);
  
  let phase: CalendarDayInfo['moonPhaseName'] = 'Lua Nova';
  let phaseDay = 1;
  let phaseDetails = '';

  if (ageDays < 7.3826) {
    phase = 'Lua Nova';
    phaseDay = Math.min(7, Math.max(1, Math.floor(ageDays) + 1));
    phaseDetails = `${phaseDay}º dia da Lua Nova (Duração: 7 dias)`;
  } else if (ageDays < 14.7653) {
    phase = 'Quarto Crescente';
    phaseDay = Math.min(7, Math.max(1, Math.floor(ageDays - 7.3826) + 1));
    phaseDetails = `${phaseDay}º dia da Lua Crescente (Duração: 7 dias)`;
  } else if (ageDays < 22.1479) {
    phase = 'Lua Cheia';
    phaseDay = Math.min(7, Math.max(1, Math.floor(ageDays - 14.7653) + 1));
    phaseDetails = `${phaseDay}º dia da Lua Cheia (Duração: 7 dias)`;
  } else {
    phase = 'Quarto Minguante';
    phaseDay = Math.min(7, Math.max(1, Math.floor(ageDays - 22.1479) + 1));
    phaseDetails = `${phaseDay}º dia da Lua Minguante (Duração: 7 dias)`;
  }
  
  return { phase, phaseDay, phaseDetails, illumination };
}

// Format month name in Portuguese
export function getMonthNamePt(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[date.getMonth()]} de ${date.getFullYear()}`;
}

export const WEEK_DAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// Generate dynamic day data for a month given year and month index (0-11)
export function generateMonthCalendar(year: number, month: number, locationName = 'Rio Taquari / Pantanal'): {
  days: CalendarDayInfo[];
  firstDayOffset: number;
} {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const firstDayOffset = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  
  const days: CalendarDayInfo[] = [];
  
  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(year, month, d, 12, 0, 0);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayOfWeekIndex = dayDate.getDay();
    const dayOfWeekShort = WEEK_DAYS_SHORT[dayOfWeekIndex];
    const isToday = dateStr === todayStr;
    const isPast = dayDate.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const { phase, phaseDay, phaseDetails, illumination } = getMoonPhase(dayDate);
    
    // Solunar rating calculation: Full Moon and New Moon have best tides & feeding activity
    let solunarRating: 'EXCELENTE' | 'BOM' | 'REGULAR' = 'REGULAR';
    let solunarScore = 55;
    if (phase === 'Lua Cheia' || phase === 'Lua Nova') {
      solunarRating = 'EXCELENTE';
      solunarScore = 90 + (d % 8);
    } else if (phase === 'Quarto Crescente' || phase === 'Quarto Minguante' || illumination > 60) {
      solunarRating = 'BOM';
      solunarScore = 75 + (d % 10);
    } else {
      solunarScore = 48 + (d % 15);
    }

    // Dynamic Tide calculation
    const hourOffset = (d * 50) % 720; // 50 mins later each day
    const highHour = Math.floor((4 + hourOffset / 60) % 12);
    const highMin = Math.floor(hourOffset % 60);
    const lowHour = Math.floor((highHour + 6) % 12);
    const lowMin = (highMin + 20) % 60;
    
    const highHeightVal = (2.6 + (illumination / 100) * 1.2).toFixed(1);
    const lowHeightVal = (-0.2 - (illumination / 100) * 0.5).toFixed(1);
    const tideTrend = (d % 2 === 0) ? 'SUBINDO' : 'DESCENDO';

    // Dynamic simulated weather
    const baseTemp = 23 + Math.sin(d * 0.4) * 5;
    const tempMax = Math.round(baseTemp + 5);
    const tempMin = Math.round(baseTemp - 4);
    const rainProb = Math.abs(Math.sin(d * 0.7) * 80);
    const windSpeedKnots = Math.round(6 + Math.abs(Math.cos(d * 0.5) * 14));
    const windSpeedKmh = Math.round(windSpeedKnots * 1.852);
    const windDirections = ['NE', 'E', 'SE', 'N', 'L', 'S', 'SO'];
    const windDirection = windDirections[(d + month) % windDirections.length];
    
    // Atmospheric pressure
    const pressureHpa = Math.round(1010 + Math.sin(d * 0.3) * 8);
    let pressureTrend: CalendarDayInfo['weather']['pressureTrend'] = 'Estável: Atividade Boa';
    if (pressureHpa >= 1014) {
      pressureTrend = 'Subindo: Excelente para Ataques';
    } else if (pressureHpa < 1010) {
      pressureTrend = 'Descendo: Peixes Manhosos / Frente Fria';
    }

    let condition = 'Sol e Poucas Nuvens';
    let icon = 'sun';
    if (rainProb > 60) {
      condition = 'Pancadas de Chuva à Tarde';
      icon = 'cloud-rain';
    } else if (rainProb > 35) {
      condition = 'Parcialmente Nublado';
      icon = 'cloud-sun';
    } else if (windSpeedKnots > 16) {
      condition = 'Vento Moderado a Forte';
      icon = 'wind';
    }

    // Recommended Baits for this day based on weather/moon
    const recommendedBaits: string[] = [];
    if (phase === 'Lua Cheia' || phase === 'Lua Nova') {
      recommendedBaits.push('Zaras de Superfície 90mm-110mm (Madrugada e Entardecer)', 'Poppers com Ratlin Barulhento', 'Tuvira Viva em poções');
    } else if (pressureHpa < 1010) {
      recommendedBaits.push('Iscas Soft estilo Shad no Fundo', 'Jighead com Camarão / Lambari', 'Trabalho Lento de Meia Água');
    } else {
      recommendedBaits.push('Plugs de Meia Água Suspending', 'Spinnerbaits em Galhadas', 'Colher Prateada');
    }

    // Propitious Fish Species by location and conditions
    const propitiousSpecies: string[] = [];
    if (locationName.toLowerCase().includes('pantanal') || locationName.toLowerCase().includes('alcinópolis') || locationName.toLowerCase().includes('ms')) {
      if (solunarRating === 'EXCELENTE') {
        propitiousSpecies.push('Dourado do Rio', 'Pintado / Surubim', 'Pacu Caranha', 'Piraputanga');
      } else {
        propitiousSpecies.push('Tucunaré Amarelo', 'Trairão de Galhada', 'Piauçu');
      }
    } else if (locationName.toLowerCase().includes('costa') || locationName.toLowerCase().includes('ilha') || locationName.toLowerCase().includes('mar')) {
      propitiousSpecies.push('Robalo Flecha', 'Corvina', 'Badejo', 'Pescada Amarela');
    } else {
      propitiousSpecies.push('Tucunaré Azul', 'Traíra', 'Tilápia do Nilo', 'Black Bass');
    }

    // Simulated community feedback / reports
    const anglerFeedback = [
      {
        id: `fb-${d}-1`,
        author: 'Marcos Ribeiro (Guia Pantaneiro)',
        location: locationName,
        rating: solunarRating === 'EXCELENTE' ? 5 : 4,
        comment: solunarRating === 'EXCELENTE' 
          ? 'Água com excelente transparência. Muita ação na boca de corixos e no reponto da maré/correnteza.'
          : 'Peixes manhosos no meio do dia, mas ativos no início da manhã com isca viva e plugs lentos.',
        dateFormatted: `${d}/${month + 1}/${year}`,
        fishCaught: propitiousSpecies[0] || 'Tucunaré'
      },
      {
        id: `fb-${d}-2`,
        author: 'Capitão Soares (Pesca Esportiva)',
        location: locationName,
        rating: solunarScore > 70 ? 5 : 4,
        comment: `Vento de ${windSpeedKnots} nós favorável para pinchar nas margens protegidas. Ótimo dia para ${recommendedBaits[0]}.`,
        dateFormatted: `${d}/${month + 1}/${year}`,
        fishCaught: propitiousSpecies[1] || 'Dourado'
      }
    ];

    days.push({
      date: dayDate,
      dateStr,
      dayNumber: d,
      dayOfWeekShort,
      dayOfWeekFull: dayDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
      isToday,
      isPast,
      isCurrentMonth: true,
      moonPhaseName: phase,
      moonPhaseDay: phaseDay,
      moonPhaseDetails: phaseDetails,
      moonIlluminationPercent: illumination,
      moonIconUrl: getMoonEmoji(phase),
      solunarRating,
      solunarScore,
      solunarMajorPeriods: [
        `${String(highHour + 5).padStart(2, '0')}:00 – ${String(highHour + 7).padStart(2, '0')}:30`,
        `${String(highHour + 17).padStart(2, '0')}:30 – ${String(highHour + 19).padStart(2, '0')}:45`
      ],
      solunarMinorPeriods: [
        `${String((highHour + 11) % 24).padStart(2, '0')}:15 – ${String((highHour + 12) % 24).padStart(2, '0')}:15`,
        `${String((highHour + 23) % 24).padStart(2, '0')}:00 – ${String((highHour + 24) % 24).padStart(2, '0')}:00`
      ],
      tide: {
        highTime: `${String(highHour || 12).padStart(2, '0')}:${String(highMin).padStart(2, '0')} ${highHour >= 12 ? 'PM' : 'AM'}`,
        highHeight: `+${highHeightVal} ft`,
        lowTime: `${String(lowHour || 12).padStart(2, '0')}:${String(lowMin).padStart(2, '0')} ${lowHour >= 12 ? 'PM' : 'AM'}`,
        lowHeight: `${lowHeightVal} ft`,
        trend: tideTrend
      },
      weather: {
        tempMax,
        tempMin,
        condition,
        icon,
        rainProbPercent: Math.round(rainProb),
        windSpeedKnots,
        windSpeedKmh,
        windDirection,
        pressureHpa,
        pressureTrend
      },
      recommendedBaits,
      propitiousSpecies,
      anglerFeedback
    });
  }

  return { days, firstDayOffset };
}

export function getMoonEmoji(phase: CalendarDayInfo['moonPhaseName']): string {
  switch (phase) {
    case 'Lua Cheia':
      return '🌕';
    case 'Lua Nova':
      return '🌑';
    case 'Quarto Crescente':
      return '🌓';
    case 'Quarto Minguante':
      return '🌗';
    default:
      return '🌕';
  }
}

export function getMoonSvgIcon(phase: CalendarDayInfo['moonPhaseName'], className = 'w-6 h-6'): React.ReactNode {
  switch (phase) {
    case 'Lua Cheia':
      return React.createElement(
        'span',
        { className: `inline-block ${className} text-center leading-none text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.6)]` },
        '🌕'
      );
    case 'Lua Nova':
      return React.createElement(
        'span',
        { className: `inline-block ${className} text-center leading-none opacity-60 text-slate-400` },
        '🌑'
      );
    case 'Quarto Crescente':
      return React.createElement(
        'span',
        { className: `inline-block ${className} text-center leading-none text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.4)]` },
        '🌓'
      );
    case 'Quarto Minguante':
      return React.createElement(
        'span',
        { className: `inline-block ${className} text-center leading-none text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.4)]` },
        '🌗'
      );
    default:
      return React.createElement('span', null, '🌕');
  }
}
