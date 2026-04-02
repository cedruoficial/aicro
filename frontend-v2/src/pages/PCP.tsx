import { useState, useMemo } from 'react';
import { MACHINES, ALL_PRODUCTION_BLOCKS } from '../data/mockPCP';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import type { ProductionStatus, ProductionBlock } from '../types/pcp';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function offsetDate(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d;
}

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

// ─── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ProductionStatus, { bg: string; border: string; text: string; dot: string; label: string }> = {
  'Programado':    { bg: '#F4F3FD', border: '#C5C0F0', text: '#6C5CE7', dot: '#A29BFE', label: 'Programado' },
  'Em Preparação': { bg: '#FFFBEE', border: '#F6C948', text: '#9A7B0A', dot: '#FDCB6E', label: 'Prep.' },
  'Em Produção':   { bg: '#EEFAF5', border: '#2DC88E', text: '#1A8A60', dot: '#00B894', label: 'Produção' },
  'Concluído':     { bg: '#F2F2F7', border: '#C0C0D0', text: '#7B7B95', dot: '#A0A0B0', label: 'OK' },
  'Atrasado':      { bg: '#FFF0F0', border: '#FF7B87', text: '#C0303C', dot: '#FF4757', label: 'Atrasado' },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 06:00 → 19:00
const CELL_H = 64; // px por hora

function blockStyle(block: ProductionBlock) {
  const s = new Date(block.programadoInicio);
  const e = new Date(block.programadoFim);
  const startMin = s.getHours() * 60 + s.getMinutes() - 6 * 60;
  const endMin   = e.getHours() * 60 + e.getMinutes() - 6 * 60;
  const top    = Math.max(0, (startMin / 60) * CELL_H);
  const height = Math.max(28, ((endMin - startMin) / 60) * CELL_H - 4);
  return { top: `${top}px`, height: `${height}px` };
}

// ─── Linha de tempo atual ──────────────────────────────────────────────────────
function nowLineOffset(): number {
  const now = new Date();
  const hrs = now.getHours() + now.getMinutes() / 60 - 6;
  return Math.max(0, hrs * CELL_H);
}

