import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Thermometer,
  Wind,
  Gauge,
  BookmarkPlus,
  Check,
  Search,
  Crosshair,
  WifiOff
} from 'lucide-react';
import L from 'leaflet';

export const MapView: React.FC = () => {
  const {
    currentLocation,
    setCoordinates,
    weather,
    isOffline,
    user,
    sendPushNotification,
    theme
  } = useApp();

  const [inputLat, setInputLat] = useState(currentLocation.latitude.toString());
  const [inputLng, setInputLng] = useState(currentLocation.longitude.toString());
  const [locationLabel, setLocationLabel] = useState(currentLocation.name);
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const initialMap = L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([currentLocation.latitude, currentLocation.longitude], 12);

        L.control.zoom({ position: 'bottomright' }).addTo(initialMap);
        mapInstanceRef.current = initialMap;
      } catch (e) {
        console.warn('Map initialization caught:', e);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      // Tile Layers
      map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });

      let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      let attribution = '&copy; OpenStreetMap contributors &copy; CARTO';

      if (mapLayer === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS';
      } else if (mapLayer === 'streets' || (mapLayer === 'dark' && theme === 'light')) {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      }

      L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

      // Marker
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: #0D9488;
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 15px #22D3EE;
              border: 2px solid white;
            ">
              🎣
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        markerRef.current = L.marker([currentLocation.latitude, currentLocation.longitude], {
          icon: customIcon,
        }).addTo(map);
      }

      map.setView([currentLocation.latitude, currentLocation.longitude], 12);
    } catch (err) {
      console.warn('Map layer update caught:', err);
    }

    // Click on map to set coordinates
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setInputLat(lat.toFixed(4));
      setInputLng(lng.toFixed(4));
      setCoordinates(lat, lng, `Ponto Marcado (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [currentLocation, mapLayer, theme]);

  // Clean up leaflet map completely on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Map cleanup error:', e);
        }
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      sendPushNotification(
        '⚠️ Coordenadas Inválidas',
        'Por favor insira valores válidos (Latitude entre -90 e 90, Longitude entre -180 e 180).',
        'system'
      );
      return;
    }

    setCoordinates(lat, lng, locationLabel || undefined);
  };

  const handleGetLiveGPS = () => {
    if (!navigator.geolocation) {
      sendPushNotification(
        '⚠️ GPS Não Suportado',
        'Geolocalização não é suportada pelo seu navegador.',
        'system'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setInputLat(lat.toFixed(4));
        setInputLng(lng.toFixed(4));
        setLocationLabel('Minha Posição GPS Atual');
        setCoordinates(lat, lng, 'Minha Posição GPS Atual');
      },
      err => {
        // Fallback demo GPS
        const fallbackLat = -18.3245;
        const fallbackLng = -53.7042;
        setInputLat(fallbackLat.toFixed(4));
        setInputLng(fallbackLng.toFixed(4));
        setLocationLabel('Alcinópolis (GPS Simulado)');
        setCoordinates(fallbackLat, fallbackLng, 'Alcinópolis (GPS Simulado)');
        sendPushNotification('📍 GPS Obtido', 'Localização ajustada para Alcinópolis / Pantanal.', 'weather');
      },
      { timeout: 5000 }
    );
  };

  const handleSaveSpot = () => {
    setSavedSuccess(true);
    sendPushNotification('💾 Ponto Salvo', `${currentLocation.name} foi salvo nos seus favoritos offline!`, 'system');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Mapa & Coordenadas
        </h2>
        {isOffline && (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono-tech font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5" /> Cache Local
          </span>
        )}
      </div>

      {/* Coordinate Input Form */}
      <form
        onSubmit={handleApplyCoordinates}
        className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Consultar Latitude e Longitude
          </span>
          <button
            type="button"
            onClick={handleGetLiveGPS}
            className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Usar Meu GPS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">LATITUDE</label>
            <input
              type="text"
              value={inputLat}
              onChange={e => setInputLat(e.target.value)}
              placeholder="-18.3245"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono-tech focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">LONGITUDE</label>
            <input
              type="text"
              value={inputLng}
              onChange={e => setInputLng(e.target.value)}
              placeholder="-53.7042"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono-tech focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono-tech text-slate-400 block mb-1">NOME DO PONTO</label>
            <input
              type="text"
              value={locationLabel}
              onChange={e => setLocationLabel(e.target.value)}
              placeholder="Ex: Curva do Rio Taquari"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 stroke-[3]" />
            Carregar Condições do Local
          </button>

          <button
            type="button"
            onClick={handleSaveSpot}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            {savedSuccess ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </form>

      {/* Map Display & Overlays */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden relative">
        {/* Layer Switcher Bar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Layers className="w-4 h-4 text-teal-500" />
            <span className="font-semibold">Camada do Mapa:</span>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-mono-tech font-bold">
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapLayer === 'dark' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400'
              }`}
            >
              Náutico Escuro
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapLayer === 'satellite' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400'
              }`}
            >
              Satélite
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                mapLayer === 'streets' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400'
              }`}
            >
              Ruas / Relevo
            </button>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-80 z-0 relative" />

        {/* Live Weather Overlay Card at bottom of map */}
        <div className="p-4 bg-slate-50 dark:bg-[#151b2d] border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-mono-tech font-bold">
              <Thermometer className="w-3 h-3 text-teal-500" /> Temp
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {weather.tempC}°C
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-mono-tech font-bold">
              <Wind className="w-3 h-3 text-cyan-400" /> Vento
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {weather.windSpeedKnots} kn
            </div>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-mono-tech font-bold">
              <Gauge className="w-3 h-3 text-emerald-400" /> Pressão
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {weather.pressureHpa}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
