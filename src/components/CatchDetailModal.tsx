import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Award,
  MapPin,
  Calendar,
  Clock,
  User,
  Scale,
  Ruler,
  Anchor,
  Trash2,
  Share2,
  Navigation,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const CatchDetailModal: React.FC = () => {
  const {
    selectedCatchModal,
    setSelectedCatchModal,
    deleteCatch,
    setActiveTab,
    setCoordinates,
    sendPushNotification
  } = useApp();

  if (!selectedCatchModal) return null;

  const handleShare = () => {
    const trophyText = `🎣 Troféu PescApp!\n🐟 Espécie: ${selectedCatchModal.species}\n📏 Comprimento: ${selectedCatchModal.lengthCm} cm | ⚖️ Peso: ${selectedCatchModal.weightKg} kg\n🪝 Isca: ${selectedCatchModal.baitUsed}\n📍 Local: ${selectedCatchModal.locationName}\n📅 Data: ${selectedCatchModal.date} às ${selectedCatchModal.time}\n✨ Status: ${selectedCatchModal.released ? 'Solto (Pesque e Solte)' : 'Embarcado'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(trophyText);
      sendPushNotification('📋 Copiado!', 'Detalhes do troféu copiados para a área de transferência!', 'system');
    }
  };

  const handleGoToMap = () => {
    if (selectedCatchModal.latitude && selectedCatchModal.longitude) {
      setCoordinates(
        selectedCatchModal.latitude,
        selectedCatchModal.longitude,
        selectedCatchModal.locationName
      );
    }
    setSelectedCatchModal(null);
    setActiveTab('mapa');
  };

  const handleDelete = () => {
    deleteCatch(selectedCatchModal.id);
    setSelectedCatchModal(null);
  };

  return (
    <div
      id="catch-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setSelectedCatchModal(null)}
    >
      <div
        id="catch-detail-modal-card"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <div className="p-2 rounded-2xl bg-teal-500/10 dark:bg-cyan-500/10">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                Detalhes da Captura
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tech">
                Registro Oficial de Troféu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCatchModal(null)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
          {/* High-res photo container */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-72 border border-slate-200 dark:border-slate-700 shadow-md">
            <img
              src={
                selectedCatchModal.photoUrl ||
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
              }
              alt={selectedCatchModal.species}
              className="w-full h-full object-cover max-h-72"
              onError={(e: any) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <span
              className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-md font-mono-tech flex items-center gap-1 ${
                selectedCatchModal.released
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selectedCatchModal.released ? 'Solto (Pesque-Solte)' : 'Embarcado'}
            </span>
          </div>

          {/* Species Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {selectedCatchModal.species}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Pescador: <strong>{selectedCatchModal.anglerName || 'Pescador Esportivo'}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              title="Compartilhar Troféu"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                <Ruler className="w-3 h-3 text-teal-500" />
                Comprimento
              </span>
              <div className="text-lg font-black text-teal-600 dark:text-cyan-400 font-mono-tech">
                {selectedCatchModal.lengthCm} cm
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                <Scale className="w-3 h-3 text-amber-500" />
                Peso
              </span>
              <div className="text-lg font-black text-amber-500 font-mono-tech">
                {selectedCatchModal.weightKg} kg
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                <Anchor className="w-3 h-3 text-cyan-500" />
                Isca Usada
              </span>
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-0.5 max-w-full">
                {selectedCatchModal.baitUsed}
              </div>
            </div>
          </div>

          {/* Location & Time details */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="font-semibold">{selectedCatchModal.locationName}</span>
              </div>

              {selectedCatchModal.latitude && selectedCatchModal.longitude && (
                <button
                  type="button"
                  onClick={handleGoToMap}
                  className="text-[11px] font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Ver no Mapa</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-mono-tech">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedCatchModal.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedCatchModal.time}
              </span>
            </div>

            {/* Notes */}
            {selectedCatchModal.notes && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mb-1">
                  <FileText className="w-3 h-3" />
                  Observações do Pescador
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{selectedCatchModal.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            title="Excluir Registro da Captura"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCatchModal(null)}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
