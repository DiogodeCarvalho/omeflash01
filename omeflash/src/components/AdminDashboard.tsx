import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Users,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  DollarSign,
  Crown,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Video, User, AdminMetrics, WebhookLog } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'users' | 'webhooks'>('videos');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Video Form Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    duration: '15:00',
    category: 'Conversas Marcantes',
    tags: 'OmeFlash, VIP',
    isVip: true,
    featured: false,
  });

  // Webhook Simulator State
  const [simUserEmail, setSimUserEmail] = useState('');
  const [simEvent, setSimEvent] = useState('checkout.session.completed');
  const [simLoading, setSimLoading] = useState(false);
  const [simMsg, setSimMsg] = useState<string | null>(null);

  // Search filter
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [m, v, u, w] = await Promise.all([
        api.getAdminMetrics(),
        api.getVideos(),
        api.getAdminUsers(),
        api.getAdminWebhooks(),
      ]);
      setMetrics(m);
      setVideos(v.videos);
      setUsers(u);
      setWebhooks(w);
      if (u.length > 0 && !simUserEmail) {
        setSimUserEmail(u[0].email);
      }
    } catch (err) {
      console.error('Erro ao carregar dados administrativos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      description: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '14:20',
      category: 'Conversas Marcantes',
      tags: 'Encontro, Espontâneo, Revelações',
      isVip: true,
      featured: false,
    });
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: (video as any).videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: video.duration,
      category: video.category,
      tags: video.tags.join(', '),
      isVip: video.isVip,
      featured: Boolean(video.featured),
    });
    setVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: videoForm.title,
        description: videoForm.description,
        thumbnailUrl: videoForm.thumbnailUrl,
        videoUrl: videoForm.videoUrl,
        duration: videoForm.duration,
        category: videoForm.category,
        tags: videoForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isVip: videoForm.isVip,
        featured: videoForm.featured,
      };

      if (editingVideo) {
        await api.updateVideo(editingVideo.id, payload);
      } else {
        await api.createVideo(payload);
      }

      setVideoModalOpen(false);
      loadAllData();
    } catch (err: any) {
      alert('Erro ao salvar vídeo: ' + err.message);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o vídeo "${title}"?`)) return;
    try {
      await api.deleteVideo(id);
      loadAllData();
    } catch (err: any) {
      alert('Erro ao excluir vídeo: ' + err.message);
    }
  };

  const handleUpdateSubscription = async (userId: string, newStatus: string) => {
    try {
      let expiresAt: string | null = null;
      if (newStatus === 'active') {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        expiresAt = d.toISOString();
      }

      await api.updateAdminUserSubscription(userId, {
        status: newStatus,
        expiresAt,
        plan: newStatus === 'active' ? 'vip_monthly' : null,
      });

      loadAllData();
    } catch (err: any) {
      alert('Erro ao alterar assinatura: ' + err.message);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimMsg(null);
    try {
      const res = await api.simulateWebhook(simEvent, simUserEmail);
      setSimMsg(res.message || 'Webhook executado com sucesso!');
      loadAllData();
    } catch (err: any) {
      setSimMsg('Falha no webhook: ' + err.message);
    } finally {
      setSimLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-red-50 border border-red-200 rounded-3xl text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-xs text-gray-600 mt-2">
          Você precisa estar conectado como administrador para acessar o painel de controle.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full w-fit mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>PAINEL ADMINISTRATIVO OMEFLASH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Gerenciamento do Catálogo & Assinaturas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Adicione vídeos, controle usuários, monitore a receita da Stripe e audite webhooks.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* KPI Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs text-gray-400 font-semibold uppercase">Receita Mensal (MRR)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              R$ {metrics.estimatedMrr.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Estimativa de assinaturas ativas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs text-gray-400 font-semibold uppercase">Assinantes VIP</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#FF5500]">{metrics.activeSubscribers}</span>
              <span className="text-xs text-gray-400">/ {metrics.totalUsers} usuários</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Taxa de conversão: {metrics.totalUsers ? Math.round((metrics.activeSubscribers / metrics.totalUsers) * 100) : 0}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs text-gray-400 font-semibold uppercase">Vídeos no Catálogo</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-gray-900">{metrics.totalVideos}</span>
              <span className="text-xs text-amber-600 font-semibold">({metrics.vipVideosCount} VIP)</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Disponíveis para streaming</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <p className="text-xs text-gray-400 font-semibold uppercase">Webhooks Processados</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{metrics.webhookLogsCount}</p>
            <p className="text-[11px] text-gray-500 mt-1">Eventos Stripe registrados</p>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'videos'
              ? 'border-[#FF5500] text-[#FF5500]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Vídeos do Catálogo ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#FF5500] text-[#FF5500]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Assinaturas ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'webhooks'
              ? 'border-[#FF5500] text-[#FF5500]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Stripe & Webhooks ({webhooks.length})</span>
        </button>
      </div>

      {/* TAB 1: VIDEOS MANAGEMENT */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Gerencie títulos, miniaturas, links de transmissão e restrições VIP diretamente.
            </p>
            <button
              onClick={handleOpenAddVideo}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF5500] hover:bg-[#e44d00] text-white rounded-xl text-xs font-bold shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Vídeo</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Miniatura & Título</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Duração</th>
                    <th className="py-3 px-4">Acesso</th>
                    <th className="py-3 px-4">Visualizações</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            className="w-14 h-9 object-cover rounded-lg bg-gray-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1 max-w-xs">{video.title}</p>
                            <p className="text-[11px] text-gray-400 line-clamp-1">{video.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-600">{video.category}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{video.duration}</td>
                      <td className="py-3 px-4">
                        {video.isVip ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            <Crown className="w-3 h-3" />
                            VIP Exclusivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            Grátis
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{video.views?.toLocaleString() || 0}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditVideo(video)}
                            className="p-1.5 text-gray-500 hover:text-[#FF5500] hover:bg-orange-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id, video.title)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & SUBSCRIPTIONS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuário por nome ou e-mail..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF5500]/30"
              />
            </div>
            <p className="text-xs text-gray-500">
              Total: <span className="font-bold text-gray-900">{filteredUsers.length}</span> usuários cadastrados
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-4">Função</th>
                    <th className="py-3 px-4">Status VIP</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Expira em</th>
                    <th className="py-3 px-4">Stripe Customer ID</th>
                    <th className="py-3 px-4 text-right">Alterar Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-gray-400 font-mono text-[11px]">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                            u.subscriptionStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.subscriptionStatus === 'canceled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.subscriptionStatus === 'active'
                            ? '⭐ VIP ATIVO'
                            : u.subscriptionStatus === 'canceled'
                            ? 'CANCELADO'
                            : 'NENHUM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {u.subscriptionPlan ? u.subscriptionPlan.replace('_', ' ') : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {u.subscriptionExpiresAt
                          ? new Date(u.subscriptionExpiresAt).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                        {u.stripeCustomerId || 'não integrado'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={u.subscriptionStatus}
                          onChange={(e) => handleUpdateSubscription(u.id, e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg text-[11px] px-2 py-1 font-semibold text-gray-700 focus:outline-none focus:border-[#FF5500]"
                        >
                          <option value="none">Sem VIP</option>
                          <option value="active">Liberar VIP</option>
                          <option value="canceled">Cancelar</option>
                          <option value="past_due">Atrasado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRIPE & WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-8">
          {/* Webhook Simulator Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4" />
              Simulador de Eventos Stripe (Testes Automatizados)
            </div>
            <h3 className="text-xl font-bold mb-2">Disparar Webhook Simulado</h3>
            <p className="text-xs text-slate-300 max-w-xl mb-6">
              Teste o fluxo completo de cobrança e cancelamento da Stripe sem precisar de ferramentas externas como ngrok.
              O evento acionará a lógica do backend e alterará o status no banco de dados instantaneamente.
            </p>

            <form onSubmit={handleSimulateWebhook} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">Tipo de Evento Stripe</label>
                <select
                  value={simEvent}
                  onChange={(e) => setSimEvent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="checkout.session.completed">checkout.session.completed (Pagamento aprovado)</option>
                  <option value="customer.subscription.deleted">customer.subscription.deleted (Assinatura cancelada)</option>
                  <option value="invoice.payment_failed">invoice.payment_failed (Falha no cartão)</option>
                  <option value="invoice.payment_succeeded">invoice.payment_succeeded (Renovação com sucesso)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1">E-mail do Usuário Alvo</label>
                <input
                  type="email"
                  required
                  value={simUserEmail}
                  onChange={(e) => setSimUserEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={simLoading}
                  className="w-full py-2.5 bg-[#FF5500] hover:bg-[#e44d00] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {simLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>Disparar Evento</span>
                </button>
              </div>
            </form>

            {simMsg && (
              <div className="mt-4 p-3 bg-indigo-900/60 border border-indigo-500/40 rounded-xl text-xs text-indigo-200">
                {simMsg}
              </div>
            )}
          </div>

          {/* Webhook Logs History */}
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-3">Histórico de Webhooks Registrados</h4>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Evento</th>
                      <th className="py-3 px-4">Mensagem</th>
                      <th className="py-3 px-4">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {webhooks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-400">
                          Nenhum webhook recebido até o momento.
                        </td>
                      </tr>
                    ) : (
                      webhooks.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/60">
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-gray-800">{log.event}</td>
                          <td className="py-3 px-4 text-gray-600">{log.message}</td>
                          <td className="py-3 px-4 text-gray-400">
                            {new Date(log.receivedAt).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO ADD/EDIT MODAL */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingVideo ? 'Editar Vídeo do Catálogo' : 'Adicionar Novo Vídeo ao Catálogo'}
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título do Vídeo</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="Ex: Encontro #43: Conversa Espontânea"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Conte um pouco sobre o que acontece na conversa..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL da Miniatura (Thumbnail)</label>
                <input
                  type="url"
                  required
                  value={videoForm.thumbnailUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL do Vídeo (MP4/WebM)</label>
                <input
                  type="url"
                  required
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duração</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    placeholder="18:30"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                  >
                    <option value="Conversas Marcantes">Conversas Marcantes</option>
                    <option value="Encontros VIP">Encontros VIP</option>
                    <option value="Flagras Divertidos">Flagras Divertidos</option>
                    <option value="Destaques">Destaques</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={videoForm.tags}
                  onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })}
                  placeholder="Romance, Humor, Inédito"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5500]/30"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={videoForm.isVip}
                    onChange={(e) => setVideoForm({ ...videoForm, isVip: e.target.checked })}
                    className="w-4 h-4 text-[#FF5500] rounded"
                  />
                  <span>Vídeo Exclusivo para Assinantes VIP</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={videoForm.featured}
                    onChange={(e) => setVideoForm({ ...videoForm, featured: e.target.checked })}
                    className="w-4 h-4 text-[#FF5500] rounded"
                  />
                  <span>Destacar na Capa</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5500] hover:bg-[#e44d00] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Salvar Vídeo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
