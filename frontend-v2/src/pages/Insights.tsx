import { useState } from 'react';
import { BarChart2, FileText, BadgeDollarSign } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Relatorios } from './Relatorios';
import { Financeiro } from './Financeiro';

type InsightsTab = 'dashboard' | 'relatorios' | 'financeiro';

const TABS: { key: InsightsTab; label: string; icon: React.ReactNode; sub: string }[] = [
  {
    key: 'dashboard',
    label: 'Dashboard P&D',
    icon: <BarChart2 size={15} />,
    sub: 'Faturamento, projetos e pipeline',
  },
  {
    key: 'relatorios',
    label: 'Relatórios Operacionais',
    icon: <FileText size={15} />,
    sub: 'Lead time, SLA e impedimentos',
  },
  {
    key: 'financeiro',
    label: 'Análise Financeira',
    icon: <BadgeDollarSign size={15} />,
    sub: 'Custos operacionais e perdas',
  },
];

export function Insights() {
  const [tab, setTab] = useState<InsightsTab>('relatorios');

  return (
    <div className="min-h-[calc(100vh-72px)]">
      {/* Tab Switcher */}
      <div className="bg-white border-b border-[#E8E6F0] px-8 py-4 sticky top-[72px] z-40 shadow-[0_2px_8px_rgba(108,92,231,0.04)]">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A0A0B0] mr-2 hidden md:block">
            Área de Análise:
          </span>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[13px] font-black transition-all duration-300 relative group
                ${tab === t.key
                  ? 'text-white shadow-[0_8px_20px_rgba(108,92,231,0.4)] scale-105 z-10'
                  : 'bg-white border-2 border-[#F0EFF8] text-[#8B8BA0] hover:border-[#6C5CE7] hover:text-[#6C5CE7] hover:bg-[#F8F7FC] shadow-sm'
                }`}
              style={
                tab === t.key
                  ? { background: 'linear-gradient(135deg, #6C5CE7, #8075FF)' }
                  : {}
              }
            >
              <span className={`transition-transform duration-300 ${tab === t.key ? 'scale-110' : 'group-hover:scale-110'}`}>
                {t.icon}
              </span>
              <span>{t.label}</span>
              {tab !== t.key && (
                <span className="hidden lg:inline text-[10px] font-bold opacity-60">
                  · {t.sub}
                </span>
              )}
              
              {/* Active Indicator Glow */}
              {tab === t.key && (
                <div className="absolute inset-0 rounded-2xl bg-[#6C5CE7] blur-[12px] opacity-20 -z-10 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'relatorios' && <Relatorios />}
        {tab === 'financeiro' && <Financeiro />}
      </div>
    </div>
  );
}
