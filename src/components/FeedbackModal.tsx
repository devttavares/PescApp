import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquarePlus,
  X,
  Send,
  Lightbulb,
  Bug,
  Fish,
  Star,
  CheckCircle2,
  Clock,
  Upload,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  History
} from 'lucide-react';
import { FeedbackCategory, FeedbackItem } from '../types';

export const FeedbackModal: React.FC = () => {
  const {
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbacks,
    addFeedback,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'novo' | 'historico'>('novo');
  const [category, setCategory] = useState<FeedbackCategory>('melhoria');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta' | 'critica'>('media');
  const [authorName, setAuthorName] = useState(user.name || '');
  const [authorEmail, setAuthorEmail] = useState(user.email || '');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isFeedbackModalOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      if (result) setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      addFeedback({
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        authorName: authorName.trim() || 'Pescador Anônimo',
        authorEmail: authorEmail.trim() || 'usuario@pescapp.com.br',
        photoUrl: photoUrl || undefined
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);

      // Reset form after delay
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setPhotoUrl('');
        setSubmittedSuccess(false);
        setActiveTab('historico');
      }, 1500);
    }, 400);
  };

  const categories = [
    { id: 'melhoria', label: 'Sugerir Melhoria', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'erro', label: 'Reportar Erro / Bug', icon: Bug, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'especie', label: 'Sugerir Espécie / Isca', icon: Fish, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'elogio', label: 'Elogio / Avaliação', icon: Star, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <MessageSquarePlus className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Canal de Feedback & Melhorias
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envie ideias, sugestões de novos recursos ou reporte erros do app
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Novo Feedback vs Histórico */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('novo')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'novo'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Novo Envio</span>
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'historico'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Feedbacks Enviados ({feedbacks.length})</span>
          </button>
        </div>

        {/* TAB 1: FORMULÁRIO DE NOVO FEEDBACK */}
        {activeTab === 'novo' ? (
          submittedSuccess ? (
            <div className="py-10 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Feedback Enviado com Sucesso!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Agradecemos sua colaboração ativa para tornar o PescApp o melhor app de pesca do Brasil!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category selector stacked vertically */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tipo de Mensagem:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all text-xs font-bold ${
                          isSelected
                            ? 'bg-teal-500/15 border-teal-500 text-teal-600 dark:text-cyan-400 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Título do Relato / Sugestão:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={
                    category === 'erro'
                      ? 'Ex: O GPS não atualizou a previsão no meu celular'
                      : category === 'melhoria'
                      ? 'Ex: Adicionar alarme sonoro para o pico da maré alta'
                      : 'Ex: Sugestão de isca para Tucunaré no Rio Taquari'
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Detalhes e Descrição:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o que ocorreu, passos para reproduzir o erro ou detalhes da melhoria que gostaria de ver no aplicativo..."
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Priority & User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Prioridade:
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="baixa">Baixa (Ideia futura)</option>
                    <option value="media">Média (Sugestão importante)</option>
                    <option value="alta">Alta (Dificuldade de uso)</option>
                    <option value="critica">Crítica (Erro bloqueante)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Seu Nome ou E-mail:
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Nome do pescador"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Optional Photo Attachment */}
              <div className="space-y-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Anexar Print ou Foto do Erro (Opcional):
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {photoUrl ? 'Trocar Imagem' : 'Carregar Imagem'}
                  </button>
                </div>
                {photoUrl && (
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 mt-1">
                    <img src={photoUrl} alt="Anexo de feedback" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black text-sm shadow-lg hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Feedback para a Equipe</span>
                  </>
                )}
              </button>
            </form>
          )
        ) : (
          /* TAB 2: HISTÓRICO DE FEEDBACKS ENVIADOS */
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {feedbacks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs">Você ainda não enviou nenhum feedback.</p>
                <button
                  onClick={() => setActiveTab('novo')}
                  className="text-xs font-bold text-teal-600 dark:text-cyan-400 hover:underline"
                >
                  Clique aqui para enviar uma sugestão!
                </button>
              </div>
            ) : (
              feedbacks.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.category === 'erro' ? (
                        <Bug className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : item.category === 'especie' ? (
                        <Fish className="w-4 h-4 text-cyan-500 shrink-0" />
                      ) : item.category === 'elogio' ? (
                        <Star className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.status === 'resolvido'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : item.status === 'analise'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-teal-500/10 text-teal-600 dark:text-cyan-400 border border-teal-500/30'
                      }`}
                    >
                      {item.status === 'resolvido'
                        ? '✅ Implementado'
                        : item.status === 'analise'
                        ? '⏳ Em Análise'
                        : '📥 Recebido'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  {item.photoUrl && (
                    <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                      <img src={item.photoUrl} alt="Anexo" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-tech pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    <span>Enviado por: {item.authorName}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
