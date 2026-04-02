import { useState } from 'react';

import { FEED_EVENTS, SECTORS } from '../data/mock';
import { typeConfig } from '../data/constants';
import { AlertCircle, User, Target, Box, Wrench, Clock, PlayCircle, UserPlus, FileSearch } from 'lucide-react';

export function FeedPanel() {
  const [selectedFeedItem, setSelectedFeedItem] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden sticky top-[88px] h-[calc(100vh-112px)]">
      {/* Header */}
      <div className="p-5 px-6 border-b border-[#F0F0F5] flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold m-0 text-[#2D2D3A]">Feed em Tempo Real</h2>
          <p className="text-xs text-[#8B8BA0] mt-0.5 font-medium">Atualizações da cadeia produtiva</p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#00B894] shadow-[0_0_0_3px_#00B89420]" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 pr-1 custom-scrollbar">
        {FEED_EVENTS.map(event => {
          const config = typeConfig[event.type];
          const isSelected = selectedFeedItem === event.id;

          return (
            <div
              key={event.id}
              onClick={() => setSelectedFeedItem(isSelected ? null : event.id)}
              className="p-3.5 px-6 border-l-4 mb-px cursor-pointer transition-all duration-200"
              style={{
                borderLeftColor: config.color,
                background: isSelected ? config.bg : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#FAFAFE';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
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
                          <span className="flex items-center gap-1 text-[#8B8BA0] font-semibold text-[10px] mb-0.5"><Box size={10} /> IDENTIFICAÇÃO DO MATERIAL</span>
                          <span className="font-medium text-[#2D2D3A] text-[11px] bg-white border border-[#F0F0F5] px-2 py-1 rounded inline-block">{event.materialId}</span>
                        </div>

                        <div>
                          <span className="flex items-center gap-1 text-[#8B8BA0] font-semibold text-[10px] mb-0.5"><Wrench size={10} /> AÇÃO REQUERIDA</span>
                          <span className="font-semibold text-[#2D2D3A] text-[12px] leading-tight block">{event.actionRequired}</span>
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
                          <UserPlus size={12} /> Atribuir
                        </button>
                        <button className="whitespace-nowrap flex items-center justify-center gap-1.5 bg-[#F4F3F8] hover:bg-[#EAE8F0] text-[#6B6B80] text-[11px] font-bold py-1.5 px-3 rounded-lg transition-colors">
                          <FileSearch size={12} /> Laudo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6B6B80] leading-[1.5] p-2 px-3 bg-[#F8F7FC] rounded-lg mb-2">
                      {event.detail}
                    </div>
                  )}

                  {event.notifyTo.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] text-[#A0A0B0] font-bold flex items-center mr-1 uppercase tracking-wide">
                        Notificado:
                      </span>
                      {event.notifyTo.map((sId) => {
                        const s = SECTORS.find(sec => sec.id === sId);
                        return s ? (
                          <span 
                            key={sId} 
                            className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide"
                            style={{ background: `${s.color}14`, color: s.color }}
                          >
                            {s.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 px-6 border-t border-[#F0F0F5] flex items-center justify-between shrink-0">
        <span className="text-xs text-[#A0A0B0] font-extrabold uppercase tracking-wider">
          {FEED_EVENTS.length} eventos hoje
        </span>
        <button className="py-2 px-4 rounded-lg border-none bg-[#6C5CE7] hover:bg-[#5A4BCE] transition-colors text-white text-xs font-bold cursor-pointer shadow-[0_2px_8px_rgba(108,92,231,0.25)]">
          Ver Histórico
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
