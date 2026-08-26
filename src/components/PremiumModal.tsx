import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Check, Crown, ArrowLeft } from 'lucide-react';

export const PremiumModal: React.FC = () => {
  const { isPremiumModalOpen, setIsPremiumModalOpen, user, togglePremium } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isPremiumModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header with Return button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPremiumModalOpen(false)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                PescApp Pro Marine
              </h3>
              <p className="text-[10px] text-amber-500 font-medium">Experiência Náutica Sem Anúncios</p>
            </div>
          </div>

          <button
            onClick={() => setIsPremiumModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">Sem Anúncios: </span>
              <span className="text-slate-600 dark:text-slate-400">Navegue sem nenhuma propaganda no feed ou no mapa.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">Modo Offline Total: </span>
              <span className="text-slate-600 dark:text-slate-400">Baixe tábuas de marés e cartas de relevo para áreas sem sinal.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">Previsões Solunares de 14 Dias: </span>
              <span className="text-slate-600 dark:text-slate-400">Planeje expedições de pesca com duas semanas de antecedência.</span>
            </div>
          </div>
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div
            onClick={() => setBillingCycle('annual')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              billingCycle === 'annual'
                ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-500 uppercase font-mono-tech">
              <span>Anual</span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full font-extrabold">-33%</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              R$ 6,65<span className="text-xs font-normal text-slate-400">/mês</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Cobrado R$ 79,90/ano</p>
          </div>

          <div
            onClick={() => setBillingCycle('monthly')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              billingCycle === 'monthly'
                ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-bold text-teal-600 dark:text-cyan-400 uppercase font-mono-tech">
              Mensal
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              R$ 9,90<span className="text-xs font-normal text-slate-400">/mês</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Cancele quando quiser</p>
          </div>
        </div>

        {/* CTA & Return */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => togglePremium(!user.isPremium)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 text-slate-950 font-bold text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {user.isPremium ? 'Desativar Premium (Modo Grátis)' : 'Ativar PescApp Pro Agora'}
          </button>

          <button
            onClick={() => setIsPremiumModalOpen(false)}
            className="w-full py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
