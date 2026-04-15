import { useState, useEffect, useRef } from 'react';

import { FEED_EVENTS } from '../data/mock';
import type { FeedEvent } from '../types';
import { typeConfig } from '../data/constants';
import { AlertCircle, User, Target, Wrench, Clock, PlayCircle, BellRing, History } from 'lucide-react';

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
    <div className="bg-white rounded-[24px] border border-[#F0F0F5] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden sticky top-[88px] h-[calc(100vh-112px)]">
      {/* Header */}
      <div className="p-5 px-6 border-b border-[#F0F0F5] flex items-center justify-between shrink-0 bg-white">
        <div>
          <h2 className="text-base font-bold m-0 text-[#2D2D3A] flex items-center gap-2">
            Feed em Tempo Real
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B894] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00B894]"></span>
            </span>
          </h2>
          <p className="text-xs text-[#8B8BA0] mt-0.5 font-medium">Sincronizando setor produtivo...</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 pr-1 custom-scrollbar">
        {liveFeed.map((event, idx) => {
          const config = typeConfig[event.type];
          const isSelected = selectedFeedItem === event.id;
          const isNewest = idx === 0;

          return (
            <div
              key={event.id}
              onClick={() => setSelectedFeedItem(isSelected ? null : event.id)}
              className={`p-3.5 px-6 border-l-4 mb-px cursor-pointer transition-all duration-300 
                ${isNewest ? 'animate-in slide-in-from-top-4 fade-in-0 duration-500' : ''}
                ${isSelected ? 'bg-slate-50' : 'hover:bg-[#FAFAFE]'}
              `}
              style={{ borderLeftColor: config.color }}
            >
              {/* Event Meta */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] text-[#A0A0B0] font-semibold tracking-wide tabular-nums">
                  {event.time}
                </span>
                <span 
                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide"
                  style={{ background: `${config.color}14`, color: config.color }}
                >
                  {config.icon} {config.label}
                </span>
                <span className="text-[10px] text-[#C0C0D0] font-medium">
                  {event.sector}
                </span>
              </div>

              {/* Message */}
              <div className="text-[13px] font-semibold text-[#2D2D3A] leading-[1.4]">
                {event.message}
              </div>

              {/* Details (Expanded) */}
              {isSelected && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  {event.type === 'reprovado' ? (
                    <div className="bg-white border rounded-[14px] overflow-hidden shadow-[0_4px_16px_rgba(255,71,87,0.06)] mb-3" style={{ borderColor: `${config.color}40` }}>
                      <div className="px-3 py-2.5 border-b flex justify-between items-center bg-white" style={{ borderColor: `${config.color}20` }}>
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: config.color }}>
                          <AlertCircle size={14} strokeWidth={2.5}/> AÇÃO CORRETIVA IMEDIATA
                        </span>
                        {event.priority && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${event.priority === 'ALTA' ? 'bg-[#FF4757] text-white' : 'bg-[#FDCB6E] text-[#2D2D3A]'}`}>
                            PRIORIDADE {event.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="p-3 bg-[#FAFAFC] text-xs grid grid-cols-1 gap-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="flex items-center gap-1 text-[#8B8BA0] font-semibold text-[10px] mb-0.5"><User size={10} /> RESPONSÁVEIS</span>
                            <span className="font-semibold text-[#2D2D3A] text-[11px]">{event.responsibles}</span>
                          </div>
                          <div>
                            <span className="flex items-center gap-1 text-[#8B8BA0] font-semibold text-[10px] mb-0.5"><Target size={10} /> ONDE ATUAR</span>
                            <span className="font-semibold text-[#2D2D3A] text-[11px]">{event.whereToAct}</span>
                          </div>
                        </div>

                        <div>
                          <span className="flex items-center gap-1.5 text-[#6B6B80] font-black text-[9px] uppercase tracking-widest mb-1.5"><Wrench size={10} /> Ação Requerida</span>
                          <span className="font-bold text-[#2D2D3A] text-[11px] block bg-white border border-[#F0F0F5] p-2 rounded-lg">{event.actionRequired}</span>
                        </div>

                        {event.deadline && (
                          <div className="pt-2 border-t border-[#F0F0F5] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[#FF4757] font-bold text-[11px]">
                              <Clock size={12} /> Prazo: {event.deadline}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="bg-white p-2.5 border-t border-[#F0F0F5] flex gap-2 overflow-x-auto custom-scrollbar">
                        <button className="flex-1 whitespace-nowrap flex items-center justify-center gap-1.5 bg-[#FF4757] hover:bg-[#E84353] text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors">
                          <PlayCircle size={12} /> Iniciar
                        </button>
                        <button className="whitespace-nowrap flex items-center justify-center gap-1.5 bg-[#F4F3F8] hover:bg-[#EAE8F0] text-[#6B6B80] text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors">
                          LAUDO
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B6B80] leading-[1.5] p-2 px-3 bg-[#F8F7FC] rounded-lg mb-2">
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
      <div className="p-4 px-6 border-t border-[#F0F0F5] bg-[#FAFAFC] flex justify-between items-center shrink-0">
        <button className="flex items-center gap-2 py-2 px-3 rounded-xl bg-white border border-[#EEEDF5] hover:border-[#F6C948] hover:bg-[#FFFBEE] text-[#9A7B0A] shadow-sm transition-all shadow-yellow-100">
          <BellRing size={14} className="text-[#F6C948]" />
          <span className="text-xs font-black tracking-tight uppercase">Histórico</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded-xl text-[#0984E3] hover:bg-[#0984E310] transition-colors font-bold text-xs uppercase">
          <History size={14} /> Full Log
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D0D0E0; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A0A0B0; }
      `}</style>
    </div>
  );
}
