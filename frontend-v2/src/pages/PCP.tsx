import { useState, useMemo, useEffect } from 'react';
import { ALL_PRODUCTION_BLOCKS, MACHINES } from '../data/mockPCP';
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarDays, Droplet, Layers, Printer, X } from 'lucide-react';
import type { ProductionBlock } from '../types/pcp';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function offsetDate(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d;
}

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

const CLIENT_COLORS: Record<string, { bg: string; text: string, shadow: string; border: string }> = {
  'Aniger':    { bg: '#00B894', text: '#FFFFFF', shadow: '#00B89440', border: '#00A785' },
  'Dakota':    { bg: '#6C5CE7', text: '#FFFFFF', shadow: '#6C5CE740', border: '#5A4BCE' },
  'Bibi':      { bg: '#FF4757', text: '#FFFFFF', shadow: '#FF475740', border: '#E03646' },
  'Vulcabras': { bg: '#FDCB6E', text: '#2D2D3A', shadow: '#FDCB6E40', border: '#EBB85C' },
  'Dass':      { bg: '#0984E3', text: '#FFFFFF', shadow: '#0984E340', border: '#0873C7' },
  'Pegada':    { bg: '#E17055', text: '#FFFFFF', shadow: '#E1705540', border: '#CE654B' },
  'Pampili':   { bg: '#E84393', text: '#FFFFFF', shadow: '#E8439340', border: '#D43C86' },
  'Olympikus': { bg: '#2D3436', text: '#FFFFFF', shadow: '#2D343640', border: '#212628' },
};

// Layout Configs
const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 → 20:00
const CELL_H = 75; // px por hora, maior para ficar bonito e legível

function getBlockStyle(block: ProductionBlock) {
  const s = new Date(block.programadoInicio);
  const e = new Date(block.programadoFim);
  const startMin = s.getHours() * 60 + s.getMinutes() - 6 * 60;
  const endMin   = e.getHours() * 60 + e.getMinutes() - 6 * 60;
  
  const top = Math.max(0, (startMin / 60) * CELL_H);
  let height = ((endMin - startMin) / 60) * CELL_H;
  
  // Garantir altura mínima para clicar
  height = Math.max(28, height - 3); 

  return { top: `${top}px`, height: `${height}px` };
}

// ─── Linha de tempo atual (Sincronizada em Tempo Real) ───────────────────────
function getNowOffset(): number {
  const now = new Date();
  const hrs = now.getHours() + now.getMinutes() / 60 - 6;
  return Math.max(0, hrs * CELL_H);
}

