import { FINANCIAL_METRICS, LOSSES_EVOLUTION, SECTOR_EFFICIENCY, FINANCIAL_ALERTS } from '../data/mockFinanceiro';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Filter, Download, ArrowUpRight, ArrowDownRight, AlertTriangle, Info, Zap } from 'lucide-react';

export function Financeiro() {
  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto min-h-[calc(100vh-64px)] pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold m-0 text-[#2D2D3A] tracking-tight">
            Análise Financeira
          </h1>
          <p className="text-[#8B8BA0] mt-1 font-semibold">
            Conversão de Dados Operacionais em Indicadores de Custo e Lucro
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E6F0] rounded-xl text-sm font-bold text-[#6B6B80] hover:bg-[#F8F7FC] transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#00B894] hover:bg-[#00A383] text-white rounded-xl text-sm font-bold shadow-[0_2px_10px_rgba(0,184,148,0.25)] transition-colors">
            <Download size={16} /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {FINANCIAL_METRICS.map((kpi, idx) => {
          // If trendDirection is UP for a COST, it's BAD (Red). If it's UP for POTENTIAL, it's GOOD (Green).
          // We define specific logic based on the title or trendDirection.
          const isGood = 
            (kpi.title.includes("Lucro") && kpi.trendDirection === "up") ||
            (kpi.title.includes("Lucro") === false && kpi.trendDirection === "down");

          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <h3 className="text-[#8B8BA0] text-xs font-bold uppercase tracking-wider mb-2">{kpi.title}</h3>
                <div className={`text-2xl font-black tracking-tight mb-2 ${kpi.title.includes('Lucro') ? 'text-[#00B894]' : 'text-[#2D2D3A]'}`}>
                  {kpi.value}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`flex items-center gap-0.5 text-xs font-extrabold px-1.5 py-0.5 rounded ${isGood ? 'bg-[#00B89415] text-[#00B894]' : 'bg-[#FF475715] text-[#FF4757]'}`}>
                    {kpi.trendDirection === 'up' ? <ArrowUpRight size={12} strokeWidth={3}/> : <ArrowDownRight size={12} strokeWidth={3}/>}
                    {kpi.trend}
                  </span>
                  <span className="text-[10px] text-[#A0A0B0] font-medium">vs último mês</span>
                </div>
                <p className="text-[11px] text-[#A0A0B0] leading-tight mt-2 border-t border-[#F0F0F5] pt-2">
                  {kpi.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost vs Revenue Efficiency */}
        <div className="bg-white p-6 rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-[#2D2D3A] mb-1">Eficiência: Receita vs Custos Operacionais</h3>
          <p className="text-xs text-[#8B8BA0] mb-6">Comparativo de ganho financeiro vs custo de máquina/mão-de-obra por setor.</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SECTOR_EFFICIENCY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8B8BA0' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8B8BA0' }}
                  tickFormatter={(val) => `R$${val/1000}k`}
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
                <RechartsTooltip 
                  cursor={{ fill: '#F8F7FC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Receita Gerada" fill="#00B894" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="cost" name="Despesa Operacional" fill="#FF7675" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Losses Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-[#F0F0F5] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-bold text-[#2D2D3A] mb-1">Evolução de Custos Ocultos</h3>
          <p className="text-xs text-[#8B8BA0] mb-6">Acompanhamento dos focos de desperdício (Lead Time = Custo).</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LOSSES_EVOLUTION} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSetup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FDCB6E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FDCB6E" stopOpacity={0}/>
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
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => {
                    const dict: any = { setup: "Custo Setup", idle: "Máq. Parada", rework: "Retrabalho" };
                    return [`R$ ${Number(value).toLocaleString('pt-BR')}`, dict[name] || name];
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                   formatter={(value) => {
                      const dict: any = { setup: "Custo de Setup", idle: "Máq. Ociosa", rework: "Retrabalho" };
                      return dict[value] || value;
                   }}
                />
                <Area type="monotone" dataKey="setup" stroke="#6C5CE7" strokeWidth={2} fillOpacity={1} fill="url(#colorSetup)" stackId="1"/>
                <Area type="monotone" dataKey="idle" stroke="#FDCB6E" strokeWidth={2} fillOpacity={1} fill="url(#colorIdle)" stackId="1"/>
                <Area type="monotone" dataKey="rework" stroke="#FF7675" strokeWidth={2} fillOpacity={1} fill="transparent" stackId="1"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div>
        <h3 className="text-base font-bold text-[#2D2D3A] mb-4 flex items-center gap-2">
          <Zap size={18} className="text-[#FDCB6E]" />
          Insights de Ação Imediata (TOC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FINANCIAL_ALERTS.map((alert, idx) => {
            const isCritical = alert.type === 'critical';
            const isWarning = alert.type === 'warning';
            return (
              <div key={idx} className={`rounded-xl p-5 border ${
                isCritical ? 'bg-[#FF475708] border-[#FF475730]' :
                isWarning ? 'bg-[#FDCB6E08] border-[#FDCB6E30]' :
                'bg-[#00B89408] border-[#00B89430]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCritical ? <AlertTriangle size={16} className="text-[#FF4757]" /> :
                   isWarning ? <Info size={16} className="text-[#FDCB6E]" /> :
                   <ArrowUpRight size={16} className="text-[#00B894]" />}
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    isCritical ? 'text-[#FF4757]' : isWarning ? 'text-[#FDCB6E]' : 'text-[#00B894]'
                  }`}>{alert.sector}</span>
                </div>
                <p className="text-sm text-[#2D2D3A] font-medium mb-3 leading-snug">
                  {alert.message}
                </p>
                <div className={`text-xs font-bold py-1.5 px-3 rounded-lg inline-block ${
                    isCritical ? 'bg-[#FF475715] text-[#FF4757]' : isWarning ? 'bg-[#FDCB6E15] text-[#E1A020]' : 'bg-[#00B89415] text-[#00B894]'
                }`}>
                  AÇÃO: {alert.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
