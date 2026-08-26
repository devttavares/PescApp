import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Fish,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Camera,
  Search,
  Check,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { FishSpecies } from '../types';
import { compressImageFile } from '../utils/imageUtils';

export const FISH_PHOTO_PRESETS = [
  { name: 'Tucunaré (Azul/Amarelo)', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tilápia do Nilo', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dourado do Rio', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pintado / Surubim', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pacu Caranha', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Traíra / Trairão', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Robalo Flecha / Peva', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tambaqui / Pirapitinga', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Black Bass', url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80' },
];

interface SpeciesCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpecies?: (speciesName: string) => void;
  initialEditSpeciesId?: string | null;
}

export const SpeciesCrudModal: React.FC<SpeciesCrudModalProps> = ({
  isOpen,
  onClose,
  onSelectSpecies,
  initialEditSpeciesId
}) => {
  const { species, addSpecies, updateSpecies, deleteSpecies, sendPushNotification } = useApp();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>(initialEditSpeciesId ? 'edit' : 'list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'TODAS' | 'INVASORA' | 'NATIVA' | 'PROTEGIDA'>('TODAS');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(initialEditSpeciesId || null);
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState<FishSpecies['category']>('INVASORA');
  const [region, setRegion] = useState('Pantanal / Bacia do Paraguai');
  const [description, setDescription] = useState('');
  const [habitat, setHabitat] = useState('');
  const [bestLures, setBestLures] = useState('');
  const [minLegalSizeCm, setMinLegalSizeCm] = useState<number>(30);
  const [bagLimit, setBagLimit] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const startCreate = () => {
    setEditingId(null);
    setName('');
    setScientificName('');
    setCategory('INVASORA');
    setRegion('Pantanal / Bacia do Paraguai');
    setDescription('');
    setHabitat('Rios, represas e lagos');
    setBestLures('Iscas de Superfície, Isca Viva, Meia Água');
    setMinLegalSizeCm(30);
    setBagLimit('Sem limite / Captura encorajada');
    setImageUrl(FISH_PHOTO_PRESETS[0].url);
    setMode('create');
  };

  const startEdit = (sp: FishSpecies) => {
    setEditingId(sp.id);
    setName(sp.name);
    setScientificName(sp.scientificName);
    setCategory(sp.category);
    setRegion(sp.region || 'Pantanal / Bacia do Paraguai');
    setDescription(sp.description);
    setHabitat(sp.habitat);
    setBestLures(sp.bestLures.join(', '));
    setMinLegalSizeCm(sp.minLegalSizeCm || 0);
    setBagLimit(sp.bagLimit || '');
    setImageUrl(sp.imageUrl);
    setMode('edit');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 900, 900, 0.75);
      if (compressed) {
        setImageUrl(compressed);
      }
    } catch (err) {
      console.warn('Error compressing species image:', err);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const luresList = bestLures
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    const badges = [
      category === 'INVASORA' ? 'Invasora' : category === 'PROTEGIDA' ? 'Protegida' : 'Nativa',
      minLegalSizeCm > 0 ? `Mín. ${minLegalSizeCm}cm` : 'Sem Mínimo'
    ];

    if (mode === 'edit' && editingId) {
      updateSpecies(editingId, {
        name: name.trim(),
        scientificName: scientificName.trim() || 'Espécie sp.',
        category,
        region,
        description: description.trim() || 'Descrição da espécie atualizada no PescApp.',
        habitat: habitat.trim() || 'Águas continentais.',
        bestLures: luresList.length > 0 ? luresList : ['Iscas Diversas'],
        minLegalSizeCm: Number(minLegalSizeCm),
        bagLimit: bagLimit.trim() || (category === 'INVASORA' ? 'Sem limite' : 'Conforme defeso local'),
        imageUrl: imageUrl || FISH_PHOTO_PRESETS[0].url,
        badges,
      });
      sendPushNotification('✅ Espécie Atualizada', `${name} foi atualizado com sucesso no catálogo.`, 'system');
    } else {
      const newSp: FishSpecies = {
        id: `sp-${Date.now()}`,
        name: name.trim(),
        scientificName: scientificName.trim() || 'Espécie sp.',
        category,
        region,
        description: description.trim() || 'Nova espécie cadastrada no PescApp.',
        habitat: habitat.trim() || 'Rios, represas e lagos.',
        bestLures: luresList.length > 0 ? luresList : ['Iscas Artificiais'],
        minLegalSizeCm: Number(minLegalSizeCm),
        bagLimit: bagLimit.trim() || (category === 'INVASORA' ? 'Sem limite' : 'Conforme defeso local'),
        imageUrl: imageUrl || FISH_PHOTO_PRESETS[0].url,
        badges,
      };
      addSpecies(newSp);
      sendPushNotification('🎉 Nova Espécie Cadastrada', `${name} foi adicionado ao catálogo do PescApp!`, 'system');
      if (onSelectSpecies) {
        onSelectSpecies(newSp.name);
      }
    }

    setMode('list');
  };

  const handleDelete = (id: string, spName: string) => {
    deleteSpecies(id);
    sendPushNotification('🗑️ Espécie Removida', `${spName} foi removido do catálogo.`, 'system');
    if (editingId === id) {
      setEditingId(null);
      setMode('list');
    }
  };

  const filteredSpecies = species.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'TODAS' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        {/* Header with clear Return Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {mode !== 'list' ? (
              <button
                type="button"
                onClick={() => setMode('list')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
                title="Retornar à lista de espécies"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center">
                <Fish className="w-4 h-4" />
              </div>
            )}

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {mode === 'list'
                  ? 'Catálogo de Espécies & Peixes'
                  : mode === 'create'
                  ? 'Cadastrar Nova Espécie de Peixe'
                  : 'Editar Dados & Foto da Espécie'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {mode === 'list'
                  ? 'Gerencie medidas mínimas legais, fotos e espécies disponíveis'
                  : 'Preencha os dados biológicos, medidas e foto'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'list' && (
              <button
                onClick={startCreate}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Peixe</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              title="Fechar / Retornar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {mode === 'list' ? (
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar espécie por nome ou categoria..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold overflow-x-auto">
                {(['TODAS', 'INVASORA', 'NATIVA', 'PROTEGIDA'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'TODAS' ? 'Todas' : cat === 'INVASORA' ? 'Invasoras' : cat === 'NATIVA' ? 'Nativas' : 'Protegidas'}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Species */}
            <div className="space-y-2.5">
              {filteredSpecies.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum peixe encontrado com esses filtros. Clique em <b>"+ Novo Peixe"</b> para cadastrar.
                </div>
              ) : (
                filteredSpecies.map(sp => (
                  <div
                    key={sp.id}
                    className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-teal-500/50 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700">
                        <img src={sp.imageUrl} alt={sp.name} className="w-full h-full object-cover" />
                        <span
                          className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[8px] font-mono-tech font-bold uppercase ${
                            sp.category === 'INVASORA'
                              ? 'bg-rose-500 text-white'
                              : sp.category === 'PROTEGIDA'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {sp.category}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {sp.name}
                        </h4>
                        <p className="text-[10px] font-mono-tech italic text-slate-500 dark:text-slate-400 truncate">
                          {sp.scientificName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          {sp.minLegalSizeCm ? (
                            <span className="font-mono-tech text-amber-500 font-bold">
                              Mín: {sp.minLegalSizeCm}cm
                            </span>
                          ) : null}
                          <span className="truncate">Iscas: {sp.bestLures[0] || 'Variadas'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectSpecies && (
                        <button
                          onClick={() => {
                            onSelectSpecies(sp.name);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Selecionar esta espécie para a captura"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Selecionar</span>
                        </button>
                      )}

                      <button
                        onClick={() => startEdit(sp)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Editar Espécie"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(sp.id, sp.name)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-400 transition-colors"
                        title="Excluir Espécie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Create / Edit Form */
          <form onSubmit={handleSave} className="space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
            {/* Photo Uploader / Presets */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                <span>Foto da Espécie</span>
                <span className="text-[10px] text-teal-600 dark:text-cyan-400 font-normal">Câmera, upload ou galeria</span>
              </label>

              <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-7 h-7 mx-auto mb-1 opacity-50" />
                    <span>Nenhuma imagem</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs shadow flex items-center gap-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-500" />
                    <span>Carregar Foto do Aparelho</span>
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

              {/* Presets Gallery */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  Ou selecione uma foto de referência:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {FISH_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`shrink-0 flex items-center gap-1.5 p-1 pr-2 rounded-xl border text-[11px] font-semibold transition-all ${
                        imageUrl === preset.url
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

              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Ou cole a URL direta de uma imagem..."
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-[11px]"
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome do Peixe / Espécie *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Tucunaré Açu, Pirarucu, etc."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome Científico
                </label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={e => setScientificName(e.target.value)}
                  placeholder="Ex: Cichla vazzoleri"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 italic"
                />
              </div>
            </div>

            {/* Category, Size & Cota */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Classificação
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="INVASORA">Invasora (Captura Encorajada)</option>
                  <option value="NATIVA">Nativa (Com Cota)</option>
                  <option value="PROTEGIDA">Protegida (Pesca e Solte)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Medida Mínima (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={minLegalSizeCm}
                  onChange={e => setMinLegalSizeCm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cota / Regulamentação
                </label>
                <input
                  type="text"
                  value={bagLimit}
                  onChange={e => setBagLimit(e.target.value)}
                  placeholder="Ex: Cota Zero / 1 exemplar"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Description & Habitat */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Descrição e Hábitos do Peixe
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Comportamento, estrutura de caça, coloração e características..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Iscas Recomendadas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={bestLures}
                  onChange={e => setBestLures(e.target.value)}
                  placeholder="Zaras, Poppers, Tuvira, Minhoquinha"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Habitat Típico
                </label>
                <input
                  type="text"
                  value={habitat}
                  onChange={e => setHabitat(e.target.value)}
                  placeholder="Galhadas, poços fundos, corredeiras..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Form Actions with prominent Return Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à Lista</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{mode === 'edit' ? 'Salvar Alterações da Espécie' : 'Cadastrar Espécie'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer with return button for list mode */}
        {mode === 'list' && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar / Fechar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
