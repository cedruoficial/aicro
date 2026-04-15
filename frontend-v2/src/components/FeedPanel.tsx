import { useState, useEffect, useRef } from 'react';

import { FEED_EVENTS, SECTORS } from '../data/mock';
import type { FeedEvent } from '../types';
import { typeConfig } from '../data/constants';
import { AlertCircle, User, Target, Box, Wrench, Clock, PlayCircle, UserPlus, FileSearch, BellRing, History } from 'lucide-react';

// Generates fake random events to keep the feed moving
function generateFakeEvent(idCounter: number): FeedEvent {
  const templates = [
    { type: 'aprovado', sector: 'Qualidade', msg: 'Amostra liberada para produção em lote', detail: 'Testes físicos OK.' },
    { type: 'info', sector: 'PCP', msg: 'Ajuste fino no setup da máquina finalizado', detail: 'Impressora #3 operando com tinta Cromo.' },
    { type: 'alerta', sector: 'Expedição', msg: 'Atraso na coleta Jadlog', detail: 'Motorista reportou atraso de 40min na rota.' },
    { type: 'info', sector: 'Laboratório', msg: 'Nova batida de tinta Cromo aprovada', detail: 'Lote TK-990.' }
  ] as const;
  
  const t = templates[idCounter % templates.length];
  const now = new Date();
  
  return {
    id: idCounter,
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: t.type,
    sector: t.sector,
    message: t.msg,
    detail: t.detail,
    notifyTo: [],
  };
}

