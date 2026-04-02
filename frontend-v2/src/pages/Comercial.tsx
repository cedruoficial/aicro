import { useState, useEffect } from 'react';
import {
  Plus, Search, Clock, CheckCircle2,
  ArrowRight, Package, User, FileText, Zap, Filter
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type PedidoTipo    = 'Producao' | 'Desenvolvimento';
type PedidoStatus  = 'novo' | 'em_triagem' | 'enviado_arte' | 'enviado_pd' | 'concluido' | 'reclamacao';
type Prioridade    = 'URGENTE' | 'NORMAL' | 'BAIXA';

interface Pedido {
  id: string;
  ref: string;
  cliente: string;
  produto: string;
  tipo: PedidoTipo;
  prioridade: Prioridade;
  status: PedidoStatus;
  entradaEm: string; // ISO
  destinoProximo: string;
  obs?: string;
}

// ─── Mock de pedidos (START do fluxo) ────────────────────────────────────────
const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 'PED-0510', ref: 'COM-2026-0510',
    cliente: 'Aniger', produto: 'Nike Air Max Sub 2026',
    tipo: 'Producao', prioridade: 'URGENTE', status: 'novo',
    entradaEm: new Date(Date.now() - 0.3 * 3600000).toISOString(),
    destinoProximo: 'Arte',
    obs: 'Cliente solicitou prazo de 5 dias úteis.',
  },
  {
    id: 'PED-0509', ref: 'COM-2026-0509',
    cliente: 'Bibi', produto: 'Linha Baby Confort 2026',
    tipo: 'Producao', prioridade: 'NORMAL', status: 'em_triagem',
    entradaEm: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    destinoProximo: 'Arte',
  },
  {
    id: 'PED-0508', ref: 'COM-2026-0508',
    cliente: 'Dass', produto: 'Bally Test Mix (novo artigo)',
    tipo: 'Desenvolvimento', prioridade: 'URGENTE', status: 'em_triagem',
    entradaEm: new Date(Date.now() - 2.1 * 3600000).toISOString(),
    destinoProximo: 'P&D',
    obs: 'Requer ensaio laboratorial antes da aprovação.',
  },
  {
    id: 'PED-0507', ref: 'COM-2026-0507',
    cliente: 'Dakota', produto: 'Fila Disruptor GT Transfer',
    tipo: 'Producao', prioridade: 'NORMAL', status: 'enviado_arte',
    entradaEm: new Date(Date.now() - 4.0 * 3600000).toISOString(),
    destinoProximo: 'Arte',
  },
  {
    id: 'PED-0506', ref: 'COM-2026-0506',
    cliente: 'Vulcabras', produto: 'Refletivo T2 Especial',
    tipo: 'Producao', prioridade: 'URGENTE', status: 'enviado_arte',
    entradaEm: new Date(Date.now() - 5.2 * 3600000).toISOString(),
    destinoProximo: 'Arte',
  },
  {
    id: 'PED-0505', ref: 'COM-2026-0505',
    cliente: 'Pegada', produto: 'Sola Vulcanizada 2C',
    tipo: 'Desenvolvimento', prioridade: 'NORMAL', status: 'enviado_pd',
    entradaEm: new Date(Date.now() - 6.8 * 3600000).toISOString(),
    destinoProximo: 'P&D',
  },
  {
    id: 'PED-0504', ref: 'COM-2026-0504',
    cliente: 'Olympikus', produto: 'Corrida Xtreme 2026',
    tipo: 'Producao', prioridade: 'BAIXA', status: 'enviado_arte',
    entradaEm: new Date(Date.now() - 8.3 * 3600000).toISOString(),
    destinoProximo: 'Arte',
  },
  {
    id: 'PED-0503', ref: 'COM-2026-0503',
    cliente: 'Pampili', produto: 'Holográfico Star Coleção 26',
    tipo: 'Producao', prioridade: 'NORMAL', status: 'concluido',
    entradaEm: new Date(Date.now() - 48 * 3600000).toISOString(),
    destinoProximo: '—',
  },
  {
    id: 'PED-0502', ref: 'COM-2026-0502',
    cliente: 'Bibi', produto: 'Verniz UV Baby',
    tipo: 'Producao', prioridade: 'NORMAL', status: 'reclamacao',
    entradaEm: new Date(Date.now() - 72 * 3600000).toISOString(),
    destinoProximo: 'Qualidade',
    obs: 'Cliente reportou descolamento do verniz após lavagem.',
  },
];

