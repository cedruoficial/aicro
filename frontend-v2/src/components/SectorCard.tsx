import { useNavigate } from 'react-router-dom';
import type { Sector } from '../types';
import { statusColor } from '../data/constants';

interface SectorCardProps {
  sector: Sector;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SectorCard({ sector, isExpanded, onToggle }: SectorCardProps) {
  const navigate = useNavigate();
  const hasAlert = sector.subSectors.some(s => s.status !== 'ativo');
  const totalTasks = sector.subSectors.reduce((sum, s) => sum + s.tasks, 0);

  return (
    <div
      onClick={onToggle}
      className={`bg-white rounded-2xl border-2 cursor-pointer overflow-hidden
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isExpanded ? 'col-span-full' : 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}
      `}
      style={{
        borderColor: isExpanded ? sector.color : 'transparent',
        boxShadow:   isExpanded ? `0 8px 32px ${sector.color}20` : undefined,
      }}
    >
      {/* Header */}
      <div className="p-5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${sector.color}12` }}>
            {sector.icon}
          </div>
          <div>
            <div className="text-base font-bold text-[#2D2D3A]">{sector.name}</div>
            <div className="text-xs text-[#8B8BA0] mt-0.5 font-medium">{sector.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasAlert && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4757] animate-pulse"
              style={{ boxShadow: '0 0 0 3px #FF475720' }} />
          )}
          <span className="py-1 px-3 rounded-full text-xs font-bold"
            style={{ background: `${sector.color}12`, color: sector.color }}>
            {totalTasks} tarefas
          </span>
          <span className={`text-lg text-[#C0C0D0] font-bold transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </div>

      {/* Sub-setores — grid de cards clicáveis */}
      {isExpanded && (
        <div
          className="px-6 pb-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3"
          onClick={e => e.stopPropagation()}
        >
          {sector.subSectors.map((sub, idx) => {
            const subId = sub.name.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');

            return (
              <div
                key={idx}
                onClick={() => navigate(`/setor/${sector.id}/${subId}`)}
                className="group p-4 px-5 rounded-xl bg-[#F8F7FC] border border-[#EEEDF5]
                  flex items-center gap-3.5 cursor-pointer
                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ ['--hover-bg' as string]: `${sector.color}08` }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${sector.color}08`;
                  e.currentTarget.style.borderColor = `${sector.color}40`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F8F7FC';
                  e.currentTarget.style.borderColor = '#EEEDF5';
                }}
              >
                <span className="text-xl">{sub.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#2D2D3A] truncate">{sub.name}</div>
                  <div className="text-[11px] text-[#8B8BA0] mt-0.5">{sub.tasks} tarefas ativas</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 rounded-full" style={{
                    background: statusColor[sub.status],
                    boxShadow: sub.status !== 'ativo' ? `0 0 0 3px ${statusColor[sub.status]}30` : 'none',
                  }} />
                  <span className="text-[#C0C0D0] text-sm group-hover:text-[#8B8BA0] transition-colors">›</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
