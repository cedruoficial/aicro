import { useState, useMemo } from 'react';
import { getMockTpuJobs } from '../data/mockTPU';
import type { TPUJob, TPUGroupedMaterial } from '../types/tpu';
import { Target, AlertCircle, Clock, Zap, CheckCircle2, User, Factory, Cpu, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export function TPU() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Manual' | 'Rotativa'>('Todos');
  const [dayOffset, setDayOffset] = useState(0);
  
  const currentDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);
  const isToday = dayOffset === 0;
  
  const currentJobs = useMemo(() => getMockTpuJobs(dayOffset), [dayOffset]);

  // Filtragem e Agrupamento
  const groupedData = useMemo(() => {
    let filtered = currentJobs;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.material.toLowerCase().includes(lowerSearch) ||
        job.reference.toLowerCase().includes(lowerSearch) ||
        job.client.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterType !== 'Todos') {
      filtered = filtered.filter(job => job.machineType === filterType);
    }

    const groups = new Map<string, TPUGroupedMaterial>();

    filtered.forEach(job => {
      if (!groups.has(job.material)) {
        groups.set(job.material, { materialName: job.material, jobs: [], totalRequested: 0, totalProduced: 0 });
      }
      const group = groups.get(job.material)!;
      group.jobs.push(job);
      group.totalRequested += job.quantityRequested;
      group.totalProduced += job.quantityProduced;
    });

    return Array.from(groups.values());
  }, [currentJobs, searchTerm, filterType]);

  const totalEmProducao = currentJobs.filter(j => j.status === 'Em Produção').length;
  const producaoGeral = currentJobs.reduce((acc, obj) => acc + obj.quantityProduced, 0);
  const metaGeral = currentJobs.reduce((acc, obj) => acc + obj.quantityRequested, 0);
  const progressoGeral = metaGeral > 0 ? (producaoGeral / metaGeral) * 100 : 0;

  const dateLabel = dayOffset === 0 ? 'HOJE' : dayOffset === 1 ? 'AMANHÃ' : dayOffset === -1 ? 'ONTEM' : currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace(' de ', '/');

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#F4F3F8] font-sans pb-10">
      {/* HEADER PAGE */}
      <div className="bg-white border-b border-[#E8E6F0] px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight flex items-center gap-2">
            <Factory className="text-[#6C5CE7]" size={26} />
            PCP Fabril · TPU
          </h1>
          <p className="text-[#6B6B80] text-sm mt-1 font-medium">Controle focado em Materiais e Referências de Alta Frequência</p>
        </div>

        {/* MÉTRICAS GLOBAIS */}
        <div className="flex items-center gap-4 bg-[#F8F7FC] p-2 rounded-2xl border border-[#EEEDF5]">
          <div className="px-4 py-1 border-r border-[#E8E6F0]">
            <div className="text-[10px] font-bold text-[#8B8BA0] uppercase tracking-wider mb-0.5">Visão Geral</div>
            <div className="flex items-end gap-2">
              <span className="text-lg font-black text-[#2D2D3A] leading-none">{progressoGeral.toFixed(1)}%</span>
              <span className="text-xs text-[#00B894] font-bold mb-0.5">Hoje</span>
            </div>
          </div>
          <div className="px-4 py-1">
             <div className="text-[10px] font-bold text-[#8B8BA0] uppercase tracking-wider mb-0.5">Batidas Ativas</div>
             <div className="text-lg font-black text-[#6C5CE7] leading-none">{totalEmProducao}</div>
          </div>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-[320px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
          <input 
            type="text" 
            placeholder="Buscar material, reff ou cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D1D0D9] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
          />
        </div>

        {/* NAVEGADOR DE DATAS */}
        <div className="flex items-center bg-white rounded-xl border border-[#D1D0D9] p-1 flex-1 md:flex-none justify-center">
          <button
            onClick={() => setDayOffset(d => d - 1)}
            className="w-8 h-8 flex items-center justify-center text-[#6B6B80] hover:bg-[#F4F3F8] rounded-lg transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            onClick={() => setDayOffset(0)}
            className="px-4 h-8 flex items-center justify-center font-black text-sm tracking-wide hover:bg-[#F4F3F8] transition-all rounded-lg min-w-[140px]"
            style={{ color: isToday ? '#6C5CE7' : '#2D2D3A' }}
          >
            {dateLabel}
            {' '}
            <span className="text-[10px] uppercase ml-2 px-1.5 py-0.5 bg-[#F4F3F8] rounded text-[#8B8BA0]">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
            </span>
          </button>
          
          <button
            onClick={() => setDayOffset(d => d + 1)}
            className="w-8 h-8 flex items-center justify-center text-[#6B6B80] hover:bg-[#F4F3F8] rounded-lg transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="flex items-center bg-white rounded-xl border border-[#D1D0D9] p-1 w-full md:w-auto overflow-x-auto">
          <Filter size={14} className="text-[#A0A0B0] ml-2 mr-1" />
          {(['Todos', 'Manual', 'Rotativa'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === f ? 'bg-[#6C5CE7] text-white shadow-md' : 'text-[#6B6B80] hover:bg-[#F4F3F8]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA AGRUPADA POR MATERIAL */}
      <div className="px-6 lg:px-8 flex-1">
        {groupedData.length === 0 ? (
          <div className="text-center py-20">
             <Factory size={48} className="mx-auto text-[#D1D0D9] mb-4" />
             <h3 className="text-lg font-bold text-[#2D2D3A]">Nenhuma produção encontrada</h3>
             <p className="text-[#8B8BA0]">Tente alterar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groupedData.map((group) => {
              const groupProgress = group.totalRequested > 0 ? (group.totalProduced / group.totalRequested) * 100 : 0;
              
              return (
                <div key={group.materialName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* HEADER DO GRUPO */}
                  <div className="flex items-end justify-between border-b border-[#D1D0D9] pb-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E1B4B] to-[#6C5CE7] flex items-center justify-center shadow-lg">
                         <Target className="text-white" size={16} />
                      </div>
                      <h2 className="text-xl font-black text-[#1E1B4B]">{group.materialName}</h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-[#8B8BA0]">Progresso do Grupo</div>
                        <div className="text-sm font-black text-[#2D2D3A]">
                          {group.totalProduced.toLocaleString()} / {group.totalRequested.toLocaleString()}
                        </div>
                      </div>
                      <div className="w-[100px] h-2 bg-[#E8E6F0] rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] rounded-full transition-all duration-1000" 
                           style={{ width: `${groupProgress}%` }}
                         />
                      </div>
                    </div>
                  </div>

                  {/* CARTÕES DAS MÁQUINAS/REFERÊNCIAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {group.jobs.map(job => <JobCard key={job.id} job={job} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE DO CARTÃO ────────────────────────────────────────────────────────

function JobCard({ job }: { job: TPUJob }) {
  const isRotativa = job.machineType === 'Rotativa';
  const progress = job.quantityRequested > 0 ? (job.quantityProduced / job.quantityRequested) * 100 : 0;
  
  const isAtrasado = job.priority === 'Atrasado';
  const cardBg = isAtrasado ? 'bg-[#FFF4F4] border-[#FFDADA]' : 'bg-white border-[#EEEDF5]';

  const priorityColor = 
    job.priority === 'Urgente' ? 'text-[#F19066] bg-[#F1906615] border-[#F1906650]' :
    isAtrasado ? 'text-[#E15F41] bg-[#E15F4115] border-[#E15F4150]' :
    'text-[#8B8BA0] bg-[#F4F3F8] border-transparent';

  const statusIcon = 
    job.status === 'Concluído' ? <CheckCircle2 size={12} className="text-[#00B894]" /> :
    job.status === 'Em Produção' ? <Zap size={12} className="text-[#6C5CE7]" /> :
    <AlertCircle size={12} className={isAtrasado ? "text-[#E15F41]" : "text-[#A0A0B0]"} />;

  return (
    <div className={`${cardBg} rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group`}>
      {/* CABEÇALHO DO CARTÃO */}
      <div className={`p-3 border-b ${isAtrasado ? 'border-[#FFDADA]' : 'border-[#F4F3F8]'} flex justify-between items-start ${isRotativa && !isAtrasado ? 'bg-[#FAFAFE]' : ''}`}>
        <div className="flex-1 min-w-0 pr-2">
           <div className="flex items-center gap-1.5 mb-1 flex-wrap">
             <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-[#2D2D3A] bg-[#EEEDF5]">
               {job.client}
             </span>
             <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${priorityColor}`}>
               {job.priority}
             </span>
           </div>
           <h3 className="text-base font-black text-[#1E1B4B] leading-none truncate" title={job.reference}>{job.reference}</h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1.5 rounded-lg ${isRotativa ? 'bg-[#6C5CE7] text-white' : 'bg-[#1E1B4B] text-white'}`}>
            {isRotativa ? <Cpu size={10} /> : <Target size={10} />}
            {job.machineName}
          </div>
        </div>
      </div>

      {/* CORPO DO CARTÃO */}
      <div className="p-3 flex-1 flex flex-col gap-2.5">
        {/* Progresso de Produção */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-[#6B6B80]">Produção</span>
            <span className="text-sm font-black text-[#1E1B4B]">
              <span className={progress === 100 ? 'text-[#00B894]' : ''}>{job.quantityProduced.toLocaleString()}</span> 
              <span className="text-[#A0A0B0] font-medium mx-1">/</span> 
              {job.quantityRequested.toLocaleString()}
            </span>
          </div>
          <div className={`w-full h-[5px] ${isAtrasado ? 'bg-[#FFDADA]' : 'bg-[#EEEDF5]'} rounded-full overflow-hidden`}>
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-[#00B894]' : isRotativa ? 'bg-[#6C5CE7]' : 'bg-[#1E1B4B]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Infos de Rodapé */}
        <div className={`flex justify-between items-center ${isAtrasado ? 'bg-[#FFF9F9] border-[#FFDADA]' : 'bg-[#F8F7FC] border-[#EEEDF5]'} p-2 rounded-lg border mt-auto`}>
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <div className="w-5 h-5 rounded-full bg-[#D1D0D9] flex items-center justify-center text-white shrink-0">
              <User size={10} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[9px] text-[#8B8BA0] uppercase font-bold leading-none truncate">{job.operator.shift}</span>
              <span className="text-[11px] font-bold text-[#2D2D3A] truncate">{job.operator.name}</span>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end shrink-0 pl-2">
            <div className="flex items-center gap-1 text-[9px] text-[#8B8BA0] uppercase font-bold">
              <Clock size={9} /> Previsão
            </div>
            <span className="text-[11px] font-black text-[#2D2D3A]">{job.forecastEnd}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 justify-center mt-0.5">
          {statusIcon}
          <span className="text-[10px] font-bold text-[#6B6B80]">{job.status}</span>
        </div>
        
        {/* Notas Adicionais */}
        {job.notes && (
          <div className="mt-0.5 text-[9px] text-[#E17055] font-medium px-1.5 py-1 bg-[#E1705510] rounded border border-[#E1705530] leading-tight">
             <strong>Nota:</strong> {job.notes}
          </div>
        )}
      </div>
    </div>
  );
}