// ─── Configs de Status ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<PedidoStatus, {
  label: string; color: string; bg: string; border: string; dot: string
}> = {
  novo:         { label: 'Novo — Aguard. Triagem', color: '#6C5CE7', bg: '#F4F3FD', border: '#C5C0F0', dot: '#6C5CE7' },
  em_triagem:   { label: 'Em Triagem',             color: '#E17055', bg: '#FFF4F1', border: '#E17055', dot: '#E17055' },
  enviado_arte: { label: 'Enviado → Arte',          color: '#0984E3', bg: '#EBF5FF', border: '#74B9FF', dot: '#0984E3' },
  enviado_pd:   { label: 'Enviado → P&D',           color: '#00B894', bg: '#EEFAF5', border: '#2DC88E', dot: '#00B894' },
  concluido:    { label: 'Concluído',               color: '#A0A0B0', bg: '#F8F8FC', border: '#E0E0EC', dot: '#A0A0B0' },
  reclamacao:   { label: 'Reclamação Aberta',       color: '#FF4757', bg: '#FFF0F0', border: '#FF7B87', dot: '#FF4757' },
};

const PRIO_CFG: Record<Prioridade, { color: string; bg: string }> = {
  URGENTE: { color: '#FF4757', bg: '#FFF0F0' },
  NORMAL:  { color: '#6C5CE7', bg: '#F4F3FD' },
  BAIXA:   { color: '#A0A0B0', bg: '#F4F3F8' },
};

