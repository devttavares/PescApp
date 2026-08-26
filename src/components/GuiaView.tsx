import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  AlertTriangle,
  Lock,
  XCircle,
  CheckCircle2,
  Fish,
  Anchor,
  Sparkles,
  Camera,
  Upload,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Globe2,
  BookOpen,
  Filter,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { FishSpecies, BaitGuide } from '../types';
import { compressImageFile } from '../utils/imageUtils';

// Curated realistic fish images presets for Brazilian sport fishing
const FISH_IMAGE_PRESETS = [
  { name: 'Tucunaré (Azul/Amarelo)', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tilápia do Nilo', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dourado Pantaneiro', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pintado / Surubim', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pacu Caranha', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Traíra / Trairão', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Robalo Flecha', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pirarucu Selvagem', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80' },
];

// Curated realistic bait presets
const BAIT_IMAGE_PRESETS = [
  { name: 'Superfície (Zara/Popper)', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Soft / Silicone', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jighead / Jig de Cerdas', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80' },
  { name: 'Isca Viva (Tuvira/Lambari)', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Meia-Água / Plug Twitch', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Colher / Spinnerbait Metálico', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80' },
];

export const GuiaView: React.FC = () => {
  const { piracema, species, baits, setSelectedBaitModal, addSpecies, updateSpecies, deleteSpecies, addBait, updateBait, deleteBait } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'TODAS' | 'INVASORA' | 'NATIVA' | 'PROTEGIDA'>('TODAS');
  const [regionFilter, setRegionFilter] = useState<string>('TODAS');
  const [selectedSpeciesDetail, setSelectedSpeciesDetail] = useState<FishSpecies | null>(null);

  // Edit / Add Species Modal state
  const [isEditingSpecies, setIsEditingSpecies] = useState(false);
  const [editingSpeciesId, setEditingSpeciesId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSciName, setFormSciName] = useState('');
  const [formCategory, setFormCategory] = useState<FishSpecies['category']>('INVASORA');
  const [formRegion, setFormRegion] = useState('Pantanal / Bacia do Paraguai');
  const [formDescription, setFormDescription] = useState('');
  const [formHabitat, setFormHabitat] = useState('');
  const [formBestLures, setFormBestLures] = useState('');
  const [formMinSize, setFormMinSize] = useState<number>(30);
  const [formMaxSize, setFormMaxSize] = useState<number>(0);
  const [formBagLimit, setFormBagLimit] = useState('');
  const [formLegalBasis, setFormLegalBasis] = useState('');
  const [formConservationStatus, setFormConservationStatus] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Edit / Add Bait Modal state
  const [isEditingBait, setIsEditingBait] = useState(false);
  const [editingBaitId, setEditingBaitId] = useState<string | null>(null);
  const [formBaitName, setFormBaitName] = useState('');
  const [formBaitSubtitle, setFormBaitSubtitle] = useState('');
  const [formBaitType, setFormBaitType] = useState<BaitGuide['type']>('superficie');
  const [formBaitDescription, setFormBaitDescription] = useState('');
  const [formBaitWorkStyle, setFormBaitWorkStyle] = useState('');
  const [formBaitTargetSpecies, setFormBaitTargetSpecies] = useState('');
  const [formBaitDepthRange, setFormBaitDepthRange] = useState('');
  const [formBaitImageUrl, setFormBaitImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const baitFileInputRef = useRef<HTMLInputElement>(null);

  // Listen to open-edit-bait custom event from global BaitModal
  React.useEffect(() => {
    const handleOpenEditBaitEvent = (e: Event) => {
      const customEvent = e as CustomEvent<BaitGuide>;
      if (customEvent.detail) {
        handleOpenEditBaitModal(customEvent.detail);
      }
    };

    window.addEventListener('open-edit-bait', handleOpenEditBaitEvent);
    return () => {
      window.removeEventListener('open-edit-bait', handleOpenEditBaitEvent);
    };
  }, []);

  // Extract unique regions for filter
  const availableRegions = useMemo(() => {
    const list = new Set<string>();
    species.forEach(s => {
      if (s.region) list.add(s.region);
    });
    return Array.from(list);
  }, [species]);

  const filteredSpecies = useMemo(() => {
    return species.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        (s.legalBasis && s.legalBasis.toLowerCase().includes(q));
      
      const matchesCategory = categoryFilter === 'TODAS' || s.category === categoryFilter;
      const matchesRegion = regionFilter === 'TODAS' || s.region === regionFilter;

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [species, searchTerm, categoryFilter, regionFilter]);

  const handleOpenAddModal = () => {
    setEditingSpeciesId(null);
    setFormName('');
    setFormSciName('');
    setFormCategory('INVASORA');
    setFormRegion('Pantanal / Bacia do Paraguai');
    setFormDescription('');
    setFormHabitat('Rios, represas e lagos');
    setFormBestLures('Iscas Artificiais, Isca Viva');
    setFormMinSize(0);
    setFormMaxSize(0);
    setFormBagLimit('Captura Liberada');
    setFormLegalBasis('Portaria IBAMA / Legislação Estadual');
    setFormConservationStatus('Exótica Invasora');
    setFormImageUrl('https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80');
    setIsEditingSpecies(true);
  };

  const handleOpenEditModal = (sp: FishSpecies) => {
    setEditingSpeciesId(sp.id);
    setFormName(sp.name);
    setFormSciName(sp.scientificName);
    setFormCategory(sp.category);
    setFormRegion(sp.region || 'Pantanal / Bacia do Paraguai');
    setFormDescription(sp.description);
    setFormHabitat(sp.habitat);
    setFormBestLures(sp.bestLures.join(', '));
    setFormMinSize(sp.minLegalSizeCm || 0);
    setFormMaxSize(sp.maxLegalSizeCm || 0);
    setFormBagLimit(sp.bagLimit || '');
    setFormLegalBasis(sp.legalBasis || 'Portaria IBAMA / Lei Estadual');
    setFormConservationStatus(sp.conservationStatus || 'Regulamentado');
    setFormImageUrl(sp.imageUrl);
    setIsEditingSpecies(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      if (compressed) {
        setFormImageUrl(compressed);
      }
    } catch (err) {
      console.warn('Error compressing species photo:', err);
    }
  };

  const handleSaveSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const luresArray = formBestLures
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    const badges = [
      formCategory === 'INVASORA' ? 'Sem Limite de Abate' : formCategory === 'PROTEGIDA' ? 'Pesque e Solte Obrigatório' : 'Com Cota Legal',
      formMinSize > 0 ? `Mín. ${formMinSize}cm` : 'Sem Mínimo',
      formMaxSize > 0 ? `Máx. ${formMaxSize}cm` : '',
    ].filter(Boolean);

    if (editingSpeciesId) {
      updateSpecies(editingSpeciesId, {
        name: formName,
        scientificName: formSciName || 'Espécie sp.',
        category: formCategory,
        region: formRegion,
        description: formDescription,
        habitat: formHabitat,
        bestLures: luresArray.length > 0 ? luresArray : ['Iscas Variadas'],
        minLegalSizeCm: formMinSize,
        maxLegalSizeCm: formMaxSize || undefined,
        bagLimit: formBagLimit,
        legalBasis: formLegalBasis,
        conservationStatus: formConservationStatus,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        badges,
      });

      if (selectedSpeciesDetail?.id === editingSpeciesId) {
        setSelectedSpeciesDetail(prev =>
          prev
            ? {
                ...prev,
                name: formName,
                scientificName: formSciName,
                category: formCategory,
                region: formRegion,
                description: formDescription,
                habitat: formHabitat,
                bestLures: luresArray,
                minLegalSizeCm: formMinSize,
                maxLegalSizeCm: formMaxSize || undefined,
                bagLimit: formBagLimit,
                legalBasis: formLegalBasis,
                conservationStatus: formConservationStatus,
                imageUrl: formImageUrl,
                badges,
              }
            : null
        );
      }
    } else {
      const newSp: FishSpecies = {
        id: `fish-${Date.now()}`,
        name: formName,
        scientificName: formSciName || 'Espécie sp.',
        category: formCategory,
        region: formRegion,
        description: formDescription || 'Espécie cadastrada no catálogo PescApp.',
        habitat: formHabitat || 'Águas continentais brasileiras.',
        bestLures: luresArray.length > 0 ? luresArray : ['Iscas Artificiais'],
        minLegalSizeCm: formMinSize,
        maxLegalSizeCm: formMaxSize || undefined,
        bagLimit: formBagLimit || (formCategory === 'INVASORA' ? 'Ilimitada' : '1 exemplar'),
        legalBasis: formLegalBasis || 'Portaria IBAMA / Lei Estadual',
        conservationStatus: formConservationStatus || 'Regulamentado',
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        badges,
      };
      addSpecies(newSp);
    }

    setIsEditingSpecies(false);
  };

  const handleOpenAddBaitModal = () => {
    setEditingBaitId(null);
    setFormBaitName('');
    setFormBaitSubtitle('Ação na Água');
    setFormBaitType('superficie');
    setFormBaitDescription('');
    setFormBaitWorkStyle('Trabalho com toques de ponta de vara alternados e recolhimento contínuo.');
    setFormBaitTargetSpecies('Tucunaré, Traíra, Robalo, Dourado');
    setFormBaitDepthRange('Superfície (0m)');
    setFormBaitImageUrl(BAIT_IMAGE_PRESETS[0].url);
    setIsEditingBait(true);
  };

  const handleOpenEditBaitModal = (bait: BaitGuide) => {
    setEditingBaitId(bait.id);
    setFormBaitName(bait.name);
    setFormBaitSubtitle(bait.subtitle);
    setFormBaitType(bait.type);
    setFormBaitDescription(bait.description);
    setFormBaitWorkStyle(bait.workStyle);
    setFormBaitTargetSpecies(bait.targetSpecies.join(', '));
    setFormBaitDepthRange(bait.depthRange);
    setFormBaitImageUrl(bait.imageUrl);
    setIsEditingBait(true);
  };

  const handleBaitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      if (compressed) {
        setFormBaitImageUrl(compressed);
      }
    } catch (err) {
      console.warn('Error compressing bait photo:', err);
    }
  };

  const handleSaveBait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBaitName.trim()) return;

    const targetArray = formBaitTargetSpecies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingBaitId) {
      updateBait(editingBaitId, {
        name: formBaitName,
        subtitle: formBaitSubtitle || 'Isca Esportiva',
        type: formBaitType,
        description: formBaitDescription,
        workStyle: formBaitWorkStyle,
        targetSpecies: targetArray.length > 0 ? targetArray : ['Tucunaré', 'Dourado'],
        depthRange: formBaitDepthRange || 'Superfície / Meia Água',
        imageUrl: formBaitImageUrl || BAIT_IMAGE_PRESETS[0].url,
      });
    } else {
      const newBait: BaitGuide = {
        id: `bait-${Date.now()}`,
        name: formBaitName,
        subtitle: formBaitSubtitle || 'Isca Esportiva',
        type: formBaitType,
        description: formBaitDescription || 'Isca registrada no catálogo PescApp.',
        workStyle: formBaitWorkStyle || 'Trabalho contínuo ou toques de ponta de vara.',
        targetSpecies: targetArray.length > 0 ? targetArray : ['Tucunaré', 'Robalo'],
        depthRange: formBaitDepthRange || 'Superfície',
        imageUrl: formBaitImageUrl || BAIT_IMAGE_PRESETS[0].url,
      };
      addBait(newBait);
    }

    setIsEditingBait(false);
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header with Search & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Guia de Espécies & Legislação
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro legal detalhado, espécies invasoras, protegidas, medidas mínimas e fotos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-species-top"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Espécie</span>
          </button>
        </div>
      </div>

      {/* Piracema Notice Card */}
      <div
        id="card-piracema-banner"
        className="rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-4"
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {piracema.title}
            </h3>
          </div>
          <span className="text-[10px] font-bold font-mono-tech px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Defeso Legal Ativo
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {piracema.description}
        </p>

        {/* Período Ativo Box */}
        <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-[#151b2d] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
              PERÍODO OFICIAL DE DEFESO (REPRODUÇÃO)
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono-tech">
              {piracema.startDate} — {piracema.endDate}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {/* Restrições List */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-[#151b2d] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <span className="text-[10px] font-bold font-mono-tech tracking-wider uppercase text-slate-500 dark:text-slate-400">
            RESTRIÇÕES LEGAIS VIGENTES & EXCEÇÕES
          </span>

          <div className="space-y-2.5">
            {piracema.restrictions.map((rule, idx) => {
              const isAllowed = rule.toLowerCase().includes('permitida') || rule.toLowerCase().includes('pesca de barranco') || rule.toLowerCase().includes('exóticas');
              return (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  {isAllowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{rule}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deep Search & Filters Container */}
      <div className="rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar peixe, bacia hidrográfica, IBAMA, cota zero..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter 1: Legal Category (Invasora, Nativa, Protegida) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-teal-600 dark:text-cyan-400" />
            Classificação Legal & Conservação:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'TODAS', label: 'Todas as Espécies', icon: Fish, color: 'bg-teal-600' },
              { id: 'INVASORA', label: 'Invasoras (Liberado)', icon: AlertTriangle, color: 'bg-rose-600' },
              { id: 'NATIVA', label: 'Nativas (Com Cota)', icon: ShieldCheck, color: 'bg-emerald-600' },
              { id: 'PROTEGIDA', label: 'Protegidas (Cota Zero)', icon: Lock, color: 'bg-amber-600' },
            ].map(cat => {
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-teal-500/40'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 2: Region / Bacia Hidrográfica */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-teal-600 dark:text-cyan-400" />
            Bacia Hidrográfica / Região:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setRegionFilter('TODAS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                regionFilter === 'TODAS'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#151b2d] text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas as Regiões
            </button>
            {availableRegions.map(reg => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  regionFilter === reg
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-[#151b2d] text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Catálogo de Espécies & Medidas Legais (Empilhadas verticalmente) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fish className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Catálogo de Espécies Regulamentadas ({filteredSpecies.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono-tech text-teal-600 dark:text-cyan-400 font-bold">
            Clique para Detalhes Legais
          </span>
        </div>

        {filteredSpecies.length === 0 ? (
          <div className="rounded-3xl p-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Fish className="w-10 h-10 mx-auto text-slate-400 opacity-40" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma espécie encontrada com esses filtros
            </p>
            <p className="text-xs text-slate-500">Tente buscar por outro nome ou limpar os filtros de região/categoria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('TODAS');
                setRegionFilter('TODAS');
              }}
              className="px-4 py-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-cyan-400 text-xs font-bold mt-2"
            >
              Restaurar Filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSpecies.map(sp => (
              <div
                key={sp.id}
                onClick={() => setSelectedSpeciesDetail(sp)}
                className="rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm hover:border-teal-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  {/* Species Photo with quick edit */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700/60 shadow-md">
                    <img
                      src={sp.imageUrl}
                      alt={sp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Category Label Pill */}
                    <span
                      className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-mono-tech shadow-sm ${
                        sp.category === 'INVASORA'
                          ? 'bg-rose-600 text-white'
                          : sp.category === 'PROTEGIDA'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {sp.category === 'INVASORA' ? 'Invasora' : sp.category === 'PROTEGIDA' ? 'Protegida' : 'Nativa'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-cyan-400 transition-colors">
                        {sp.name}
                      </h4>
                      {sp.region && (
                        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                          {sp.region}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono-tech italic text-slate-500 dark:text-slate-400 line-clamp-1">
                      {sp.scientificName}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {sp.description}
                    </p>

                    {/* Legal Info Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {sp.minLegalSizeCm !== undefined && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono-tech font-black bg-teal-500/10 text-teal-700 dark:text-cyan-300 border border-teal-500/30">
                          {sp.minLegalSizeCm > 0
                            ? sp.maxLegalSizeCm
                              ? `Medida: ${sp.minLegalSizeCm} a ${sp.maxLegalSizeCm} cm`
                              : `Mínimo: ${sp.minLegalSizeCm} cm`
                            : 'Sem Medida Mínima'}
                        </span>
                      )}

                      {sp.legalBasis && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono-tech text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 truncate max-w-[200px]">
                          📜 {sp.legalBasis}
                        </span>
                      )}

                      {sp.bagLimit && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono-tech font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 truncate max-w-[200px]">
                          ⚖️ {sp.bagLimit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(sp);
                    }}
                    className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    title="Editar Espécie, Fotos e Medidas Legais"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar / Trocar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSpecies(sp.id);
                    }}
                    className="p-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors"
                    title="Excluir Espécie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpeciesDetail(sp);
                    }}
                    className="px-3 py-2 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-cyan-300 text-xs font-bold transition-colors"
                  >
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Guia Geral de Iscas & Trabalho de Água (Diretamente abaixo do catálogo de espécies) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Anchor className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Guia Geral de Iscas & Ação de Água
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
              Consulte e cadastre características de trabalho, profundidade e fotos das suas iscas favoritas.
            </p>
          </div>

          <button
            id="btn-add-bait"
            onClick={handleOpenAddBaitModal}
            className="px-3.5 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Nova Isca</span>
          </button>
        </div>

        {/* Baits List - Stacking vertically */}
        <div className="space-y-3">
          {baits.map(bait => (
            <div
              key={bait.id}
              onClick={() => setSelectedBaitModal(bait)}
              className="rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0f172a] shadow-sm hover:border-teal-500/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700/60 shadow-sm relative">
                  <img
                    src={bait.imageUrl}
                    alt={bait.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono-tech font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-teal-300 border border-teal-500/30">
                    {bait.subtitle}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {bait.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-tech font-bold uppercase bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-cyan-300">
                      {bait.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {bait.description}
                  </p>
                  <span className="text-[11px] font-mono-tech font-bold text-teal-600 dark:text-cyan-400 mt-1.5 block">
                    Profundidade: {bait.depthRange}
                  </span>
                </div>
              </div>

              <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 flex items-center justify-between sm:justify-end gap-2 text-xs font-mono-tech text-teal-600 dark:text-cyan-400 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditBaitModal(bait);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Editar Isca ou Alterar Foto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar / Foto</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBait(bait.id);
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors"
                  title="Excluir Isca"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <span className="font-bold underline group-hover:text-teal-500">Ver Técnicas →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Species Detail Modal with Complete Legal Basis */}
      {selectedSpeciesDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header Photo */}
            <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md">
              <img
                src={selectedSpeciesDetail.imageUrl}
                alt={selectedSpeciesDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <button
                onClick={() => setSelectedSpeciesDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono-tech shadow-md ${
                      selectedSpeciesDetail.category === 'INVASORA'
                        ? 'bg-rose-600 text-white'
                        : selectedSpeciesDetail.category === 'PROTEGIDA'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedSpeciesDetail.category === 'INVASORA'
                      ? 'Espécie Invasora / Alóctone'
                      : selectedSpeciesDetail.category === 'PROTEGIDA'
                      ? 'Espécie Protegida / Cota Zero'
                      : 'Espécie Nativa Regulamentada'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedSpeciesDetail.name}
                  </h3>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono-tech italic text-slate-500 dark:text-slate-400">
                {selectedSpeciesDetail.scientificName} • Região: {selectedSpeciesDetail.region || 'Brasil'}
              </p>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedSpeciesDetail.description}
            </p>

            {/* Legal & Regulation Box */}
            <div className="space-y-2.5 text-xs bg-slate-50 dark:bg-[#151b2d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                <FileText className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
                <span>Enquadramento Legal & Medidas Obrigatórias</span>
              </div>

              {selectedSpeciesDetail.minLegalSizeCm !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Tamanho Legal:</span>
                  <span className="text-teal-600 dark:text-cyan-400 font-mono-tech font-black text-sm">
                    {selectedSpeciesDetail.minLegalSizeCm > 0
                      ? selectedSpeciesDetail.maxLegalSizeCm
                        ? `Janela de ${selectedSpeciesDetail.minLegalSizeCm} cm a ${selectedSpeciesDetail.maxLegalSizeCm} cm`
                        : `Mínimo de ${selectedSpeciesDetail.minLegalSizeCm} cm`
                      : 'Sem tamanho mínimo (Captura Encorajada)'}
                  </span>
                </div>
              )}

              {selectedSpeciesDetail.bagLimit && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Cota de Captura:</span>
                  <span className="text-amber-500 font-bold">{selectedSpeciesDetail.bagLimit}</span>
                </div>
              )}

              {selectedSpeciesDetail.legalBasis && (
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400 shrink-0">Base Legal / Decreto:</span>
                  <span className="text-slate-800 dark:text-slate-200 text-right font-mono-tech">
                    {selectedSpeciesDetail.legalBasis}
                  </span>
                </div>
              )}

              {selectedSpeciesDetail.conservationStatus && (
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Status de Conservação:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedSpeciesDetail.conservationStatus}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Habitat: </span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedSpeciesDetail.habitat}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Iscas Favoritas: </span>
                  <span className="text-teal-600 dark:text-cyan-400 font-semibold">{selectedSpeciesDetail.bestLures.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedSpeciesDetail(null)}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedSpeciesDetail) {
                    deleteSpecies(selectedSpeciesDetail.id);
                    setSelectedSpeciesDetail(null);
                  }
                }}
                className="px-3.5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="Excluir Espécie do Catálogo"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>

              <button
                onClick={() => {
                  const sp = selectedSpeciesDetail;
                  setSelectedSpeciesDetail(null);
                  handleOpenEditModal(sp);
                }}
                className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar Espécie / Trocar Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Species Modal with Photo Upload & Presets */}
      {isEditingSpecies && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSpecies(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Voltar"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {editingSpeciesId ? 'Editar Espécie & Medidas Legais' : 'Cadastrar Nova Espécie de Peixe'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingSpecies(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecies} className="space-y-4 text-xs">
              {/* Photo Preview & Upload Controls */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Foto da Espécie
                </label>

                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                  {formImageUrl ? (
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>Sem imagem selecionada</span>
                    </div>
                  )}

                  {/* Upload button over preview */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs shadow-lg flex items-center gap-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-500" />
                      <span>Enviar da Câmera / Arquivo</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Quick Presets Carousel */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    Ou escolha uma foto de referência realista:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {FISH_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`shrink-0 flex items-center gap-1.5 p-1 pr-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                          formImageUrl === preset.url
                            ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-cyan-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-6 h-6 rounded-lg object-cover" />
                        <span>{preset.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    placeholder="Ou cole a URL direta da foto na web..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Names & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Comum *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Ex: Dourado"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Científico
                  </label>
                  <input
                    type="text"
                    value={formSciName}
                    onChange={e => setFormSciName(e.target.value)}
                    placeholder="Ex: Salminus brasiliensis"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 italic"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Região / Bacia Hidrográfica
                  </label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={e => setFormRegion(e.target.value)}
                    placeholder="Ex: Pantanal / Bacia do Paraguai"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Category, Min Size, Max Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Classificação Legal
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="INVASORA">Invasora / Exótica (Sem Limite)</option>
                    <option value="NATIVA">Nativa Regulamentada (Com Cota)</option>
                    <option value="PROTEGIDA">Protegida por Lei (Cota Zero / Proibido Abate)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Medida Mínima (cm)
                  </label>
                  <input
                    type="number"
                    value={formMinSize}
                    onChange={e => setFormMinSize(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Medida Máxima / Janela (cm)
                  </label>
                  <input
                    type="number"
                    value={formMaxSize}
                    onChange={e => setFormMaxSize(Number(e.target.value))}
                    placeholder="0 = Sem Máximo"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech font-bold"
                  />
                </div>
              </div>

              {/* Legal Basis & Bag limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Base Legal / Portaria / Lei
                  </label>
                  <input
                    type="text"
                    value={formLegalBasis}
                    onChange={e => setFormLegalBasis(e.target.value)}
                    placeholder="Ex: Lei Estadual MS 5.234 / Portaria IBAMA nº 445"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Regulamentação de Cota / Abate
                  </label>
                  <input
                    type="text"
                    value={formBagLimit}
                    onChange={e => setFormBagLimit(e.target.value)}
                    placeholder="Ex: Cota Zero (Pesque e Solte Exclusivo) ou 1 exemplar"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Descrição e Características
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Informações comportamentais, hábitos alimentares, coloração e importância esportiva..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Lures & Habitat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Iscas Favoritas (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formBestLures}
                    onChange={e => setFormBestLures(e.target.value)}
                    placeholder="Zaras, Poppers, Isca Viva, Tuvira"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Habitat Típico
                  </label>
                  <input
                    type="text"
                    value={formHabitat}
                    onChange={e => setFormHabitat(e.target.value)}
                    placeholder="Corredeiras rápidas, pedrais, pés de cachoeira..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSpecies(false)}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                {editingSpeciesId && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteSpecies(editingSpeciesId);
                      setIsEditingSpecies(false);
                      setSelectedSpeciesDetail(null);
                    }}
                    className="px-4 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold transition-colors"
                    title="Excluir espécie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingSpeciesId ? 'Salvar Alterações' : 'Cadastrar Espécie'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Bait Modal (Cadastro e Alteração de Fotos de Iscas) */}
      {isEditingBait && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {editingBaitId ? 'Editar Isca & Alterar Foto' : 'Cadastrar Nova Isca'}
                </h3>
              </div>

              <button
                onClick={() => setIsEditingBait(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBait} className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              {/* Photo selection / upload banner */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Foto da Isca (Envie do dispositivo ou escolha um modelo)
                </label>
                
                <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-inner group">
                  <img
                    src={formBaitImageUrl || BAIT_IMAGE_PRESETS[0].url}
                    alt="Prévia da Isca"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 transition-opacity">
                    <button
                      type="button"
                      onClick={() => baitFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Alterar / Enviar Foto</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={baitFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBaitFileUpload}
                  className="hidden"
                />

                {/* Preset quick picker */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                    Ou selecione um visual de isca pré-definido:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {BAIT_IMAGE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormBaitImageUrl(p.url)}
                        className={`p-1 rounded-xl border text-[10px] text-left truncate transition-all ${
                          formBaitImageUrl === p.url
                            ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-cyan-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                        title={p.name}
                      >
                        {p.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Photo URL input fallback */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={formBaitImageUrl}
                    onChange={e => setFormBaitImageUrl(e.target.value)}
                    placeholder="Ou cole o link direto da imagem (URL https://...)"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-[11px]"
                  />
                </div>
              </div>

              {/* Bait Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome da Isca *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBaitName}
                    onChange={e => setFormBaitName(e.target.value)}
                    placeholder="Ex: Iscas de Superfície (Zara)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtítulo / Categoria Curta
                  </label>
                  <input
                    type="text"
                    value={formBaitSubtitle}
                    onChange={e => setFormBaitSubtitle(e.target.value)}
                    placeholder="Ex: Ação na Superfície / Pesca de Fundo"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Type & Depth Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Família / Tipo de Isca
                  </label>
                  <select
                    value={formBaitType}
                    onChange={e => setFormBaitType(e.target.value as BaitGuide['type'])}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="superficie">Superfície (Zara, Popper, Stick)</option>
                    <option value="meia-agua">Meia-Água (Plugs, Minnow, Twitch)</option>
                    <option value="soft">Soft / Silicone (Criaturas, Shads, Minhocas)</option>
                    <option value="jig">Jig / Bucktail / Jighead</option>
                    <option value="fundo">Fundo / Crankbaits / Chatterbaits</option>
                    <option value="spinner">Spinnerbaits / Colheres Metálicas</option>
                    <option value="viva">Isca Viva (Tuviras, Lambaris, Camarões)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Faixa de Profundidade
                  </label>
                  <input
                    type="text"
                    value={formBaitDepthRange}
                    onChange={e => setFormBaitDepthRange(e.target.value)}
                    placeholder="Ex: 0m (Superfície) ou 1 a 4 metros"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Descrição e Características Técnicas
                </label>
                <textarea
                  rows={2}
                  value={formBaitDescription}
                  onChange={e => setFormBaitDescription(e.target.value)}
                  placeholder="Explique o comportamento da isca, material, barulho (rattlin) e quando usar..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Work Style / Recolhimento */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ação de Água & Modo de Trabalho / Recolhimento
                </label>
                <textarea
                  rows={2}
                  value={formBaitWorkStyle}
                  onChange={e => setFormBaitWorkStyle(e.target.value)}
                  placeholder="Ex: Toques curtos e secos de ponta de vara no recolhimento contínuo em zigue-zague (Zara)..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Target Species */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Peixes Alvo Recomendados (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formBaitTargetSpecies}
                  onChange={e => setFormBaitTargetSpecies(e.target.value)}
                  placeholder="Tucunaré Açu, Dourado, Trairão, Robalo"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditingBait(false)}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                {editingBaitId && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteBait(editingBaitId);
                      setIsEditingBait(false);
                    }}
                    className="px-4 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold transition-colors"
                    title="Excluir Isca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingBaitId ? 'Salvar Alterações da Isca' : 'Cadastrar Isca'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


