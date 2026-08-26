import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveTab,
  LocationCoordinates,
  MarineWeather,
  TideDayData,
  PiracemaConfig,
  FishSpecies,
  BaitGuide,
  CatchRecord,
  PushNotificationItem,
  UserProfile,
  AdCampaign,
  FeedbackItem
} from '../types';
import {
  PRESET_LOCATIONS,
  INITIAL_WEATHER,
  INITIAL_PIRACEMA,
  INITIAL_SPECIES,
  INITIAL_BAITS,
  INITIAL_TIDE_DAYS,
  INITIAL_CATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADS,
  DEFAULT_USER
} from '../data/initialData';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentLocation: LocationCoordinates;
  setCurrentLocation: (loc: LocationCoordinates) => void;
  setCoordinates: (lat: number, lng: number, name?: string) => void;
  weather: MarineWeather;
  updateWeather: (data: Partial<MarineWeather>) => void;
  selectedTideDay: TideDayData;
  setSelectedTideDay: (day: TideDayData) => void;
  tideDays: TideDayData[];
  piracema: PiracemaConfig;
  updatePiracema: (config: Partial<PiracemaConfig>) => void;
  species: FishSpecies[];
  addSpecies: (item: FishSpecies) => void;
  updateSpecies: (id: string, item: Partial<FishSpecies>) => void;
  deleteSpecies: (id: string) => void;
  baits: BaitGuide[];
  addBait: (item: BaitGuide) => void;
  updateBait: (id: string, item: Partial<BaitGuide>) => void;
  deleteBait: (id: string) => void;
  catches: CatchRecord[];
  addCatch: (catchItem: Omit<CatchRecord, 'id'>) => void;
  updateCatch: (id: string, item: Partial<CatchRecord>) => void;
  deleteCatch: (id: string) => void;
  notifications: PushNotificationItem[];
  unreadNotifsCount: number;
  markNotificationsAsRead: () => void;
  sendPushNotification: (title: string, message: string, category?: PushNotificationItem['category'], urgent?: boolean) => void;
  activeToast: PushNotificationItem | null;
  dismissToast: () => void;
  user: UserProfile;
  login: (provider: UserProfile['provider'], email?: string, name?: string, avatar?: string) => void;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  togglePremium: (active?: boolean) => void;
  isOffline: boolean;
  toggleOffline: () => void;
  ads: AdCampaign[];
  toggleAd: (id: string) => void;
  isCatchModalOpen: boolean;
  setIsCatchModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPremiumModalOpen: boolean;
  setIsPremiumModalOpen: (open: boolean) => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  feedbacks: FeedbackItem[];
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>) => void;
  locateCurrentGPS: () => void;
  isLocatingGPS: boolean;
  selectedBaitModal: BaitGuide | null;
  setSelectedBaitModal: (bait: BaitGuide | null) => void;
  selectedCatchModal: CatchRecord | null;
  setSelectedCatchModal: (c: CatchRecord | null) => void;
  viewMode: 'mobile-frame' | 'responsive';
  toggleViewMode: () => void;
  appMetrics: {
    activeAnglers: number;
    catchesToday: number;
    premiumSubscribers: number;
    adImpressions: number;
    revenueBrl: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme: default dark or saved preference
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('pescapp_theme') || localStorage.getItem('anzol_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(PRESET_LOCATIONS[0]);
  const [weather, setWeather] = useState<MarineWeather>(INITIAL_WEATHER);
  const [tideDays] = useState<TideDayData[]>(INITIAL_TIDE_DAYS);
  const [selectedTideDay, setSelectedTideDay] = useState<TideDayData>(INITIAL_TIDE_DAYS[8]); // Oct 9th matching screenshot
  const [piracema, setPiracema] = useState<PiracemaConfig>(INITIAL_PIRACEMA);
  const [species, setSpecies] = useState<FishSpecies[]>(() => {
    try {
      const saved = localStorage.getItem('pescapp_species');
      return saved ? JSON.parse(saved) : INITIAL_SPECIES;
    } catch {
      return INITIAL_SPECIES;
    }
  });
  const [baits, setBaits] = useState<BaitGuide[]>(() => {
    try {
      const saved = localStorage.getItem('pescapp_baits');
      return saved ? JSON.parse(saved) : INITIAL_BAITS;
    } catch {
      return INITIAL_BAITS;
    }
  });
  const [catches, setCatches] = useState<CatchRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pescapp_catches') || localStorage.getItem('anzol_catches');
      return saved ? JSON.parse(saved) : INITIAL_CATCHES;
    } catch {
      return INITIAL_CATCHES;
    }
  });
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<PushNotificationItem | null>(null);
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('pescapp_user') || localStorage.getItem('anzol_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [isOffline, setIsOffline] = useState(false);
  const [ads, setAds] = useState<AdCampaign[]>(INITIAL_ADS);
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('mobile-frame');

  // Modals
  const [isCatchModalOpen, setIsCatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedBaitModal, setSelectedBaitModal] = useState<BaitGuide | null>(null);
  const [selectedCatchModal, setSelectedCatchModal] = useState<CatchRecord | null>(null);

  // GPS State
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('pescapp_feedbacks');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'fb-1',
              category: 'melhoria',
              title: 'Régua com câmera em tempo real',
              description: 'Excelente precisão na régua e diário de troféus!',
              priority: 'media',
              authorName: 'Carlos Pescador',
              authorEmail: 'carlos@pesca.com.br',
              timestamp: 'Ontem às 16:30',
              status: 'resolvido',
            },
          ];
    } catch {
      return [
        {
          id: 'fb-1',
          category: 'melhoria',
          title: 'Régua com câmera em tempo real',
          description: 'Excelente precisão na régua e diário de troféus!',
          priority: 'media',
          authorName: 'Carlos Pescador',
          authorEmail: 'carlos@pesca.com.br',
          timestamp: 'Ontem às 16:30',
          status: 'resolvido',
        },
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('pescapp_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (item: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>) => {
    const newFeedback: FeedbackItem = {
      ...item,
      id: `fb-${Date.now()}`,
      timestamp: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'recebido',
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    sendPushNotification(
      '💬 Feedback Recebido!',
      'Muito obrigado pela sua sugestão/relato. Nossa equipe de desenvolvimento analisará com prioridade.',
      'system'
    );
  };

  const locateCurrentGPS = () => {
    if (!navigator.geolocation) {
      sendPushNotification(
        '⚠️ GPS Indisponível',
        'Geolocalização não suportada no seu navegador.',
        'system'
      );
      return;
    }

    setIsLocatingGPS(true);
    sendPushNotification(
      '🛰️ Conectando ao GPS...',
      'Buscando sinal de satélite para obter sua latitude e longitude exatas...',
      'system'
    );

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsLocatingGPS(false);
        setCoordinates(lat, lng, '📍 Meu Ponto GPS');
        sendPushNotification(
          '📍 GPS Sincronizado com Sucesso!',
          `Coordenadas obtidas: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}. Previsão e marés atualizadas!`,
          'weather'
        );
      },
      err => {
        setIsLocatingGPS(false);
        console.warn('Geolocation error:', err);
        // Fallback default coordinates
        const fallbackLat = -18.3245;
        const fallbackLng = -53.7042;
        setCoordinates(fallbackLat, fallbackLng, 'Alcinópolis / Pantanal (GPS Simulado)');
        sendPushNotification(
          '📍 Localização GPS Definida',
          'Sinal de satélite aproximado definido para Alcinópolis / Pantanal.',
          'weather'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Stats
  const [appMetrics, setAppMetrics] = useState({
    activeAnglers: 1420,
    catchesToday: 89,
    premiumSubscribers: 312,
    adImpressions: 14520,
    revenueBrl: 3480.00,
  });

  useEffect(() => {
    try {
      localStorage.setItem('pescapp_theme', theme);
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    } catch (err) {
      console.warn('LocalStorage error saving theme:', err);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('pescapp_catches', JSON.stringify(catches));
    } catch (err) {
      console.warn('LocalStorage error saving catches:', err);
    }
  }, [catches]);

  useEffect(() => {
    try {
      localStorage.setItem('pescapp_species', JSON.stringify(species));
    } catch (err) {
      console.warn('LocalStorage error saving species:', err);
    }
  }, [species]);

  useEffect(() => {
    try {
      localStorage.setItem('pescapp_baits', JSON.stringify(baits));
    } catch (err) {
      console.warn('LocalStorage error saving baits:', err);
    }
  }, [baits]);

  useEffect(() => {
    try {
      localStorage.setItem('pescapp_user', JSON.stringify(user));
    } catch (err) {
      console.warn('LocalStorage error saving user:', err);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'mobile-frame' ? 'responsive' : 'mobile-frame'));
  };

  const setCoordinates = (lat: number, lng: number, name?: string) => {
    const newLoc: LocationCoordinates = {
      id: `coord-${Date.now()}`,
      name: name || `Coord. (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      region: 'Localização Personalizada',
      latitude: lat,
      longitude: lng,
    };
    setCurrentLocation(newLoc);

    // Dynamically simulate weather variations based on coordinates
    const simulatedTemp = Math.round(20 + Math.sin(lat) * 6 + Math.cos(lng) * 4);
    const simulatedWind = Math.round(8 + (Math.abs(lng) % 15));
    const simulatedPressure = Math.round(1010 + ((Math.abs(lat) * 10) % 12));

    setWeather(prev => ({
      ...prev,
      tempC: Math.max(16, Math.min(36, simulatedTemp)),
      windSpeedKnots: simulatedWind,
      pressureHpa: simulatedPressure,
      pressureTrend: simulatedPressure >= 1013 ? 'Subindo: Condição Excelente' : 'Estável: Condição Boa',
    }));

    sendPushNotification(
      '📍 Local Atualizado',
      `Condições para ${newLoc.name}: ${simulatedTemp}°C, Vento ${simulatedWind}kn, Pressão ${simulatedPressure}hPa.`,
      'weather'
    );
  };

  const updateWeather = (data: Partial<MarineWeather>) => {
    setWeather(prev => ({ ...prev, ...data }));
  };

  const updatePiracema = (config: Partial<PiracemaConfig>) => {
    setPiracema(prev => ({ ...prev, ...config }));
  };

  const addSpecies = (item: FishSpecies) => {
    setSpecies(prev => [item, ...prev]);
  };

  const updateSpecies = (id: string, updated: Partial<FishSpecies>) => {
    setSpecies(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteSpecies = (id: string) => {
    setSpecies(prev => {
      const target = prev.find(s => s.id === id);
      const name = target ? target.name : 'Espécie';
      sendPushNotification(
        '🗑️ Espécie Excluída',
        `"${name}" foi removida do catálogo com sucesso.`,
        'system'
      );
      return prev.filter(s => s.id !== id);
    });
  };

  const addBait = (item: BaitGuide) => {
    setBaits(prev => [item, ...prev]);
    sendPushNotification(
      '🎣 Isca Cadastrada!',
      `A isca "${item.name}" foi adicionada com sucesso ao Guia Geral.`,
      'system'
    );
  };

  const updateBait = (id: string, updated: Partial<BaitGuide>) => {
    setBaits(prev => prev.map(b => (b.id === id ? { ...b, ...updated } : b)));
    sendPushNotification(
      '✏️ Isca Atualizada!',
      `As informações e foto da isca foram atualizadas.`,
      'system'
    );
  };

  const deleteBait = (id: string) => {
    setBaits(prev => {
      const target = prev.find(b => b.id === id);
      const name = target ? target.name : 'Isca';
      sendPushNotification(
        '🗑️ Isca Excluída',
        `"${name}" foi removida do guia com sucesso.`,
        'system'
      );
      return prev.filter(b => b.id !== id);
    });
  };

  const addCatch = (catchItem: Omit<CatchRecord, 'id'>) => {
    const newRecord: CatchRecord = {
      ...catchItem,
      id: `catch-${Date.now()}`,
    };
    setCatches(prev => [newRecord, ...prev]);
    setUser(prev => ({ ...prev, totalCatches: prev.totalCatches + 1 }));
    setAppMetrics(prev => ({ ...prev, catchesToday: prev.catchesToday + 1 }));

    sendPushNotification(
      '🎣 Nova Captura Registrada!',
      `${newRecord.species} de ${newRecord.lengthCm}cm (${newRecord.weightKg}kg) registrado com sucesso!`,
      'solunar'
    );
  };

  const updateCatch = (id: string, updated: Partial<CatchRecord>) => {
    setCatches(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCatch = (id: string) => {
    setCatches(prev => {
      const target = prev.find(c => c.id === id);
      const spName = target ? target.species : 'Captura';
      sendPushNotification(
        '🗑️ Registro Excluído',
        `O registro de captura de "${spName}" foi removido.`,
        'system'
      );
      return prev.filter(c => c.id !== id);
    });
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sendPushNotification = (
    title: string,
    message: string,
    category: PushNotificationItem['category'] = 'system',
    urgent = false
  ) => {
    const newNotif: PushNotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      category,
      timestamp: 'Agora mesmo',
      read: false,
      urgent,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Auto dismiss toast after 6s
    setTimeout(() => {
      setActiveToast(current => (current?.id === newNotif.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const login = (provider: UserProfile['provider'], email?: string, name?: string, avatar?: string) => {
    const displayName = name?.trim() || (email ? email.split('@')[0] : (provider === 'google' ? 'Pescador Google' : provider === 'apple' ? 'Pescador Apple' : 'Pescador Conectado'));
    const displayEmail = email?.trim() || (provider === 'google' ? 'saude.alcinopolis@gmail.com' : `${provider}.angler@pescapp.com.br`);
    const displayAvatar = avatar?.trim() || (
      provider === 'google'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    );

    const loggedUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: displayEmail,
      avatar: displayAvatar,
      provider,
      isPremium: false,
      role: 'user',
      totalCatches: catches.length,
      joinedDate: 'Hoje',
      savedSpots: PRESET_LOCATIONS.slice(0, 3),
      isLoggedIn: true,
    };

    setUser(loggedUser);
    localStorage.setItem('pescapp_user', JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
    sendPushNotification('🎉 Bem-vindo ao PescApp!', `Olá, ${displayName}! Sessão iniciada com sucesso via ${provider.toUpperCase()}.`, 'system');
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser(prev => {
      const updated = { ...prev, ...profile };
      localStorage.setItem('pescapp_user', JSON.stringify(updated));
      return updated;
    });
    sendPushNotification('✅ Perfil Atualizado', 'Suas informações de pescador foram salvas com sucesso!', 'system');
  };

  const logout = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      isLoggedIn: false,
    };
    setUser(guestUser);
    localStorage.setItem('pescapp_user', JSON.stringify(guestUser));
    sendPushNotification('👋 Sessão Encerrada', 'Você saiu da sua conta e está navegando como visitante.', 'system');
  };

  const togglePremium = (forceActive?: boolean) => {
    setUser(prev => {
      const nextState = forceActive !== undefined ? forceActive : !prev.isPremium;
      return { ...prev, isPremium: nextState };
    });
    setAppMetrics(prev => ({
      ...prev,
      premiumSubscribers: user.isPremium ? prev.premiumSubscribers - 1 : prev.premiumSubscribers + 1,
      revenueBrl: user.isPremium ? prev.revenueBrl - 9.90 : prev.revenueBrl + 9.90,
    }));
    setIsPremiumModalOpen(false);
    sendPushNotification(
      user.isPremium ? 'ℹ️ Plano Gratuito' : '⭐ Assinatura Premium Ativa!',
      user.isPremium ? 'Anúncios reativados.' : 'Parabéns! Anúncios removidos e acesso offline ilimitado desbloqueado.',
      'admin'
    );
  };

  const toggleOffline = () => {
    setIsOffline(prev => {
      const next = !prev;
      sendPushNotification(
        next ? '📡 Modo Offline Ativado' : '🌐 Conexão Restaurada',
        next ? 'Você está utilizando previsões e guias salvos no cache do dispositivo.' : 'Sincronização em tempo real reativada.',
        'system'
      );
      return next;
    });
  };

  const toggleAd = (id: string) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, active: !a.active } : a)));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        currentLocation,
        setCurrentLocation,
        setCoordinates,
        weather,
        updateWeather,
        selectedTideDay,
        setSelectedTideDay,
        tideDays,
        piracema,
        updatePiracema,
        species,
        addSpecies,
        updateSpecies,
        deleteSpecies,
        baits,
        addBait,
        updateBait,
        deleteBait,
        catches,
        addCatch,
        updateCatch,
        deleteCatch,
        notifications,
        unreadNotifsCount,
        markNotificationsAsRead,
        sendPushNotification,
        activeToast,
        dismissToast,
        user,
        login,
        logout,
        updateUserProfile,
        togglePremium,
        isOffline,
        toggleOffline,
        ads,
        toggleAd,
        isCatchModalOpen,
        setIsCatchModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        feedbacks,
        addFeedback,
        locateCurrentGPS,
        isLocatingGPS,
        selectedBaitModal,
        setSelectedBaitModal,
        selectedCatchModal,
        setSelectedCatchModal,
        viewMode,
        toggleViewMode,
        appMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