// ─── Lead time ao vivo ────────────────────────────────────────────────────────
function useLive(startIso: string) {
  const [txt, setTxt] = useState('');
  useEffect(() => {
    const tick = () => {
      const ms = Date.now() - new Date(startIso).getTime();
      const h  = Math.floor(ms / 3600000);
      const m  = Math.floor((ms % 3600000) / 60000);
      const s  = Math.floor((ms % 60000) / 1000);
      setTxt(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startIso]);
  return txt;
}

// ─── Card de Pedido ───────────────────────────────────────────────────────────
function PedidoCard({ pedido, onEnviar }: {
  pedido: Pedido;
  onEnviar: (id: string, dest: 'arte' | 'pd') => void;
}) {
  const st      = STATUS_CFG[pedido.status];
  const pr      = PRIO_CFG[pedido.prioridade];
  const elapsed = useLive(pedido.entradaEm);
  const isNew   = pedido.status === 'novo' || pedido.status === 'em_triagem';

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg`}
      style={{ borderColor: st.border, boxShadow: isNew ? `0 4px 20px ${st.dot}15` : '0 1px 4px rgba(0,0,0,0.05)' }}>

      {/* Barra de prioridade top */}
      <div className="h-1 w-full" style={{ background: pr.bg }}>
        <div className="h-full w-full" style={{ background: pr.color, opacity: 0.6 }} />
      </div>

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5"
              style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
              {st.label}
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ color: pr.color, background: pr.bg }}>
              {pedido.prioridade}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              pedido.tipo === 'Desenvolvimento'
                ? 'text-[#9B59B6] bg-[#F5EEFB]'
                : 'text-[#0984E3] bg-[#EBF5FF]'
            }`}>
              {pedido.tipo === 'Desenvolvimento' ? '🔬 P&D' : '🏭 Produção'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#A0A0B0]">{pedido.ref}</span>
        </div>

        {/* Cliente + produto */}
        <div className="mb-3">
          <div className="text-lg font-black text-[#2D2D3A]">{pedido.cliente}</div>
          <div className="text-sm text-[#8B8BA0] font-medium">{pedido.produto}</div>
          {pedido.obs && (
            <div className="mt-2 text-[11px] text-[#8B8BA0] bg-[#F8F7FC] rounded-xl px-3 py-2 border border-[#EEEDF5]">
              💬 {pedido.obs}
            </div>
          )}
        </div>

        {/* Fluxo visual */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#00CEC920] text-[#00CEC9]">
            🤝 Comercial
          </span>
          <ArrowRight size={12} className="text-[#C0C0D0]" />
          <span className="text-xs font-black px-2.5 py-1 rounded-full"
            style={{
              background: pedido.tipo === 'Desenvolvimento' ? '#F5EEFB' : '#EBF5FF',
              color:      pedido.tipo === 'Desenvolvimento' ? '#9B59B6' : '#0984E3',
            }}>
            {pedido.tipo === 'Desenvolvimento' ? '🔬 P&D' : '🎨 Arte'}
          </span>
          <ArrowRight size={12} className="text-[#C0C0D0]" />
          <span className="text-xs text-[#C0C0D0] font-bold">Lab → Produção → Revisão → Embalagem → Expedição</span>
        </div>

        {/* Lead time + ações */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F5]">
          <div>
            <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mb-0.5">
              {pedido.status === 'concluido' ? 'Tempo Total' : 'Lead Time Atual'}
            </div>
            <div className="text-base font-black text-[#2D2D3A] tabular-nums flex items-center gap-1.5">
              <Clock size={12} className="text-[#A0A0B0]" />
              {elapsed}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pedido.status === 'novo' && (
              <>
                <button
                  onClick={() => onEnviar(pedido.id, 'arte')}
                  className="px-3 py-2 rounded-xl text-white text-xs font-black transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                  style={{ background: '#0984E3' }}
                >
                  🎨 Enviar p/ Arte
                </button>
                <button
                  onClick={() => onEnviar(pedido.id, 'pd')}
                  className="px-3 py-2 rounded-xl text-white text-xs font-black transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                  style={{ background: '#9B59B6' }}
                >
                  🔬 Enviar p/ P&D
                </button>
              </>
            )}
            {pedido.status === 'em_triagem' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEnviar(pedido.id, 'arte')}
                  className="px-3 py-2 rounded-xl bg-[#0984E3] text-white text-xs font-black transition-all active:scale-95 shadow-md"
                >
                  → Arte
                </button>
                <button
                  onClick={() => onEnviar(pedido.id, 'pd')}
                  className="px-3 py-2 rounded-xl bg-[#9B59B6] text-white text-xs font-black transition-all active:scale-95 shadow-md"
                >
                  → P&D
                </button>
              </div>
            )}
            {pedido.status === 'enviado_arte' && (
              <span className="text-xs font-black text-[#0984E3] bg-[#EBF5FF] px-3 py-2 rounded-xl">
                ✓ Arte recebeu
              </span>
            )}
            {pedido.status === 'enviado_pd' && (
              <span className="text-xs font-black text-[#00B894] bg-[#EEFAF5] px-3 py-2 rounded-xl">
                ✓ P&D recebeu
              </span>
            )}
            {pedido.status === 'reclamacao' && (
              <button className="px-3 py-2 rounded-xl bg-[#FF4757] text-white text-xs font-black active:scale-95 shadow-md">
                ⚡ Abrir Análise
              </button>
            )}
            {pedido.status === 'concluido' && (
              <span className="text-xs font-black text-[#A0A0B0] bg-[#F4F3F8] px-3 py-2 rounded-xl">
                ✓ Concluído
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Novo Pedido ────────────────────────────────────────────────────────
function NovoPedidoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-6 bg-[#00CEC9] text-white">
          <div className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-1">COMERCIAL — START</div>
          <h2 className="text-2xl font-black tracking-tight">Novo Pedido</h2>
          <p className="text-white/70 text-sm mt-1">Ao salvar, o relógio de Lead Time inicia automaticamente.</p>
        </div>

        <form className="p-8 space-y-5" onSubmit={e => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Cliente</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-3.5 text-[#C0C0D0]" />
              <input className="w-full pl-11 pr-4 py-3 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00CEC930] focus:border-[#00CEC9]"
                placeholder="Ex: Aniger, Bibi, Dass..." />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Produto / Referência</label>
            <div className="relative">
              <Package size={16} className="absolute left-4 top-3.5 text-[#C0C0D0]" />
              <input className="w-full pl-11 pr-4 py-3 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00CEC930] focus:border-[#00CEC9]"
                placeholder="Ex: Nike Air Max Sub 2026" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Tipo</label>
              <select className="w-full px-4 py-3 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none">
                <option value="Producao">🏭 Produção</option>
                <option value="Desenvolvimento">🔬 Desenvolvimento (P&D)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Prioridade</label>
              <select className="w-full px-4 py-3 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none">
                <option>NORMAL</option>
                <option>URGENTE</option>
                <option>BAIXA</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Observações</label>
            <div className="relative">
              <FileText size={16} className="absolute left-4 top-3 text-[#C0C0D0]" />
              <textarea
                rows={2}
                className="w-full pl-11 pr-4 py-3 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00CEC930] focus:border-[#00CEC9] resize-none"
                placeholder="Prazo, especificações especiais..."
              />
            </div>
          </div>

          {/* Destino */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] block mb-2">Enviar Para</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all border-[#0984E330] bg-[#EBF5FF] hover:border-[#0984E3]">
                <input type="radio" name="destino" defaultChecked className="accent-[#0984E3]" />
                <span className="text-sm font-black text-[#0984E3]">🎨 Arte / Design</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all border-[#9B59B630] bg-[#F5EEFB] hover:border-[#9B59B6]">
                <input type="radio" name="destino" className="accent-[#9B59B6]" />
                <span className="text-sm font-black text-[#9B59B6]">🔬 P&D</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-[#EEEDF5] text-[#8B8BA0] font-black text-sm hover:bg-[#F8F7FC] transition-all">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-[#00CEC9] text-white font-black text-sm shadow-lg shadow-[#00CEC930] hover:bg-[#00B5B1] transition-all active:scale-95 flex items-center justify-center gap-2">
              <Zap size={16} /> INICIAR PEDIDO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página Comercial ─────────────────────────────────────────────────────────
const FILTROS: { key: PedidoStatus | 'todos'; label: string }[] = [
  { key: 'todos',       label: 'Todos' },
  { key: 'novo',        label: 'Novos' },
  { key: 'em_triagem',  label: 'Em Triagem' },
  { key: 'enviado_arte',label: 'Enviados → Arte' },
  { key: 'enviado_pd',  label: 'Enviados → P&D' },
  { key: 'reclamacao',  label: 'Reclamações' },
  { key: 'concluido',   label: 'Concluídos' },
];

export function Comercial() {
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_MOCK);
  const [filtro, setFiltro] = useState<PedidoStatus | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleEnviar = (id: string, dest: 'arte' | 'pd') => {
    setPedidos(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: dest === 'arte' ? 'enviado_arte' : 'enviado_pd', destinoProximo: dest === 'arte' ? 'Arte' : 'P&D' }
        : p
    ));
  };

  const filtered = pedidos
    .filter(p => filtro === 'todos' || p.status === filtro)
    .filter(p =>
      busca === '' ||
      p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.produto.toLowerCase().includes(busca.toLowerCase()) ||
      p.ref.toLowerCase().includes(busca.toLowerCase())
    );

  const counts = {
    novo:         pedidos.filter(p => p.status === 'novo').length,
    em_triagem:   pedidos.filter(p => p.status === 'em_triagem').length,
    enviado_arte: pedidos.filter(p => p.status === 'enviado_arte').length,
    enviado_pd:   pedidos.filter(p => p.status === 'enviado_pd').length,
    reclamacao:   pedidos.filter(p => p.status === 'reclamacao').length,
  };

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto animate-in fade-in duration-400">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00CEC9]">🤝 START DO FLUXO</span>
          </div>
          <h1 className="text-2xl font-black text-[#2D2D3A] tracking-tight m-0">Comercial / Atendimento</h1>
          <p className="text-[#8B8BA0] text-sm font-medium mt-0.5">Todos os pedidos começam aqui. Triagem → Arte ou P&D.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm shadow-lg shadow-[#00CEC930] transition-all active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00CEC9, #00B5B1)' }}
        >
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Novos',         val: counts.novo,         color: '#6C5CE7' },
          { label: 'Em Triagem',    val: counts.em_triagem,   color: '#E17055' },
          { label: '→ Arte',        val: counts.enviado_arte,  color: '#0984E3' },
          { label: '→ P&D',         val: counts.enviado_pd,    color: '#9B59B6' },
          { label: 'Reclamações',   val: counts.reclamacao,   color: '#FF4757' },
        ].map(k => (
          <div key={k.label} className="bg-white px-4 py-4 rounded-2xl border border-[#E8E6F0] shadow-sm text-center">
            <div className="text-3xl font-black" style={{ color: k.color }}>{k.val}</div>
            <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-[#A0A0B0]" />
          {FILTROS.map(f => {
            const count = f.key === 'todos' ? pedidos.length : pedidos.filter(p => p.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  filtro === f.key
                    ? 'text-white shadow-sm border-transparent'
                    : 'bg-white text-[#8B8BA0] border-[#E8E6F0] hover:border-[#C0C0D0]'
                }`}
                style={filtro === f.key ? { background: '#00CEC9' } : {}}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-2.5 text-[#C0C0D0]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar cliente, produto..."
            className="pl-9 pr-4 py-2 bg-white border border-[#E8E6F0] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#00CEC930] focus:border-[#00CEC9] w-56"
          />
        </div>
      </div>

      {/* Fluxo visual macro */}
      <div className="bg-white rounded-2xl border border-[#E8E6F0] px-6 py-4 mb-6 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-black text-[#A0A0B0] uppercase tracking-wider shrink-0">Fluxo:</span>
        {[
          { label: '🤝 Comercial', color: '#00CEC9' },
          { label: '🎨 Arte',      color: '#E17055' },
          { label: '🧫 Lab. Cores',color: '#9B59B6' },
          { label: '✂️ Corte',     color: '#6C5CE7' },
          { label: '🖨️ Impressão', color: '#6C5CE7' },
          { label: '🔍 Revisão',   color: '#6C5CE7' },
          { label: '📦 Embalagem', color: '#6C5CE7' },
          { label: '🛡️ Qualidade', color: '#FF4757' },
          { label: '🚚 Expedição', color: '#00B894' },
        ].map((step, i, arr) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{
                background: i === 0 ? `${step.color}20` : '#F4F3F8',
                color:      i === 0 ? step.color : '#8B8BA0',
                border:     i === 0 ? `1.5px solid ${step.color}50` : '1.5px solid transparent',
              }}>
              {step.label}
            </span>
            {i < arr.length - 1 && <ArrowRight size={10} className="text-[#D0D0E0]" />}
          </div>
        ))}
      </div>

      {/* Grid de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#E8E6F0] p-16 text-center">
            <CheckCircle2 size={32} className="text-[#E0E0EC] mx-auto mb-3" />
            <div className="text-[#C0C0D0] font-bold">Nenhum pedido neste filtro.</div>
          </div>
        )}
        {filtered.map(p => (
          <PedidoCard key={p.id} pedido={p} onEnviar={handleEnviar} />
        ))}
      </div>

      {/* Modal */}
      {showModal && <NovoPedidoModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
