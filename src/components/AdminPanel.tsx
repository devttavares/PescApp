import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Fish,
  Crown,
  DollarSign,
  Send,
  Bell,
  ShieldCheck,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  BarChart3,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { FishSpecies } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    appMetrics,
    sendPushNotification,
    piracema,
    updatePiracema,
    species,
    addSpecies,
    deleteSpecies,
    ads,
    toggleAd,
    setActiveTab,
  } = useApp();

  const [adminSubTab, setAdminSubTab] = useState<'metricas' | 'notificacoes' | 'conteudo' | 'anuncios'>('metricas');

  // Push broadcast state
  const [notifTitle, setNotifTitle] = useState('⚠️ Alerta Meteorológico');
  const [notifMessage, setNotifMessage] = useState('Frente fria se aproximando na bacia do Pantanal. Ventos fortes de 25 nós esperados nas próximas horas.');
  const [notifCategory, setNotifCategory] = useState<'weather' | 'tide' | 'piracema' | 'solunar' | 'admin'>('weather');
  const [notifUrgent, setNotifUrgent] = useState(true);

  // New species state
  const [newFishName, setNewFishName] = useState('');
  const [newFishSci, setNewFishSci] = useState('');
  const [newFishCategory, setNewFishCategory] = useState<FishSpecies['category']>('INVASORA');
  const [newFishDesc, setNewFishDesc] = useState('');
  const [newFishSize, setNewFishSize] = useState(30);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    sendPushNotification(notifTitle, notifMessage, notifCategory, notifUrgent);
    setNotifTitle('');
    setNotifMessage('');
  };

  const handleAddFish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFishName) return;

    addSpecies({
      id: `fish-${Date.now()}`,
      name: newFishName,
      scientificName: newFishSci || 'Species sp.',
      category: newFishCategory,
      region: 'Pantanal / Bacia do Paraguai',
      description: newFishDesc || 'Nova espécie adicionada pelo administrador.',
      badges: [newFishCategory, `Mín. ${newFishSize}cm`],
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      habitat: 'Rios, represas e lagos.',
      bestLures: ['Iscas Artificiais', 'Isca Viva'],
      minLegalSizeCm: newFishSize,
    });

    setNewFishName('');
    setNewFishSci('');
    setNewFishDesc('');
    sendPushNotification('🐟 Novo Peixe no Catálogo', `${newFishName} foi cadastrado no Guia Regional.`, 'admin');
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Painel Administrativo
            </h2>
            <p className="text-xs text-slate-400">Gerenciador de conteúdo, métricas e notificações</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('inicio')}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          Voltar ao App
        </button>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setAdminSubTab('metricas')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
            adminSubTab === 'metricas'
              ? 'bg-teal-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Métricas de Uso
        </button>

        <button
          onClick={() => setAdminSubTab('notificacoes')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
            adminSubTab === 'notificacoes'
              ? 'bg-teal-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Disparador Push
        </button>

        <button
          onClick={() => setAdminSubTab('conteudo')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
            adminSubTab === 'conteudo'
              ? 'bg-teal-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Edit className="w-3.5 h-3.5" />
          Piracema & Espécies
        </button>

        <button
          onClick={() => setAdminSubTab('anuncios')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
            adminSubTab === 'anuncios'
              ? 'bg-teal-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Anúncios
        </button>
      </div>

      {/* Tab 1: Métricas de Uso */}
      {adminSubTab === 'metricas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-teal-600 dark:text-cyan-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold font-mono-tech text-emerald-500">+12%</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {appMetrics.activeAnglers}
              </div>
              <p className="text-[11px] text-slate-400">Pescadores Ativos</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-teal-600 dark:text-cyan-400 mb-1">
                <Fish className="w-4 h-4" />
                <span className="text-[10px] font-bold font-mono-tech text-emerald-500">+24 hoje</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {appMetrics.catchesToday}
              </div>
              <p className="text-[11px] text-slate-400">Capturas Hoje</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-amber-500 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-[10px] font-bold font-mono-tech text-amber-500">PRO</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {appMetrics.premiumSubscribers}
              </div>
              <p className="text-[11px] text-slate-400">Assinantes Ativos</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#151b2d] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-emerald-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-[10px] font-bold font-mono-tech text-emerald-500">BRL</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono-tech">
                R$ {appMetrics.revenueBrl.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400">Receita Mensal</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Desempenho de Espécies Mais Capturadas
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tucunaré Amarelo / Azul</span>
                  <span className="font-mono-tech text-teal-600 dark:text-cyan-400">45% (402 registros)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tilápia (Espécie Invasora)</span>
                  <span className="font-mono-tech text-teal-600 dark:text-cyan-400">30% (268 registros)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Pintado / Surubim</span>
                  <span className="font-mono-tech text-teal-600 dark:text-cyan-400">15% (134 registros)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Disparador de Notificações Push em Tempo Real */}
      {adminSubTab === 'notificacoes' && (
        <form
          onSubmit={handleSendPush}
          className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs"
        >
          <div className="flex items-center gap-2 text-teal-600 dark:text-cyan-400">
            <Send className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Disparar Alerta Instantâneo para Todos os Usuários
            </h3>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Título da Notificação
            </label>
            <input
              type="text"
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              placeholder="Ex: ⚠️ Alerta de Maré Máxima"
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Mensagem de Texto
            </label>
            <textarea
              rows={3}
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              placeholder="Digite o conteúdo do alerta meteorológico ou aviso de pesca..."
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Categoria
              </label>
              <select
                value={notifCategory}
                onChange={e => setNotifCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="weather">Clima / Meteorologia</option>
                <option value="tide">Marés</option>
                <option value="piracema">Regulamentação Piracema</option>
                <option value="solunar">Pico Solunar</option>
                <option value="admin">Aviso Geral do Sistema</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">Alerta Urgente:</span>
              <button
                type="button"
                onClick={() => setNotifUrgent(p => !p)}
                className="text-teal-600 dark:text-cyan-400 font-bold"
              >
                {notifUrgent ? <ToggleRight className="w-7 h-7 text-rose-500" /> : <ToggleLeft className="w-7 h-7 text-slate-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-bold text-xs shadow hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Emitir Notificação Push em Tempo Real
          </button>
        </form>
      )}

      {/* Tab 3: Conteúdo (Piracema & Espécies) */}
      {adminSubTab === 'conteudo' && (
        <div className="space-y-4">
          {/* Piracema configuration */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-500" />
              Configurar Período da Piracema
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Início</label>
                <input
                  type="text"
                  value={piracema.startDate}
                  onChange={e => updatePiracema({ startDate: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Término</label>
                <input
                  type="text"
                  value={piracema.endDate}
                  onChange={e => updatePiracema({ endDate: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech"
                />
              </div>
            </div>
          </div>

          {/* Add Species form */}
          <form
            onSubmit={handleAddFish}
            className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs"
          >
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-500" />
              Cadastrar Nova Espécie de Peixe
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Nome Comum</label>
                <input
                  type="text"
                  value={newFishName}
                  onChange={e => setNewFishName(e.target.value)}
                  placeholder="Ex: Trairão da Amazônia"
                  required
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nome Científico</label>
                <input
                  type="text"
                  value={newFishSci}
                  onChange={e => setNewFishSci(e.target.value)}
                  placeholder="Ex: Hoplias aimara"
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Categoria</label>
                <select
                  value={newFishCategory}
                  onChange={e => setNewFishCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="INVASORA">Invasora (Captura Encorajada)</option>
                  <option value="NATIVA">Nativa (Com Cota)</option>
                  <option value="PROTEGIDA">Protegida (Pesca e Solte)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tamanho Mínimo Legal (cm)</label>
                <input
                  type="number"
                  value={newFishSize}
                  onChange={e => setNewFishSize(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono-tech"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Descrição & Comportamento</label>
              <textarea
                rows={2}
                value={newFishDesc}
                onChange={e => setNewFishDesc(e.target.value)}
                placeholder="Predador voraz que ataca na superfície..."
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
            >
              Adicionar Espécie ao Guia
            </button>
          </form>

          {/* Species List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Espécies Cadastradas ({species.length})
            </h4>
            {species.map(s => (
              <div
                key={s.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{s.name}</span>
                  <span className="text-slate-400 ml-2">({s.category})</span>
                </div>
                <button
                  onClick={() => deleteSpecies(s.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Gestão de Anúncios */}
      {adminSubTab === 'anuncios' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100">
            Campanhas Publicitárias no Feed
          </h4>
          <p className="text-slate-400 text-[11px]">
            Usuários com plano Anzol Pro não visualizam estes anúncios.
          </p>

          <div className="space-y-3 mt-3">
            {ads.map(ad => (
              <div
                key={ad.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151b2d] border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100">{ad.title}</h5>
                  <p className="text-[10px] text-slate-400">Patrocinador: {ad.sponsor}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ad.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {ad.active ? 'Ativo' : 'Pausado'}
                  </span>
                  <button
                    onClick={() => toggleAd(ad.id)}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {ad.active ? <ToggleRight className="w-6 h-6 text-teal-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
