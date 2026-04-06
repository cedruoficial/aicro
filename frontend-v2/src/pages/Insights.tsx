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
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-black transition-all duration-200 ${
                tab === t.key
                  ? 'text-white shadow-lg shadow-[#6C5CE730]'
                  : 'bg-[#F8F7FC] text-[#8B8BA0] hover:bg-[#F0EFF8] hover:text-[#6C5CE7]'
              }`}
              style={
                tab === t.key
                  ? { background: 'linear-gradient(135deg, #6C5CE7, #5A4BCE)' }
                  : {}
              }
            >
              {t.icon}
              <span>{t.label}</span>
              {tab !== t.key && (
                <span className="hidden lg:inline text-[10px] font-medium text-[#C0C0D0]">
                  · {t.sub}
                </span>
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