// ─── Production Detail Modal ──────────────────────────────────────────────────
function ProductionModal({ block, machine, onClose }: {
  block: ProductionBlock;
  machine: { name: string; type: string } | undefined;
  onClose: () => void;
}) {
  const cfg = STATUS_CFG[block.status];
  const start = new Date(block.programadoInicio);
  const end   = new Date(block.programadoFim);
  const plannedMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const elapsedMinutes = block.status !== 'Programado'
    ? Math.round(Math.min(plannedMinutes, plannedMinutes * block.progress / 100))
    : 0;

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const efficiency = block.status === 'Concluído' ? 96 :
    block.status === 'Atrasado' ? 72 :
    block.status === 'Em Produção' ? Math.max(60, 100 - (plannedMinutes - elapsedMinutes) / 2) : 0;

  const fmtMins = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header colorido pelo status */}
        <div className="px-8 pt-7 pb-6" style={{ background: `linear-gradient(135deg, ${cfg.bg} 0%, white 100%)`, borderBottom: `2px solid ${cfg.border}` }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  style={{ color: cfg.text, background: `${cfg.dot}25`, border: `1px solid ${cfg.border}` }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                  {block.status}
                </span>
                {block.status === 'Atrasado' && (
                  <span className="text-[10px] font-black text-[#FF4757] bg-[#FF475715] px-2 py-1 rounded-full">⚠ Atenção Necessária</span>
                )}
              </div>
              <h2 className="text-xl font-black text-[#2D2D3A] tracking-tight">{block.client}</h2>
              <p className="text-sm text-[#8B8BA0] font-medium mt-0.5">{block.product}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/80 border border-[#EEEDF5] flex items-center justify-center text-[#8B8BA0] hover:text-[#2D2D3A] hover:bg-white transition-all ml-4 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Identidade do Pedido */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pedido / Ref.',  val: block.reference },
              { label: 'Máquina',        val: machine?.name ?? '—' },
              { label: 'Tipo',           val: machine?.type ?? '—' },
              { label: 'Início Prog.',   val: fmtTime(start) },
              { label: 'Fim Prog.',      val: fmtTime(end) },
              { label: 'Duração Prev.',  val: fmtMins(plannedMinutes) },
            ].map(item => (
              <div key={item.label} className="bg-[#F8F7FC] rounded-2xl px-4 py-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#A0A0B0] mb-1">{item.label}</div>
                <div className="text-sm font-black text-[#2D2D3A]">{item.val}</div>
              </div>
            ))}
          </div>

          {/* Progresso */}
          {block.status !== 'Programado' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-black text-[#6B6B80] uppercase tracking-wider">Progresso da Ordem</span>
                <span className="text-sm font-black" style={{ color: cfg.text }}>{block.progress}%</span>
              </div>
              <div className="h-3 bg-[#F0F0F5] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${block.progress}%`, background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.border})` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#A0A0B0] font-bold mt-1.5">
                <span>Executado: {fmtMins(elapsedMinutes)}</span>
                <span>Restante: {fmtMins(Math.max(0, plannedMinutes - elapsedMinutes))}</span>
              </div>
            </div>
          )}

          {/* KPIs de Análise */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] mb-3">Análise da Produção</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-[#F8F7FC] rounded-2xl border border-[#EEEDF5]">
                <div className="text-2xl font-black" style={{ color: efficiency >= 90 ? '#00B894' : efficiency >= 75 ? '#FDCB6E' : '#FF4757' }}>
                  {block.status === 'Programado' ? '—' : `${Math.round(efficiency)}%`}
                </div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[#A0A0B0] mt-1">OEE Parcial</div>
              </div>
              <div className="text-center p-4 bg-[#F8F7FC] rounded-2xl border border-[#EEEDF5]">
                <div className="text-2xl font-black text-[#6C5CE7]">{fmtMins(plannedMinutes)}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[#A0A0B0] mt-1">Lead Time</div>
              </div>
              <div className="text-center p-4 bg-[#F8F7FC] rounded-2xl border border-[#EEEDF5]">
                <div className="text-2xl font-black" style={{ color: block.status === 'Atrasado' ? '#FF4757' : '#00B894' }}>
                  {block.status === 'Atrasado' ? `+${Math.round(plannedMinutes * 0.15)}min` : block.status === 'Concluído' ? 'No prazo' : '—'}
                </div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[#A0A0B0] mt-1">Variação</div>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex gap-3 pt-2 border-t border-[#F0F0F5]">
            {block.status === 'Em Produção' && (
              <button className="flex-1 py-3 bg-[#00B894] text-white font-black rounded-2xl text-sm hover:bg-[#00A785] transition-all shadow-md shadow-[#00B89420] active:scale-95">
                ✓ Marcar Concluído
              </button>
            )}
            {block.status === 'Programado' && (
              <button className="flex-1 py-3 bg-[#6C5CE7] text-white font-black rounded-2xl text-sm hover:bg-[#5A4BCE] transition-all shadow-md shadow-[#6C5CE720] active:scale-95">
                ▶ Iniciar Produção
              </button>
            )}
            {block.status === 'Atrasado' && (
              <button className="flex-1 py-3 bg-[#FF4757] text-white font-black rounded-2xl text-sm hover:bg-[#E03646] transition-all shadow-md shadow-[#FF475720] active:scale-95">
                ⚡ Acionar Gestor
              </button>
            )}
            <button className="py-3 px-5 rounded-2xl border border-[#EEEDF5] text-[#8B8BA0] font-black text-sm hover:bg-[#F8F7FC] transition-all">
              + Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Block Card ───────────────────────────────────────────────────────────────
function BlockCard({ block, machines }: { block: ProductionBlock; machines: typeof MACHINES }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[block.status];
  const machine = machines.find(m => m.id === block.machineId);

  return (
    <>
      <div
        className="absolute left-1 right-1 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] hover:-translate-y-px hover:z-10"
        style={{ ...blockStyle(block), backgroundColor: cfg.bg, border: `1.5px solid ${cfg.border}` }}
        onClick={() => setOpen(true)}
      >
        {block.progress > 0 && block.progress < 100 && (
          <div className="h-1 w-full absolute top-0 left-0" style={{ background: `${cfg.border}30` }}>
            <div className="h-full" style={{ width: `${block.progress}%`, background: cfg.dot }} />
          </div>
        )}
        <div className="px-2 pt-2 pb-1.5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ color: cfg.text, background: `${cfg.dot}20` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
            {block.status === 'Atrasado' && <AlertTriangle size={10} className="text-[#FF4757]" />}
          </div>
          <div className="text-[10px] font-bold truncate" style={{ color: cfg.text }}>{block.reference}</div>
          <div className="text-[11px] font-black text-[#2D2D3A] truncate leading-tight">{block.client}</div>
          <div className="text-[10px] text-[#8B8BA0] truncate leading-tight mt-0.5">{block.product}</div>
        </div>
      </div>

      {open && (
        <ProductionModal block={block} machine={machine} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

// ─── Main PCP ─────────────────────────────────────────────────────────────────
export function PCP() {
  const today = useMemo(() => new Date(), []);
  const [dayOffset, setDayOffset] = useState(0);
  const [showStrip, setShowStrip] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'Sakurai' | 'Atima'>('all');

  const currentDate = useMemo(() => offsetDate(today, dayOffset), [today, dayOffset]);
  const dateKey = toDateKey(currentDate);
  const isPast = dayOffset < 0;

  // Sync isToday with dayOffset
  const todayFlag = dayOffset === 0;

  const dayBlocks = ALL_PRODUCTION_BLOCKS[dateKey] || [];

  const visibleMachines = useMemo(() =>
    MACHINES.filter(m => filterType === 'all' || m.type === filterType),
    [filterType]
  );

  // Stats for current day
  const stats = useMemo(() => {
    const total = dayBlocks.length;
    const done  = dayBlocks.filter(b => b.status === 'Concluído').length;
    const late  = dayBlocks.filter(b => b.status === 'Atrasado').length;
    const active = dayBlocks.filter(b => b.status === 'Em Produção').length;
    return { total, done, late, active };
  }, [dayBlocks]);

  const nowOffset = todayFlag ? nowLineOffset() : null;
  const strip = Array.from({ length: 15 }, (_, i) => i - 7);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F7F6FB] overflow-hidden">

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EEEDF5] px-8 py-4 flex items-center justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-xl font-black text-[#2D2D3A] tracking-tight m-0">Programação de Produção</h1>
          <p className="text-xs text-[#8B8BA0] font-semibold mt-0.5">
            {todayFlag ? 'Hoje · ' : isPast ? 'Histórico · ' : 'Planejado · '}
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats strip */}
        <div className="hidden lg:flex items-center gap-4">
          {[
            { label: 'Total', val: stats.total, color: '#6C5CE7' },
            { label: 'Concluídos', val: stats.done, color: '#00B894' },
            { label: 'Em Produção', val: stats.active, color: '#2DC88E' },
            { label: 'Atrasados', val: stats.late, color: '#FF4757' },
          ].map(s => (
            <div key={s.label} className="text-center px-4 py-1 rounded-xl bg-[#F7F6FB] border border-[#EEEDF5]">
              <div className="text-[20px] font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[9px] font-bold text-[#A0A0B0] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Machine type filter */}
        <div className="flex items-center bg-[#F4F3F8] rounded-xl p-1 gap-1">
          {(['all', 'Sakurai', 'Atima'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterType === t ? 'bg-white text-[#2D2D3A] shadow-sm' : 'text-[#8B8BA0]'}`}
            >
              {t === 'all' ? 'Todas' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── DATE NAV (compacta) ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EEEDF5] px-8 py-3 flex items-center gap-3 shrink-0">
        {/* Seta anterior */}
        <button
          onClick={() => setDayOffset(d => d - 1)}
          className="p-2 rounded-xl text-[#6B6B80] hover:bg-[#F4F3F8] border border-[#EEEDF5] transition-all active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Label do dia atual */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              todayFlag ? 'text-[#6C5CE7]' : isPast ? 'text-[#8B8BA0]' : 'text-[#00B894]'
            }`}>
              {todayFlag ? '● Hoje' : isPast ? '← Histórico' : '→ Planejado'}
            </span>
            <span className="text-base font-black text-[#2D2D3A] capitalize">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
            </span>
          </div>

          {!todayFlag && (
            <button
              onClick={() => setDayOffset(0)}
              className="text-[11px] font-black text-[#6C5CE7] hover:underline ml-2"
            >
              Voltar a Hoje
            </button>
          )}
        </div>

        {/* Botão calendário — expande o strip */}
        <button
          onClick={() => setShowStrip(s => !s)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-black transition-all ${
            showStrip
              ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md'
              : 'bg-white text-[#6B6B80] border-[#EEEDF5] hover:border-[#6C5CE7] hover:text-[#6C5CE7]'
          }`}
        >
          <Calendar size={14} /> Calendário
        </button>

        {/* Seta próximo */}
        <button
          onClick={() => setDayOffset(d => d + 1)}
          className="p-2 rounded-xl text-[#6B6B80] hover:bg-[#F4F3F8] border border-[#EEEDF5] transition-all active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ── DATE STRIP (colapsável) ──────────────────────────────────────────── */}
      {showStrip && (
        <div className="bg-white border-b border-[#EEEDF5] px-8 py-3 flex items-center gap-1 overflow-x-auto shrink-0 animate-in slide-in-from-top-2 duration-200">
          {strip.map(offset => {
            const d = offsetDate(today, offset);
            const isActive = offset === dayOffset;
            const isFt = offset > 0;
            return (
              <button
                key={offset}
                onClick={() => { setDayOffset(offset); setShowStrip(false); }}
                className={`shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl text-center transition-all min-w-[52px]
                  ${ isActive
                      ? 'bg-[#6C5CE7] text-white shadow-md'
                      : offset === 0
                      ? 'bg-[#6C5CE710] text-[#6C5CE7] border border-[#6C5CE730]'
                      : 'text-[#8B8BA0] hover:bg-[#F4F3F8]'
                  }`}
              >
                <span className={`text-[9px] font-bold uppercase ${
                  isActive ? 'text-white/70' : isFt ? 'text-[#A0A0B0]' : 'text-[#A0A0B0]'
                }`}>
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                </span>
                <span className="text-[15px] font-black leading-tight">{d.getDate()}</span>
                {offset === 0 && (
                  <span className={`text-[7px] font-black uppercase ${
                    isActive ? 'text-white/80' : 'text-[#6C5CE7]'
                  }`}>Hoje</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── GRID ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-max flex">

          {/* Hour column */}
          <div className="sticky left-0 z-20 w-16 shrink-0 bg-[#F7F6FB] border-r border-[#EEEDF5]">
            {/* Corner */}
            <div className="sticky top-0 z-30 h-14 bg-[#F7F6FB] border-b border-[#EEEDF5]" />
            <div className="relative" style={{ height: `${HOURS.length * CELL_H}px` }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full border-b border-[#EEEDF5]"
                  style={{ top: `${(h - 6) * CELL_H}px`, height: `${CELL_H}px` }}
                >
                  <span className="text-[10px] font-bold text-[#B0B0C0] absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#F7F6FB] px-1">
                    {String(h).padStart(2, '0')}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Machine group columns */}
          {(['Sakurai', 'Atima'] as const).map(groupType => {
            const groupMachines = visibleMachines.filter(m => m.type === groupType);
            if (groupMachines.length === 0) return null;

            const groupColor = groupType === 'Sakurai' ? '#6C5CE7' : '#00B894';
            const groupBg    = groupType === 'Sakurai' ? '#F4F3FD' : '#EEFAF5';

            return (
              <div key={groupType} className="flex border-r-2 border-[#EEEDF5]">
                {groupMachines.map((machine, mi) => {
                  const machineBlocks = dayBlocks.filter(b => b.machineId === machine.id);

                  return (
                    <div key={machine.id} className="w-[188px] shrink-0 flex flex-col border-r border-[#EEEDF5] last:border-r-0">
                      {/* Machine header */}
                      <div
                        className="sticky top-0 z-20 h-14 flex flex-col items-center justify-center px-2 border-b border-[#EEEDF5]"
                        style={{ background: mi === 0 ? groupBg : 'white' }}
                      >
                        {mi === 0 && (
                          <div className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: groupColor }}>
                            {groupType}
                          </div>
                        )}
                        <div className="text-[12px] font-black text-[#2D2D3A]">{machine.name}</div>
                        <div className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-px rounded-full mt-0.5 ${
                          machine.status === 'Online'     ? 'bg-[#E6F8F3] text-[#00B894]' :
                          machine.status === 'Manutenção' ? 'bg-[#FFF7E6] text-[#9A7B0A]' :
                                                            'bg-[#F0F0F5] text-[#9090A0]'
                        }`}>
                          {machine.status}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div
                        className="relative"
                        style={{ height: `${HOURS.length * CELL_H}px`, background: machine.status === 'Offline' ? '#FAFAFA' : 'white' }}
                      >
                        {/* Hour lines */}
                        {HOURS.map(h => (
                          <div
                            key={h}
                            className="absolute w-full border-b border-[#F0F0F5]"
                            style={{ top: `${(h - 6) * CELL_H}px`, height: `${CELL_H}px` }}
                          />
                        ))}

                        {/* NOW line */}
                        {nowOffset !== null && (
                          <div
                            className="absolute w-full z-10 pointer-events-none"
                            style={{ top: `${nowOffset}px`, borderTop: '2px dashed #FF4757' }}
                          />
                        )}

                        {/* Offline overlay */}
                        {machine.status === 'Offline' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#C0C0D0] -rotate-12 tracking-widest">OFFLINE</span>
                          </div>
                        )}

                        {/* Production blocks */}
                        {machineBlocks.map(block => (
                          <BlockCard key={block.id} block={block} machines={MACHINES} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LEGEND ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-[#EEEDF5] px-8 py-2.5 flex items-center gap-6 shrink-0">
        <span className="text-[10px] font-black text-[#A0A0B0] uppercase tracking-wider mr-2">Status:</span>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
            <span className="text-[11px] font-bold text-[#6B6B80]">{key}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 border-t-2 border-dashed border-[#FF4757]" />
          <span className="text-[11px] font-bold text-[#6B6B80]">Horário atual</span>
        </div>
      </div>
    </div>
  );
}
