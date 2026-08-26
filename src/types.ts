export type ActiveTab = 'inicio' | 'agenda' | 'guia' | 'ferramentas' | 'mapa' | 'admin';

export interface LocationCoordinates {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface MarineWeather {
  tempC: number;
  condition: string;
  windSpeedKnots: number;
  windDirection: string;
  pressureHpa: number;
  pressureTrend: 'Subindo: Condição Excelente' | 'Estável: Condição Boa' | 'Descendo: Alerta de Frente Fria';
  moonPhase: string;
  moonIlluminationPercent: number;
  solunarMorningPeak: string;
  solunarMorningPeakRange: string;
  solunarEveningPeak: string;
  solunarEveningPeakRange: string;
  solunarMorningProgress: number; // 0 to 100
  solunarEveningProgress: number; // 0 to 100
  recommendation: string;
  waterTempC?: number;
  waveHeightFt?: number;
  uvIndex?: number;
}

export interface TideDayData {
  dayNumber: number;
  dateStr: string;
  dayOfWeek: string;
  quality: 'EXCELENTE' | 'BOM' | 'REGULAR';
  highTideTime: string;
  highTideHeight: string;
  lowTideTime: string;
  lowTideHeight: string;
  trend: 'DESCENDO' | 'SUBINDO';
}

export interface PiracemaConfig {
  active: boolean;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  restrictions: string[];
}

export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: 'INVASORA' | 'NATIVA' | 'PROTEGIDA';
  region: string;
  description: string;
  badges: string[];
  minLegalSizeCm?: number;
  maxLegalSizeCm?: number;
  bagLimit?: string;
  imageUrl: string;
  habitat: string;
  bestLures: string[];
  legalBasis?: string;
  conservationStatus?: string;
}

export interface BaitGuide {
  id: string;
  name: string;
  subtitle: string;
  type: 'soft' | 'jig' | 'superficie' | 'meia-agua' | 'fundo' | 'plug' | 'viva' | 'spinner';
  imageUrl: string;
  description: string;
  workStyle: string;
  targetSpecies: string[];
  depthRange: string;
}

export interface CatchRecord {
  id: string;
  species: string;
  lengthCm: number;
  weightKg: number;
  baitUsed: string;
  locationName: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  released: boolean;
  photoUrl?: string;
  notes?: string;
  anglerName: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'tide' | 'weather' | 'piracema' | 'solunar' | 'admin' | 'system';
  timestamp: string;
  read: boolean;
  urgent?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'apple' | 'facebook' | 'email';
  isPremium: boolean;
  role: 'user' | 'admin';
  totalCatches: number;
  joinedDate: string;
  savedSpots: LocationCoordinates[];
  isLoggedIn?: boolean;
}

export interface AdCampaign {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
}

export type FeedbackCategory = 'melhoria' | 'erro' | 'especie' | 'elogio';

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  title: string;
  description: string;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  authorName: string;
  authorEmail: string;
  timestamp: string;
  status: 'recebido' | 'analise' | 'resolvido';
  photoUrl?: string;
}

