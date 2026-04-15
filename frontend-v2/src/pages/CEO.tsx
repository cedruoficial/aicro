import { CEO_METRICS, SUPPLY_CHAIN } from '../data/mockCEO';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIAnalysisModal } from '../components/AIAnalysisModal';
import { MOCK_AI_REPORT } from '../data/mockAI';

export function CEO() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleAIAnalysis = async () => {
    setIsAIModalOpen(true);
    setIsAILoading(true);
    
    // Simular o delay de "processamento" da IA para a demonstração
    setTimeout(() => {
      setAiAnalysis(MOCK_AI_REPORT);
      setIsAILoading(false);
    }, 2500);
  };

  return (
    <div className="bg-[#13111C] min-h-[calc(100vh-64px)] p-6 md:p-8 text-white font-sans overflow-x-hidden selection:bg-[#6C5CE7] selection:text-white">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header CEO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-extrabold m-0 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] text-transparent bg-clip-text">War Room</span> Estratégico
            </h1>
            <p className="text-[#A0A0B0] mt-1 font-medium text-sm">
              Visão macro da indústria baseada em Lean Manufacturing & TOC
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#1A1825] px-4 py-2 rounded-xl border border-[#2D2B3A] shadow-inner text-sm font-bold text-[#A0A0B0] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B894] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B894]"></span>
              </span>
              Dados em Tempo Real
            </div>
            
            <button 
              onClick={handleAIAnalysis}
              className="bg-[#222030] hover:bg-[#2A283A] border border-[#6C5CE7]/30 hover:border-[#6C5CE7] px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 group"
            >
              <Sparkles size={16} className="text-[#6C5CE7] group-hover:animate-pulse" />
              Analista IA
            </button>

            <button className="bg-[#6C5CE7] hover:bg-[#5A4BCE] px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_16px_rgba(108,92,231,0.3)] transition-all flex items-center gap-2">
              Gerar Relatório Executivo
            </button>
          </div>
        </div>

        {/* AI Analysis Modal */}
        <AIAnalysisModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          analysis={aiAnalysis} 
          isLoading={isAILoading}
        />

        {/* ÁREA 1: KPIs ESTRATÉGICOS */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {CEO_METRICS.map(metric => {
            const isGood = metric.isPositiveTrend ? metric.trendDirection === 'up' : metric.trendDirection === 'down';
            return (
              <div key={metric.id} className="bg-[#1A1825] rounded-2xl p-5 border border-[#2D2B3A] shadow-[0_8px_24px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:border-[#6C5CE7] transition-colors duration-300">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#6C5CE720] to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-[#A0A0B0] text-xs font-bold uppercase tracking-wider mb-2 relative z-10">{metric.title}</h3>
                <div className="text-3xl font-black text-white tracking-tight mb-2 relative z-10">{metric.value}</div>
                
                <div className="flex items-center gap-1.5 mb-4 relative z-10">
                  <span className={`flex items-center gap-0.5 text-xs font-extrabold px-1.5 py-0.5 rounded ${isGood ? 'bg-[#00B89420] text-[#00B894]' : 'bg-[#FF475720] text-[#FF4757]'}`}>
                    {metric.trendDirection === 'up' && <ArrowUpRight size={12} strokeWidth={3}/>}
                    {metric.trendDirection === 'down' && <ArrowDownRight size={12} strokeWidth={3}/>}
                    {metric.trendDirection === 'neutral' && <Minus size={12} strokeWidth={3}/>}
                    {metric.trend}%
                  </span>
                  <span className="text-[10px] text-[#6B6B80] font-medium">vs último mês</span>
                </div>

                {/* Sparkline */}
                <div className="h-10 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.history}>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={isGood ? '#00B894' : '#FF4757'} 
                        strokeWidth={2} 
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col gap-8">
            {/* ÁREA 2: MAPA DA CADEIA PRODUTIVA (TOC) */}
            <div className="bg-[#1A1825] border border-[#2D2B3A] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">Cadeia Produtiva Integrada</h2>
                  <p className="text-xs text-[#8B8BA0] mt-1">Status de WIP (Work In Progress) e Gargalos identificados.</p>
                </div>
              </div>

              {/* Mapeamento Horizontal */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 custom-scrollbar-dark">
                {SUPPLY_CHAIN.map((node, i) => {
                  const isGargalo = node.status === 'gargalo';
                  return (
                    <div key={node.id} className="flex items-center">
                      <div className={`relative flex flex-col w-[130px] shrink-0 p-4 rounded-xl border-2 transition-transform hover:-translate-y-1 ${
                        isGargalo ? 'bg-[#FF475710] border-[#FF4757] shadow-[0_0_15px_rgba(255,71,87,0.3)]' : 
                        node.status === 'atencao' ? 'bg-[#FDCB6E10] border-[#FDCB6E]' : 
                        'bg-[#222030] border-[#2D2B3A]'
                      }`}>
                        {isGargalo && (
                          <div className="absolute -top-3 -right-2 text-[#FF4757] animate-bounce">
                            <AlertTriangle size={24} fill="#1A1825" />
                          </div>
                        )}
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-[#C0C0D0] mb-3 truncate">{node.title}</h4>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-[#8B8BA0] font-bold">WIP <span className="font-normal text-[#6B6B80]">/{node.wipLimit}</span></span>
                            </div>
                            <div className={`text-xl font-black leading-none ${isGargalo ? 'text-[#FF4757]' : 'text-white'}`}>
                              {node.wip}
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-[#3D3B4A] grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-[9px] text-[#6B6B80] font-bold uppercase">Tempo</div>
                              <div className="text-[11px] font-bold text-[#A0A0B0]">{node.avgTime}</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-[#6B6B80] font-bold uppercase">Saída</div>
                              <div className="text-[11px] font-bold text-[#A0A0B0]">{node.throughput}/h</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow / Connection */}
                      {i < SUPPLY_CHAIN.length - 1 && (
                        <div className="w-8 flex justify-center items-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={isGargalo ? "#FF4757" : "#4D4B5A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ÁREA 3: ANÁLISES DE PERDAS (Lean Muda) & ALERTAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 7 Desperdícios */}
              <div className="bg-[#1A1825] border border-[#2D2B3A] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                <h2 className="text-base font-bold flex items-center gap-2 mb-6">7 Desperdícios (Custos Ocultos)</h2>
                {/* Mocked Muda bars */}
                <div className="space-y-4">
                  {[
                    {name: 'Espera (Máq. parada)', val: 78, loss: 'R$ 8.2k'},
                    {name: 'Processamento Exces.', val: 45, loss: 'R$ 4.5k'},
                    {name: 'Defeitos / Retrabalho', val: 32, loss: 'R$ 6.1k'},
                    {name: 'Estoque Intermediário', val: 20, loss: 'R$ 1.2k'},
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-[#A0A0B0]">{item.name}</span>
                        <span className="text-[#FF4757]">{item.loss}</span>
                      </div>
                      <div className="h-2 w-full bg-[#2D2B3A] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF4757] to-[#FFA07A]" style={{width: `${item.val}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ÁREA 4: ALERTAS ESTRATÉGICOS (Inteligência de Operação) */}
              <div className="bg-[#1A1825] border border-[#2D2B3A] rounded-2xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col">
                <h2 className="text-base font-bold flex items-center gap-2 mb-6 text-[#A0A0B0] uppercase tracking-wider text-xs">
                  <AlertCircle size={14} className="text-[#FDCB6E]"/>
                  Inteligência de Operação
                </h2>

                <div className="space-y-3 flex-1">
                  {/* Alert Card 1 */}
                  <div className="bg-[#222030] p-4 rounded-xl border-l-[3px] border-[#FF4757] hover:bg-[#2A283A] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-[#FF4757] bg-[#FF475715] px-2 py-0.5 rounded">Gargalo Crítico</span>
                      <span className="text-[10px] text-[#6B6B80] font-bold">Agora</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight mb-1">PCP com 45 itens parados</h4>
                    <p className="text-[11px] text-[#A0A0B0] leading-snug">Volume está 80% acima do limite de WIP. Produção de Aniger afetada diretamente.</p>
                  </div>

                  {/* Alert Card 2 */}
                  <div className="bg-[#222030] p-4 rounded-xl border-l-[3px] border-[#FDCB6E] hover:bg-[#2A283A] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-[#FDCB6E] bg-[#FDCB6E15] px-2 py-0.5 rounded">OEE Abaixo</span>
                      <span className="text-[10px] text-[#6B6B80] font-bold">Há 2h</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight mb-1">Performance da Linha 3 (Laser) nula.</h4>
                    <p className="text-[11px] text-[#A0A0B0] leading-snug">Máquina entrou em manutenção imprevista afetando Lead Time geral.</p>
                  </div>

                  {/* Alert Card 3 */}
                  <div className="bg-[#222030] p-4 rounded-xl border-l-[3px] border-[#00B894] hover:bg-[#2A283A] transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-[#00B894] bg-[#00B89415] px-2 py-0.5 rounded">Meta Batida</span>
                      <span className="text-[10px] text-[#6B6B80] font-bold">Hoje</span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight mb-1">Faturamento Mensal Alcançado</h4>
                    <p className="text-[11px] text-[#A0A0B0] leading-snug">Acabamos de atingir a marca de 104% da meta projetada. Excelente trabalho contínuo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: #1A1825; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #3D3B4A; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #6C5CE7; }
      `}</style>
    </div>
  );
}
