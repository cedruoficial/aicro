import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SECTORS } from '../data/mock';
import { SUBSECTOR_TASKS, type SubTask, type SubTaskStatus } from '../data/mockSubTasks';
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle,
  ArrowRight, Lock, Timer, ChevronDown, ChevronUp,
  AlertTriangle, X, Send
} from 'lucide-react';
import { TransitTimeline } from '../components/TransitTimeline';

// ─── Mapa completo do fluxo (baseado no fluxograma) ───────────────────────────
// Cada sub-setor conhece: de onde vem, para onde vai e onde está no fluxo geral
interface FlowPosition {
  from: string;     // setor anterior
  next: string;     // próximo setor
  chain: { label: string; icon: string; key: string }[]; // fluxo completo
  currentKey: string; // chave desta etapa no chain
  description: string; // o que este setor faz
}

const FULL_CHAIN = [
  { label: 'Comercial',  icon: '🤝', key: 'comercial' },
  { label: 'Arte',       icon: '🎨', key: 'arte' },
  { label: 'Lab. Cores', icon: '🧫', key: 'lab-cores' },
  { label: 'PCP',        icon: '📅', key: 'pcp' },
  { label: 'Corte',      icon: '✂️', key: 'corte' },
  { label: 'Impressão',  icon: '🖨️', key: 'impressao' },
  { label: 'Revisão',    icon: '🔍', key: 'revisao' },
  { label: 'Embalagem',  icon: '📦', key: 'embalagem' },
  { label: 'Qualidade',  icon: '🛡️', key: 'qualidade' },
  { label: 'Expedição',  icon: '🚚', key: 'expedicao' },
];

// Desenvolvimento tem desvio P&D
const PD_CHAIN = [
  { label: 'Comercial', icon: '🤝', key: 'comercial' },
  { label: 'P&D',       icon: '🔬', key: 'pd' },
  { label: 'Arte',      icon: '🎨', key: 'arte' },
  { label: 'Lab. Cores',icon: '🧫', key: 'lab-cores' },
  { label: 'PCP',       icon: '📅', key: 'pcp' },
  { label: 'Impressão', icon: '🖨️', key: 'impressao' },
  { label: 'Revisão',   icon: '🔍', key: 'revisao' },
  { label: 'Embalagem', icon: '📦', key: 'embalagem' },
  { label: 'Qualidade', icon: '🛡️', key: 'qualidade' },
  { label: 'Expedição', icon: '🚚', key: 'expedicao' },
];

