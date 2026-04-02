import { KPICard } from '../components/KPICard';
import { METRICS_DATA, PROJECTS_DATA, REVENUE_EVOLUTION } from '../data/mockDashboard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Filter, Download } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto min-h-[calc(100vh-64px)] pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold m-0 text-[#2D2D3A] tracking-tight">
            Dashboard P&D
          </h1>
          <p className="text-[#8B8BA0] mt-1 font-semibold">
            Análise de Projetos, Faturamento e Pipeline de Desenvolvimento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E6F0] rounded-xl text-sm font-bold text-[#6B6B80] hover:bg-[#F8F7FC] transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#6C5CE7] hover:bg-[#5A4BCE] text-white rounded-xl text-sm font-bold shadow-[0_2px_10px_rgba(108,92,231,0.25)] transition-colors">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {METRICS_DATA.map((kpi, idx) => (
          <KPICard key={idx} data={kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-[#2D2D3A] mb-6">Evolução de Faturamento</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_EVOLUTION} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B894" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00B894" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8BA0' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8B8BA0' }} 
                  tickFormatter={(val) => `R$${val/1000}k`}
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="value" stroke="#00B894" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Realized vs Projected */}
        <div className="bg-white p-6 rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-[#2D2D3A] mb-6">Faturamento Realizado x Projeção</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROJECTS_DATA.slice(0, 4)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="client" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8BA0' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8B8BA0' }}
                  tickFormatter={(val) => `R$${val/1000}k`}
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
                <Tooltip 
                  cursor={{ fill: '#F8F7FC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenueRealized" name="Realizado" fill="#6C5CE7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="revenueProjected" name="Projeção" fill="#E8EDF2" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects Table Row */}
      <div className="bg-white rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F0F0F5] flex justify-between items-center">
          <h3 className="text-base font-bold text-[#2D2D3A]">Pipeline de Projetos</h3>
          <span className="bg-[#6C5CE7] bg-opacity-10 text-[#6C5CE7] text-xs font-extrabold px-3 py-1 rounded-lg">
            {PROJECTS_DATA.length} Projetos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F7FC] text-[#8B8BA0] text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Ref. & Cliente</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-4 font-semibold">Início / Produção</th>
                <th className="py-4 px-4 font-semibold text-right">Lead Time</th>
                <th className="py-4 px-6 font-semibold text-right">Faturamento / Projeção</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {PROJECTS_DATA.map((proj, idx) => {
                const isLate = proj.devTimeDays > 30 && proj.status !== 'Concluído';
                
                return (
                  <tr key={idx} className="border-b border-[#F0F0F5] last:border-none hover:bg-[#FAFAFD] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-[#2D2D3A]">{proj.reference}</div>
                      <div className="text-xs text-[#8B8BA0] font-medium mt-0.5">{proj.client}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold
                        ${proj.status === 'Em Produção' ? 'bg-[#00B894] bg-opacity-10 text-[#00B894]' : 
                          proj.status === 'Em Desenvolvimento' ? 'bg-[#FDCB6E] bg-opacity-20 text-[#E1A020]' :
                          proj.status === 'Concluído' ? 'bg-[#6C5CE7] bg-opacity-10 text-[#6C5CE7]' :
                          'bg-[#A0A0B0] bg-opacity-10 text-[#8B8BA0]'
                        }
                      `}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[#2D2D3A] font-medium">{new Date(proj.startDate).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-[#8B8BA0] mt-0.5">
                        {proj.productionDate ? new Date(proj.productionDate).toLocaleDateString('pt-BR') : 'Aguardando'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className={`font-bold ${isLate ? 'text-[#FF4757]' : 'text-[#2D2D3A]'}`}>
                        {proj.devTimeDays} dias
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-extrabold text-[#00B894]">
                        R$ {proj.revenueRealized.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-[#8B8BA0] font-medium mt-0.5">
                        Meta: R$ {proj.revenueProjected.toLocaleString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
