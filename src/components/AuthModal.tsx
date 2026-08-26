import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  LogOut,
  User,
  CheckCircle2,
  Camera,
  Edit3,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, user, login, logout, updateUserProfile } = useApp();

  const [emailInput, setEmailInput] = useState(user.email !== 'pescador@pescapp.com.br' ? user.email : 'saude.alcinopolis@gmail.com');
  const [nameInput, setNameInput] = useState(user.name !== 'Comandante Pescador' ? user.name : 'Pescador Alcinópolis');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Photo Selector Sheet State
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);

  // Live Camera Stream State
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Hidden File Inputs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const AVATAR_OPTIONS = [
    {
      label: 'Pescador Esportivo',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    {
      label: 'Pescadora 1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    {
      label: 'Pescador com Boné',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    {
      label: 'Pescadora 2',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    },
    {
      label: 'Barco de Pesca',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80'
    }
  ];

  // Stop camera stream cleanly when component unmounts or modal closes
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Handle local image file upload (camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          applyNewAvatar(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input so the same file can be picked again
    e.target.value = '';
  };

  const applyNewAvatar = (newAvatarUrl: string) => {
    setSelectedAvatar(newAvatarUrl);
    if (user.isLoggedIn && !isEditingProfile) {
      updateUserProfile({ avatar: newAvatarUrl });
    }
    setIsPhotoPickerOpen(false);
    stopLiveCamera();
  };

  // Start live web camera
  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to native camera input on unsupported browsers
        cameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });

      streamRef.current = stream;
      setIsLiveCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      console.warn('Erro ao acessar webcam ao vivo, abrindo captura nativa:', err);
      // fallback to device camera directly
      cameraInputRef.current?.click();
      setIsPhotoPickerOpen(false);
    }
  };

  // Capture snapshot from live camera
  const captureLivePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror horizontally if front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        applyNewAvatar(dataUrl);
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      applyNewAvatar(customUrlInput.trim());
      setCustomUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const finalName = nameInput.trim() || emailInput.split('@')[0];
    login('email', emailInput.trim(), finalName, selectedAvatar);
  };

  const handleGoogleLogin = (customEmail?: string) => {
    const finalEmail = customEmail || emailInput.trim() || 'saude.alcinopolis@gmail.com';
    const finalName = nameInput.trim() || (finalEmail.includes('alcinopolis') ? 'Pescador Alcinópolis' : 'Pescador Google');
    login('google', finalEmail, finalName, selectedAvatar);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim() || user.name,
      email: emailInput.trim() || user.email,
      avatar: selectedAvatar
    });
    setIsEditingProfile(false);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Hidden File Inputs */}
      {/* 1. Galeria de Fotos */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 2. Câmera Direta do Dispositivo */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="user"
        className="hidden"
      />

      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <User className="w-5 h-5" />
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              {user.isLoggedIn ? 'Minha Conta de Pescador' : 'Acessar o PescApp'}
            </h3>
          </div>

          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setIsPhotoPickerOpen(false);
              stopLiveCamera();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Camera Modal Overlay */}
        {isLiveCameraActive && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4 animate-pulse text-red-500" />
                Câmera ao Vivo
              </span>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Fechar Câmera
              </button>
            </div>

            <div className="relative aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-cyan-500/40 shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={captureLivePhoto}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto Agora</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                title="Abrir câmera nativa do celular"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Photo Selection Action Sheet */}
        {isPhotoPickerOpen && !isLiveCameraActive && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-teal-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-xl">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                Como deseja escolher sua foto?
              </h4>
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Opções de Foto */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Opção 1: Tirar Foto com Câmera */}
              <button
                type="button"
                onClick={() => {
                  // If on mobile device or modern browser, initiate camera
                  startLiveCamera();
                }}
                className="p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white flex flex-col items-center text-center gap-2 transition-all shadow-md group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-black block">Tirar Foto</span>
                  <span className="text-[10px] text-teal-100 block">Usar a câmera</span>
                </div>
              </button>

              {/* Opção 2: Buscar na Galeria */}
              <button
                type="button"
                onClick={() => {
                  galleryInputRef.current?.click();
                }}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-900 dark:text-slate-100 flex flex-col items-center text-center gap-2 transition-all border border-slate-200 dark:border-slate-700 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-cyan-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black block">Buscar na Galeria</span>
                  <span className="text-[10px] text-slate-400 block">Fotos do celular</span>
                </div>
              </button>
            </div>

            {/* Opção 3: Avatares Prontos */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                Ou selecione um avatar de pesca:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AVATAR_OPTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyNewAvatar(item.url)}
                    className={`w-11 h-11 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedAvatar === item.url
                        ? 'border-teal-500 scale-105 shadow-md ring-2 ring-teal-500/40'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    title={item.label}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Opção 4: Link de Imagem */}
            <div className="pt-1">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Colar link de foto da internet</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={customUrlInput}
                    onChange={e => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-xl font-bold text-xs shrink-0"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logged in state view */}
        {user.isLoggedIn && !isEditingProfile ? (
          <div className="space-y-4">
            {/* Card com Foto de Perfil em Destaque */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-teal-500/30 flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md ring-2 ring-teal-500/20 cursor-pointer"
                  onClick={() => setIsPhotoPickerOpen(true)}
                />
                {/* Botão de trocar foto direto na imagem */}
                <button
                  type="button"
                  onClick={() => setIsPhotoPickerOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-teal-600 text-white shadow-md hover:bg-teal-500 transition-all border-2 border-white dark:border-slate-900 cursor-pointer"
                  title="Tirar Foto ou Buscar na Galeria"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-cyan-400 border border-teal-500/20">
                    {user.provider.toUpperCase()} • CONECTADO
                  </span>
                  {user.isPremium && (
                    <span className="text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      ★ VIP
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Statistics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono-tech block">Capturas Gravadas</span>
                <span className="text-sm font-black text-teal-600 dark:text-cyan-400">{user.totalCatches} peixes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono-tech block">Membro Desde</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{user.joinedDate}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNameInput(user.name);
                  setEmailInput(user.email);
                  setSelectedAvatar(user.avatar);
                  setIsEditingProfile(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados do Pescador</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            </div>
          </div>
        ) : isEditingProfile ? (
          /* Profile Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Foto e Seletor */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                Foto de Perfil do Pescador:
              </label>

              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={selectedAvatar}
                    alt="Prévia da foto"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md ring-2 ring-teal-500/20 cursor-pointer"
                    onClick={() => setIsPhotoPickerOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPhotoPickerOpen(true)}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-teal-600 text-white shadow-md hover:bg-teal-500"
                    title="Tirar Foto ou Buscar na Galeria"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => setIsPhotoPickerOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tirar Foto ou Buscar na Galeria</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Pescador:
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail:
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          /* Login / Sign up View */
          <div className="space-y-4">
            {/* Quick 1-Click Google Sign In */}
            <div className="p-3.5 rounded-2xl bg-teal-500/5 dark:bg-cyan-500/5 border border-teal-500/20 space-y-2">
              <span className="text-[11px] font-bold text-teal-700 dark:text-cyan-300 block">
                Entrada Rápida Recomendada:
              </span>

              <button
                type="button"
                onClick={() => handleGoogleLogin('saude.alcinopolis@gmail.com')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-black flex items-center justify-center gap-3 transition-all shadow-md group cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.24v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.24C.45 8.18 0 9.94 0 12s.45 3.82 1.24 5.39l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.24 6.61l4.03 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span className="truncate">Entrar com Google (saude.alcinopolis@gmail.com)</span>
              </button>
            </div>

            {/* Custom Form with Photo Choice */}
            <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] font-mono-tech text-slate-400 uppercase">
                  ou personalize com seus dados
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Seletor de Foto no Cadastro */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800">
                <img
                  src={selectedAvatar}
                  alt="Prévia"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500 shrink-0 shadow-sm cursor-pointer"
                  onClick={() => setIsPhotoPickerOpen(true)}
                />
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Foto de Perfil:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPhotoPickerOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Tirar Foto ou Buscar na Galeria</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seu Nome ou Apelido:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pescador Alcinópolis"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seu E-mail:
                </label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Salvar e Acessar</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                login('google', 'pescador.visitante@pescapp.com.br', 'Visitante');
              }}
              className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center font-medium cursor-pointer"
            >
              Continuar navegando sem login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
