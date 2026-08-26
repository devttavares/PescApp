import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Anchor, Compass, ArrowDown, Target, ArrowLeft, Edit2, Trash2 } from 'lucide-react';

interface BaitModalProps {
  onOpenEditBait?: (bait: any) => void;
}

export const BaitModal: React.FC<BaitModalProps> = ({ onOpenEditBait }) => {
  const { selectedBaitModal, setSelectedBaitModal, deleteBait } = useApp();

  if (!selectedBaitModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Top Header with Return Button & Edit Photo Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setSelectedBaitModal(null)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Voltar"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Guia</span>
          </button>

          <div className="flex items-center gap-2">
            {onOpenEditBait && (
              <button
                onClick={() => {
                  const b = selectedBaitModal;
                  setSelectedBaitModal(null);
                  onOpenEditBait(b);
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-teal-500/20"
                title="Editar Isca ou Alterar Foto"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar / Trocar Foto</span>
              </button>
            )}

            <button
              onClick={() => {
                if (selectedBaitModal) {
                  deleteBait(selectedBaitModal.id);
                  setSelectedBaitModal(null);
                }
              }}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors"
              title="Excluir Isca"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedBaitModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[calc(92vh-130px)]">
          {/* Main Photo Banner */}
          <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700/60 shadow-md shrink-0">
            <img
              src={selectedBaitModal.imageUrl}
              alt={selectedBaitModal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                {selectedBaitModal.subtitle}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-teal-600/90 text-white shadow-sm">
                Tipo: {selectedBaitModal.type.toUpperCase()}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {selectedBaitModal.name}
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono-tech uppercase tracking-wider text-slate-400">
              Visão Geral & Aplicação
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#151b2d] p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              {selectedBaitModal.description}
            </p>
          </div>

          {/* Technical Specs Details */}
          <div className="space-y-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#151b2d] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
              <Compass className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Trabalho da Isca & Recolhimento:</span>
                <span className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{selectedBaitModal.workStyle}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
              <ArrowDown className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">Faixa de Profundidade:</span>
                <span className="text-teal-600 dark:text-cyan-400 font-mono-tech font-bold text-xs">{selectedBaitModal.depthRange}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Peixes Alvo Recomendados:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBaitModal.targetSpecies.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 text-teal-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      🐟 {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedBaitModal(null)}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Catálogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

