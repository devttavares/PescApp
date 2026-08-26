import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ruler,
  Plus,
  Scale,
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  Trash2,
  Edit2,
  Camera,
  CameraOff,
  FlipHorizontal,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Search,
  Eye,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Fish,
  Sliders,
  Target,
  Info,
  CreditCard,
  Box,
  Maximize2,
  Layers
} from 'lucide-react';
import { CatchRecord, FishSpecies } from '../types';

export const FerramentasView: React.FC = () => {
  const {
    setIsCatchModalOpen,
    catches,
    updateCatch,
    deleteCatch,
    addCatch,
    species,
    updateSpecies,
    deleteSpecies,
    addSpecies,
    currentLocation,
    sendPushNotification,
    user
  } = useApp();

  const [rulerLengthCm, setRulerLengthCm] = useState<number>(45);
  const [rulerUnit, setRulerUnit] = useState<'cm' | 'in'>('cm');

  // Species selected in the ruler
  const [selectedRulerSpecies, setSelectedRulerSpecies] = useState<string>(() => {
    return species[0]?.name || 'Tucunaré (Azul / Amarelo)';
  });

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraPhotoSnapshot, setCameraPhotoSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const caliperContainerRef = useRef<HTMLDivElement>(null);

  // AR measurement caliper pins (percentage 0 to 100 on width)
  const [caliperStartPercent, setCaliperStartPercent] = useState<number>(20);
  const [caliperEndPercent, setCaliperEndPercent] = useState<number>(80);
  const [draggingMarker, setDraggingMarker] = useState<'start' | 'end' | 'refStart' | 'refEnd' | null>(null);

  // Optical Distance & Reference Calibration State
  const [cameraDistanceCm, setCameraDistanceCm] = useState<number>(50); // Standard 50cm distance
  const [calibrationMode, setCalibrationMode] = useState<'distance' | 'reference'>('distance');
  const [selectedRefObject, setSelectedRefObject] = useState<'cartao' | 'lata' | 'moeda' | 'alicate' | 'custom'>('cartao');
  const [customRefSizeCm, setCustomRefSizeCm] = useState<number>(8.5);
  const [refStartPercent, setRefStartPercent] = useState<number>(38);
  const [refEndPercent, setRefEndPercent] = useState<number>(56);
  const [isAdjustingRef, setIsAdjustingRef] = useState<boolean>(false);

  // Real physical dimensions of reference objects in cm
  const REF_OBJECTS_DATA: Record<
    'cartao' | 'lata' | 'moeda' | 'alicate' | 'custom',
    { name: string; sizeCm: number; icon: string; desc: string }
  > = useMemo(() => ({
    cartao: { name: 'Cartão de Crédito / Licença', sizeCm: 8.5, icon: '💳', desc: 'Largura padrão ISO de 8,5 cm' },
    lata: { name: 'Lata de Bebida (350ml)', sizeCm: 12.0, icon: '🥫', desc: 'Lata de refrigerante/cerveja de 12,0 cm' },
    moeda: { name: 'Moeda de R$ 1,00 Real', sizeCm: 2.7, icon: '🪙', desc: 'Diâmetro oficial de 2,7 cm' },
    alicate: { name: 'Alicate de Pesca / Bico', sizeCm: 18.0, icon: '📏', desc: 'Alicate de contenção/bico de 18,0 cm' },
    custom: { name: 'Medida Personalizada', sizeCm: customRefSizeCm, icon: '📐', desc: `Tamanho exato de ${customRefSizeCm} cm` }
  }), [customRefSizeCm]);

  // Optical scale factor: converts 1% of screen width to real centimeters
  // Mobile camera lens FOV is ~68°: Visible frame width = 2 * Distance * tan(34°) ≈ 1.349 * Distance
  const caliperScaleFactor = useMemo(() => {
    if (calibrationMode === 'reference') {
      const refSpanPercent = Math.max(2, Math.abs(refEndPercent - refStartPercent));
      const refActualCm = REF_OBJECTS_DATA[selectedRefObject]?.sizeCm || 8.5;
      return refActualCm / refSpanPercent;
    } else {
      // Optical distance projection formula
      return (1.349 * cameraDistanceCm) / 100;
    }
  }, [calibrationMode, selectedRefObject, REF_OBJECTS_DATA, refStartPercent, refEndPercent, cameraDistanceCm]);

  // Synchronize caliper length when scale factor or pins change
  useEffect(() => {
    const span = Math.abs(caliperEndPercent - caliperStartPercent);
    const measured = Math.round(span * caliperScaleFactor);
    setRulerLengthCm(Math.max(5, Math.min(180, measured)));
  }, [caliperStartPercent, caliperEndPercent, caliperScaleFactor]);

  // Find species details
  const currentSpeciesData = useMemo(() => {
    return (
      species.find(
        s =>
          s.name.toLowerCase() === selectedRulerSpecies.toLowerCase() ||
          s.name.toLowerCase().includes(selectedRulerSpecies.toLowerCase().slice(0, 4))
      ) || species[0]
    );
  }, [species, selectedRulerSpecies]);

  const minLegalSize = currentSpeciesData?.minLegalSizeCm || 30;
  const isLegalForHarvest = rulerLengthCm >= minLegalSize;

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  };

  // Attach stream whenever video element is available
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn('Video play caught:', e));
    }
  }, [isCameraActive]);

  // Start / Stop Live Camera with full fallback
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setCameraPhotoSnapshot(null);
    setIsStartingCamera(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não possui suporte direto a getUserMedia.');
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (firstConstraintErr) {
        console.warn('First video constraint failed, attempting generic video:', firstConstraintErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (stream) {
        streamRef.current = stream;
        setCameraFacing(facing);
        setIsCameraActive(true);
        setIsStartingCamera(false);

        // Immediate + delayed attach to guarantee stream rendering
        setTimeout(() => {
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(err => console.warn('Play error:', err));
          }
        }, 80);
      }
    } catch (err: any) {
      console.warn('Live camera access error:', err);
      setIsStartingCamera(false);
      setIsCameraActive(false);
      setCameraError(
        'Câmera ao vivo bloqueada ou não suportada no navegador. Utilize o botão "Tirar Foto com Celular" abaixo para abrir a câmera nativa do seu aparelho.'
      );
    }
  };

  const flipCamera = async () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    await startCamera(newFacing);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const takePhotoSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCameraPhotoSnapshot(dataUrl);
      stopCamera();
    }
  };

  // Sync caliper dragging with measured length
  const updateCaliperLength = (start: number, end: number) => {
    const diff = Math.abs(end - start);
    const measured = Math.round(diff * caliperScaleFactor);
    setRulerLengthCm(Math.max(5, Math.min(180, measured)));
  };

  const handleSliderLengthChange = (val: number) => {
    setRulerLengthCm(val);
    const center = 50;
    const halfSpan = Math.min(45, Math.max(8, Math.round(val / (2 * caliperScaleFactor))));
    setCaliperStartPercent(Math.max(5, center - halfSpan));
    setCaliperEndPercent(Math.min(95, center + halfSpan));
  };

  // Caliper pointer events for dragging BICO, CAUDA and Reference Markers
  const handlePointerDown = (marker: 'start' | 'end' | 'refStart' | 'refEnd') => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingMarker(marker);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingMarker || !caliperContainerRef.current) return;
    const rect = caliperContainerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const percent = Math.max(2, Math.min(98, Math.round((rawX / rect.width) * 100)));

    if (draggingMarker === 'start') {
      const newStart = Math.min(percent, caliperEndPercent - 4);
      setCaliperStartPercent(newStart);
      updateCaliperLength(newStart, caliperEndPercent);
    } else if (draggingMarker === 'end') {
      const newEnd = Math.max(percent, caliperStartPercent + 4);
      setCaliperEndPercent(newEnd);
      updateCaliperLength(caliperStartPercent, newEnd);
    } else if (draggingMarker === 'refStart') {
      const newStart = Math.min(percent, refEndPercent - 3);
      setRefStartPercent(newStart);
    } else if (draggingMarker === 'refEnd') {
      const newEnd = Math.max(percent, refStartPercent + 3);
      setRefEndPercent(newEnd);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingMarker) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingMarker(null);
    }
  };

  const handleQuickRegisterMeasuredCatch = () => {
    const photo = cameraPhotoSnapshot || currentSpeciesData?.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80';
    addCatch({
      species: selectedRulerSpecies,
      lengthCm: rulerLengthCm,
      weightKg: Number(((rulerLengthCm * rulerLengthCm * 0.000035) * (selectedRulerSpecies.toLowerCase().includes('pintado') || selectedRulerSpecies.toLowerCase().includes('dourado') ? 1.5 : 1.1)).toFixed(1)) || 2.5,
      baitUsed: currentSpeciesData?.bestLures[0] || 'Isca Artificial',
      locationName: currentLocation.name,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      notes: `Medido via Régua Digital PescApp: ${rulerLengthCm}cm (${isLegalForHarvest ? 'Medida legal atingida' : 'Soltura orientada'}).`,
      photoUrl: photo,
      released: !isLegalForHarvest,
      anglerName: user.name,
    });

    sendPushNotification(
      '🎣 Medição Registrada no Diário!',
      `${selectedRulerSpecies} de ${rulerLengthCm}cm salvo nos seus registros de troféus.`,
      'system'
    );
  };

  // ----------------------------------------------------
  // CRUD CATCH MANAGEMENT STATE (Edit, View, Delete, Search)
  // ----------------------------------------------------
  const [catchSearchTerm, setCatchSearchTerm] = useState('');
  const [catchFilter, setCatchFilter] = useState<'TODOS' | 'SOLTOS' | 'EMBARCADOS'>('TODOS');
  const [viewingCatch, setViewingCatch] = useState<CatchRecord | null>(null);
  const [editingCatch, setEditingCatch] = useState<CatchRecord | null>(null);

  // Edit Catch Form state
  const [editSpecies, setEditSpecies] = useState('');
  const [editLength, setEditLength] = useState(40);
  const [editWeight, setEditWeight] = useState(2.0);
  const [editBait, setEditBait] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editReleased, setEditReleased] = useState(true);
  const [editNotes, setEditNotes] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  const startEditCatch = (c: CatchRecord) => {
    setEditingCatch(c);
    setEditSpecies(c.species);
    setEditLength(c.lengthCm);
    setEditWeight(c.weightKg);
    setEditBait(c.baitUsed);
    setEditLocation(c.locationName);
    setEditReleased(c.released);
    setEditNotes(c.notes || '');
    setEditPhotoUrl(c.photoUrl);
  };

  const handleSaveEditCatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatch || !editSpecies.trim()) return;

    updateCatch(editingCatch.id, {
      species: editSpecies.trim(),
      lengthCm: Number(editLength),
      weightKg: Number(editWeight),
      baitUsed: editBait.trim() || 'Isca Artificial',
      locationName: editLocation.trim() || currentLocation.name,
      released: editReleased,
      notes: editNotes.trim(),
      photoUrl: editPhotoUrl || editingCatch.photoUrl
    });

    sendPushNotification('✅ Registro Atualizado', `Captura de ${editSpecies} atualizada com sucesso!`, 'system');
    setEditingCatch(null);
  };

  const handleDeleteCatch = (c: CatchRecord) => {
    deleteCatch(c.id);
    sendPushNotification('🗑️ Captura Removida', `O registro de ${c.species} foi excluído do seu diário.`, 'system');
    if (viewingCatch?.id === c.id) {
      setViewingCatch(null);
    }
  };

  const filteredCatches = useMemo(() => {
    return catches.filter(c => {
      const matchesSearch =
        c.species.toLowerCase().includes(catchSearchTerm.toLowerCase()) ||
        c.locationName.toLowerCase().includes(catchSearchTerm.toLowerCase()) ||
        c.baitUsed.toLowerCase().includes(catchSearchTerm.toLowerCase());
      const matchesFilter =
        catchFilter === 'TODOS' ||
        (catchFilter === 'SOLTOS' && c.released) ||
        (catchFilter === 'EMBARCADOS' && !c.released);
      return matchesSearch && matchesFilter;
    });
  }, [catches, catchSearchTerm, catchFilter]);

  // Direct editing of species minimum legal size
  const [editingMinSizeSpeciesId, setEditingMinSizeSpeciesId] = useState<string | null>(null);
  const [customMinSizeInput, setCustomMinSizeInput] = useState<number>(30);
  const [speciesSearchTerm, setSpeciesSearchTerm] = useState<string>('');

  // Full Species Modal Editing & Creation
  const [editingSpeciesFull, setEditingSpeciesFull] = useState<FishSpecies | null>(null);
  const [isAddingSpecies, setIsAddingSpecies] = useState<boolean>(false);

  // Form fields for Add / Edit Species
  const [speciesFormName, setSpeciesFormName] = useState('');
  const [speciesFormScientific, setSpeciesFormScientific] = useState('');
  const [speciesFormMinSize, setSpeciesFormMinSize] = useState<number>(30);
  const [speciesFormImage, setSpeciesFormImage] = useState('');
  const [speciesFormCategory, setSpeciesFormCategory] = useState<'NATIVO' | 'INVASOR' | 'PROTEGIDO' | 'EXOTICO'>('NATIVO');
  const [speciesFormHabitat, setSpeciesFormHabitat] = useState('');
  const [speciesFormBaits, setSpeciesFormBaits] = useState('');

  const openAddSpeciesModal = () => {
    setSpeciesFormName('');
    setSpeciesFormScientific('');
    setSpeciesFormMinSize(30);
    setSpeciesFormImage('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80');
    setSpeciesFormCategory('NATIVO');
    setSpeciesFormHabitat('Rios de água limpa, lagoas e represas');
    setSpeciesFormBaits('Iscas artificiais, lambaris, camarão');
    setIsAddingSpecies(true);
  };

  const openEditSpeciesModal = (sp: FishSpecies) => {
    setEditingSpeciesFull(sp);
    setSpeciesFormName(sp.name);
    setSpeciesFormScientific(sp.scientificName);
    setSpeciesFormMinSize(sp.minLegalSizeCm || 0);
    setSpeciesFormImage(sp.imageUrl);
    setSpeciesFormCategory(
      sp.category === 'PROTEGIDA'
        ? 'PROTEGIDO'
        : sp.category === 'INVASORA'
        ? 'INVASOR'
        : 'NATIVO'
    );
    setSpeciesFormHabitat(sp.habitat || 'Rios e lagos');
    setSpeciesFormBaits(Array.isArray(sp.bestLures) ? sp.bestLures.join(', ') : 'Iscas artificiais');
  };

  const handleSaveFullSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesFormName.trim()) return;

    const baitsArray = speciesFormBaits
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    const mappedCategory: 'INVASORA' | 'NATIVA' | 'PROTEGIDA' =
      speciesFormCategory === 'PROTEGIDO'
        ? 'PROTEGIDA'
        : speciesFormCategory === 'INVASOR'
        ? 'INVASORA'
        : 'NATIVA';

    if (editingSpeciesFull) {
      updateSpecies(editingSpeciesFull.id, {
        name: speciesFormName.trim(),
        scientificName: speciesFormScientific.trim() || speciesFormName.trim(),
        minLegalSizeCm: Number(speciesFormMinSize),
        imageUrl: speciesFormImage.trim() || editingSpeciesFull.imageUrl,
        category: mappedCategory,
        conservationStatus: speciesFormCategory,
        habitat: speciesFormHabitat.trim(),
        bestLures: baitsArray.length > 0 ? baitsArray : ['Iscas Artificiais'],
        badges: [
          speciesFormMinSize > 0 ? `Mín. ${speciesFormMinSize}cm` : 'Sem Mínimo',
          speciesFormCategory
        ]
      });
      sendPushNotification('✅ Espécie Atualizada', `Medida e dados de "${speciesFormName}" foram salvos com sucesso!`, 'system');
      setEditingSpeciesFull(null);
    } else if (isAddingSpecies) {
      const newSp: FishSpecies = {
        id: `sp-${Date.now()}`,
        name: speciesFormName.trim(),
        scientificName: speciesFormScientific.trim() || speciesFormName.trim(),
        category: mappedCategory,
        region: currentLocation.region || 'Brasil',
        description: `Espécie ${speciesFormName.trim()} com medida mínima legal de ${speciesFormMinSize}cm.`,
        minLegalSizeCm: Number(speciesFormMinSize),
        imageUrl: speciesFormImage.trim() || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
        conservationStatus: speciesFormCategory,
        habitat: speciesFormHabitat.trim() || 'Águas continentais e costeiras',
        bestLures: baitsArray.length > 0 ? baitsArray : ['Iscas Artificiais'],
        badges: [
          speciesFormMinSize > 0 ? `Mín. ${speciesFormMinSize}cm` : 'Sem Mínimo',
          speciesFormCategory
        ]
      };
      addSpecies(newSp);
      sendPushNotification('🐟 Nova Espécie Cadastrada', `"${speciesFormName}" foi adicionada ao catálogo de medidas legais!`, 'system');
      setIsAddingSpecies(false);
    }
  };

  const handleDeleteSpecies = (sp: FishSpecies) => {
    deleteSpecies(sp.id);
    sendPushNotification('🗑️ Espécie Removida', `"${sp.name}" foi excluída das medidas legais.`, 'system');
    if (editingSpeciesFull?.id === sp.id) {
      setEditingSpeciesFull(null);
    }
  };

  const handleSaveMinSize = (spId: string) => {
    updateSpecies(spId, {
      minLegalSizeCm: customMinSizeInput,
      badges: [
        customMinSizeInput > 0 ? `Mín. ${customMinSizeInput}cm` : 'Sem Mínimo'
      ]
    });
    setEditingMinSizeSpeciesId(null);
    sendPushNotification('📏 Medida Atualizada', `Medida mínima legal atualizada para ${customMinSizeInput}cm.`, 'system');
  };

  const filteredSpecies = useMemo(() => {
    if (!speciesSearchTerm.trim()) return species;
    const q = speciesSearchTerm.toLowerCase();
    return species.filter(
      sp =>
        sp.name.toLowerCase().includes(q) ||
        sp.scientificName.toLowerCase().includes(q) ||
        (sp.conservationStatus && sp.conservationStatus.toLowerCase().includes(q))
    );
  }, [species, speciesSearchTerm]);

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Régua Digital & Diário de Capturas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Medição ótica com câmera, verificação de soltura e histórico de troféus
          </p>
        </div>
        <span className="text-xs font-mono-tech font-bold text-teal-600 dark:text-cyan-400 bg-teal-500/10 px-2.5 py-1 rounded-full">
          Câmera & IA
        </span>
      </div>

      {/* Hidden canvas and elements for camera snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ========================================================================= */}
      {/* SECTION 1: RÉGUA DIGITAL COM CÂMERA AO VIVO & VERIFICAÇÃO DE SOLTURA      */}
      {/* ========================================================================= */}
      <div
        id="card-digital-ruler"
        className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4"
      >
        {/* Header of Ruler */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <Camera className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Régua Digital (Câmera ao Vivo)
                {isCameraActive && (
                  <span className="flex items-center gap-1 text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    AO VIVO
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Unit Toggle & Flip */}
          <div className="flex items-center gap-2">
            {isCameraActive && (
              <button
                type="button"
                onClick={flipCamera}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                title="Alternar Câmera Frontal / Traseira"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span className="text-[10px]">Virar Câmera</span>
              </button>
            )}

            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-mono-tech font-bold border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setRulerUnit('cm')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  rulerUnit === 'cm' ? 'bg-teal-500 text-slate-950 font-black shadow-sm' : 'text-slate-400'
                }`}
              >
                CM
              </button>
              <button
                onClick={() => setRulerUnit('in')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  rulerUnit === 'in' ? 'bg-teal-500 text-slate-950 font-black shadow-sm' : 'text-slate-400'
                }`}
              >
                POL
              </button>
            </div>
          </div>
        </div>

        {/* Species Selector for Instant Legal Check */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            {currentSpeciesData?.imageUrl ? (
              <img
                src={currentSpeciesData.imageUrl}
                alt={currentSpeciesData.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                <Fish className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <label className="text-[10px] font-mono-tech uppercase font-bold text-slate-400">
                Selecione a Espécie Alvo:
              </label>
              <select
                value={selectedRulerSpecies}
                onChange={e => setSelectedRulerSpecies(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {species.map(sp => (
                  <option key={sp.id} value={sp.name} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {sp.name} — Mínimo: {sp.minLegalSizeCm || 'Sem limite'} cm
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono-tech text-slate-400">Medida Mínima Legal:</span>
            <div className="text-sm font-black font-mono-tech text-amber-500">
              {minLegalSize ? `${minLegalSize} cm` : 'Sem cota mínima'}
            </div>
          </div>
        </div>

        {/* Live Camera / AR Caliper Viewport */}
        <div className="space-y-3">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center min-h-[340px] max-h-[460px]">
            {/* Live Video Feed */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(e => console.warn('Play error:', e));
                  }
                }}
                className="w-full h-full object-cover min-h-[340px]"
              />
            ) : cameraPhotoSnapshot ? (
              <img
                src={cameraPhotoSnapshot}
                alt="Foto capturada para medição"
                className="w-full h-full object-contain min-h-[340px]"
              />
            ) : (
              <div className="p-6 sm:p-8 text-center space-y-4 text-slate-300">
                <div className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                  <Camera className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Câmera ao Vivo para Medição</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Ative a câmera em tempo real para enquadrar o peixe e posicionar a régua digital milimétrica no bico e na cauda.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isStartingCamera}
                    onClick={() => startCamera('environment')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 flex items-center gap-2 mx-auto active:scale-95 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{isStartingCamera ? 'Iniciando Câmera...' : 'Abrir Câmera ao Vivo'}</span>
                  </button>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2 max-w-md mx-auto">
                    <p className="font-bold mb-1">Permissão da Câmera:</p>
                    <p>{cameraError}</p>
                  </div>
                )}
              </div>
            )}

            {/* OVERLAID AR CALIPER & MEASURING GRID (when camera or photo active) */}
            {(isCameraActive || cameraPhotoSnapshot) && (
              <div
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="absolute inset-0 pointer-events-auto flex flex-col justify-between p-3 bg-gradient-to-t from-black/85 via-transparent to-black/75 select-none"
              >
                {/* Top Bar inside Camera */}
                <div className="flex items-center justify-between text-white text-xs z-30">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full font-mono-tech font-bold text-teal-400 border border-teal-500/30 flex items-center gap-1.5 shadow-lg">
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">{rulerUnit === 'cm' ? `${rulerLengthCm} cm` : `${(rulerLengthCm / 2.54).toFixed(1)} pol`}</span>
                    </span>

                    <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full font-mono-tech text-[10px] text-slate-300 border border-white/10 hidden sm:flex items-center gap-1">
                      {calibrationMode === 'distance' ? (
                        <>
                          <Target className="w-3 h-3 text-teal-400" />
                          <span>Dist: {cameraDistanceCm} cm</span>
                        </>
                      ) : (
                        <>
                          <span>{REF_OBJECTS_DATA[selectedRefObject].icon}</span>
                          <span>Ref: {REF_OBJECTS_DATA[selectedRefObject].sizeCm} cm</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle reference box overlay */}
                    <button
                      type="button"
                      onClick={() => setIsAdjustingRef(!isAdjustingRef)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors border ${
                        isAdjustingRef
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                          : 'bg-black/65 hover:bg-black/85 text-white border-white/10'
                      }`}
                      title={isAdjustingRef ? 'Ocultar Caixa de Referência' : 'Exibir Caixa de Calibração por Referência'}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>

                    {isCameraActive && (
                      <button
                        type="button"
                        onClick={flipCamera}
                        className="p-2 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md transition-colors border border-white/10"
                        title="Alternar Câmera Frontal / Traseira"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setCameraPhotoSnapshot(null);
                      }}
                      className="p-2 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md transition-colors border border-white/10"
                      title="Desativar Câmera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reference Object Calibration Reticle (When in Reference mode or adjusting) */}
                {(calibrationMode === 'reference' || isAdjustingRef) && (
                  <div className="mx-auto w-full max-w-sm pointer-events-auto bg-black/85 backdrop-blur-md rounded-2xl p-2.5 border border-cyan-400/40 text-white text-xs space-y-1.5 my-1 z-30 shadow-xl">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cyan-300 flex items-center gap-1">
                        <span>{REF_OBJECTS_DATA[selectedRefObject].icon}</span>
                        <span>{REF_OBJECTS_DATA[selectedRefObject].name} ({REF_OBJECTS_DATA[selectedRefObject].sizeCm} cm)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Arraste os limites do objeto</span>
                    </div>

                    <div className="relative w-full h-8 flex items-center bg-slate-900/90 rounded-xl px-2">
                      <div className="absolute inset-x-2 h-0.5 bg-cyan-500/50" />
                      
                      {/* Ref Start Pin */}
                      <div
                        style={{ left: `${refStartPercent}%` }}
                        onPointerDown={handlePointerDown('refStart')}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-ew-resize z-30 touch-none"
                      >
                        <div className="w-3.5 h-6 rounded bg-cyan-400 border border-white shadow-md" />
                      </div>

                      {/* Ref Span Highlight */}
                      <div
                        style={{
                          left: `${refStartPercent}%`,
                          width: `${Math.max(2, refEndPercent - refStartPercent)}%`
                        }}
                        className="absolute h-5 bg-cyan-400/30 border-y border-cyan-400 pointer-events-none rounded"
                      />

                      {/* Ref End Pin */}
                      <div
                        style={{ left: `${refEndPercent}%` }}
                        onPointerDown={handlePointerDown('refEnd')}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-ew-resize z-30 touch-none"
                      >
                        <div className="w-3.5 h-6 rounded bg-cyan-400 border border-white shadow-md" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Centered Interactive AR Caliper Reticle for the Fish */}
                <div
                  ref={caliperContainerRef}
                  style={{ touchAction: 'none' }}
                  className="relative w-full h-32 my-auto flex items-center justify-center select-none"
                >
                  {/* Caliper Baseline */}
                  <div className="absolute inset-x-6 h-1 bg-cyan-400/90 shadow-[0_0_15px_rgba(34,211,238,0.9)] rounded-full" />

                  {/* Start Marker (Snout / Bico) */}
                  <div
                    style={{ left: `${caliperStartPercent}%` }}
                    onPointerDown={handlePointerDown('start')}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-ew-resize group select-none touch-none z-20"
                  >
                    <div className="px-2.5 py-0.5 rounded-md bg-cyan-400 text-[10px] font-black text-slate-950 font-mono-tech mb-1 shadow-lg group-hover:scale-110 transition-transform">
                      BICO
                    </div>
                    <div className="w-4 h-16 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] border-2 border-white group-hover:scale-110 transition-transform" />
                  </div>

                  {/* End Marker (Tail / Cauda) */}
                  <div
                    style={{ left: `${caliperEndPercent}%` }}
                    onPointerDown={handlePointerDown('end')}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-ew-resize group select-none touch-none z-20"
                  >
                    <div className="px-2.5 py-0.5 rounded-md bg-teal-400 text-[10px] font-black text-slate-950 font-mono-tech mb-1 shadow-lg group-hover:scale-110 transition-transform">
                      CAUDA
                    </div>
                    <div className="w-4 h-16 rounded-full bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,1)] border-2 border-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                {/* Camera Bottom Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 z-30">
                  <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-white text-xs">
                    <span className="text-[10px] text-slate-300">Ajuste Manual:</span>
                    <input
                      type="range"
                      min="5"
                      max="140"
                      value={rulerLengthCm}
                      onChange={e => handleSliderLengthChange(Number(e.target.value))}
                      className="w-16 sm:w-24 accent-teal-400 h-1.5 bg-slate-700 rounded cursor-pointer"
                    />
                    <span className="font-mono-tech font-bold text-teal-400 ml-1">{rulerLengthCm}cm</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCameraActive ? (
                      <button
                        type="button"
                        onClick={takePhotoSnapshot}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        Congelar & Medir
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCamera('environment')}
                        className="px-4 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Retornar ao Vivo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Caliper instructions */}
          {(isCameraActive || cameraPhotoSnapshot) && (
            <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400 font-mono-tech">
              <span>0 cm</span>
              <span className="text-center font-bold text-teal-600 dark:text-teal-400">
                Arraste os marcadores BICO e CAUDA diretamente sobre o peixe na câmera ao vivo
              </span>
              <span>180 cm</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAINEL DE CALIBRAÇÃO ÓPTICA & DISTÂNCIA DA CÂMERA AO PEIXE               */}
          {/* ========================================================================= */}
          <div className="rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 bg-slate-50 dark:bg-[#151b2d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                    Calibração Óptica & Distância Real
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-mono-tech font-bold">
                      {calibrationMode === 'distance' ? `Distância: ${cameraDistanceCm} cm` : `Ref: ${REF_OBJECTS_DATA[selectedRefObject].name}`}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajuste a distância da lente ou use um objeto conhecido para calcular o tamanho real
                  </p>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-1 rounded-2xl self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCalibrationMode('distance');
                    setIsAdjustingRef(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calibrationMode === 'distance'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>1. Distância (cm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalibrationMode('reference');
                    setIsAdjustingRef(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calibrationMode === 'reference'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-cyan-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>2. Objeto de Referência</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DISTÂNCIA DA CÂMERA AO PEIXE */}
            {calibrationMode === 'distance' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-teal-500" />
                    Distância aproximada entre o celular e o peixe:
                  </span>
                  <span className="text-xs font-mono-tech font-bold text-teal-600 dark:text-teal-400">
                    {cameraDistanceCm} cm (Escala: 1% da tela = {caliperScaleFactor.toFixed(2)} cm)
                  </span>
                </div>

                {/* Preset Quick Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { dist: 30, label: '30 cm', tip: 'Muito Perto / Detalhe' },
                    { dist: 45, label: '45 cm', tip: 'Braço Semi-Dobrado' },
                    { dist: 60, label: '60 cm', tip: 'Braço Esticado (Padrão)' },
                    { dist: 80, label: '80 cm', tip: 'De Pé no Barco' },
                    { dist: 100, label: '100 cm', tip: 'Distância Longa (Deck)' }
                  ].map(item => (
                    <button
                      key={item.dist}
                      type="button"
                      onClick={() => setCameraDistanceCm(item.dist)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        cameraDistanceCm === item.dist
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 shadow-sm'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/30'
                      }`}
                    >
                      <div className="text-xs font-black font-mono-tech">{item.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.tip}</div>
                    </button>
                  ))}
                </div>

                {/* Fine Distance Slider */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono-tech">20 cm</span>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="1"
                    value={cameraDistanceCm}
                    onChange={e => setCameraDistanceCm(Number(e.target.value))}
                    className="w-full accent-teal-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono-tech">120 cm</span>
                </div>
              </div>
            ) : (
              /* TAB 2: OBJETO DE REFERÊNCIA FÍSICO */
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-500" />
                    Selecione o objeto colocado ao lado do peixe no quadro:
                  </span>
                  <span className="text-xs font-mono-tech font-bold text-cyan-600 dark:text-cyan-400">
                    Tamanho do Objeto: {REF_OBJECTS_DATA[selectedRefObject].sizeCm} cm
                  </span>
                </div>

                {/* Reference Object Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['cartao', 'lata', 'moeda', 'alicate'] as const).map(key => {
                    const item = REF_OBJECTS_DATA[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedRefObject(key);
                          setIsAdjustingRef(true);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          selectedRefObject === key
                            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm'
                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500/30'
                        }`}
                      >
                        <div className="text-base">{item.icon}</div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">{item.name}</div>
                        <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono-tech mt-0.5">{item.sizeCm} cm</div>
                      </button>
                    );
                  })}
                </div>

                {/* Status & Guide to Align Reference in Camera */}
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-900 dark:text-cyan-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>
                      {isAdjustingRef
                        ? 'Arraste a barra azul na câmera para marcar as extremidades do objeto de referência.'
                        : 'Clique para posicionar os marcadores de calibração sobre o objeto.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdjustingRef(!isAdjustingRef)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shrink-0 transition-colors"
                  >
                    {isAdjustingRef ? 'Ocultar Marcador' : 'Ajustar no Objeto'}
                  </button>
                </div>
              </div>
            )}

            {/* Educational Explanatory Card on Camera Distance Physics */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <p>
                <strong>Por que a distância é necessária?</strong> Como as câmeras comuns não possuem sensor de profundidade físico (LiDAR), a distância entre a lente e o peixe altera a escala em pixels na tela. O <strong>PescApp</strong> calcula a perspectiva óptica real para entregar a medida em centímetros sem distorções!
              </p>
            </div>
          </div>
        </div>

        {/* DYNAMIC VERIFICAÇÃO DE SOLTURA OBRIGATÓRIA OU MEDIDA LEGAL ATINGIDA */}
        <div
          className={`p-4 rounded-3xl border transition-all ${
            isLegalForHarvest
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isLegalForHarvest ? (
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h4 className="text-sm font-black tracking-tight">
                  {isLegalForHarvest ? '✅ MEDIDA LEGAL ATINGIDA (Cota Permitida)' : '🚨 SOLTURA OBRIGATÓRIA (Abaixo do Mínimo Legal)'}
                </h4>
                <span className="text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/40">
                  Espécie: {selectedRulerSpecies}
                </span>
              </div>

              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isLegalForHarvest ? (
                  <>
                    O exemplar medido possui <strong>{rulerLengthCm} cm</strong>, atingindo ou superando a medida mínima legal de <strong>{minLegalSize} cm</strong>. O peixe já atingiu sua maturidade reprodutiva e pode ser embarcado dentro da cota regulamentada ou solto esportivamente!
                  </>
                ) : (
                  <>
                    O exemplar medido possui <strong>{rulerLengthCm} cm</strong>, estando <strong>abaixo da medida mínima legal de {minLegalSize} cm</strong>. O transporte ou abate deste exemplar é proibido por lei ambiental (crime ambiental). <strong>Devolva o peixe vivo à água!</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick button to register this measured catch directly */}
          <div className="mt-3 pt-3 border-t border-current/15 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium opacity-80">
              Deseja salvar este peixe medido no seu histórico?
            </span>

            <button
              onClick={handleQuickRegisterMeasuredCatch}
              className={`px-4 py-2 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5 ${
                isLegalForHarvest
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Salvar no Diário de Capturas ({isLegalForHarvest ? 'Troféu' : 'Soltura'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CRUD COMPLETO DE CAPTURAS REGISTRADAS (DIÁRIO DE TROFÉUS)     */}
      {/* ========================================================================= */}
      <div className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Diário & Histórico de Capturas ({catches.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visualize fotos em alta resolução, edite dados ou exclua registros
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCatchModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black text-xs hover:opacity-95 shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Registrar Nova Captura</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catchSearchTerm}
              onChange={e => setCatchSearchTerm(e.target.value)}
              placeholder="Buscar por peixe, isca ou local..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl text-xs bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
            {(['TODOS', 'SOLTOS', 'EMBARCADOS'] as const).map(f => (
              <button
                key={f}
                onClick={() => setCatchFilter(f)}
                className={`px-3 py-1 rounded-xl transition-all ${
                  catchFilter === f
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List of Captures */}
        {filteredCatches.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-400">
            <Fish className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">Nenhum peixe encontrado com os filtros selecionados.</p>
            <button
              onClick={() => setIsCatchModalOpen(true)}
              className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline"
            >
              Clique aqui para registrar sua primeira captura!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCatches.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-3xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5">
                  {/* Photo with modal preview trigger */}
                  <div
                    onClick={() => setViewingCatch(c)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm group-hover:scale-102 transition-transform"
                    title="Clique para ver a foto ampliada"
                  >
                    <img
                      src={c.photoUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80'}
                      alt={c.species}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {c.species}
                      </h4>
                      <span
                        className={`text-[9px] font-mono-tech font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                          c.released
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {c.released ? 'Solto (Esportivo)' : 'Embarcado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs font-mono-tech font-bold text-teal-600 dark:text-cyan-400">
                      <span>{c.lengthCm} cm</span>
                      <span className="text-slate-400">•</span>
                      <span>{c.weightKg} kg</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
                      Isca Utilizada: <strong className="text-slate-800 dark:text-slate-200">{c.baitUsed}</strong>
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono-tech">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.locationName}
                      </span>
                      <span>•</span>
                      <span>{c.date}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: View, Edit, Delete */}
                <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setViewingCatch(c)}
                    className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Detalhes do Troféu
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditCatch(c)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-teal-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Editar registro da captura"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCatch(c)}
                      className="p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 transition-colors"
                      title="Excluir captura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: TABELA DE MEDIDAS MÍNIMAS LEGAIS COM CRUD DAS MEDIDAS         */}
      {/* ========================================================================= */}
      <div
        id="card-minimum-legal-sizes"
        className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <Scale className="w-5 h-5" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Medidas Mínimas Legais por Espécie
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Regulamentação IBAMA & Portarias Estaduais • Edição, Exclusão e Cadastro
              </p>
            </div>
          </div>

          <button
            onClick={openAddSpeciesModal}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black text-xs hover:opacity-95 shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Espécie / Medida</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={speciesSearchTerm}
            onChange={e => setSpeciesSearchTerm(e.target.value)}
            placeholder="Buscar peixe ou tamanho legal..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Species List */}
        <div className="space-y-2.5">
          {filteredSpecies.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhuma espécie encontrada com o termo pesquisado.
            </div>
          ) : (
            filteredSpecies.map(sp => (
              <div
                key={sp.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-500/40 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={sp.imageUrl}
                    alt={sp.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {sp.name}
                      </h4>
                      {sp.conservationStatus && (
                        <span
                          className={`text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded-full ${
                            sp.conservationStatus === 'PROTEGIDO'
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : sp.conservationStatus === 'INVASOR'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {sp.conservationStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 italic font-mono-tech truncate">
                      {sp.scientificName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Habitat: {sp.habitat || 'Rios e represas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/80 shrink-0">
                  {/* Inline Size Edit or Display */}
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-mono-tech text-slate-400 block uppercase">
                      Tamanho Mínimo Legal:
                    </span>
                    {editingMinSizeSpeciesId === sp.id ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={customMinSizeInput}
                          onChange={e => setCustomMinSizeInput(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-teal-500 font-mono-tech font-black text-center text-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={() => handleSaveMinSize(sp.id)}
                          className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                          title="Salvar medida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingMinSizeSpeciesId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black font-mono-tech text-teal-600 dark:text-cyan-400">
                          {sp.minLegalSizeCm ? `${sp.minLegalSizeCm} cm` : 'Sem cota'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingMinSizeSpeciesId(sp.id);
                            setCustomMinSizeInput(sp.minLegalSizeCm || 30);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 transition-colors"
                          title="Ajuste rápido de cm"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit Full & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditSpeciesModal(sp)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-teal-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                      title="Editar foto, nome e detalhes da espécie"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSpecies(sp)}
                      className="p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 transition-colors"
                      title="Excluir espécie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZADOR DETALHADO DO TROFÉU                                   */}
      {/* ========================================================================= */}
      {viewingCatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <Award className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Troféu: {viewingCatch.species}
                </h3>
              </div>
              <button
                onClick={() => setViewingCatch(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-res photo */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-72 border border-slate-200 dark:border-slate-700">
              <img
                src={viewingCatch.photoUrl}
                alt={viewingCatch.species}
                className="w-full h-full object-cover max-h-72"
              />
              <span
                className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-md font-mono-tech ${
                  viewingCatch.released
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {viewingCatch.released ? 'Solto Esportivamente' : 'Embarcado'}
              </span>
            </div>

            {/* Metric badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Comprimento</span>
                <div className="text-lg font-black text-teal-600 dark:text-cyan-400 font-mono-tech">
                  {viewingCatch.lengthCm} cm
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Peso</span>
                <div className="text-lg font-black text-amber-500 font-mono-tech">
                  {viewingCatch.weightKg} kg
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Isca Usada</span>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-1">
                  {viewingCatch.baitUsed}
                </div>
              </div>
            </div>

            {/* Location & Notes */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                <span>Local: <strong>{viewingCatch.locationName}</strong> ({viewingCatch.date} às {viewingCatch.time})</span>
              </div>
              {viewingCatch.notes && (
                <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 italic">
                  "{viewingCatch.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const c = viewingCatch;
                  setViewingCatch(null);
                  startEditCatch(c);
                }}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar Dados
              </button>

              <button
                onClick={() => setViewingCatch(null)}
                className="px-4 py-2 rounded-2xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CAPTURA REGISTRADA                                         */}
      {/* ========================================================================= */}
      {editingCatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditCatch}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <Edit2 className="w-4 h-4" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Editar Registro de Captura
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCatch(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Espécie */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Espécie do Peixe:
                </label>
                <input
                  type="text"
                  value={editSpecies}
                  onChange={e => setEditSpecies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Medida e Peso */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Comprimento (cm):
                  </label>
                  <input
                    type="number"
                    value={editLength}
                    onChange={e => setEditLength(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Peso (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editWeight}
                    onChange={e => setEditWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech font-bold"
                  />
                </div>
              </div>

              {/* Isca Utilizada */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Isca Utilizada:
                </label>
                <input
                  type="text"
                  value={editBait}
                  onChange={e => setEditBait(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Local */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Local da Captura:
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Status de Soltura */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditReleased(true)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    editReleased
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  Solto (Esportivo)
                </button>
                <button
                  type="button"
                  onClick={() => setEditReleased(false)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    !editReleased
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  Embarcado
                </button>
              </div>

              {/* Observações */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Observações & Detalhes:
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingCatch(null)}
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
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR / CADASTRAR ESPÉCIE & MEDIDA MÍNIMA LEGAL                   */}
      {/* ========================================================================= */}
      {(editingSpeciesFull || isAddingSpecies) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveFullSpecies}
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
                <Scale className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {editingSpeciesFull ? `Editar: ${editingSpeciesFull.name}` : 'Cadastrar Nova Espécie / Medida Legal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSpeciesFull(null);
                  setIsAddingSpecies(false);
                }}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Photo Preview & URL */}
              <div className="flex items-center gap-3">
                <img
                  src={speciesFormImage || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80'}
                  alt="Prévia da espécie"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div className="flex-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    URL da Imagem / Foto do Peixe:
                  </label>
                  <input
                    type="url"
                    value={speciesFormImage}
                    onChange={e => setSpeciesFormImage(e.target.value)}
                    placeholder="https://exemplo.com/foto-do-peixe.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Nome Popular e Científico */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Popular da Espécie: *
                  </label>
                  <input
                    type="text"
                    required
                    value={speciesFormName}
                    onChange={e => setSpeciesFormName(e.target.value)}
                    placeholder="Ex: Dourado, Tucunaré..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Científico:
                  </label>
                  <input
                    type="text"
                    value={speciesFormScientific}
                    onChange={e => setSpeciesFormScientific(e.target.value)}
                    placeholder="Ex: Salminus brasiliensis"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 italic focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Medida Mínima e Status de Conservação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Medida Mínima Legal (cm): *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    required
                    value={speciesFormMinSize}
                    onChange={e => setSpeciesFormMinSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-teal-500 text-slate-900 dark:text-slate-100 font-mono-tech font-black text-base focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 para espécies sem cota mínima</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Classificação / Status Legal:
                  </label>
                  <select
                    value={speciesFormCategory}
                    onChange={e => setSpeciesFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="NATIVO">Nativo (Captura permitida acima do mín.)</option>
                    <option value="PROTEGIDO">Protegido (Captura Proibida / Apenas Pesque-Solte)</option>
                    <option value="INVASOR">Invasor (Controle estimulado)</option>
                    <option value="EXOTICO">Exótico / Cultivado</option>
                  </select>
                </div>
              </div>

              {/* Habitat & Iscas */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Habitat / Bacias Hidrográficas:
                </label>
                <input
                  type="text"
                  value={speciesFormHabitat}
                  onChange={e => setSpeciesFormHabitat(e.target.value)}
                  placeholder="Ex: Bacia do Paraná, rios de correnteza, represas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Iscas Recomendadas (separadas por vírgula):
                </label>
                <input
                  type="text"
                  value={speciesFormBaits}
                  onChange={e => setSpeciesFormBaits(e.target.value)}
                  placeholder="Ex: Isca de meia-água, tuvira, minhoca..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {editingSpeciesFull ? (
                <button
                  type="button"
                  onClick={() => handleDeleteSpecies(editingSpeciesFull)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Espécie</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSpeciesFull(null);
                    setIsAddingSpecies(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
                >
                  Salvar Espécie & Medida
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
