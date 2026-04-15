import { useParams, useNavigate } from 'react-router-dom';
import { SECTORS } from '../data/mock';
import { ArrowLeft, CheckCircle, AlertCircle, ArrowRight, Lock, Unlock, Timer } from 'lucide-react';
import { TransitTimeline } from '../components/TransitTimeline';
import { useState, useEffect } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type TaskStatus = 'bloqueado' | 'aguardando' | 'em_execucao' | 'concluido' | 'atrasado';

interface FlowTask {
  id: string;
  ref: string;
  cliente: string;
  produto: string;
  prioridade: 'URGENTE' | 'NORMAL' | 'BAIXA';
  status: TaskStatus;
  origemSetor: string;
  proximoSetor: string;
  // Lead time
  iniciadoEm?: string;   // ISO datetime — quando foi aceito
  slaHoras: number;      // horas máximas permitidas no setor
  // Bloqueio
  bloqueadoPor?: string; // setor que ainda não liberou
}

// ─── Pool de tarefas por setor ─────────────────────────────────────────────────
const SECTOR_TASKS: Record<string, FlowTask[]> = {
  comercial: [
    { id: 'T001', ref: 'PED-2026-0501', cliente: 'Aniger',    produto: 'Nike Air Max Sub',       prioridade: 'URGENTE', status: 'em_execucao', origemSetor: '—',        proximoSetor: 'Arte',      iniciadoEm: new Date(Date.now() - 1.2 * 3600000).toISOString(), slaHoras: 2 },
    { id: 'T002', ref: 'PED-2026-0502', cliente: 'Bibi',      produto: 'Linha Baby Confort 26',  prioridade: 'NORMAL',  status: 'em_execucao', origemSetor: '—',        proximoSetor: 'P&D',       iniciadoEm: new Date(Date.now() - 0.4 * 3600000).toISOString(), slaHoras: 2 },
    { id: 'T003', ref: 'PED-2026-0503', cliente: 'Dakota',    produto: 'Fila Disruptor GT',      prioridade: 'NORMAL',  status: 'em_execucao', origemSetor: '—',        proximoSetor: 'Arte',      iniciadoEm: new Date(Date.now() - 2.8 * 3600000).toISOString(), slaHoras: 2 },
    { id: 'T004', ref: 'PED-2026-0504', cliente: 'Olympikus', produto: 'Corrida Xtreme 2026',    prioridade: 'BAIXA',   status: 'aguardando',  origemSetor: '—',        proximoSetor: 'Arte',      slaHoras: 2 },
    { id: 'T005', ref: 'PED-2026-0505', cliente: 'Dass',      produto: 'Bally Flex Pro',         prioridade: 'URGENTE', status: 'atrasado',    origemSetor: '—',        proximoSetor: 'P&D',       iniciadoEm: new Date(Date.now() - 4.5 * 3600000).toISOString(), slaHoras: 2 },
  ],
  arte: [
    { id: 'T010', ref: 'PED-2026-0488', cliente: 'Pampili',   produto: 'Holográfico Star',       prioridade: 'URGENTE', status: 'em_execucao', origemSetor: 'Comercial', proximoSetor: 'P&D',      iniciadoEm: new Date(Date.now() - 3.1 * 3600000).toISOString(), slaHoras: 4 },
    { id: 'T011', ref: 'PED-2026-0490', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',  prioridade: 'NORMAL',  status: 'em_execucao', origemSetor: 'Comercial', proximoSetor: 'Produção',  iniciadoEm: new Date(Date.now() - 1.0 * 3600000).toISOString(), slaHoras: 4 },
    { id: 'T012', ref: 'PED-2026-0492', cliente: 'Aniger',    produto: 'Nike Air Force Sub',     prioridade: 'URGENTE', status: 'aguardando',  origemSetor: 'Comercial', proximoSetor: 'P&D',      slaHoras: 4 },
    { id: 'T013', ref: 'PED-2026-0493', cliente: 'Dass',      produto: 'Stamping Metálico DK',   prioridade: 'NORMAL',  status: 'bloqueado',   origemSetor: 'P&D',      proximoSetor: 'Produção',  bloqueadoPor: 'P&D', slaHoras: 4 },
    { id: 'T014', ref: 'PED-2026-0494', cliente: 'Bibi',      produto: 'Verniz UV Baby',         prioridade: 'BAIXA',   status: 'atrasado',    origemSetor: 'Comercial', proximoSetor: 'Produção',  iniciadoEm: new Date(Date.now() - 5.2 * 3600000).toISOString(), slaHoras: 4 },
  ],
  pd: [
    { id: 'T020', ref: 'PED-2026-0470', cliente: 'Dass',      produto: 'Bally Test Mix',         prioridade: 'URGENTE', status: 'em_execucao', origemSetor: 'Arte',     proximoSetor: 'Produção',  iniciadoEm: new Date(Date.now() - 6.0 * 3600000).toISOString(), slaHoras: 8 },
    { id: 'T021', ref: 'PED-2026-0471', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',    prioridade: 'NORMAL',  status: 'em_execucao', origemSetor: 'Arte',     proximoSetor: 'Produção',  iniciadoEm: new Date(Date.now() - 2.5 * 3600000).toISOString(), slaHoras: 8 },
    { id: 'T022', ref: 'PED-2026-0475', cliente: 'Pampili',   produto: 'Holográfico Star',       prioridade: 'URGENTE', status: 'aguardando',  origemSetor: 'Arte',     proximoSetor: 'Produção',  slaHoras: 8 },
    { id: 'T023', ref: 'PED-2026-0478', cliente: 'Aniger',    produto: 'Sublimação Premium',     prioridade: 'NORMAL',  status: 'bloqueado',   origemSetor: 'Arte',     proximoSetor: 'Produção',  bloqueadoPor: 'Arte', slaHoras: 8 },
    { id: 'T024', ref: 'PED-2026-0480', cliente: 'Olympikus', produto: 'Film Matte Clamshell',   prioridade: 'BAIXA',   status: 'concluido',   origemSetor: 'Arte',     proximoSetor: 'Produção',  slaHoras: 8 },
  ],
  producao: [
    { id: 'T030', ref: 'PED-2026-0445', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',   prioridade: 'URGENTE', status: 'em_execucao', origemSetor: 'P&D',     proximoSetor: 'Expedição',  iniciadoEm: new Date(Date.now() - 1.5 * 3600000).toISOString(), slaHoras: 6 },
    { id: 'T031', ref: 'PED-2026-0448', cliente: 'Dakota',    produto: 'Sublimação Premium',     prioridade: 'NORMAL',  status: 'em_execucao', origemSetor: 'P&D',     proximoSetor: 'Expedição',  iniciadoEm: new Date(Date.now() - 3.2 * 3600000).toISOString(), slaHoras: 6 },
    { id: 'T032', ref: 'PED-2026-0450', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',    prioridade: 'URGENTE', status: 'aguardando',  origemSetor: 'P&D',     proximoSetor: 'Expedição',  slaHoras: 6 },
    { id: 'T033', ref: 'PED-2026-0452', cliente: 'Bibi',      produto: 'Etiqueta PU Alta Freq',  prioridade: 'NORMAL',  status: 'bloqueado',   origemSetor: 'P&D',     proximoSetor: 'Expedição',  bloqueadoPor: 'P&D', slaHoras: 6 },
    { id: 'T034', ref: 'PED-2026-0455', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',  prioridade: 'URGENTE', status: 'atrasado',    origemSetor: 'Arte',    proximoSetor: 'Expedição',  iniciadoEm: new Date(Date.now() - 8.0 * 3600000).toISOString(), slaHoras: 6 },
    { id: 'T035', ref: 'PED-2026-0458', cliente: 'Dass',      produto: 'Bally Flex Pro',         prioridade: 'NORMAL',  status: 'aguardando',  origemSetor: 'P&D',     proximoSetor: 'Expedição',  slaHoras: 6 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useElapsedTime(startIso?: string) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!startIso) { setElapsed('—'); return; }
    const update = () => {
      const diffMs = Date.now() - new Date(startIso).getTime();
      const h = Math.floor(diffMs / 3600000);
      const m = Math.floor((diffMs % 3600000) / 60000);
      const s = Math.floor((diffMs % 60000) / 1000);
      setElapsed(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [startIso]);
  return elapsed;
}

function calcSlaPercent(startIso: string | undefined, slaHoras: number): number {
  if (!startIso) return 0;
  const elapsed = (Date.now() - new Date(startIso).getTime()) / 3600000;
  return Math.min(100, Math.round((elapsed / slaHoras) * 100));
}

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  bloqueado:    { label: 'Bloqueado — Aguard. Setor Anterior', color: '#8B8BA0', bg: '#F4F3F8', icon: <Lock size={14} /> },
  aguardando:   { label: 'Na Fila — Aguardando Aceite',       color: '#E17055', bg: '#FFF4F1', icon: <AlertCircle size={14} /> },
  em_execucao:  { label: 'Em Execução',                        color: '#00B894', bg: '#EEFAF5', icon: <Timer size={14} /> },
  concluido:    { label: 'Concluído — Liberado',               color: '#A0A0B0', bg: '#F4F3F8', icon: <CheckCircle size={14} /> },
  atrasado:     { label: 'ATRASADO',                           color: '#FF4757', bg: '#FFF0F0', icon: <AlertCircle size={14} /> },
};

const PRIORITY_CFG = {
  URGENTE: { color: '#FF4757', bg: '#FFF0F0' },
  NORMAL:  { color: '#6C5CE7', bg: '#F4F3FD' },
  BAIXA:   { color: '#A0A0B0', bg: '#F4F3F8' },
};

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, sectorColor, sectorName }: { task: FlowTask; sectorColor: string, sectorName: string }) {
  const elapsed = useElapsedTime(task.iniciadoEm);
  const slaPercent = calcSlaPercent(task.iniciadoEm, task.slaHoras);
  const cfg = STATUS_CFG[task.status];
  const prCfg = PRIORITY_CFG[task.prioridade];
  const isBlocked = task.status === 'bloqueado';
  const isLate    = task.status === 'atrasado';
  const isActive  = task.status === 'em_execucao';

  return (
    <div className={`bg-white rounded-[20px] border transition-all overflow-hidden
      ${isLate ? 'border-[#FF475740]' : isBlocked ? 'border-dashed border-[#D0D0E0]' : 'border-[#E8E6F0]'}
      ${isActive ? 'shadow-md' : 'shadow-sm'}
      hover:shadow-lg
    `}>
      {/* SLA progress bar top */}
      {task.iniciadoEm && (
        <div className="h-1 w-full" style={{ background: '#F0F0F5' }}>
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${slaPercent}%`,
              background: slaPercent >= 90 ? '#FF4757' : slaPercent >= 70 ? '#FDCB6E' : sectorColor,
            }}
          />
        </div>
      )}

      <div className="p-5 flex items-center gap-5">
        {/* Status icon */}
        <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: prCfg.color, background: prCfg.bg }}>
              {task.prioridade}
            </span>
            <span className="text-[10px] font-bold text-[#8B8BA0]">{task.ref}</span>
            <span className="text-[10px] font-bold" style={{ color: cfg.color, background: cfg.bg }}>
              › {cfg.label}
            </span>
          </div>
          <div className="text-base font-black text-[#2D2D3A] truncate">{task.cliente}</div>
          <div className="text-sm text-[#8B8BA0] font-medium truncate">{task.produto}</div>

          {/* Fluxo */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] bg-[#F4F3F8] px-2 py-0.5 rounded-full font-bold text-[#8B8BA0]">{task.origemSetor}</span>
            <ArrowRight size={10} className="text-[#C0C0D0]" />
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${sectorColor}20`, color: sectorColor }}>
              {sectorName}
            </span>
            <ArrowRight size={10} className="text-[#C0C0D0]" />
            <span className="text-[10px] bg-[#F4F3F8] px-2 py-0.5 rounded-full font-bold text-[#8B8BA0]">{task.proximoSetor}</span>
          </div>

          {/* Bloqueado por */}
          {isBlocked && task.bloqueadoPor && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#8B8BA0]">
              <Lock size={10} />
              Aguardando liberação de: <strong className="text-[#E17055]">{task.bloqueadoPor}</strong>
            </div>
          )}
        </div>

        {/* Lead time + ações */}
        <div className="shrink-0 flex flex-col items-end gap-3">
          {task.iniciadoEm ? (
            <div className="text-right">
              <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mb-0.5">Lead Time</div>
              <div className={`text-xl font-black tabular-nums ${isLate ? 'text-[#FF4757]' : 'text-[#2D2D3A]'}`}>
                {elapsed}
              </div>
              <div className="text-[9px] text-[#A0A0B0] font-bold">SLA: {task.slaHoras}h · {slaPercent}%</div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mb-0.5">SLA Previsto</div>
              <div className="text-xl font-black text-[#C0C0D0]">{task.slaHoras}h</div>
            </div>
          )}

          {/* Botão de ação contextual */}
          {task.status === 'aguardando' && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black transition-all active:scale-95 shadow-md"
              style={{ background: sectorColor }}>
              <Unlock size={14} /> Aceitar
            </button>
          )}
          {task.status === 'em_execucao' && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black bg-[#1A1A2E] hover:bg-black transition-all active:scale-95 shadow-md">
              Finalizar <ArrowRight size={13} />
            </button>
          )}
          {task.status === 'atrasado' && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black bg-[#FF4757] hover:bg-[#E03646] transition-all active:scale-95 shadow-md">
              ⚡ Acionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sector Detail ─────────────────────────────────────────────────────────────
export function SectorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sector = SECTORS.find(s => s.id === id);
  const [filter, setFilter] = useState<'todos' | TaskStatus>('todos');

  if (!sector) return <div className="p-8 text-[#8B8BA0]">Setor não encontrado.</div>;

  const allTasks = SECTOR_TASKS[id ?? ''] ?? [];
  const filtered = filter === 'todos' ? allTasks : allTasks.filter(t => t.status === filter);

  const counts = {
    bloqueado:   allTasks.filter(t => t.status === 'bloqueado').length,
    aguardando:  allTasks.filter(t => t.status === 'aguardando').length,
    em_execucao: allTasks.filter(t => t.status === 'em_execucao').length,
    atrasado:    allTasks.filter(t => t.status === 'atrasado').length,
    concluido:   allTasks.filter(t => t.status === 'concluido').length,
  };

  const avgSla = allTasks
    .filter(t => t.iniciadoEm)
    .map(t => calcSlaPercent(t.iniciadoEm, t.slaHoras))
    .reduce((a, b, _, arr) => a + b / arr.length, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto animate-in slide-in-from-right-4 duration-400">

      {/* Voltar */}
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 text-[#8B8BA0] hover:text-[#6C5CE7] font-bold text-sm mb-6 transition-all group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Voltar ao Painel Geral
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: `${sector.color}15`, border: `2px solid ${sector.color}30` }}>
            {sector.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2D2D3A] tracking-tight m-0">{sector.name}</h1>
            <p className="text-[#8B8BA0] text-sm font-medium">{sector.description}</p>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Em Execução',  val: counts.em_execucao, color: '#00B894' },
            { label: 'Na Fila',      val: counts.aguardando,  color: '#E17055' },
            { label: 'Bloqueados',   val: counts.bloqueado,   color: '#8B8BA0' },
            { label: 'Atrasados',    val: counts.atrasado,    color: '#FF4757' },
          ].map(k => (
            <div key={k.label} className="bg-white px-5 py-3 rounded-2xl border border-[#E8E6F0] shadow-sm text-center min-w-[80px]">
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.val}</div>
              <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider">{k.label}</div>
            </div>
          ))}
          <div className="bg-white px-5 py-3 rounded-2xl border border-[#E8E6F0] shadow-sm text-center min-w-[90px]">
            <div className="text-2xl font-black" style={{ color: avgSla >= 80 ? '#FF4757' : '#6C5CE7' }}>
              {Math.round(avgSla)}%
            </div>
            <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider">SLA Consumido</div>
          </div>
        </div>
      </div>

      <TransitTimeline
        items={allTasks.filter(t => t.status === 'bloqueado').map(t => ({
          ref: t.ref, cliente: t.cliente, produto: t.produto,
          origemSetor: t.origemSetor, slaHoras: t.slaHoras,
        }))}
      />

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {([
          { key: 'todos',      label: `Todos (${allTasks.length})` },
          { key: 'em_execucao',label: `Em Execução (${counts.em_execucao})` },
          { key: 'aguardando', label: `Na Fila (${counts.aguardando})` },
          { key: 'bloqueado',  label: `Bloqueados (${counts.bloqueado})` },
          { key: 'atrasado',   label: `Atrasados (${counts.atrasado})` },
          { key: 'concluido',  label: `Concluídos (${counts.concluido})` },
        ] as { key: typeof filter; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
              filter === f.key
                ? 'text-white shadow-md border-transparent'
                : 'bg-white text-[#8B8BA0] border-[#E8E6F0] hover:border-[#C0C0D0]'
            }`}
            style={filter === f.key ? { background: sector.color } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-[#E8E6F0] p-12 text-center text-[#C0C0D0] font-bold">
            Nenhuma tarefa neste filtro.
          </div>
        )}
        {filtered.map(task => (
          <TaskRow key={task.id} task={task} sectorColor={sector.color} sectorName={sector.name} />
        ))}
      </div>

    </div>
  );
}