// ─── Modal com a Ordem de Produção (Passadas e Tintas) ────────────────────────
function ProductionModal({ block, onClose }: { block: ProductionBlock, onClose: () => void }) {
  const colors = CLIENT_COLORS[block.client] || { bg: '#A0A0B0', text: '#FFFFFF', shadow: '#A0A0B040', border: '#8A8A9A' };
  const [confirmedOps, setConfirmedOps] = useState<Record<string, boolean>>({});

  const toggleConfirm = (opId: string) => {
    setConfirmedOps(prev => ({ ...prev, [opId]: !prev[opId] }));
  };
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        
        {/* Header Colorido da Ordem */}
        <div className="px-8 py-6 shrink-0 relative" style={{ background: colors.bg, color: colors.text }}>
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all">
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-1 rounded-full">
              OP: {block.reference}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest bg-black/20 px-2 py-1 rounded-full">
              {block.status}
            </span>
          </div>
          <h2 className="text-3xl font-black mb-1 drop-shadow-sm">{block.client}</h2>
          <p className="opacity-90 font-medium text-sm drop-shadow-sm">{block.product}</p>
        </div>

        {/* Tabela Branca de Operações e Tintas */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F7F6FB] custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-lg font-black text-[#2D2D3A]">Plano de Passadas & Colorimetria</h3>
            <p className="text-sm text-[#8B8BA0]">Detalhamento de estabilização, necessidades de tinta e montagem.</p>
          </div>

          <div className="bg-white border border-[#EEEDF5] rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F7FC] border-b border-[#EEEDF5]">
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0]">Operação / Tinta</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0] text-center w-16">Tela</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0] text-right">Nec. Prevista</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0]">Setup de Montagem</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0] text-right w-24">Impressões</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#8B8BA0] text-center w-32">Confirmação</th>
                </tr>
              </thead>
              <tbody>
                {block.operations ? block.operations.map((op) => {
                  const isConfirmed = confirmedOps[op.id];
                  return (
                  <tr key={op.id} className={`border-b border-[#EEEDF5] last:border-b-0 transition-colors ${isConfirmed ? 'bg-green-50/50' : 'hover:bg-[#FAFAFC]'}`}>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-2.5">
                        <Droplet size={16} className={`mt-0.5 shrink-0 ${isConfirmed ? 'text-green-500' : 'text-[#6C5CE7]'}`} />
                        <span className={`text-[12px] font-bold uppercase tracking-tight ${isConfirmed ? 'text-green-700' : 'text-[#2D2D3A]'}`}>{op.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <span className="inline-flex items-center justify-center bg-[#F4F3F8] border border-[#EEEDF5] text-[#2D2D3A] text-[11px] font-black h-7 px-2.5 rounded-lg">
                        {op.screen}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <div className={`text-[13px] font-black ${isConfirmed ? 'text-green-600' : 'text-[#00B894]'}`}>
                        {Math.min(op.inkNeeded, 3.0).toFixed(3)} kg
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start gap-2 text-[12px] font-medium text-[#6B6B80] leading-snug">
                        <Layers size={14} className="text-[#A0A0B0] mt-0.5 shrink-0" />
                        {op.passesInfo}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[12px] font-black text-[#2D2D3A]">
                        <Printer size={14} className="text-[#A0A0B0]" />
                        {op.impressions}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-center">
                      <button 
                        onClick={() => toggleConfirm(op.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 mx-auto border-2 ${
                          isConfirmed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-[#EEEDF5] text-[#8B8BA0] hover:border-[#00B894] hover:text-[#00B894]'
                        }`}
                      >
                        {isConfirmed ? 'CONCLUÍDO' : 'CONFIRMAR'}
                      </button>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm font-medium text-[#A0A0B0]">
                      Nenhuma especificação de tinta atrelada a esta Ordem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cartão de Bloco de Agenda ────────────────────────────────────────────────
function BlockCard({ block, onClick }: { block: ProductionBlock, onClick: () => void }) {
  const colors = CLIENT_COLORS[block.client] || { bg: '#A0A0B0', text: '#FFFFFF', shadow: '#A0A0B040', border: '#8A8A9A' };
  const style = getBlockStyle(block);
  
  const start = new Date(block.programadoInicio);
  const fmtTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Padrão de textura para blocos atrasados ou em pausa
  const isLate = block.status === 'Atrasado';
  const bgTexture = isLate 
    ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px), ${colors.bg}`
    : colors.bg;

  return (
    <div
      onClick={onClick}
      className="absolute left-1.5 right-1.5 rounded-[10px] overflow-hidden cursor-pointer transition-all hover:z-20 hover:scale-[1.03] group"
      style={{
        ...style,
        background: bgTexture,
        borderLeft: `5px solid ${colors.border}`,
        boxShadow: `0 4px 12px ${colors.shadow}`,
        color: colors.text
      }}
    >
      {/* Barra de Progresso Suave Escurecida */}
      {block.progress > 0 && block.progress < 100 && (
        <div className="absolute top-0 left-0 bottom-0 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.15)', width: `${block.progress}%` }} />
      )}
      
      {/* Ícone de Atraso */}
      {isLate && (
        <div className="absolute top-1 right-1.5">
          <AlertTriangle size={14} className="text-white drop-shadow-md animate-pulse" />
        </div>
      )}
      
      <div className="relative z-10 px-2.5 py-1.5 flex flex-col h-full pointer-events-none text-shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-wider opacity-90 drop-shadow-sm leading-tight">
          {fmtTime(start)} <span className="opacity-60">-</span> {block.client}
        </div>
        <div className="text-[11px] font-bold leading-tight mt-0.5 max-h-[2.4em] overflow-hidden text-ellipsis drop-shadow-sm line-clamp-2">
          {block.product}
        </div>
        
        {/* Info Condicional (Apenas aparece no hover via CSS se houver espaço) */}
        <div className="mt-auto pt-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] uppercase tracking-wider font-bold bg-black/20 px-1.5 py-px rounded backdrop-blur">
            {block.reference}
          </span>
          <span className="text-[9px] uppercase font-black tracking-wider">
            {block.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}


// ─── Main PCP Agenda ──────────────────────────────────────────────────────────
export function PCP() {
  const today = useMemo(() => new Date(), []);
  const [dayOffset, setDayOffset] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'Sakurai' | 'Atima'>('all');
  const [selectedBlock, setSelectedBlock] = useState<ProductionBlock | null>(null);
  
  // Real-time agora ticker
  const [nowOffset, setNowOffset] = useState(() => getNowOffset());

  useEffect(() => {
    const int = setInterval(() => setNowOffset(getNowOffset()), 60000); // 1 minuto update
    return () => clearInterval(int);
  }, []);

  const currentDate = useMemo(() => offsetDate(today, dayOffset), [today, dayOffset]);
  const dateKey = toDateKey(currentDate);
  const isToday = dayOffset === 0;

  const dayBlocks = ALL_PRODUCTION_BLOCKS[dateKey] || [];
  const visibleMachines = useMemo(() =>
    MACHINES.filter(m => filterType === 'all' || m.type === filterType),
    [filterType]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#FAFAFC] overflow-hidden">
      
      {/* ── TOP BAR (Nav & Controls) ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#EEEDF5] shrink-0">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-black text-[#2D2D3A] tracking-tight">Timeline da Fábrica</h1>
              <p className="text-xs text-[#8B8BA0] font-semibold mt-0.5">Visão Diária por Recurso · Histórico Oficial</p>
            </div>
            
            {/* Navegador Estilo Agenda */}
            <div className="flex items-center bg-[#F7F6FB] rounded-xl border border-[#EEEDF5] p-1">
              <button
                onClick={() => setDayOffset(d => d - 1)}
                className="w-8 h-8 flex items-center justify-center text-[#6B6B80] hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button 
                onClick={() => setDayOffset(0)}
                className="px-4 h-8 flex items-center justify-center font-black text-sm tracking-wide hover:bg-white hover:text-[#6C5CE7] hover:shadow-sm transition-all rounded-lg min-w-[140px]"
                style={{ color: isToday ? '#6C5CE7' : '#2D2D3A' }}
              >
                {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace(' de ', '/')}
                {' '}
                <span className="text-[10px] uppercase ml-2 px-1.5 py-0.5 bg-[#EEEDF5] rounded text-[#8B8BA0]">
                  {currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </span>
              </button>
              
              <button
                onClick={() => setDayOffset(d => d + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#6B6B80] hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Botão Hoje */}
            {!isToday && (
              <button
                onClick={() => setDayOffset(0)}
                className="px-3 py-1.5 rounded-lg border border-[#EEEDF5] text-xs font-black text-[#8B8BA0] hover:bg-[#F4F3F8] hover:text-[#2D2D3A]"
              >
                Retornar para o Agora
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sector Tabs */}
            <div className="flex items-center bg-[#F4F3F8] rounded-xl p-1 gap-1">
              {(['all', 'Sakurai', 'Atima'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterType === t ? 'bg-white text-[#2D2D3A] shadow-sm' : 'text-[#8B8BA0] hover:text-[#2D2D3A]'}`}
                >
                  {t === 'all' ? 'Ver Todos' : t}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BCE] text-white rounded-xl text-xs font-black shadow-md shadow-[#6C5CE730] transition-colors">
              <CalendarDays size={14} /> Visão Semanal Macro
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID EIXOS (TIME/CALENDAR) ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto relative custom-scrollbar bg-white">
        
        <div className="min-w-max flex">
          {/* EIXO Y (Horas) Sticky left */}
          <div className="sticky left-0 z-40 w-[60px] shrink-0 bg-white border-r border-[#EEEDF5] shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
            <div className="sticky top-0 z-50 h-10 bg-white" /> {/* spacer header */}
            <div className="relative" style={{ height: `${HOURS.length * CELL_H}px` }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  className="absolute w-full right-0 text-right pr-2"
                  style={{ top: `${(h - 6) * CELL_H}px`, transform: 'translateY(-50%)' }}
                >
                  <span className="bg-white px-1 relative z-10 text-[10px] font-black text-[#A0A0B0]">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNAS (Máquinas) Area */}
          <div className="flex bg-[#FAFAFC]">
            {visibleMachines.map((m) => {
              const blocks = dayBlocks.filter(b => b.machineId === m.id);
              return (
                <div key={m.id} className="w-[200px] shrink-0 flex flex-col border-r border-[#EEEDF5]">
                  {/* Cabeçalho da Máquina - Fixed Top */}
                  <div className="sticky top-0 z-30 h-10 bg-[#F4F3F8] border-b border-[#EEEDF5] flex flex-col items-center justify-center select-none shadow-sm">
                    <div className="text-[11px] font-black tracking-tight text-[#2D2D3A]">
                      {m.name.toUpperCase()}
                    </div>
                    {/* Status da Maquina Condicional (Dot) */}
                    <div className="absolute top-1 right-1">
                       <span className={`block w-2.5 h-2.5 rounded-full ${m.status==='Online'?'bg-[#00B894]':m.status==='Manutenção'?'bg-[#FDCB6E]':'bg-[#FF4757]'}`}/>
                    </div>
                  </div>

                  {/* Body Real (onde rolam os blocos) */}
                  <div className="relative bg-white" style={{ height: `${HOURS.length * CELL_H}px` }}>
                    {/* Grid Lines HZ */}
                    {HOURS.map(h => (
                      <div
                        key={h}
                        className="absolute w-full border-b border-[#EEEDF5]/60"
                        style={{ top: `${(h - 6) * CELL_H}px` }}
                      >
                        {/* Half-hour tick invisivel/suave */}
                        <div className="w-full h-px bg-[#F8F7FC] absolute" style={{ top: `${CELL_H/2}px` }} />
                      </div>
                    ))}

                    {/* RED NOW LINE (Agenda Pulsante Google Style) */}
                    {isToday && nowOffset < HOURS.length * CELL_H && (
                      <div
                        className="absolute w-full z-30 pointer-events-none flex items-center"
                        style={{ top: `${nowOffset}px` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-[#EA4335] absolute -left-1 shadow-[0_0_8px_rgba(234,67,53,0.5)] transform -translate-y-1/2" />
                        <div className="w-full h-[2px] bg-[#EA4335] opacity-90 shadow-sm" />
                      </div>
                    )}

                    {/* Blocos de Produçao da Máquina */}
                    {blocks.map(block => (
                      <BlockCard key={block.id} block={block} onClick={() => setSelectedBlock(block)} />
                    ))}
                    
                    {/* Overlay de Manutenção/Offline */}
                    {m.status !== 'Online' && (
                       <div className="absolute inset-0 bg-[#F0F0F5]/50 flex items-center justify-center backdrop-blur-[1px] pointer-events-none z-20">
                          <span className="text-xl font-black text-[#A0A0B0] opacity-50 -rotate-90 uppercase tracking-widest whitespace-nowrap text-shadow border border-[#A0A0B0]/20 px-8 py-2 rounded-xl backdrop-blur-sm">
                            {m.status}
                          </span>
                       </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {selectedBlock && (
         <ProductionModal block={selectedBlock} onClose={() => setSelectedBlock(null)} />
      )}

      <style>{`
        .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D0D9; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #A0A0B0; }
        
        /* Smooth scrolling for calendar */
        .custom-scrollbar { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
