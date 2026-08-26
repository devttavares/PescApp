import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Fish,
  Camera,
  Scale,
  Ruler,
  MapPin,
  Anchor,
  Sparkles,
  HeartHandshake,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Plus,
  Settings,
  Check,
  Search,
  SwitchCamera,
  RefreshCw,
  Smartphone,
  Video,
  Trash2,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpeciesCrudModal } from './SpeciesCrudModal';
import { compressImageFile } from '../utils/imageUtils';

const POPULAR_BAITS = [
  'Zara de Superfície',
  'Popper',
  'Plug de Meia Água',
  'Camarão Soft / Jighead',
  'Shad / Grub',
  'Tuvira Viva',
  'Lambari Vivo',
  'Massa de Pesqueiro',
  'Milho Azedo',
  'Colher Metálica',
  'Spinnerbait',
  'Fly / Ninfa'
];

export const CatchModal: React.FC = () => {
  const {
    isCatchModalOpen,
    setIsCatchModalOpen,
    species,
    addSpecies,
    currentLocation,
    addCatch,
    user
  } = useApp();

  const [selectedSpecies, setSelectedSpecies] = useState('Tucunaré (Azul / Amarelo)');
  const [lengthCm, setLengthCm] = useState(48);
  const [weightKg, setWeightKg] = useState(2.8);
  const [selectedBait, setSelectedBait] = useState('Zara de Superfície');
  const [locationName, setLocationName] = useState(currentLocation.name);
  const [released, setReleased] = useState(true);
  const [notes, setNotes] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isSpeciesCrudOpen, setIsSpeciesCrudOpen] = useState(false);
  const [showSpeciesSuggestions, setShowSpeciesSuggestions] = useState(false);

  // Photo & Camera States
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraOpen(false);
    setIsStartingCamera(false);
    setCameraError(null);
  };

  const startLiveCamera = async (facingMode: 'environment' | 'user' = cameraFacing) => {
    setIsStartingCamera(true);
    setCameraError(null);
    setIsLiveCameraOpen(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Live camera error:', err);
      setIsStartingCamera(false);
      setCameraError('Permissão da câmera necessária ou não suportada no momento.');
    }
  };

  const flipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startLiveCamera(nextFacing);
  };

  const captureLiveSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Extract compressed JPEG data url
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCustomPhotoUrl(dataUrl);
    stopLiveCamera();
  };

  useEffect(() => {
    if (!isCatchModalOpen) {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isCatchModalOpen]);

  // Auto-fill photo from chosen species if user hasn't uploaded a custom photo
  useEffect(() => {
    if (!customPhotoUrl) {
      const match = species.find(s => 
        s.name.toLowerCase() === selectedSpecies.toLowerCase() ||
        s.name.toLowerCase().includes(selectedSpecies.toLowerCase().slice(0, 4))
      );
      if (match) {
        setCustomPhotoUrl(match.imageUrl);
      }
    }
  }, [selectedSpecies, species, customPhotoUrl]);

  if (!isCatchModalOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      if (compressed) {
        setCustomPhotoUrl(compressed);
      }
    } catch (err) {
      console.warn('Error compressing catch photo:', err);
    }
  };

  const handleQuickAddSpecies = () => {
    if (!selectedSpecies.trim()) return;
    const exists = species.some(s => s.name.toLowerCase() === selectedSpecies.trim().toLowerCase());
    if (exists) return;

    addSpecies({
      id: `sp-${Date.now()}`,
      name: selectedSpecies.trim(),
      scientificName: 'Espécie sp.',
      category: 'NATIVA',
      region: currentLocation.name || 'Pantanal / Bacia do Paraguai',
      description: `Espécie ${selectedSpecies.trim()} cadastrada via registro de captura.`,
      habitat: 'Rios e represas',
      bestLures: [selectedBait || 'Iscas Artificiais'],
      minLegalSizeCm: lengthCm > 0 ? lengthCm : 30,
      imageUrl: customPhotoUrl || 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
      badges: ['Nativa', 'Nova Espécie'],
    });
  };

  const isCurrentSpeciesInCatalog = species.some(
    s => s.name.toLowerCase() === selectedSpecies.trim().toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti effect
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#0D9488', '#22D3EE', '#F59E0B', '#10B981']
    });

    addCatch({
      species: selectedSpecies.trim() || 'Espécie Não Informada',
      lengthCm: Number(lengthCm),
      weightKg: Number(weightKg),
      baitUsed: selectedBait.trim() || 'Isca Artificial',
      locationName: locationName.trim() || currentLocation.name,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      released,
      photoUrl: customPhotoUrl || 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80',
      notes,
      anglerName: user.name,
    });

    setIsCatchModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
          {/* Header with Return button & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCatchModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Voltar / Retornar"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Fish className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                  Registrar Troféu & Foto
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Grave sua captura com foto, espécie e isca personalizadas
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCatchModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
            {/* Photo Uploader / Camera / Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-500" />
                  <span>Foto do Peixe / Captura</span>
                </label>
                <span className="text-[10px] text-teal-600 dark:text-cyan-400 font-mono-tech">
                  Câmera ou Galeria
                </span>
              </div>

              {/* Hidden file inputs and canvas */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Live Camera Viewfinder */}
              {isLiveCameraOpen ? (
                <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-teal-500 shadow-xl space-y-2 p-2">
                  <div className="relative aspect-video max-h-56 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {isStartingCamera && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                        <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                        <span className="text-xs font-bold">Iniciando câmera...</span>
                      </div>
                    )}

                    {/* Camera grid overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-xl m-2 flex items-center justify-center">
                      <div className="w-24 h-24 border border-teal-400/40 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {cameraError && (
                    <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] text-center">
                      {cameraError}
                    </div>
                  )}

                  {/* Camera Controls */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Virar Câmera (Frontal / Traseira)"
                    >
                      <SwitchCamera className="w-4 h-4 text-cyan-400" />
                      <span className="hidden sm:inline">Virar</span>
                    </button>

                    <button
                      type="button"
                      onClick={captureLiveSnapshot}
                      className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all"
                    >
                      <div className="w-3 h-3 rounded-full bg-slate-950 animate-ping" />
                      <span>📸 Tirar Foto Agora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Abrir App de Câmera Nativo do Celular"
                    >
                      <Smartphone className="w-4 h-4 text-teal-400" />
                      <span className="hidden sm:inline">Nativa</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Cancelar Câmera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Photo Preview & Options */
                <div className="space-y-2">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                    {customPhotoUrl ? (
                      <>
                        <img
                          src={customPhotoUrl}
                          alt="Preview do Peixe"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomPhotoUrl('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                          title="Remover Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50 text-teal-500" />
                        <span className="text-[11px] block">Nenhuma foto tirada ou enviada</span>
                        <span className="text-[10px] text-slate-500">
                          Escolha entre abrir a câmera na hora ou enviar da sua galeria
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons: Tirar Foto na Câmera vs Enviar da Galeria */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Attempt live camera first, if user is on mobile or prefers native they have the direct button
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                          startLiveCamera('environment');
                        } else {
                          cameraInputRef.current?.click();
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>📸 Tirar Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload className="w-4 h-4 text-teal-500" />
                      <span>📁 Enviar Foto</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Species Field with Freeform Writing, Autocomplete & CRUD button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Fish className="w-3.5 h-3.5 text-teal-500" />
                  Espécie do Peixe (Escreva ou escolha) *
                </label>

                <button
                  type="button"
                  onClick={() => setIsSpeciesCrudOpen(true)}
                  className="text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  title="Gerenciar catálogo de peixes e medidas legais"
                >
                  <Settings className="w-3 h-3" />
                  <span>Catálogo de Espécies</span>
                </button>
              </div>

              {/* Freeform input with suggestions */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={selectedSpecies}
                  onChange={e => {
                    setSelectedSpecies(e.target.value);
                    setShowSpeciesSuggestions(true);
                  }}
                  onFocus={() => setShowSpeciesSuggestions(true)}
                  placeholder="Escreva o nome do peixe (ex: Tucunaré Azul, Traíra, etc.)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />

                {/* Dropdown list of matching species when typing/focusing */}
                {showSpeciesSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                      <span>ESPÉCIES CADASTRADAS NO PESCAPP</span>
                      <button
                        type="button"
                        onClick={() => setShowSpeciesSuggestions(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        Fechar
                      </button>
                    </div>

                    {species
                      .filter(s =>
                        s.name.toLowerCase().includes(selectedSpecies.toLowerCase()) ||
                        selectedSpecies.trim() === ''
                      )
                      .slice(0, 8)
                      .map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedSpecies(s.name);
                            setCustomPhotoUrl(s.imageUrl);
                            setShowSpeciesSuggestions(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <img src={s.imageUrl} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {s.name}
                            </p>
                            <p className="text-[10px] italic text-slate-500 truncate">
                              {s.scientificName} • {s.category}
                            </p>
                          </div>
                          {selectedSpecies === s.name && (
                            <Check className="w-4 h-4 text-teal-500 shrink-0" />
                          )}
                        </div>
                      ))}

                    <div
                      onClick={() => setIsSpeciesCrudOpen(true)}
                      className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-cyan-300 font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1 text-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar / Gerenciar mais espécies...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notice & Quick Add if species is not yet registered in catalog */}
              {selectedSpecies.trim() !== '' && !isCurrentSpeciesInCatalog && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px]">
                  <span className="text-teal-800 dark:text-cyan-200">
                    💡 <b>"{selectedSpecies}"</b> é uma nova espécie não cadastrada.
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickAddSpecies}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] transition-colors whitespace-nowrap"
                  >
                    + Salvar no Catálogo
                  </button>
                </div>
              )}

              {/* Quick species chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">Populares:</span>
                {species.slice(0, 6).map(sp => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecies(sp.name);
                      setCustomPhotoUrl(sp.imageUrl);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      selectedSpecies === sp.name
                        ? 'bg-teal-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sp.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-teal-500" />
                  Comprimento (cm)
                </label>
                <input
                  type="number"
                  min="5"
                  max="350"
                  value={lengthCm}
                  onChange={e => setLengthCm(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-teal-500" />
                  Peso Estimado (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="250"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Bait Used - Freeform Writing + Presets */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Anchor className="w-3.5 h-3.5 text-teal-500" />
                  Isca Utilizada (Escreva qualquer isca) *
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Artificial, viva ou massa</span>
              </label>

              <input
                type="text"
                required
                list="baits-suggestions-list"
                value={selectedBait}
                onChange={e => setSelectedBait(e.target.value)}
                placeholder="Escreva a isca usada (ex: Zara T20 Osso, Camarão 9cm, Tuvira, etc.)"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />

              <datalist id="baits-suggestions-list">
                {POPULAR_BAITS.map((bait, idx) => (
                  <option key={idx} value={bait} />
                ))}
              </datalist>

              {/* Quick bait chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">Sugestões:</span>
                {POPULAR_BAITS.slice(0, 6).map((bait, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBait(bait)}
                    className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                      selectedBait === bait
                        ? 'bg-teal-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {bait}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Spot */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                Local da Captura
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Ex: Rio Taquari / Ponto do Remanso"
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Release / Catch and Release Checkbox */}
            <div
              onClick={() => setReleased(prev => !prev)}
              className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-colors ${
                released
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Pesca e Solte (Devolvido à Água)</p>
                  <p className="text-[10px] opacity-80">Prática esportiva de preservação das matrizes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={released}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Observações do Ataque / Condições
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Ataque na superfície perto da galhada com trabalho rápido de recolhimento..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Bottom Actions with Return & Submit */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCatchModalOpen(false)}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Voltar / Cancelar"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar e Registrar Troféu</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Species CRUD Manager Modal */}
      <SpeciesCrudModal
        isOpen={isSpeciesCrudOpen}
        onClose={() => setIsSpeciesCrudOpen(false)}
        onSelectSpecies={(speciesName) => {
          setSelectedSpecies(speciesName);
          const match = species.find(s => s.name === speciesName);
          if (match) setCustomPhotoUrl(match.imageUrl);
          setIsSpeciesCrudOpen(false);
        }}
      />
    </>
  );
};