const FLOW_MAP: Record<string, FlowPosition> = {
  // COMERCIAL
  'comercial::Recebimento de Pedidos': {
    from: 'Cliente', next: 'Arte ou P&D',
    chain: FULL_CHAIN, currentKey: 'comercial',
    description: 'Ponto de entrada de todos os pedidos. Triagem e direcionamento para Arte (produção) ou P&D (desenvolvimento).',
  },
  'comercial::Faturamento / NF': {
    from: 'Expedição', next: 'Cliente',
    chain: FULL_CHAIN, currentKey: 'expedicao',
    description: 'Emissão da nota fiscal após expedição do pedido aprovado pelo cliente.',
  },
  'comercial::Gestão de Reclamações': {
    from: 'Cliente / Qualidade', next: 'Qualidade',
    chain: FULL_CHAIN, currentKey: 'qualidade',
    description: 'Registro e acompanhamento de reclamações. Encaminha para análise de causa na Qualidade.',
  },

  // ARTE
  'arte::Criação e Design': {
    from: 'Comercial', next: 'Especificação Técnica',
    chain: FULL_CHAIN, currentKey: 'arte',
    description: 'Criação do layout e arte final para o produto. Recebe briefing do Comercial.',
  },
  'arte::Especificação Técnica': {
    from: 'Criação e Design', next: 'Gravação de Telas',
    chain: FULL_CHAIN, currentKey: 'arte',
    description: 'Definição de parâmetros técnicos: cores, telas, materiais. Alimenta Lab. de Cores.',
  },
  'arte::Gravação de Telas': {
    from: 'Especificação Técnica', next: 'Corte / Impressão',
    chain: FULL_CHAIN, currentKey: 'arte',
    description: 'Gravação das telas de impressão com base na especificação técnica aprovada.',
  },

  // P&D
  'pd::Novos Projetos': {
    from: 'Comercial', next: 'Homologação',
    chain: PD_CHAIN, currentKey: 'pd',
    description: 'Pesquisa e desenvolvimento de novos artigos. Recebe solicitação do Comercial.',
  },
  'pd::Homologação': {
    from: 'Novos Projetos', next: 'Aprovação de Materiais',
    chain: PD_CHAIN, currentKey: 'pd',
    description: 'Validação técnica do desenvolvimento. Ensaios laboratoriais e testes de resistência.',
  },
  'pd::Aprovação de Materiais': {
    from: 'Homologação', next: 'Arte',
    chain: PD_CHAIN, currentKey: 'pd',
    description: 'Aprovação final dos materiais e envio da especificação para Arte iniciar produção.',
  },

  // PRODUÇÃO
  'producao::Laboratório de Cores': {
    from: 'Arte / P&D', next: 'PCP / Impressão',
    chain: FULL_CHAIN, currentKey: 'lab-cores',
    description: 'Definição, preparação e aprovação de cores e tintas. Libera tinta para produção.',
  },
  'producao::PCP (Planejamento)': {
    from: 'Arte / Lab. Cores', next: 'Corte',
    chain: FULL_CHAIN, currentKey: 'pcp',
    description: 'Planejamento e sequenciamento da produção. Agenda máquinas e define ordem de entrada.',
  },
  'producao::Corte': {
    from: 'PCP', next: 'Impressão / Sakurai',
    chain: FULL_CHAIN, currentKey: 'corte',
    description: 'Corte do material base conforme especificação. Alimenta a linha de impressão.',
  },
  'producao::Plotter': {
    from: 'Arte', next: 'Impressão / Sakurai',
    chain: FULL_CHAIN, currentKey: 'corte',
    description: 'Impressão digital (plotter) de arte, refile e preparação de peças para produção.',
  },
  'producao::Impressão / Sakurai': {
    from: 'Corte', next: 'Revisão',
    chain: FULL_CHAIN, currentKey: 'impressao',
    description: 'Impressão em máquinas Sakurai/Atima. Produção das peças conforme ordem do PCP.',
  },
  'producao::Revisão': {
    from: 'Impressão', next: 'Qualidade (CTIA) / Embalagem',
    chain: FULL_CHAIN, currentKey: 'revisao',
    description: 'Revisão visual de 100% das peças. Amostras enviadas para CTIA aprovar antes de embalar.',
  },
  'producao::Embalagem': {
    from: 'Revisão / Qualidade', next: 'Expedição',
    chain: FULL_CHAIN, currentKey: 'embalagem',
    description: 'Embalagem e identificação do produto aprovado. Prepara para expedição.',
  },
  'producao::Apontamento': {
    from: 'Impressão', next: 'PCP / Qualidade',
    chain: FULL_CHAIN, currentKey: 'impressao',
    description: 'Registro de produção realizada por máquina e turno. Alimenta OEE e métricas de PCP.',
  },
  'producao::TPU': {
    from: 'P&D', next: 'Calçado / Impressão',
    chain: PD_CHAIN, currentKey: 'pd',
    description: 'Processamento de materiais TPU. Produção de componentes termoplásticos para calçado.',
  },
  'producao::Calçado': {
    from: 'TPU', next: 'Qualidade / Expedição',
    chain: PD_CHAIN, currentKey: 'qualidade',
    description: 'Montagem final do calçado com todos os componentes. Último estágio antes da qualidade.',
  },
  'producao::Qualidade (CTIA)': {
    from: 'Revisão / Embalagem', next: 'Expedição ou Retrabalho',
    chain: FULL_CHAIN, currentKey: 'qualidade',
    description: 'Avaliação da qualidade das amostras. Aprova para expedição ou retorna para retrabalho.',
  },
  'producao::Expedição': {
    from: 'Qualidade (CTIA)', next: 'Faturamento / Cliente',
    chain: FULL_CHAIN, currentKey: 'expedicao',
    description: 'Separação, conferência e despacho dos pedidos aprovados pelo CTIA.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useLiveTimer(startIso?: string) {
  const [txt, setTxt] = useState('—');
  useEffect(() => {
    if (!startIso) return;
    const tick = () => {
      const ms = Date.now() - new Date(startIso).getTime();
      const h  = Math.floor(ms / 3600000);
      const m  = Math.floor((ms % 3600000) / 60000);
      const s  = Math.floor((ms % 60000) / 1000);
      setTxt(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startIso]);
  return txt;
}

function slaPercent(startIso: string | undefined, slaH: number) {
  if (!startIso) return 0;
  return Math.min(100, ((Date.now() - new Date(startIso).getTime()) / 3600000 / slaH) * 100);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const ST: Record<SubTaskStatus, { label: string; color: string; bg: string; border: string }> = {
  em_execucao: { label: 'Em Execução', color: '#00B894', bg: '#EEFAF5', border: '#2DC88E' },
  aguardando:  { label: 'Na Fila',     color: '#E17055', bg: '#FFF4F1', border: '#E17055' },
  bloqueado:   { label: 'Bloqueado',   color: '#8B8BA0', bg: '#F4F3F8', border: '#D0D0E0' },
  atrasado:    { label: 'ATRASADO',    color: '#FF4757', bg: '#FFF0F0', border: '#FF7B87' },
  concluido:   { label: 'Concluído',   color: '#A0A0B0', bg: '#F8F8FC', border: '#E0E0EC' },
};

// ─── Tipo do Problema Reportado ──────────────────────────────────────────────────

const MOTIVOS = [
  'Máquina parada / falha',
  'Falta de material',
  'Aguardando aprovação',
  'Mão de obra insuficiente',
  'Problema de qualidade',
  'Retrabalho necessário',
  'Energia / utilidades',
  'Outro (descreva abaixo)',
];

interface Problema {
  motivo: string;
  detalhe: string;
  hora: string; // HH:MM
}

// ─── Card de tarefa ──────────────────────────────────────────────────
function TaskCard({ task, color, flowInfo, subName }: {
  task: SubTask;
  color: string;
  flowInfo: FlowPosition | null;
  subName: string;
}) {
  const [expanded, setExpanded]         = useState(false);
  const [showReporte, setShowReporte]   = useState(false);
  const [motivoSel, setMotivoSel]       = useState('');
  const [detalhe, setDetalhe]           = useState('');
  const [problema, setProblema]         = useState<Problema | null>(null);

  const elapsed  = useLiveTimer(task.iniciadoEm);
  const pct      = slaPercent(task.iniciadoEm, task.slaHoras);
  const st       = ST[task.status];
  const isLate   = task.status === 'atrasado';
  const isActive = task.status === 'em_execucao';
  const nextLabel = flowInfo?.next ?? 'Próximo';

  const handleReportar = () => {
    if (!motivoSel) return;
    const agora = new Date();
    const hora  = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
    setProblema({ motivo: motivoSel, detalhe, hora });
    setShowReporte(false);
    setMotivoSel('');
    setDetalhe('');
  };

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: problema ? '#FDCB6E' : st.border,
        boxShadow: problema
          ? '0 4px 20px rgba(253,203,110,0.25)'
          : isActive ? `0 4px 20px ${color}18` : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* SLA bar */}
      {task.iniciadoEm && (
        <div className="h-1 w-full" style={{ background: '#F0F0F5' }}>
          <div className="h-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: pct >= 90 ? '#FF4757' : pct >= 70 ? '#FDCB6E' : color }} />
        </div>
      )}

      <div className="p-5">
        {/* Status + ref */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
              {task.status === 'em_execucao' && <Timer size={10} />}
              {task.status === 'aguardando'  && <Clock size={10} />}
              {task.status === 'bloqueado'   && <Lock size={10} />}
              {task.status === 'atrasado'    && <AlertCircle size={10} />}
              {task.status === 'concluido'   && <CheckCircle size={10} />}
              {st.label}
            </span>
            {isLate && (
              <span className="text-[10px] font-black text-[#FF4757] bg-[#FF475715] px-2 py-0.5 rounded-full animate-pulse">
                ⚠ Fora do SLA
              </span>
            )}
            {/* Badge de impedimento ativo */}
            {problema && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#B7791F] bg-[#FEFCE8] border border-[#FDCB6E] px-2.5 py-1 rounded-full">
                <AlertTriangle size={10} />
                IMPEDIMENTO · {problema.hora}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black text-[#A0A0B0] shrink-0">{task.ref}</span>
        </div>

        {/* Problema reportado — banner */}
        {problema && (
          <div className="mb-3 bg-[#FFFBEB] border border-[#FDCB6E] rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-[#D97706] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-[#92400E] mb-0.5">{problema.motivo}</div>
              {problema.detalhe && (
                <div className="text-[11px] text-[#A16207]">{problema.detalhe}</div>
              )}
              <div className="text-[9px] text-[#CA8A04] mt-1 font-bold">Reportado às {problema.hora} · Lead Time continua correndo</div>
            </div>
            <button
              onClick={() => setProblema(null)}
              className="shrink-0 text-[#CA8A04] hover:text-[#92400E] transition-colors"
              title="Remover impedimento"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Cliente + produto */}
        <div className="mb-3">
          <div className="text-lg font-black text-[#2D2D3A]">{task.cliente}</div>
          <div className="text-sm text-[#8B8BA0] font-medium">{task.produto}</div>
        </div>

        {/* Fluxo */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs bg-[#F4F3F8] text-[#8B8BA0] font-bold px-2.5 py-1 rounded-full">{task.origemSetor}</span>
          <ArrowRight size={12} className="text-[#C0C0D0] shrink-0" />
          <span className="text-xs font-black px-2.5 py-1 rounded-full"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{subName}</span>
          <ArrowRight size={12} className="text-[#C0C0D0] shrink-0" />
          <span className="text-xs bg-[#F4F3F8] text-[#8B8BA0] font-bold px-2.5 py-1 rounded-full">{nextLabel}</span>
        </div>

        {/* Lead time + ações */}
        <div className="flex items-center justify-between">
          <div>
            {task.iniciadoEm ? (
              <>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  Lead Time {problema && <span className="text-[#D97706]">+ impedimento ativo</span>}
                </div>
                <div className={`text-xl font-black tabular-nums ${
                  problema ? 'text-[#D97706]' : isLate ? 'text-[#FF4757]' : 'text-[#2D2D3A]'
                }`}>
                  {elapsed}
                </div>
                <div className="text-[9px] text-[#B0B0C0] font-bold">SLA: {task.slaHoras}h · {Math.round(pct)}% consumido</div>
              </>
            ) : (
              <>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mb-0.5">SLA Previsto</div>
                <div className="text-xl font-black text-[#C0C0D0]">{task.slaHoras}h</div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {task.status === 'aguardando' && (
              <button className="px-4 py-2 rounded-xl text-white text-xs font-black transition-all active:scale-95 shadow-md"
                style={{ background: color }}>&#10003; Aceitar</button>
            )}
            {task.status === 'em_execucao' && (
              <button className="px-4 py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-black hover:bg-black transition-all active:scale-95 shadow-md flex items-center gap-1.5">
                Finalizar → {nextLabel}
              </button>
            )}
            {task.status === 'atrasado' && (
              <button className="px-4 py-2 rounded-xl bg-[#FF4757] text-white text-xs font-black active:scale-95 shadow-md">
                ⚡ Acionar
              </button>
            )}

            {/* Botão reportar problema */}
            {(task.status === 'em_execucao' || task.status === 'atrasado') && (
              <button
                onClick={() => setShowReporte(o => !o)}
                title="Reportar impedimento"
                className={`p-2 rounded-xl border transition-all ${
                  showReporte || problema
                    ? 'bg-[#FFFBEB] border-[#FDCB6E] text-[#D97706]'
                    : 'border-[#EEEDF5] text-[#A0A0B0] hover:bg-[#FFFBEB] hover:border-[#FDCB6E] hover:text-[#D97706]'
                }`}
              >
                <AlertTriangle size={14} />
              </button>
            )}

            <button onClick={() => setExpanded(o => !o)}
              className="p-2 rounded-xl border border-[#EEEDF5] text-[#A0A0B0] hover:bg-[#F8F7FC] transition-all">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Painel de reporte de problema */}
        {showReporte && (
          <div className="mt-4 pt-4 border-t border-[#FDCB6E] space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-[#D97706]" />
              <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">Reportar Impedimento</span>
            </div>

            {/* Motivos rápidos */}
            <div className="grid grid-cols-2 gap-1.5">
              {MOTIVOS.map(m => (
                <button
                  key={m}
                  onClick={() => setMotivoSel(m)}
                  className={`text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                    motivoSel === m
                      ? 'bg-[#FFFBEB] border-[#FDCB6E] text-[#92400E]'
                      : 'bg-[#F8F7FC] border-transparent text-[#8B8BA0] hover:border-[#FDCB6E] hover:text-[#92400E]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Detalhe */}
            <textarea
              value={detalhe}
              onChange={e => setDetalhe(e.target.value)}
              rows={2}
              placeholder="Detalhes adicionais (opcional)..."
              className="w-full px-3 py-2.5 bg-[#FFFBEB] border border-[#FDCB6E] rounded-xl text-xs font-medium text-[#92400E] placeholder:text-[#CA8A04] resize-none focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowReporte(false)}
                className="flex-1 py-2 rounded-xl border border-[#EEEDF5] text-[#8B8BA0] text-xs font-black hover:bg-[#F8F7FC] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleReportar}
                disabled={!motivoSel}
                className="flex-1 py-2 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ background: motivoSel ? '#D97706' : '#C0C0D0' }}
              >
                <Send size={12} /> Reportar
              </button>
            </div>
          </div>
        )}

        {/* Detalhe expandido */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-[#F0F0F5] space-y-3">
            {task.status === 'bloqueado' && (
              <div className="flex items-center gap-2 text-sm text-[#8B8BA0] bg-[#F4F3F8] rounded-xl px-4 py-3">
                <Lock size={14} className="shrink-0" />
                <span>Aguardando <strong className="text-[#E17055]">{task.origemSetor}</strong> finalizar e liberar.</span>
              </div>
            )}
            {task.status === 'aguardando' && (
              <div className="flex items-center gap-2 text-sm text-[#8B8BA0] bg-[#FFF4F1] rounded-xl px-4 py-3">
                <Clock size={14} className="text-[#E17055] shrink-0" />
                <span><strong className="text-[#E17055]">{task.origemSetor}</strong> já liberou. Aceite para iniciar o Lead Time.</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#F8F7FC] rounded-xl p-3 text-center">
                <div className="text-base font-black" style={{ color }}>{task.slaHoras}h</div>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase mt-0.5">SLA</div>
              </div>
              <div className="bg-[#F8F7FC] rounded-xl p-3 text-center">
                <div className="text-base font-black text-[#2D2D3A]">{Math.round(pct)}%</div>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase mt-0.5">Consumido</div>
              </div>
              <div className="bg-[#F8F7FC] rounded-xl p-3 text-center">
                <div className="text-base font-black" style={{ color: pct >= 90 ? '#FF4757' : '#00B894' }}>
                  {pct >= 100 ? 'Vencido' : `${Math.round((1 - pct / 100) * task.slaHoras * 60)}min`}
                </div>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase mt-0.5">Restante</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página do Sub-Setor ───────────────────────────────────────────────────────
const STATUS_TABS: { key: SubTaskStatus | 'todos'; label: string }[] = [
  { key: 'todos',       label: 'Todos' },
  { key: 'em_execucao', label: 'Em Execução' },
  { key: 'aguardando',  label: 'Na Fila' },
  { key: 'bloqueado',   label: 'Bloqueados' },
  { key: 'atrasado',    label: 'Atrasados' },
  { key: 'concluido',   label: 'Concluídos' },
];

export function SubSectorDetail() {
  const { sectorId, subId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SubTaskStatus | 'todos'>('todos');

  const sector = SECTORS.find(s => s.id === sectorId);

  const sub = sector?.subSectors.find(s => {
    const slug = s.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug === subId;
  });

  if (!sector || !sub) {
    return (
      <div className="p-8 text-[#8B8BA0] font-bold">
        Sub-setor não encontrado.{' '}
        <button onClick={() => navigate('/home')} className="text-[#6C5CE7] hover:underline">Voltar</button>
      </div>
    );
  }

  const key = `${sector.id}::${sub.name}`;
  const flowInfo = FLOW_MAP[key] ?? null;
  const allTasks = SUBSECTOR_TASKS[key] ?? [];
  const filtered = tab === 'todos' ? allTasks : allTasks.filter(t => t.status === tab);

  const counts: Record<SubTaskStatus, number> = {
    em_execucao: allTasks.filter(t => t.status === 'em_execucao').length,
    aguardando:  allTasks.filter(t => t.status === 'aguardando').length,
    bloqueado:   allTasks.filter(t => t.status === 'bloqueado').length,
    atrasado:    allTasks.filter(t => t.status === 'atrasado').length,
    concluido:   allTasks.filter(t => t.status === 'concluido').length,
  };


  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto animate-in fade-in duration-300">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#A0A0B0] font-bold mb-6">
        <button onClick={() => navigate('/home')} className="hover:text-[#6C5CE7] transition-colors">Painel Geral</button>
        <span>›</span>
        <button onClick={() => navigate('/home')} className="hover:text-[#6C5CE7] transition-colors">{sector.name}</button>
        <span>›</span>
        <span style={{ color: sector.color }}>{sub.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E8E6F0] text-[#8B8BA0] hover:text-[#2D2D3A] hover:bg-[#F4F3F8] transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: `${sector.color}15`, border: `2px solid ${sector.color}30` }}>
            {sub.icon}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: sector.color }}>
              {sector.name}
            </div>
            <h1 className="text-2xl font-black text-[#2D2D3A] m-0 tracking-tight">{sub.name}</h1>
            {flowInfo && (
              <p className="text-[#8B8BA0] text-xs font-medium mt-1 max-w-md">{flowInfo.description}</p>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Ativos',      val: counts.em_execucao, color: '#00B894' },
            { label: 'Na Fila',     val: counts.aguardando,  color: '#E17055' },
            { label: 'Bloqueados',  val: counts.bloqueado,   color: '#A0A0B0' },
            { label: 'Atrasados',   val: counts.atrasado,    color: '#FF4757' },
          ].map(k => (
            <div key={k.label} className="bg-white px-4 py-3 rounded-2xl border border-[#E8E6F0] shadow-sm text-center min-w-[72px]">
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.val}</div>
              <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BARRA DO FLUXO — removida, info está dentro dos cards */}


      <TransitTimeline
        items={allTasks.filter(t => t.status === 'bloqueado').map(t => ({
          ref: t.ref, cliente: t.cliente, produto: t.produto,
          origemSetor: t.origemSetor, slaHoras: t.slaHoras,
        }))}
      />

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map(t => {
          const count = t.key === 'todos' ? allTasks.length : counts[t.key as SubTaskStatus];
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                tab === t.key ? 'text-white shadow-md border-transparent' : 'bg-white text-[#8B8BA0] border-[#E8E6F0] hover:border-[#C0C0D0]'
              }`}
              style={tab === t.key ? { background: sector.color } : {}}>
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid de tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#E8E6F0] p-16 text-center text-[#C0C0D0] font-bold">
            Nenhuma tarefa neste filtro.
          </div>
        )}
        {filtered.map((task, i) => (
          <TaskCard key={i} task={task} color={sector.color} flowInfo={flowInfo} subName={sub.name} />
        ))}
      </div>
    </div>
  );
}
