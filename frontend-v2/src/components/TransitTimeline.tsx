/**
 * TransitTimeline.tsx
 * Componente reutilizável de "Timeline de Trânsito"
 * Exibe previsão de entrada de materiais do setor anterior.
 * Usado em todas as páginas de processo da cadeia produtiva.
 */
import { Calendar, Lock } from 'lucide-react';

export interface TransitItem {
  ref: string;
  cliente: string;
  produto: string;
  origemSetor: string;
  slaHoras: number;
}

interface TransitTimelineProps {
  items: TransitItem[];       // itens reais em trânsito
  minItems?: number;          // mínimo de cards exibidos (padrão: 3)
  titulo?: string;            // texto secundário opcional
}

export function TransitTimeline({ items, minItems = 3, titulo }: TransitTimelineProps) {
  if (items.length === 0) return null;

  const count = Math.max(minItems, items.length);

  return (
    <div className="mb-8 bg-white border border-[#E8E6F0] rounded-2xl overflow-hidden shadow-lg shadow-[#6C5CE7]/5 ring-4 ring-[#6C5CE7]/5 transition-all duration-700 hover:shadow-xl hover:shadow-[#6C5CE7]/10 animate-in slide-in-from-bottom-4 duration-500">
      {/* Cabeçalho */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#F8F7FC] to-white border-b border-[#E8E6F0] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#6C5CE7] bg-opacity-10 flex items-center justify-center text-[#6C5CE7]">
          <Calendar size={16} />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#2D2D3A] uppercase tracking-wider mb-0.5">
            Timeline de Trânsito
          </h3>
          <p className="text-[10px] font-bold text-[#8B8BA0]">
            {titulo ?? 'Previsão de entrada de materiais do setor anterior'}
          </p>
        </div>
      </div>

      {/* Cards horizontais */}
      <div className="p-6 overflow-hidden">
        <div className="relative flex items-start gap-6 overflow-x-auto pb-4 pt-4 px-2 snap-x">
          {/* Linha tracejada horizontal */}
          <div className="absolute top-[27px] left-0 right-0 border-t-[3px] border-dashed border-[#EEEDF5] z-0" />

          {[...Array(count)].map((_, i) => {
            const task = items[i % items.length];
            const h = 13 + i + Math.floor((30 + i * 45) / 60);
            const m = String((30 + i * 45) % 60).padStart(2, '0');

            return (
              <div key={i} className="relative group flex flex-col items-center shrink-0 w-[300px] z-10 snap-center">
                {/* Ponto na linha */}
                <div className="w-[22px] h-[22px] rounded-full border-[4px] border-white bg-[#A0A0B0] ring-1 ring-[#D0D0E0] group-hover:bg-[#6C5CE7] group-hover:ring-[#6C5CE7] transition-colors mb-4 z-10" />

                <div className="w-full bg-[#F8F8FC] rounded-2xl p-4 border border-[#F0F0F5] transition-all duration-300 hover:border-[#D0D0E0] hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex flex-col gap-3">

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black text-[#A0A0B0] bg-white px-2 py-0.5 rounded border border-[#E8E6F0] tracking-wider uppercase">
                          {task.ref}
                        </span>
                        <span className="text-[10px] font-bold text-[#8B8BA0] flex items-center gap-1">
                          Saindo de:
                          <span className="bg-[#FFF4F1] text-[#E17055] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock size={10} /> {task.origemSetor}
                          </span>
                        </span>
                      </div>
                      <h4 className="text-base font-black text-[#2D2D3A] m-0 mb-1 leading-tight truncate">
                        {task.cliente}
                      </h4>
                      <span className="text-xs text-[#8B8BA0] font-medium block truncate">
                        {task.produto}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#E8E6F0]">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-[#8B8BA0] mb-0.5">Entrada</span>
                        <div className="text-sm font-black text-[#2D2D3A] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                          Hoje às {h}:{m}
                        </div>
                      </div>
                      <div className="text-[9px] font-bold text-[#A0A0B0] text-right">
                        <span className="block text-[#6C5CE7] font-black">{task.slaHoras}h</span>
                        Lead Time
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