export function FeedPanel() {
  const [selectedFeedItem, setSelectedFeedItem] = useState<number | null>(null);
  const [liveFeed, setLiveFeed] = useState<FeedEvent[]>(FEED_EVENTS);
  const idRef = useRef(100);

  // Simulation of incoming real-time feed updates
  useEffect(() => {
    const int = setInterval(() => {
      idRef.current += 1;
      const newEvt = generateFakeEvent(idRef.current);
      setLiveFeed(prev => [newEvt, ...prev].slice(0, 50)); // keep last 50
    }, 1500); // 1.5 seconds tick (Dinamismo total)

    return () => clearInterval(int);
  }, []);

  return (
    <div className="bg-[#1A1825]/80 backdrop-blur-xl rounded-[32px] border border-[#2D2B3A] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden sticky top-[88px] h-[calc(100vh-112px)] group">
      {/* Glow effect backgrounds */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6C5CE710] blur-[80px] rounded-full group-hover:bg-[#6C5CE720] transition-colors duration-700"></div>

      {/* Header */}
      <div className="p-6 px-8 border-b border-[#2D2B3A] flex items-center justify-between shrink-0 bg-[#1A1825]/40">
        <div>
          <h2 className="text-lg font-black m-0 text-white flex items-center gap-3 tracking-tight">
            Feed em Tempo Real
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B894] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B894]"></span>
            </span>
          </h2>
          <p className="text-xs text-[#6B6B80] mt-1 font-bold uppercase tracking-widest">Painel de Operações Live</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pt-2 pb-6 pr-1 custom-scrollbar-dark">
        {liveFeed.map((event, idx) => {
          const config = typeConfig[event.type];
          const isSelected = selectedFeedItem === event.id;
          const isNewest = idx === 0;

          return (
            <div
              key={event.id}
              onClick={() => setSelectedFeedItem(isSelected ? null : event.id)}
              className={`p-4 px-8 border-l-4 mb-px cursor-pointer transition-all duration-500 relative group/item
                ${isNewest ? 'animate-in slide-in-from-top-4 fade-in-0 duration-500' : ''}
              `}
              style={{
                borderLeftColor: config.color,
                background: isSelected ? `${config.color}15` : 'transparent',
              }}
            >
              {/* Event Meta */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] text-[#6B6B80] font-black tracking-widest tabular-nums italic">
                  {event.time}
                </span>
                <span 
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm"
                  style={{ background: `${config.color}20`, color: config.color, border: `1px solid ${config.color}30` }}
                >
                  <span className="scale-90">{config.icon}</span>
                  {config.label}
                </span>
                <span className="text-[10px] text-[#A0A0B0] font-bold uppercase tracking-tight opacity-60">
                  {event.sector}
                </span>
              </div>

              {/* Message */}
              <div className={`text-[14px] font-bold leading-relaxed transition-colors duration-300 ${isSelected ? 'text-white' : 'text-[#C0C0D0] group-hover/item:text-white'}`}>
                {event.message}
              </div>

              {/* Details (Expanded) */}
              {isSelected && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                  {event.type === 'reprovado' ? (
                    <div className="bg-[#13111C] border rounded-2xl overflow-hidden shadow-2xl mb-4" style={{ borderColor: `${config.color}40` }}>
                      <div className="px-4 py-3 border-b flex justify-between items-center bg-[#1A1825]" style={{ borderColor: `${config.color}20` }}>
                        <span className="text-[11px] font-black flex items-center gap-2 tracking-widest uppercase" style={{ color: config.color }}>
                          <AlertCircle size={14} strokeWidth={3}/> Ação Corretiva
                        </span>
                        {event.priority && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${event.priority === 'ALTA' ? 'bg-[#FF4757] text-white' : 'bg-[#FDCB6E] text-[#1A1825]'}`}>
                            {event.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="flex items-center gap-1.5 text-[#6B6B80] font-black text-[9px] uppercase tracking-widest mb-1.5"><User size={12} /> Responsáveis</span>
                            <span className="font-bold text-[#C0C0D0] text-[12px] block bg-[#222030] p-1.5 rounded-lg border border-[#2D2B3A]">{event.responsibles}</span>
                          </div>
                          <div>
                            <span className="flex items-center gap-1.5 text-[#6B6B80] font-black text-[9px] uppercase tracking-widest mb-1.5"><Target size={12} /> Onde Atuar</span>
                            <span className="font-bold text-[#C0C0D0] text-[12px] block bg-[#222030] p-1.5 rounded-lg border border-[#2D2B3A]">{event.whereToAct}</span>
                          </div>
                        </div>

                        <div>
                          <span className="flex items-center gap-1.5 text-[#6B6B80] font-black text-[9px] uppercase tracking-widest mb-1.5"><Wrench size={12} /> Ação Requerida</span>
                          <span className="font-extrabold text-white text-[13px] leading-snug block bg-[#6C5CE710] border border-[#6C5CE720] p-2.5 rounded-xl">{event.actionRequired}</span>
                        </div>

                        {event.deadline && (
                          <div className="pt-3 border-t border-[#2D2B3A] flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#FF4757] font-black text-[11px] uppercase tracking-widest">
                              <Clock size={14} strokeWidth={3} /> Prazo: {event.deadline}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="bg-[#1A1825] p-3 border-t border-[#2D2B3A] flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5A4BCE] text-white text-[11px] font-black p-2.5 rounded-xl transition-all shadow-lg shadow-[#6C5CE720]">
                          <PlayCircle size={14} /> INICIAR
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-[#2D2B3A] hover:bg-[#3D3B4A] text-[#A0A0B0] text-[11px] font-black p-2.5 rounded-xl border border-[#3D394D] transition-all">
                          LAUDO
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#A0A0B0] font-medium leading-[1.6] p-4 bg-[#13111C] border border-[#2D2B3A] rounded-2xl mb-3 shadow-inner">
                      {event.detail}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 px-8 border-t border-[#2D2B3A] bg-[#1A1825]/60 backdrop-blur-md flex justify-between items-center shrink-0">
        <button className="flex items-center gap-2.5 py-3 px-5 rounded-2xl bg-[#F6C94820] border border-[#F6C94840] hover:bg-[#F6C94830] text-[#F6C948] transition-all group/btn">
          <BellRing size={16} className="group-hover/btn:animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest">Histórico</span>
        </button>

        <button className="flex items-center gap-2.5 py-3 px-5 rounded-2xl text-[#6B6B80] hover:text-white hover:bg-[#2D2B3A] transition-all font-black text-[10px] uppercase tracking-widest">
          <History size={16} /> Full Log
        </button>
      </div>

      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #2D2B3A; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #6C5CE7; }
      `}</style>
    </div>
  );
}
